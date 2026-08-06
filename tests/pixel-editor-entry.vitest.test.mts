import assert from "node:assert/strict";
import { describe, expect, it, vi } from "vitest";

const pixelEditorMocks = vi.hoisted(() => ({
  controllers: vi.fn(() => ({
    open: "open",
    refreshFontBuild: "font",
    refreshTranslations: "translations",
  })),
  createElements: vi.fn(() => ({ view: { kind: "view" } })),
  createState: vi.fn(() => ({ kind: "state" })),
}));

vi.mock("../src/pixel-editor/canvas/pixel-editor-canvas-helpers.js", () => ({
  drawBitmapText: vi.fn(),
}));
vi.mock("../src/pixel-editor/controllers/pixel-editor-controllers.js", () => ({
  createPixelEditorControllers: pixelEditorMocks.controllers,
}));
vi.mock("../src/pixel-editor/canvas/pixel-editor-elements.js", () => ({
  createPixelEditorElements: pixelEditorMocks.createElements,
  createPixelEditorState: pixelEditorMocks.createState,
}));

describe("pixel-editor-entry", () => {
  it("covers createPixelEditor wiring in the source module", async () => {
    const module = await import("../src/pixel-editor-entry.js");
    const created = module.createPixelEditor({
      dialog: { id: "dialog" },
      translate: (value: string) => value,
    });

    expect(pixelEditorMocks.createElements).toHaveBeenCalled();
    expect(pixelEditorMocks.createState).toHaveBeenCalled();
    expect(pixelEditorMocks.controllers).toHaveBeenCalledWith({
      dialog: { id: "dialog" },
      elements: { view: { kind: "view" } },
      formatNumber: String,
      formatPercent: expect.any(Function),
      state: { kind: "state" },
      translate: expect.any(Function),
    });
    expect(created).toEqual({
      element: { kind: "view" },
      open: "open",
      refreshFontBuild: "font",
      refreshTranslations: "translations",
    });
    const firstControllerCall = pixelEditorMocks.controllers.mock.calls.at(0);
    expect(firstControllerCall).toBeDefined();
    const [passedOptions] = firstControllerCall as unknown as [
      {
        formatPercent: (value: number) => string;
      },
    ];
    expect(passedOptions.formatPercent(0.126)).toBe("13%");
  });

  it("keeps the entry module wiring intact", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const sourceModuleSpecifier = "../src/pixel-editor-entry.js";
    const source = await fs.readFile(
      path.join(process.cwd(), "src/pixel-editor-entry.ts"),
      "utf8",
    );

    assert.equal(sourceModuleSpecifier, "../src/pixel-editor-entry.js");
    assert.match(
      source,
      /import \{ drawBitmapText \} from "\.\/pixel-editor\/canvas\/pixel-editor-canvas-helpers\.js";/,
    );
    assert.match(
      source,
      /import \{ createPixelEditorControllers \} from "\.\/pixel-editor\/controllers\/pixel-editor-controllers\.js";/,
    );
    assert.match(source, /export function createPixelEditor\(\{/);
    assert.match(
      source,
      /export \{\s*buildSkinToneOwnership,[\s\S]*compareSkinToneHelpers,\s*\};/,
    );
  });
});
