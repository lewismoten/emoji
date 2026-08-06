import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureThemeStyles: vi.fn(async () => undefined),
  getColor: vi.fn(() => "#123456"),
  getString: vi.fn(() => "base"),
  isDeveloper: vi.fn(() => false),
  renderAudio: vi.fn(),
  setChecked: vi.fn(),
  setPressed: vi.fn(),
  syncChoiceInputSelection: vi.fn(),
  syncHelpMusic: vi.fn(),
}));

vi.mock("../../../../src/preferences.js", () => ({
  getString: mocks.getString,
}));
vi.mock("../../../../src/utils/aria.js", () => ({
  setChecked: mocks.setChecked,
  setPressed: mocks.setPressed,
}));
vi.mock("../../../../src/explorer/theme/theme-styles.js", () => ({
  ensureThemeStyles: mocks.ensureThemeStyles,
}));
vi.mock("../../../../src/sync-choice-input-selection.js", () => ({
  default: mocks.syncChoiceInputSelection,
}));
vi.mock("../../../../src/utils/themes.js", () => ({
  getColor: mocks.getColor,
}));
vi.mock("../../../../src/controls/audio/audio-toggle.js", () => ({
  render: mocks.renderAudio,
}));
vi.mock("../../../../src/explorer/audio/explorer-audio-engine.js", () => ({
  default: () => ({ syncHelpMusic: mocks.syncHelpMusic }),
}));
vi.mock("../../../../src/auth.js", () => ({
  isDeveloper: mocks.isDeveloper,
}));

type Choice = {
  classList: { toggle(name: string, force?: boolean): void };
  dataset: { theme?: string };
  querySelector(selector: string): unknown;
  tabIndex: number;
};

describe("render-theme-toggle", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else Reflect.deleteProperty(globalThis, "document");
  });

  it("renders the resolved non-developer theme and syncs controls", async () => {
    const selectedStates: boolean[] = [];
    const input = { kind: "radio-input" };
    const choice = {
      dataset: { theme: "dark" },
      querySelector: (selector: string) => (selector === 'input[type="radio"]' ? input : null),
      tabIndex: -1,
      classList: {
        toggle(_name: string, force?: boolean) {
          selectedStates.push(Boolean(force));
        },
      },
    } satisfies Choice;
    const meta = { content: "" };

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: {},
        },
        querySelector(selector: string) {
          if (selector === 'meta[name="theme-color"]') return meta;
          return null;
        },
      },
    });

    vi.doMock("../../../../src/utils/document.js", () => ({
      all: () => [choice],
    }));

    const { renderThemeToggle } = await import("../../../../src/render-theme-toggle.js");
    renderThemeToggle();

    expect(mocks.ensureThemeStyles).toHaveBeenCalledWith("dark");
    expect((globalThis.document as any).documentElement.dataset.theme).toBe("dark");
    expect(selectedStates).toEqual([true]);
    expect(choice.tabIndex).toBe(0);
    expect(mocks.setPressed).toHaveBeenCalledWith(choice, true);
    expect(mocks.setChecked).toHaveBeenCalledWith(choice, true);
    expect(mocks.syncChoiceInputSelection).toHaveBeenCalledWith(input, true);
    expect(meta.content).toBe("#123456");
    expect(mocks.renderAudio).toHaveBeenCalled();
    expect(mocks.syncHelpMusic).toHaveBeenCalled();
  });

  it("allows the base theme for developers and returns when document is missing", async () => {
    mocks.isDeveloper.mockReturnValue(true);
    mocks.getString.mockReturnValueOnce("base").mockReturnValueOnce("bogus");
    const devChoice = {
      dataset: { theme: "base" },
      querySelector: () => null,
      tabIndex: -1,
      classList: {
        toggle() {},
      },
    } satisfies Choice;

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: {
          dataset: {},
        },
        querySelector() {
          return null;
        },
      },
    });
    vi.doMock("../../../../src/utils/document.js", () => ({
      all: () => [devChoice],
    }));

    const { renderThemeToggle } = await import("../../../../src/render-theme-toggle.js");
    renderThemeToggle();
    expect(mocks.ensureThemeStyles).toHaveBeenCalledWith("base");
    renderThemeToggle();
    expect(mocks.ensureThemeStyles).toHaveBeenLastCalledWith("dark");

    Reflect.deleteProperty(globalThis, "document");
    expect(() => renderThemeToggle()).not.toThrow();
  });
});
