import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Pairing source: ../../../src/pixel-editor/controllers/pixel-editor-mode.js

const sourceModuleSpecifier =
  "../../../src/pixel-editor/controllers/pixel-editor-mode.ts";
const root = process.cwd();
const source = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-mode.ts"),
  "utf8",
);

const transformedSource = source
  .replace(
    'from "../layers/pixel-editor-layer-helpers.js";',
    'from "./pixel-editor-layer-helpers-stub.mjs";',
  )
  .replace(
    'from "../core/pixel-editor-geometry-helpers.js";',
    'from "./pixel-editor-geometry-helpers-stub.mjs";',
  )
  .replace(
    'from "../core/pixel-editor-grid-navigation.js";',
    'from "./pixel-editor-grid-navigation-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-mode-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-layer-helpers-stub.mjs"),
  [
    "export const layerCalls = [];",
    "export function flipPixels(_layer, horizontal) {",
    "  layerCalls.push(['flipPixels', horizontal]);",
    "  return horizontal ? new Uint8ClampedArray([7,7,7,255]) : new Uint8ClampedArray([8,8,8,255]);",
    "}",
    "export function layerTransformChangesPixels(_layer, rotated) {",
    "  layerCalls.push(['layerTransformChangesPixels']);",
    "  return rotated.changed !== false;",
    "}",
    "export function nextLayerRotation(_layer, clockwise) {",
    "  layerCalls.push(['nextLayerRotation', clockwise]);",
    "  return { pixels: new Uint8ClampedArray([9,9,9,255]), width: 2, height: 2, changed: true };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  [
    "export const geometryCalls = [];",
    "export function layerPositionAllowed(_layer, x, y) {",
    "  geometryCalls.push(['layerPositionAllowed', x, y]);",
    "  return x >= 0 && y >= 0 && x < 5 && y < 5;",
    "}",
    "export function pixelsEqual(left, right) {",
    "  geometryCalls.push(['pixelsEqual']);",
    "  return left.length === right.length && left.every((value, index) => value === right[index]);",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-grid-navigation-stub.mjs"),
  [
    "export const rovingCalls = [];",
    "export function syncRovingGrid(buttons) {",
    "  rovingCalls.push(buttons);",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-mode.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-mode.mjs")).href
);
const geometryStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  ).href
);
const gridStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-grid-navigation-stub.mjs"),
  ).href
);

const classList = () => {
  const active = new Set<string>();
  return {
    active,
    contains(name: string) {
      return active.has(name);
    },
    toggle(name: string, force?: boolean) {
      if (force === false) active.delete(name);
      else if (force === true || !active.has(name)) active.add(name);
      else active.delete(name);
    },
  };
};

const copyArtButton: any = { disabled: false, hidden: false };
const copyFontButton: any = { disabled: false, hidden: false };
const copySelectionButton: any = { disabled: false, hidden: false };
const pasteArtButton: any = { disabled: false, hidden: false };
const canvas: any = { tabIndex: -1 };
const toolsPanel: any = { hidden: false };
const historyPanel: any = { hidden: false };
const drawingPanel: any = { hidden: false };
const tracingPanel: any = { hidden: false };
const transferPanel: any = { hidden: false };
const layerPanel: any = { hidden: true };
const layerHelp: any = { hidden: true };
const filePanel: any = { hidden: false };
const previewActions: any = { hidden: false };
const view: any = { classList: classList() };
const invertLayerButton: any = {
  attributes: new Map<string, string>(),
  classList: classList(),
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  },
};
const toolButtons: any[] = [{ disabled: false }, { disabled: false }];
const layerNudgeButtons: any[] = [
  { dataset: { layerX: "1", layerY: "0" }, disabled: false },
  { dataset: { layerX: "-1", layerY: "0" }, disabled: false },
];
const layerTransformButtons: any[] = [
  { dataset: { layerTransform: "rotate-right" }, disabled: false },
  { dataset: { layerTransform: "flip-horizontal" }, disabled: false },
];

let currentEntry: any = { painted: true };
let loaded = true;
let currentSelection: any = { x: 1 };
let currentTool = "pencil";
let currentFloatingLayer: any = undefined;
let clipboard: any = { kind: "art" };

const controller = module.createPixelEditorModeController({
  artworkClipboard: () => clipboard,
  canvas,
  cellLoaded: () => loaded,
  copyArtButton,
  copyFontButton,
  copySelectionButton,
  currentEntry: () => currentEntry,
  draftController: {
    hasVisibleArtwork: () => true,
    selectionHasVisibleArtwork: () => true,
  },
  drawingPanel,
  filePanel,
  floatingLayer: () => currentFloatingLayer,
  historyPanel,
  invertLayerButton,
  layerHelp,
  layerNudgeButtons,
  layerPanel,
  layerTransformButtons,
  paletteController: {
    activePaletteColors: () => ["#fff", "#000"],
  },
  pasteArtButton,
  pastePending: () => false,
  previewActions,
  selection: () => currentSelection,
  tool: () => currentTool,
  toolButtons,
  toolsPanel,
  tracingPanel,
  transferPanel,
  view,
});

assert.equal(
  sourceModuleSpecifier,
  "../../../src/pixel-editor/controllers/pixel-editor-mode.ts",
);
controller.updateTransferButtons();
assert.equal(copyArtButton.disabled, false);
assert.equal(copyFontButton.disabled, false);
assert.equal(copySelectionButton.disabled, false);
assert.equal(pasteArtButton.disabled, false);

currentTool = "select";
clipboard = { kind: "art" };
controller.updateTransferButtons();
assert.equal(pasteArtButton.disabled, true);
clipboard = { kind: "selection" };
controller.updateTransferButtons();
assert.equal(pasteArtButton.disabled, false);

currentFloatingLayer = {
  x: 1,
  y: 1,
  width: 1,
  height: 1,
  inverted: true,
  pixels: new Uint8ClampedArray([1, 1, 1, 255]),
};
controller.updateEditorModePanels();
assert.equal(view.classList.contains("is-layer-mode"), true);
assert.equal(view.classList.contains("is-selection-mode"), false);
assert.equal(canvas.tabIndex, 0);
assert.equal(toolsPanel.hidden, true);
assert.equal(historyPanel.hidden, true);
assert.equal(layerPanel.hidden, false);
assert.equal(layerHelp.hidden, false);
assert.equal(previewActions.hidden, true);
assert.equal(copyArtButton.hidden, false);
assert.equal(copySelectionButton.hidden, true);
assert.equal(
  toolButtons.every((button) => button.disabled === true),
  true,
);
assert.equal(invertLayerButton.attributes.get("aria-pressed"), "true");
assert.equal(invertLayerButton.classList.contains("is-active"), true);
assert.equal(gridStub.rovingCalls.length >= 1, true);

controller.updateLayerControlStates();
assert.equal(layerNudgeButtons[0].disabled, false);
assert.equal(layerNudgeButtons[1].disabled, false);
assert.equal(layerTransformButtons[0].disabled, false);
assert.equal(layerTransformButtons[1].disabled, false);
assert.equal(
  geometryStub.geometryCalls.some(
    (entry: any[]) => entry[0] === "layerPositionAllowed",
  ),
  true,
);

currentFloatingLayer = undefined;
currentTool = "select";
controller.updateEditorModePanels();
assert.equal(view.classList.contains("is-layer-mode"), false);
assert.equal(view.classList.contains("is-selection-mode"), true);
assert.equal(copyArtButton.hidden, true);
assert.equal(copySelectionButton.hidden, false);
