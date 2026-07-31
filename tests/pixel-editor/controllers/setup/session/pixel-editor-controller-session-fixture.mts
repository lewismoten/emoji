import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export async function loadControllerSessionFixture() {
  const root = process.cwd();
  const source = await fs.readFile(
    path.join(
      root,
      "src/pixel-editor/controllers/setup/pixel-editor-controller-session.ts",
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
    pathToFileURL(
      path.join(tempDirectory, "pixel-editor-controller-session.mjs"),
    ).href
  );
  const atlasStub = await import(
    pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas-stub.mjs")).href
  );
  const inputStub = await import(
    pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas-io-stub.mjs"))
      .href
  );
  const sessionStub = await import(
    pathToFileURL(path.join(tempDirectory, "pixel-editor-session-stub.mjs"))
      .href
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

  return { atlasStub, elements, inputStub, result, sessionStub, state, visual };
}
