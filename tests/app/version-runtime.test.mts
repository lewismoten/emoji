import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/version-runtime.js

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/version-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { loadExplorerCatalog } from "../explorer/catalog-loader.js";',
    'import { loadExplorerCatalog } from "./catalog-loader-stub.mjs";',
  )
  .replace(
    'import { loadVersionCatalog } from "../explorer/version-data.js";',
    'import { loadVersionCatalog } from "./version-data-stub.mjs";',
  )
  .replace(
    'import { createVersionController } from "./version-controller.js";',
    'import { createVersionController } from "./version-controller-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/item: any/g, "item")
  .replace(/key: string/g, "key")
  .replace(/value: string/g, "value")
  .replace(/open: boolean/g, "open")
  .replace(/_navigationKeys: string\[\] \| undefined/g, "_navigationKeys")
  .replace(/initialMode: string \| undefined/g, "initialMode")
  .replace(/ as\s+HTMLElement \| undefined/g, "");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "version-runtime-test-"),
);

await fs.writeFile(
  path.join(tempDirectory, "catalog-loader-stub.mjs"),
  [
    "export const catalogCalls = [];",
    "export function loadExplorerCatalog(options) {",
    "  catalogCalls.push(options);",
    "  return ['catalog-result', options];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "version-data-stub.mjs"),
  [
    "export const versionCatalogCalls = [];",
    "export function loadVersionCatalog(options) {",
    "  versionCatalogCalls.push(options);",
    "  return ['version-catalog-result', options];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "version-controller-stub.mjs"),
  [
    "export const controllerCalls = [];",
    "export const controllerResult = { kind: 'version-controller' };",
    "export function createVersionController(options) {",
    "  controllerCalls.push(options);",
    "  return controllerResult;",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "version-runtime.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "version-runtime.mjs")).href
);
const catalogStub = await import(
  pathToFileURL(path.join(tempDirectory, "catalog-loader-stub.mjs")).href
);
const versionDataStub = await import(
  pathToFileURL(path.join(tempDirectory, "version-data-stub.mjs")).href
);
const controllerStub = await import(
  pathToFileURL(path.join(tempDirectory, "version-controller-stub.mjs")).href
);

const state = {
  allIds: ["wave"],
  byId: { wave: { key: "wave" } },
  emojiByKey: { wave: "👋" },
  items: [{ key: "wave" }],
};
const clickCalls: unknown[][] = [];
const dialogViewCalls: unknown[][] = [];
const result = module.createVersionRuntime({
  applyLoadedUrlState: () => "apply-loaded-url-state",
  buildRepresentatives: "build-representatives",
  developerModeEnabled: "developer-mode-enabled",
  drawList: () => "draw-list",
  getEmojiGenders: (item: unknown) => ["emoji-genders", item],
  getExplorerSubGroup: "get-explorer-subgroup",
  getIntroducedVersion: "get-introduced-version",
  groupSelector: () => "group-selector",
  genderCheckboxes: () => ["neutral"],
  genderFieldset: () => "gender-fieldset",
  hairCheckboxes: () => ["red"],
  hairFieldset: () => "hair-fieldset",
  isViteDevelopment: "vite-dev",
  modifierFilters: () => "modifier-filters",
  onClick: (...args: unknown[]) => {
    clickCalls.push(args);
  },
  onGroupChange: "on-group-change",
  onSequenceTypeChange: "on-sequence-type-change",
  onSubGroupChange: "on-subgroup-change",
  rebuildCodePointLookup: "rebuild-codepoint-lookup",
  renderCategoryFilters: () => "render-category-filters",
  sequenceTypeSelector: () => "sequence-type-selector",
  setDialogView: (...args: unknown[]) => {
    dialogViewCalls.push(args);
  },
  skinToneCheckboxes: () => ["1F3FB"],
  skinToneFieldset: () => "skin-tone-fieldset",
  state: () => state,
  subGroupSelector: () => "subgroup-selector",
  translate: "translate",
  updateModifierArtwork: () => "update-modifier-artwork",
  updatePixelArtworkManifest: "update-pixel-artwork-manifest",
  versionModeSelector: () => "version-mode-selector",
  versionNext: () => "version-next",
  versionPrevious: () => "version-previous",
  versionRange: () => "version-range",
  versionRangeValue: () => "version-range-value",
  versionSelector: () => "version-selector",
});

assert.equal(result, controllerStub.controllerResult);
assert.equal(controllerStub.controllerCalls.length, 1);
const call = controllerStub.controllerCalls[0];

assert.equal(call.applyLoadedUrlState(), "apply-loaded-url-state");
assert.equal(call.buildRepresentatives, "build-representatives");
assert.equal(call.developerModeEnabled, "developer-mode-enabled");
assert.equal(call.drawList(), "draw-list");
assert.deepEqual(call.getEmojiGenders("wave"), ["emoji-genders", "wave"]);
assert.equal(call.groupSelector(), "group-selector");
assert.deepEqual(call.genderCheckboxes(), ["neutral"]);
assert.equal(call.genderFieldset(), "gender-fieldset");
assert.deepEqual(call.hairCheckboxes(), ["red"]);
assert.equal(call.hairFieldset(), "hair-fieldset");
assert.equal(call.modifierFilters(), "modifier-filters");
assert.equal(call.onGroupChange, "on-group-change");
assert.equal(call.onSequenceTypeChange, "on-sequence-type-change");
assert.equal(call.onSubGroupChange, "on-subgroup-change");
assert.equal(call.rebuildCodePointLookup, "rebuild-codepoint-lookup");
assert.equal(call.renderCategoryFilters(), "render-category-filters");
assert.equal(call.sequenceTypeSelector(), "sequence-type-selector");
assert.deepEqual(call.skinToneCheckboxes(), ["1F3FB"]);
assert.equal(call.skinToneFieldset(), "skin-tone-fieldset");
assert.equal(call.state(), state);
assert.equal(call.subGroupSelector(), "subgroup-selector");
assert.equal(call.translate, "translate");
assert.equal(call.updateModifierArtwork(), "update-modifier-artwork");
assert.equal(call.versionModeSelector(), "version-mode-selector");
assert.equal(call.versionNext(), "version-next");
assert.equal(call.versionPrevious(), "version-previous");
assert.equal(call.versionRange(), "version-range");
assert.equal(call.versionRangeValue(), "version-range-value");
assert.equal(call.versionSelector(), "version-selector");

assert.deepEqual(call.loadCatalog(), [
  "catalog-result",
  catalogStub.catalogCalls[0],
]);
assert.equal(
  catalogStub.catalogCalls[0].getExplorerSubGroup,
  "get-explorer-subgroup",
);
assert.equal(catalogStub.catalogCalls[0].isViteDevelopment, "vite-dev");
assert.equal(
  catalogStub.catalogCalls[0].updatePixelArtworkManifest,
  "update-pixel-artwork-manifest",
);

assert.deepEqual(call.loadVersionCatalog(), [
  "version-catalog-result",
  versionDataStub.versionCatalogCalls[0],
]);
assert.deepEqual(versionDataStub.versionCatalogCalls[0].allIds(), ["wave"]);
assert.equal(versionDataStub.versionCatalogCalls[0].byId().wave.key, "wave");
assert.equal(versionDataStub.versionCatalogCalls[0].emojiByKey().wave, "👋");
assert.equal(
  versionDataStub.versionCatalogCalls[0].getExplorerSubGroup,
  "get-explorer-subgroup",
);
assert.deepEqual(versionDataStub.versionCatalogCalls[0].items(), [
  { key: "wave" },
]);

call.openEmoji("wave", true, undefined, "code");
assert.deepEqual(clickCalls, [[{ target: { id: "wave" } }, true]]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

call.openEmoji("wave", false, undefined, "editor");
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, false]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

call.openEmoji("wave", true, undefined, "details");
assert.deepEqual(clickCalls.at(-1), [{ target: { id: "wave" } }, true]);
assert.deepEqual(dialogViewCalls, [["code", false]]);

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    getElementsByClassName(name: string) {
      assert.equal(name, "emoji-version");
      return [{ innerText: "" }];
    },
  },
});
try {
  const target = { innerText: "" };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementsByClassName() {
        return [target];
      },
    },
  });
  call.setIntroducedVersion("Emoji 16.0");
  assert.equal(target.innerText, "Emoji 16.0");

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementsByClassName() {
        return [];
      },
    },
  });
  call.setIntroducedVersion("Emoji 17.0");
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
}
