import assert from "node:assert/strict";
import { initializePixelEditorUi } from "../../../src/pixel-editor/controllers/pixel-editor-startup.js";

type ListenerMap = Map<string, Function[]>;

const createTarget = (dataset: Record<string, string> = {}) => {
  const listeners: ListenerMap = new Map();
  return {
    classList: {
      contains: () => false,
    },
    dataset,
    disabled: false,
    focus() {},
    getAttribute(_name: string) {
      return null;
    },
    getBoundingClientRect() {
      return { height: 20, left: 0, top: 0, width: 20 };
    },
    getClientRects() {
      return [1];
    },
    hidden: false,
    listeners,
    tabIndex: -1,
    addEventListener(type: string, handler: Function) {
      const list = listeners.get(type) ?? [];
      list.push(handler);
      listeners.set(type, list);
    },
  };
};

const docTarget = createTarget();
const winTarget = createTarget();
const canvas = createTarget();
const copyArtButton = createTarget();
const copyFontButton = createTarget();
const copySelectionButton = createTarget();
const pasteArtButton = createTarget();
const bakeLayerButton = createTarget();
const invertLayerButton = createTarget();
const saveButton = createTarget();
const downloadButton = createTarget();
const downloadEmojiButton = createTarget();
const undoButton = createTarget();
const redoButton = createTarget();
const cancelLayerButton = createTarget();
const traceAlpha = createTarget();
(traceAlpha as any).value = "25";

const toolA = createTarget({ tool: "pencil" });
const toolB = createTarget({ tool: "ellipse" });
const paletteA = createTarget();
const paletteB = createTarget();
const traceNudge = createTarget({ traceX: "1", traceY: "-1" });
const layerNudge = createTarget({ layerX: "2", layerY: "3" });
const layerTransform = createTarget({ layerTransform: "rotate-right" });
const previewButton = createTarget();
const historyButton = createTarget();

const calls: Array<any> = [];
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalGetComputedStyle = Object.getOwnPropertyDescriptor(
  globalThis,
  "getComputedStyle",
);

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: { documentElement: { dir: "ltr" } },
});
Object.defineProperty(globalThis, "getComputedStyle", {
  configurable: true,
  value: (button: any) => ({
    gridColumnStart: button.dataset.gridColumn ?? "1",
    gridRowStart: button.dataset.gridRow ?? "1",
  }),
});

try {
  initializePixelEditorUi({
    adjustTraceOffsets: (x: number, y: number) =>
      calls.push(["trace-offset", x, y]),
    atlasController: {
      downloadAtlas: () => calls.push("download-atlas"),
      downloadEmojiPng: () => calls.push("download-emoji"),
      saveAtlas: () => calls.push("save-atlas"),
    },
    bakeLayerButton,
    cancelLayerButton,
    canvas,
    copyArtButton,
    copyFontButton,
    copySelectionButton,
    documentTarget: docTarget,
    downloadButton,
    downloadEmojiButton,
    draftController: {
      updatePreviewActionLabels: () => calls.push("preview-action-labels"),
      warnAboutDirtyArtwork: () => calls.push("warn-dirty"),
    },
    historyButtons: [historyButton],
    inputController: {
      onCanvasKeyDown: () => calls.push("canvas-keydown"),
      onEditorKeyDown: () => calls.push("editor-keydown"),
      onPointerCancel: () => calls.push("pointercancel"),
      onPointerDown: () => calls.push("pointerdown"),
      onPointerMove: () => calls.push("pointermove"),
      onPointerUp: () => calls.push("pointerup"),
    },
    invertLayerButton,
    layerNudgeButtons: [layerNudge],
    layerTransformButtons: [layerTransform],
    paletteButtons: [paletteA, paletteB],
    paletteController: {
      selectPaletteColor: (button: unknown) => calls.push(["palette", button]),
      updatePaletteSelection: () => calls.push("palette-selection"),
    },
    pasteArtButton,
    previewActionButtons: [previewButton],
    previewController: {
      renderTrace: () => calls.push("render-trace"),
    },
    renderController: {
      draw: () => calls.push("draw"),
    },
    runtimeController: {
      redo: () => calls.push("redo"),
      undo: () => calls.push("undo"),
      updateTraceOutput: () => calls.push("trace-output"),
    },
    saveButton,
    toolButtons: [toolA, toolB],
    toolController: {
      selectTool: (tool: string) => calls.push(["select-tool", tool]),
      updateShapeToolButtons: () => calls.push("shape-buttons"),
    },
    traceAlpha,
    traceNudgeButtons: [traceNudge],
    transferController: {
      bakeFloatingLayer: () => calls.push("bake-layer"),
      cancelFloatingLayer: () => calls.push("cancel-layer"),
      copyFontGlyph: (button: unknown) => calls.push(["copy-font", button]),
      copyPixelArt: () => calls.push("copy-art"),
      copySelection: () => calls.push("copy-selection"),
      moveFloatingLayer: (x: number, y: number) =>
        calls.push(["move-layer", x, y]),
      pastePixelArt: () => calls.push("paste-art"),
      toggleFloatingLayerInversion: () => calls.push("invert-layer"),
      transformFloatingLayer: (mode: string) =>
        calls.push(["transform-layer", mode]),
    },
    undoButton,
    redoButton,
    windowTarget: winTarget,
  });
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalGetComputedStyle) {
    Object.defineProperty(
      globalThis,
      "getComputedStyle",
      originalGetComputedStyle,
    );
  } else Reflect.deleteProperty(globalThis, "getComputedStyle");
}

