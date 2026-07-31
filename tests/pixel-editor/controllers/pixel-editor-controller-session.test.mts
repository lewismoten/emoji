import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceModuleSpecifier =
  "../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js";
const root = process.cwd();
const source = await fs.readFile(
  path.join(
    root,
    "build/src/pixel-editor/controllers/setup/pixel-editor-controller-session.js",
  ),
  "utf8",
);

const transformedSource = source
  .replace(
    'from "../../core/pixel-editor-geometry-helpers.js";',
    'from "./pixel-editor-geometry-helpers-stub.mjs";',
  )
  .replace(
    'from "../../core/pixel-editor-constants.js";',
    'from "./pixel-editor-constants-stub.mjs";',
  )
  .replace(
    'from "../../data/pixel-editor-atlas-io.js";',
    'from "./pixel-editor-atlas-io-stub.mjs";',
  )
  .replace(
    'from "../pixel-editor-atlas.js";',
    'from "./pixel-editor-atlas-stub.mjs";',
  )
  .replace(
    'from "../pixel-editor-session.js";',
    'from "./pixel-editor-session-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-controller-session-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  [
    "export const boundsFromPoints = 'bounds';",
    "export const clamp = 'clamp';",
    "export const cloneFloatingLayer = 'clone-floating';",
    "export const cloneSelection = 'clone-selection';",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-constants-stub.mjs"),
  "export const CELL_SIZE = 12;\n",
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-atlas-io-stub.mjs"),
  [
    "export const createBlankAtlas = 'create-blank-atlas';",
    "export const extractCell = 'extract-cell';",
    "export const getNestedFileHandle = 'nested-file-handle';",
    "export const inputCalls = [];",
    "export function createPixelEditorInputController(options) {",
    "  inputCalls.push(options);",
    "  return { kind: 'input-controller' };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-atlas-stub.mjs"),
  [
    "export const atlasCalls = [];",
    "export function createPixelEditorAtlasController(options) {",
    "  atlasCalls.push(options);",
    "  return { kind: 'atlas-controller' };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-session-stub.mjs"),
  [
    "export const sessionCalls = [];",
    "export function createPixelEditorSessionController(options) {",
    "  sessionCalls.push(options);",
    "  return { kind: 'session-controller' };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-controller-session.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-controller-session.mjs"))
    .href
);
const atlasStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas-stub.mjs")).href
);
const inputStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas-io-stub.mjs")).href
);
const sessionStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-session-stub.mjs")).href
);

const state: any = {
  artworkDrafts: new Map(),
  atlasBlob: "blob",
  atlasExists: true,
  atlasHeight: 10,
  atlasWidth: 20,
  cellLoaded: true,
  currentEmoji: "😀",
  currentEntry: { key: "smile" },
  directoryHandle: "dir",
  floatingLayer: { id: 1 },
  layerDragOrigin: "origin",
  layerDragStart: "start",
  persistedArtwork: new Map(),
  pixels: new Uint8ClampedArray([1]),
  pointerPrevious: "prev",
  pointerStart: "pointer",
  selection: { x: 1 },
  shapeBase: "shape",
  tool: "pencil",
  traceOffsetX: 3,
  traceOffsetY: 4,
};

const elements: any = {
  canvas: "canvas",
  copyArtButton: "copy-art",
  copySelectionButton: "copy-selection",
  downloadButton: "download",
  downloadEmojiButton: "download-emoji",
  location: { textContent: "" },
  pasteArtButton: "paste-art",
  redoButton: "redo",
  saveButton: "save",
  status: { textContent: "" },
  undoButton: "undo",
  view: "view",
};

const visual: any = {
  modeController: { updateTransferButtons: "update-transfer-buttons" },
  paletteController: "palette-controller",
  previewController: "preview-controller",
  renderController: "render-controller",
  runtimeController: {
    loadManifest: "load-manifest",
    redo: "redo-runtime",
    refreshFontBuild: "refresh-font-build",
    refreshTranslations: "refresh-translations",
    renderLocationText: "render-location",
    undo: "undo-runtime",
  },
  toolController: {
    drawLine: "draw-line",
    drawShape: "draw-shape",
    floodFill: "flood-fill",
  },
  transferController: {
    bakeFloatingLayer: "bake-layer",
    cancelFloatingLayer: "cancel-layer",
    copyPixelArt: "copy-pixel-art",
    copySelection: "copy-selection",
    moveFloatingLayer: "move-layer",
    pastePixelArt: "paste-pixel-art",
    transformFloatingLayer: "transform-layer",
  },
};

const result = module.createPixelEditorSessionControllers({
  dialog: "dialog",
  draftController: "draft-controller",
  elements,
  state,
  translate: "translate",
  visual,
});

