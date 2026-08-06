import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  advancedDialog: vi.fn(async () => ({ dialog: { kind: "advanced-filters-dialog" } })),
  advancedTrigger: vi.fn(() => ({ className: "advanced-filters-trigger" })),
  createHelpDialogControl: vi.fn(async () => ({
    element: { kind: "help-dialog" },
    mountLanguagePicker: vi.fn((value) => {
      (globalThis as any).__mountedLanguagePicker = value;
    }),
  })),
  createHelpPickerControl: vi.fn(() => ({ className: "help-picker" })),
  createLanguageDialogControl: vi.fn(async () => ({ dialog: { kind: "language-dialog" } })),
  createLanguagePickerControl: vi.fn(async () => ({ button: { kind: "language-picker" } })),
  createSavedPickerControl: vi.fn(() => ({ className: "saved-picker" })),
  ensureDialogTitleRow: vi.fn(() => ({ kind: "dialog-title-row" })),
  ensureFavoriteButton: vi.fn(() => ({ kind: "favorite-button" })),
  ensurePickerControls: vi.fn(),
  positionFavoriteButtonHelper: vi.fn(),
}));

vi.mock("../../../src/explorer/language/language-dialog-control.js", () => ({
  createLanguageDialogControl: mocks.createLanguageDialogControl,
  createLanguagePickerControl: mocks.createLanguagePickerControl,
}));
vi.mock("../../../src/controls/toolbar/emoji-font-choice-group.js", () => ({
  EmojiFontChoiceGroupControl: {
    create: () => ({
      className: "pixel-comparison",
      dataset: { i18nAriaLabel: "emojiStyle" },
      childNodes: [{ className: "emoji-font-choice" }],
    }),
  },
}));
vi.mock("../../../src/explorer/dialog/parts/dialog-title-controls.js", () => ({
  ensureDialogTitleRow: mocks.ensureDialogTitleRow,
  ensureFavoriteButton: mocks.ensureFavoriteButton,
  positionFavoriteButton: mocks.positionFavoriteButtonHelper,
}));
vi.mock("../../../src/explorer/toolbar/help-settings-control.js", () => ({
  createHelpDialogControl: mocks.createHelpDialogControl,
}));
vi.mock("../../../src/explorer/filters/advanced-filter-dialog-control.js", () => ({
  createAdvancedFiltersDialogControl: mocks.advancedDialog,
  createAdvancedFiltersTriggerControl: mocks.advancedTrigger,
}));
vi.mock("../../../src/explorer/toolbar/toolbar-trigger-controls.js", () => ({
  createHelpPickerControl: mocks.createHelpPickerControl,
  createSavedPickerControl: mocks.createSavedPickerControl,
}));
vi.mock("../../../src/explorer/utility/utility-picker-controls.js", () => ({
  ensurePickerControls: mocks.ensurePickerControls,
}));
vi.mock("../../../src/controls/dialog/content/emoji-composition-section.js", () => ({
  EmojiCompositionSectionControl: {
    create: () => ({ className: "emoji-composition" }),
  },
}));
vi.mock("../../../src/controls/dialog/content/saved-dialog.js", () => ({
  SavedDialogControl: {
    create: () => ({ className: "saved-dialog" }),
  },
}));

class FakeNode {
  attributes = new Map<string, string>();
  childNodes: any[] = [];
  className = "";
  dataset: Record<string, string | undefined> = {};
  hidden = false;
  innerHTML = "";
  removed = false;
  selectorMap: Record<string, any>;

