import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Direct source under test: ../../src/explorer/utility-controls.js

const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer/utility-controls.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { createLanguageDialogControl, createLanguagePickerControl, } from "./language/language-dialog-control.js";',
    'import { createLanguageDialogControl, createLanguagePickerControl } from "./language-dialog-control-stub.mjs";',
  )
  .replace(
    'import { ensureDialogTitleRow, ensureFavoriteButton, positionFavoriteButton as positionFavoriteButtonHelper, } from "./dialog/dialog-title-controls.js";',
    'import { ensureDialogTitleRow, ensureFavoriteButton, positionFavoriteButton as positionFavoriteButtonHelper, calls as titleControlCalls } from "./dialog-title-controls-stub.mjs";',
  )
  .replace(
    'import { createHelpDialogControl } from "./toolbar/help-settings-control.js";',
    'import { createHelpDialogControl } from "./help-settings-control-stub.mjs";',
  )
  .replace(
    'import { ensureAdvancedFilterControls } from "./advanced-filter-dialog-control.js";',
    'import { ensureAdvancedFilterControls, calls as advancedFilterCalls } from "./advanced-filter-dialog-control-stub.mjs";',
  )
  .replace(
    'import { createHelpPickerControl, createSavedPickerControl, } from "./toolbar/toolbar-trigger-controls.js";',
    'import { createHelpPickerControl, createSavedPickerControl } from "./toolbar-trigger-controls-stub.mjs";',
  )
  .replace(
    'import { ensurePickerControls } from "./utility-picker-controls.js";',
    'import { ensurePickerControls, calls as pickerCalls } from "./utility-picker-controls-stub.mjs";',
  )
  .replace(
    'import { emojiCompositionMarkup, savedDialogMarkup, } from "./utility-control-markup.js";',
    'import { emojiCompositionMarkup, savedDialogMarkup } from "./utility-control-markup-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "utility-controls-"));

await fs.writeFile(
  path.join(tempDirectory, "language-dialog-control-stub.mjs"),
  `export function createLanguageDialogControl() {
  return { dialog: { kind: "language-dialog" } };
}
export function createLanguagePickerControl() {
  return { button: { kind: "language-picker-button" } };
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "dialog-title-controls-stub.mjs"),
  `export const calls = [];
export function ensureDialogTitleRow(value) {
  calls.push(["ensureDialogTitleRow", value]);
  return { kind: "dialog-title-row" };
}
export function ensureFavoriteButton(value) {
  calls.push(["ensureFavoriteButton", value]);
  return { kind: "favorite-button" };
}
export function positionFavoriteButton(value) {
  calls.push(["positionFavoriteButton", value]);
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "help-settings-control-stub.mjs"),
  `export function createHelpDialogControl() {
  return {
    element: { kind: "help-dialog" },
    mountLanguagePicker(value) {
      globalThis.__mountedLanguagePicker = value;
    },
  };
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "advanced-filter-dialog-control-stub.mjs"),
  `export const calls = [];
export function ensureAdvancedFilterControls() {
  calls.push("ensureAdvancedFilterControls");
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "toolbar-trigger-controls-stub.mjs"),
  `export function createSavedPickerControl() {
  return { className: "saved-picker", kind: "saved-picker" };
}
export function createHelpPickerControl() {
  return { className: "help-picker", kind: "help-picker" };
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "utility-picker-controls-stub.mjs"),
  `export const calls = [];
export function ensurePickerControls() {
  calls.push("ensurePickerControls");
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "utility-control-markup-stub.mjs"),
  `export const emojiCompositionMarkup = "<section class=\\"emoji-composition\\"></section>";
export const savedDialogMarkup = "<dialog class=\\"saved-dialog\\"></dialog>";`,
);
await fs.writeFile(
  path.join(tempDirectory, "utility-controls.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "utility-controls.mjs")).href
);
const titleStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-title-controls-stub.mjs")).href
);
const pickerStub = await import(
  pathToFileURL(path.join(tempDirectory, "utility-picker-controls-stub.mjs")).href
);
const advancedStub = await import(
  pathToFileURL(path.join(tempDirectory, "advanced-filter-dialog-control-stub.mjs")).href
);

type Queryable = {
  append?: (...nodes: any[]) => void;
  before?: (...nodes: any[]) => void;
  childNodes?: any[];
  className?: string;
  dataset?: Record<string, string | undefined>;
  insertAdjacentHTML?: (position: string, text: string) => void;
  prepend?: (...nodes: any[]) => void;
  querySelector?: (selector: string) => any;
  remove?: () => void;
  replaceWith?: (...nodes: any[]) => void;
  setAttribute?: (name: string, value: string) => void;
  checked?: boolean;
  name?: string;
  tabIndex?: number;
  textContent?: string | null;
  title?: string;
  type?: string;
  value?: string;
};

class FakeNode {
  className = "";
  dataset: Record<string, string | undefined> = {};
  childNodes: any[] = [];
  attributes = new Map<string, string>();
  inserted: Array<[string, string]> = [];
  removed = false;
  replacedWith: any[] = [];
  textContent: string | null = null;
  type = "";
  name = "";
  value = "";
  checked = false;
  tabIndex = 0;
  hidden = false;

  constructor(
    readonly key: string,
    private readonly selectorMap: Record<string, any> = {},
  ) {}

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  before(...nodes: any[]) {
    this.childNodes.unshift(...nodes);
  }

  insertAdjacentHTML(position: string, text: string) {
    this.inserted.push([position, text]);
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

  replaceWith(...nodes: any[]) {
    this.replacedWith.push(...nodes);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
try {
  const previewA = new FakeNode("preview-a");
  previewA.childNodes = [{ key: "system-preview" }];
  const previewB = new FakeNode("preview-b");
  previewB.childNodes = [{ key: "pixel-preview" }];
  const fontComparison = new FakeNode("font-comparison", {
    ".emoji-font-choice": null,
  });
  fontComparison.childNodes = [previewA, previewB];

  const pixelFontToggle = new FakeNode("pixel-font-toggle");
  const searchControls = new FakeNode("search-controls", {
    ".saved-picker": null,
    ".help-picker": null,
    ".pixel-font-toggle": pixelFontToggle,
  });

  const dialogControls = new FakeNode("dialog-controls");
  const dialogTitle = new FakeNode("dialog-title");
  const dialogDetails = new FakeNode("dialog-details");
  const compositionTitle = new FakeNode("composition-title");
  const composition = new FakeNode("composition", {
    ".emoji-composition-heading": null,
    h3: compositionTitle,
  });
  const main = new FakeNode("main");
  const helpLanguageControl = new FakeNode("help-language-control");

  let compositionQueryCount = 0;
  const selectors: Record<string, any> = {
    ".search-controls": searchControls,
    ".pixel-comparison": fontComparison,
    ".example-dialog .toggle-favorite": { kind: "favorite-button-element" },
    ".example-dialog .dialog-title-row": { kind: "dialog-title-row-element" },
    ".example-dialog .dialog-controls": dialogControls,
    ".example-dialog .dialog-heading > div:first-child": dialogTitle,
    ".example-dialog .emoji-dialog-details": dialogDetails,
    main,
    ".saved-dialog": null,
    ".language-dialog": null,
    ".help-dialog": null,
    ".language-picker": null,
    ".help-dialog .help-language-control": helpLanguageControl,
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        return new FakeNode(tagName);
      },
      querySelector(selector: string) {
        if (selector === ".example-dialog .emoji-composition") {
          compositionQueryCount += 1;
          return compositionQueryCount === 1 ? null : composition;
        }
        return selectors[selector] ?? null;
      },
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      matchMedia() {
        return { matches: true };
      },
    },
  });

  module.positionFavoriteButton();
  assert.deepEqual(titleStub.calls[0], [
    "positionFavoriteButton",
    {
      compact: true,
      dialogControls,
      dialogTitleRow: { kind: "dialog-title-row-element" },
      favoriteButton: { kind: "favorite-button-element" },
    },
  ]);

  titleStub.calls.length = 0;
  module.ensureUtilityControls();

  assert.equal(fontComparison.attributes.get("role"), "radiogroup");
  assert.equal(fontComparison.dataset.i18nAriaLabel, "emojiStyle");
  assert.equal(previewA.replacedWith[0]?.className, "emoji-font-choice emoji-font-choice-system");
  assert.equal(previewB.replacedWith[0]?.className, "emoji-font-choice emoji-font-choice-pixel");
  assert.equal(searchControls.childNodes.some((node) => node?.className === "saved-picker"), true);
  assert.equal(searchControls.childNodes.some((node) => node?.className === "help-picker"), true);
  assert.equal(pixelFontToggle.removed, true);
  assert.deepEqual(pickerStub.calls, ["ensurePickerControls"]);
  assert.deepEqual(advancedStub.calls, ["ensureAdvancedFilterControls"]);
  assert.equal(dialogDetails.inserted[0]?.[1], '<section class="emoji-composition"></section>');
  assert.equal(compositionTitle.childNodes[0]?.className, "emoji-composition-heading");
  assert.equal(main.inserted[0]?.[1], '<dialog class="saved-dialog"></dialog>');
  assert.deepEqual(main.childNodes, [{ kind: "language-dialog" }, { kind: "help-dialog" }]);
  assert.deepEqual((globalThis as any).__mountedLanguagePicker, { kind: "language-picker-button" });
} finally {
  delete (globalThis as any).__mountedLanguagePicker;
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