assert.equal(
  sourceModuleSpecifier,
  "../../../src/pixel-editor/controllers/setup/pixel-editor-controller-session.js",
);
assert.deepEqual(result, {
  atlasController: { kind: "atlas-controller" },
  inputController: { kind: "input-controller" },
  sessionController: { kind: "session-controller" },
});

const sessionOptions = sessionStub.sessionCalls[0];
assert.equal(sessionOptions.cellSize, 12);
assert.equal(sessionOptions.downloadButton, elements.downloadButton);
assert.equal(sessionOptions.saveButton, elements.saveButton);
assert.equal(
  sessionOptions.loadManifest,
  visual.runtimeController.loadManifest,
);
assert.equal(sessionOptions.paletteController, visual.paletteController);
assert.equal(sessionOptions.previewController, visual.previewController);
assert.equal(sessionOptions.renderController, visual.renderController);
assert.equal(
  sessionOptions.refreshRuntimeFontBuild,
  visual.runtimeController.refreshFontBuild,
);
assert.equal(
  sessionOptions.refreshRuntimeTranslations,
  visual.runtimeController.refreshTranslations,
);
assert.equal(
  sessionOptions.renderLocationText,
  visual.runtimeController.renderLocationText,
);
sessionOptions.setAtlasDimensions(30, 40);
sessionOptions.setCurrentEmoji("🙂");
sessionOptions.setCurrentEntry({ key: "wave" });
sessionOptions.setFloatingLayer("layer");
sessionOptions.setLocationText("loc");
sessionOptions.setPixels(new Uint8ClampedArray([9]));
sessionOptions.setSelection("selection");
sessionOptions.setStatusText("status");
sessionOptions.setTraceOffsets(7, 8);
assert.deepEqual(
  {
    atlasHeight: state.atlasHeight,
    atlasWidth: state.atlasWidth,
    currentEmoji: state.currentEmoji,
    currentEntry: state.currentEntry,
    floatingLayer: state.floatingLayer,
    pixels: Array.from(state.pixels),
    selection: state.selection,
    traceOffsetX: state.traceOffsetX,
    traceOffsetY: state.traceOffsetY,
    location: elements.location.textContent,
    status: elements.status.textContent,
  },
  {
    atlasHeight: 40,
    atlasWidth: 30,
    currentEmoji: "🙂",
    currentEntry: { key: "wave" },
    floatingLayer: "layer",
    pixels: [9],
    selection: "selection",
    traceOffsetX: 7,
    traceOffsetY: 8,
    location: "loc",
    status: "status",
  },
);

const atlasOptions = atlasStub.atlasCalls[0];
assert.equal(atlasOptions.downloadButton, elements.downloadButton);
assert.equal(atlasOptions.downloadEmojiButton, elements.downloadEmojiButton);
assert.equal(atlasOptions.translate, "translate");
atlasOptions.setDirectoryHandle("new-dir");
atlasOptions.setAtlasBlob("new-blob");
atlasOptions.setAtlasExists(false);
atlasOptions.writeStatus("atlas-status");
assert.equal(state.directoryHandle, "new-dir");
assert.equal(state.atlasBlob, "new-blob");
assert.equal(state.atlasExists, false);
assert.equal(elements.status.textContent, "atlas-status");

const inputOptions = inputStub.inputCalls[0];
assert.equal(inputOptions.dialog, "dialog");
assert.equal(inputOptions.canvas, elements.canvas);
assert.equal(inputOptions.copyArtButton, elements.copyArtButton);
assert.equal(inputOptions.copySelectionButton, elements.copySelectionButton);
assert.equal(inputOptions.copyPixelArt, visual.transferController.copyPixelArt);
assert.equal(
  inputOptions.copySelection,
  visual.transferController.copySelection,
);
assert.equal(
  inputOptions.pastePixelArt,
  visual.transferController.pastePixelArt,
);
assert.equal(inputOptions.undo, visual.runtimeController.undo);
assert.equal(inputOptions.redo, visual.runtimeController.redo);
assert.equal(inputOptions.paletteController, visual.paletteController);
inputOptions.releasePointerState();
assert.equal(state.pointerStart, undefined);
assert.equal(state.pointerPrevious, undefined);
assert.equal(state.shapeBase, undefined);
assert.equal(state.layerDragStart, undefined);
assert.equal(state.layerDragOrigin, undefined);
inputOptions.setSelection("new-selection");
assert.equal(state.selection, "new-selection");
inputOptions.setLayerDragOrigin("drag-origin");
inputOptions.setLayerDragStart("drag-start");
inputOptions.setPointerPrevious("pointer-prev");
inputOptions.setPointerStart("pointer-start");
inputOptions.setShapeBase("shape-base");
assert.equal(state.layerDragOrigin, "drag-origin");
assert.equal(state.layerDragStart, "drag-start");
assert.equal(state.pointerPrevious, "pointer-prev");
assert.equal(state.pointerStart, "pointer-start");
assert.equal(state.shapeBase, "shape-base");