  constructor(selectorMap: Record<string, any> = {}) {
    this.selectorMap = selectorMap;
  }

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  after(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  prepend(...nodes: any[]) {
    this.childNodes.unshift(...nodes);
  }

  querySelector(selector: string) {
    return this.selectorMap[selector] ?? null;
  }

  remove() {
    this.removed = true;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

describe("utility-controls runtime", () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (globalThis as any).__mountedLanguagePicker;
  });

  afterEach(() => {
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  });

  it("hydrates utility controls and async utility panels", async () => {
    let compositionChecks = 0;
    const pixelFontToggle = new FakeNode();
    const searchControls = new FakeNode({
      ".saved-picker": null,
      ".help-picker": null,
      ".pixel-font-toggle": pixelFontToggle,
    });
    const fontComparison = new FakeNode({ ".emoji-font-choice": null });
    fontComparison.childNodes = [{ old: true }];
    const filterOptions = new FakeNode({ ".advanced-filters-trigger": null });
    const dialogControls = new FakeNode();
    const dialogDetails = new FakeNode();
    const main = new FakeNode();
    const helpLanguageControl = new FakeNode();
    const selectors: Record<string, any> = {
      ".search-controls": searchControls,
      ".pixel-comparison": fontComparison,
      ".filter-options": filterOptions,
      ".example-dialog .dialog-heading > div:first-child": new FakeNode(),
      ".example-dialog .dialog-controls": dialogControls,
      ".example-dialog .toggle-favorite": { kind: "favorite-button-element" },
      ".example-dialog .dialog-title-row": { kind: "dialog-title-row-element" },
      ".example-dialog .emoji-dialog-details": dialogDetails,
      ".saved-dialog": null,
      ".language-dialog": null,
      ".help-dialog": null,
      ".advanced-filters-dialog": null,
      ".language-picker": null,
      ".help-dialog .help-language-control": helpLanguageControl,
      main,
    };

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === ".example-dialog .emoji-composition") {
            compositionChecks += 1;
            return compositionChecks > 2 ? { className: "emoji-composition" } : null;
          }
          return selectors[selector] ?? null;
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: true }) },
    });

    const module = await import("../../../src/explorer/utility/utility-controls.js");

    module.positionFavoriteButton();
    assert.deepEqual(mocks.positionFavoriteButtonHelper.mock.calls[0]?.[0], {
      compact: true,
      dialogControls,
      dialogTitleRow: { kind: "dialog-title-row-element" },
      favoriteButton: { kind: "favorite-button-element" },
    });

    module.ensureUtilityControls();
    assert.equal(fontComparison.attributes.get("role"), "radiogroup");
    assert.equal(fontComparison.attributes.get("aria-label"), "Emoji style");
    assert.equal(fontComparison.dataset.i18nAriaLabel, "emojiStyle");
    assert.equal(searchControls.childNodes.some((node) => node.className === "saved-picker"), true);
    assert.equal(searchControls.childNodes.some((node) => node.className === "help-picker"), true);
    assert.equal(pixelFontToggle.removed, true);
    assert.equal(filterOptions.childNodes[0]?.className, "advanced-filters-trigger");
    assert.equal(mocks.ensurePickerControls.mock.calls.length, 1);
    assert.equal(mocks.ensureDialogTitleRow.mock.calls.length, 1);
    assert.equal(mocks.ensureFavoriteButton.mock.calls.length, 1);

    await module.ensureEmojiCompositionControl();
    assert.equal(dialogDetails.childNodes[0]?.className, "emoji-composition");

    await module.ensureUtilityPanel("favorites");
    await module.ensureUtilityPanel("language");
    await module.ensureUtilityPanel("help");
    await module.ensureUtilityPanel("filters");

    assert.equal(main.childNodes.some((node) => node.className === "saved-dialog"), true);
    assert.equal(main.childNodes.some((node) => node.kind === "language-dialog"), true);
    assert.equal(main.childNodes.some((node) => node.kind === "help-dialog"), true);
    assert.equal(main.childNodes.some((node) => node.kind === "advanced-filters-dialog"), true);
    assert.equal((globalThis as any).__mountedLanguagePicker?.kind, "language-picker");
  });

  it("reuses or skips existing utility panels", async () => {
    const existingPicker = { kind: "existing-language-picker" };
    const main = new FakeNode();
    const helpLanguageControl = new FakeNode();
    const selectors: Record<string, any> = {
      main,
      ".saved-dialog": { className: "saved-dialog" },
      ".language-dialog": { className: "language-dialog" },
      ".help-dialog": { className: "help-dialog" },
      ".advanced-filters-dialog": { className: "advanced-filters-dialog" },
      ".language-picker": existingPicker,
      ".help-dialog .help-language-control": helpLanguageControl,
      ".search-controls": null,
      ".pixel-comparison": null,
      ".filter-options": null,
      ".example-dialog .dialog-heading > div:first-child": null,
      ".example-dialog .dialog-controls": null,
      ".example-dialog .toggle-favorite": null,
      ".example-dialog .dialog-title-row": null,
      ".example-dialog .emoji-dialog-details": null,
      ".example-dialog .emoji-composition": { className: "emoji-composition" },
    };
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelector: (selector: string) => selectors[selector] ?? null },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    });

    const module = await import("../../../src/explorer/utility/utility-controls.js");

    await module.ensureEmojiCompositionControl();
    await module.ensureUtilityPanel("favorites");
    await module.ensureUtilityPanel("language");
    await module.ensureUtilityPanel("help");
    await module.ensureUtilityPanel("filters");

    assert.equal(main.childNodes.length, 0);
    assert.equal(helpLanguageControl.childNodes[0], existingPicker);
    assert.equal(mocks.createLanguageDialogControl.mock.calls.length, 0);
    assert.equal(mocks.createHelpDialogControl.mock.calls.length, 0);
    assert.equal(mocks.advancedDialog.mock.calls.length, 0);
  });

  it("returns early when main is unavailable", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { querySelector: () => null },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    });
    const module = await import("../../../src/explorer/utility/utility-controls.js");
    await assert.doesNotReject(() => module.ensureUtilityPanel("favorites"));
  });

  it("exits composition setup when dialog details are missing", async () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === ".example-dialog .emoji-composition") return null;
          if (selector === ".example-dialog .emoji-dialog-details") return null;
          return null;
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { matchMedia: () => ({ matches: false }) },
    });

    const module = await import("../../../src/explorer/utility/utility-controls.js");
    await module.ensureEmojiCompositionControl();
  });

});
