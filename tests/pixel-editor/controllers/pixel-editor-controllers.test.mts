import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Pairing source: ../../../src/pixel-editor/controllers/pixel-editor-controllers.js

const sourceModuleSpecifier =
  "../../../src/pixel-editor/controllers/pixel-editor-controllers.ts";
const root = process.cwd();
const source = await fs.readFile(
  path.join(root, "src/pixel-editor/controllers/pixel-editor-controllers.ts"),
  "utf8",
);

const transformedSource = source
  .replace(
    'from "../data/pixel-editor-drafts.js";',
    'from "./pixel-editor-drafts-stub.mjs";',
  )
  .replace(
    'from "../core/pixel-editor-geometry-helpers.js";',
    'from "./pixel-editor-geometry-helpers-stub.mjs";',
  )
  .replace(
    'from "./pixel-editor-startup.js";',
    'from "./pixel-editor-startup-stub.mjs";',
  )
  .replace(
    'from "./setup/pixel-editor-controller-session.js";',
    'from "./pixel-editor-controller-session-stub.mjs";',
  )
  .replace(
    'from "./setup/pixel-editor-controller-visual.js";',
    'from "./pixel-editor-controller-visual-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-controllers-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-drafts-stub.mjs"),
  [
    "export const draftCalls = [];",
    "export function createPixelEditorDraftController(options) {",
    "  draftCalls.push(options);",
    "  return { kind: 'draft-controller' };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  [
    "export const cloneFloatingLayer = 'clone-floating-layer';",
    "export const cloneSelection = 'clone-selection';",
    "export const extractPixels = 'extract-pixels';",
    "export const hasVisiblePixels = 'has-visible-pixels';",
    "export const pixelsEqual = 'pixels-equal';",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-startup-stub.mjs"),
  [
    "export const startupCalls = [];",
    "export function initializePixelEditorUi(options) {",
    "  startupCalls.push(options);",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-controller-session-stub.mjs"),
  [
    "export const sessionCalls = [];",
    "export function createPixelEditorSessionControllers(options) {",
    "  sessionCalls.push(options);",
    "  return {",
    "    atlasController: { kind: 'atlas-controller' },",
    "    inputController: { kind: 'input-controller' },",
    "    sessionController: {",
    "      open() { return 'open'; },",
    "      refreshTranslations() { return 'translations'; },",
    "      refreshFontBuild() { return 'font'; },",
    "    },",
    "  };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-controller-visual-stub.mjs"),
  [
    "export const visualCalls = [];",
    "export function createPixelEditorVisualControllers(options) {",
    "  visualCalls.push(options);",
    "  return {",
    "    modeController: { updateTransferButtons() { return 'transfer-buttons'; } },",
    "    paletteController: { kind: 'palette' },",
    "    previewController: { kind: 'preview' },",
    "    renderController: { kind: 'render' },",
    "    runtimeController: { kind: 'runtime' },",
    "    toolController: { kind: 'tool' },",
    "    transferController: { kind: 'transfer' },",
    "  };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-controllers.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-controllers.mjs")).href
);
const draftStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-drafts-stub.mjs")).href
);
const startupStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-startup-stub.mjs")).href
);
const sessionStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-controller-session-stub.mjs"),
  ).href
);
const visualStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-controller-visual-stub.mjs"),
  ).href
);

const state: any = {
  artworkDrafts: new Map(),
  atlasBlob: "blob",
  atlasExists: true,
  cellLoaded: true,
  currentEntry: { key: "smile" },
  dirtyKeys: new Set(["smile"]),
  fillShapesEnabled: false,
  floatingLayer: "layer",
  persistedArtwork: new Map(),
  pixels: new Uint8ClampedArray([1]),
  selection: "selection",
  traceOffsetX: 1,
  traceOffsetY: 2,
};

const elements: any = {
  bakeLayerButton: "bake",
  cancelLayerButton: "cancel",
  canvas: "canvas",
  copyArtButton: "copy-art",
  copyFontButton: "copy-font",
  copySelectionButton: "copy-selection",
  dirtyIndicator: "dirty",
  downloadButton: "download",
  downloadEmojiButton: "download-emoji",
  historyButtons: ["history"],
  invertLayerButton: "invert",
  layerNudgeButtons: ["layer-nudge"],
  layerTransformButtons: ["layer-transform"],
  paletteButtons: ["palette"],
  pasteArtButton: "paste-art",
  previewActionButtons: ["preview-action"],
  redoButton: "redo",
  saveButton: "save",
  status: "status",
  toolButtons: ["tool"],
  traceAlpha: "trace-alpha",
  traceNudgeButtons: ["trace-nudge"],
  undoButton: "undo",
};

const result = module.createPixelEditorControllers({
  dialog: "dialog",
  elements,
  formatNumber: "format-number",
  formatPercent: "format-percent",
  state,
  translate: "translate",
});

assert.equal(
  sourceModuleSpecifier,
  "../../../src/pixel-editor/controllers/pixel-editor-controllers.ts",
);
assert.equal(typeof result.open, "function");
assert.equal(typeof result.refreshTranslations, "function");
assert.equal(typeof result.refreshFontBuild, "function");

assert.equal(draftStub.draftCalls.length, 1);
assert.equal(visualStub.visualCalls.length, 1);
assert.equal(sessionStub.sessionCalls.length, 1);
assert.equal(startupStub.startupCalls.length, 1);

const draftOptions = draftStub.draftCalls[0];
assert.equal(draftOptions.currentEntry(), state.currentEntry);
assert.equal(draftOptions.floatingLayer(), state.floatingLayer);
assert.equal(draftOptions.selection(), state.selection);
draftOptions.pixelsSetter(new Uint8ClampedArray([9]));
assert.deepEqual(Array.from(state.pixels), [9]);

const sessionOptions = sessionStub.sessionCalls[0];
assert.equal(sessionOptions.dialog, "dialog");
assert.equal(sessionOptions.translate, "translate");
assert.equal(sessionOptions.visual.paletteController.kind, "palette");
assert.equal(sessionOptions.visual.transferController.kind, "transfer");

const startupOptions = startupStub.startupCalls[0];
assert.equal(startupOptions.canvas, elements.canvas);
assert.equal(startupOptions.atlasController.kind, "atlas-controller");
assert.equal(startupOptions.inputController.kind, "input-controller");
startupOptions.adjustTraceOffsets(5, -2);
assert.equal(state.traceOffsetX, 6);
assert.equal(state.traceOffsetY, 0);