assert.equal(toolA.listeners.get("click")?.length, 2);
toolB.listeners.get("click")?.[0]();
traceAlpha.listeners.get("input")?.[0]();
traceNudge.listeners.get("click")?.[0]();
paletteA.listeners.get("click")?.[0]();
undoButton.listeners.get("click")?.[0]();
redoButton.listeners.get("click")?.[0]();
copyArtButton.listeners.get("click")?.[0]();
copyFontButton.listeners.get("click")?.[0]();
copySelectionButton.listeners.get("click")?.[0]();
pasteArtButton.listeners.get("click")?.[0]();
layerNudge.listeners.get("click")?.[0]();
layerTransform.listeners.get("click")?.[0]();
bakeLayerButton.listeners.get("click")?.[0]();
cancelLayerButton.listeners.get("click")?.[0]();
invertLayerButton.listeners.get("click")?.[0]();
saveButton.listeners.get("click")?.[0]();
downloadButton.listeners.get("click")?.[0]();
downloadEmojiButton.listeners.get("click")?.[0]();
canvas.listeners.get("pointerdown")?.[0]();
canvas.listeners.get("pointermove")?.[0]();
canvas.listeners.get("pointerup")?.[0]();
canvas.listeners.get("pointercancel")?.[0]();
canvas.listeners.get("keydown")?.[0]();
docTarget.listeners.get("keydown")?.[0]();
winTarget.listeners.get("beforeunload")?.[0]();

assert.deepEqual(calls.slice(0, 5), [
  "palette-selection",
  "shape-buttons",
  "trace-output",
  "preview-action-labels",
  "draw",
]);
assert.equal(
  calls.some(
    (entry) =>
      Array.isArray(entry) &&
      entry[0] === "select-tool" &&
      entry[1] === "ellipse",
  ),
  true,
);
assert.equal(
  calls.some(
    (entry) =>
      Array.isArray(entry) &&
      entry[0] === "trace-offset" &&
      entry[1] === 1 &&
      entry[2] === -1,
  ),
  true,
);
assert.equal(calls.includes("render-trace"), true);
assert.equal(calls.includes("undo"), true);
assert.equal(calls.includes("redo"), true);
assert.equal(calls.includes("copy-art"), true);
assert.equal(calls.includes("copy-selection"), true);
assert.equal(calls.includes("paste-art"), true);
assert.equal(calls.includes("bake-layer"), true);
assert.equal(calls.includes("cancel-layer"), true);
assert.equal(calls.includes("invert-layer"), true);
assert.equal(calls.includes("save-atlas"), true);
assert.equal(calls.includes("download-atlas"), true);
assert.equal(calls.includes("download-emoji"), true);
assert.equal(calls.includes("canvas-keydown"), true);
assert.equal(calls.includes("editor-keydown"), true);
assert.equal(calls.includes("warn-dirty"), true);
