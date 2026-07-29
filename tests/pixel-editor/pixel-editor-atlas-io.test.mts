import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceModuleSpecifier =
  "../../src/pixel-editor/data/pixel-editor-atlas-io.js";
const root = process.cwd();
const source = await fs.readFile(
  path.join(root, "build/src/pixel-editor/data/pixel-editor-atlas-io.js"),
  "utf8",
);

const transformedSource = source
  .replace(
    'from "../core/pixel-editor-constants.js";',
    'from "./pixel-editor-constants-stub.mjs";',
  )
  .replace(
    'from "../canvas/pixel-editor-canvas-helpers.js";',
    'from "./pixel-editor-canvas-helpers-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-atlas-io-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-constants-stub.mjs"),
  "export const CELL_SIZE = 12;\n",
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs"),
  [
    "export const helperCalls = [];",
    "export async function canvasToPng(canvas) {",
    "  helperCalls.push(['canvasToPng', canvas.width, canvas.height]);",
    "  return { kind: 'png-blob' };",
    "}",
    "export function drawBitmapText(context, x, y, text, color) {",
    "  helperCalls.push(['drawBitmapText', x, y, text, color, context.kind]);",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-atlas-io.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas-io.mjs")).href,
);
const helperStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs")).href,
);

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalCreateImageBitmap = Object.getOwnPropertyDescriptor(
  globalThis,
  "createImageBitmap",
);

try {
  const nestedCalls: Array<[string, boolean]> = [];
  const fileHandle = await module.getNestedFileHandle(
    {
      async getDirectoryHandle(name: string, options: { create: boolean }) {
        nestedCalls.push([name, options.create]);
        return {
          async getDirectoryHandle(inner: string, innerOptions: { create: boolean }) {
            nestedCalls.push([inner, innerOptions.create]);
            return {
              getFileHandle(file: string, fileOptions: { create: boolean }) {
                return { file, create: fileOptions.create };
              },
            };
          },
        };
      },
    },
    "people/smile/file.png",
    true,
  );
  assert.equal(sourceModuleSpecifier, "../../src/pixel-editor/data/pixel-editor-atlas-io.js");
  assert.deepEqual(nestedCalls, [
    ["people", true],
    ["smile", true],
  ]);
  assert.deepEqual(fileHandle, { file: "file.png", create: true });

  const fillCalls: any[] = [];
  const atlasContext = {
    kind: "atlas-context",
    fillStyle: "",
    fillRect(x: number, y: number, width: number, height: number) {
      fillCalls.push([this.fillStyle, x, y, width, height]);
    },
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag: string) {
        assert.equal(tag, "canvas");
        return {
          height: 0,
          width: 0,
          getContext: () => atlasContext,
        };
      },
    },
  });

  const blankAtlas = await module.createBlankAtlas(
    {
      author: "Lewis",
      createdDate: "2026-07-29",
      footerHeight: 16,
      headerHeight: 32,
      setName: "Pixel Emoji",
      url: "https://lewismoten.com",
    },
    {
      atlasHeight: 64,
      atlasWidth: 128,
      group: "Smileys",
      part: 2,
      partCount: 3,
      subGroup: "face-smiling",
    },
  );
  assert.deepEqual(blankAtlas, { kind: "png-blob" });
  assert.equal(fillCalls.length, 4);
  assert.equal(
    helperStub.helperCalls.some((entry: any[]) => entry[0] === "drawBitmapText" && entry[3] === "SUBGROUP: face-smiling 2/3"),
    true,
  );

  const extractContext = {
    drawImage() {},
    getImageData(_x: number, _y: number, width: number, height: number) {
      return { data: new Uint8ClampedArray(width * height * 4).fill(5) };
    },
  };
  Object.defineProperty(globalThis, "createImageBitmap", {
    configurable: true,
    value: async () => ({
      close() {},
      height: 24,
      width: 24,
    }),
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement() {
        return {
          height: 0,
          width: 0,
          getContext: () => extractContext,
        };
      },
    },
  });
  const extracted = await module.extractCell(
    { kind: "blob" },
    { x: 1, y: 2 },
  );
  assert.equal(extracted.length, 12 * 12 * 4);

  const pointerCalls: string[] = [];
  const fakeCanvas = {
    captured: true,
    focus() {
      pointerCalls.push("focus");
    },
    getBoundingClientRect() {
      return { height: 120, left: 10, top: 20, width: 120 };
    },
    hasPointerCapture() {
      return this.captured;
    },
    releasePointerCapture() {
      this.captured = false;
      pointerCalls.push("release-capture");
    },
    setPointerCapture() {
      this.captured = true;
      pointerCalls.push("set-capture");
    },
  };

  const selectionState: any = {
    cellLoaded: () => true,
    currentEntry: () => ({ key: "smile" }),
    layerDragOrigin: () => ({ x: 1, y: 1 }),
    layerDragStart: () => undefined,
    pointerPrevious: () => ({ x: 0, y: 0 }),
    pointerStart: () => undefined,
    shapeBase: () => undefined,
  };

  const editorCalls: string[] = [];
  const input = module.createPixelEditorInputController({
    bakeFloatingLayer: () => editorCalls.push("bake"),
    boundsFromPoints: (_start: any, _end: any) => ({ x: 0, y: 0, width: 1, height: 1 }),
    canvas: fakeCanvas,
    cancelFloatingLayer: () => editorCalls.push("cancel"),
    cellSize: 12,
    clamp: (value: number, minimum: number, maximum: number) =>
      Math.min(Math.max(value, minimum), maximum),
    copyArtButton: { disabled: false },
    copyPixelArt: () => editorCalls.push("copy-art"),
    copySelection: () => editorCalls.push("copy-selection"),
    copySelectionButton: { disabled: false },
    dialog: { open: true },
    draftController: { pushHistory: () => editorCalls.push("push-history") },
    drawLine: () => editorCalls.push("draw-line"),
    drawShape: () => editorCalls.push("draw-shape"),
    floodFill: () => editorCalls.push("flood-fill"),
    floatingLayer: () => undefined,
    moveFloatingLayer: () => editorCalls.push("move-layer"),
    pasteArtButton: { disabled: false },
    pastePixelArt: () => editorCalls.push("paste-art"),
    paletteController: { pickColor: () => editorCalls.push("pick-color") },
    pixels: () => new Uint8ClampedArray([1, 2, 3, 4]),
    redo: () => editorCalls.push("redo"),
    redoButton: { disabled: false },
    releasePointerState: () => editorCalls.push("release-state"),
    renderController: {
      draw: () => editorCalls.push("draw"),
      pointInFloatingLayer: () => false,
    },
    selectionState,
    setLayerDragOrigin: () => editorCalls.push("set-layer-origin"),
    setLayerDragStart: () => editorCalls.push("set-layer-start"),
    setPointerPrevious: () => editorCalls.push("set-pointer-previous"),
    setPointerStart: () => editorCalls.push("set-pointer-start"),
    setSelection: () => editorCalls.push("set-selection"),
    setShapeBase: () => editorCalls.push("set-shape-base"),
    toolState: () => "bucket",
    transformFloatingLayer: (mode: string) => editorCalls.push(`transform:${mode}`),
    undo: () => editorCalls.push("undo"),
    undoButton: { disabled: false },
    updateTransferButtons: () => editorCalls.push("update-transfer-buttons"),
    view: { hidden: false },
  });

  input.onPointerDown({
    button: 0,
    clientX: 20,
    clientY: 30,
    pointerId: 1,
  });
  assert.equal(pointerCalls.includes("set-capture"), true);
  assert.equal(editorCalls.includes("push-history"), true);
  assert.equal(editorCalls.includes("flood-fill"), true);

  input.onPointerUp({ pointerId: 1 });
  assert.equal(editorCalls.includes("release-state"), true);
  assert.equal(editorCalls.includes("update-transfer-buttons"), true);

  input.onCanvasKeyDown({
    ctrlKey: true,
    altKey: false,
    metaKey: false,
    key: "ArrowRight",
    preventDefault() {
      editorCalls.push("prevent-default-rotate");
    },
  });
  input.onCanvasKeyDown({
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: true,
    key: "ArrowLeft",
    preventDefault() {
      editorCalls.push("prevent-default-flip");
    },
  });

  const floatingInput = module.createPixelEditorInputController({
    bakeFloatingLayer: () => editorCalls.push("bake-2"),
    boundsFromPoints: (_start: any, _end: any) => ({ x: 0, y: 0, width: 1, height: 1 }),
    canvas: fakeCanvas,
    cancelFloatingLayer: () => editorCalls.push("cancel-2"),
    cellSize: 12,
    clamp: (value: number, minimum: number, maximum: number) =>
      Math.min(Math.max(value, minimum), maximum),
    copyArtButton: { disabled: false },
    copyPixelArt: () => editorCalls.push("copy-art-2"),
    copySelection: () => editorCalls.push("copy-selection-2"),
    copySelectionButton: { disabled: false },
    dialog: { open: true },
    draftController: { pushHistory: () => editorCalls.push("push-history-2") },
    drawLine: () => editorCalls.push("draw-line-2"),
    drawShape: () => editorCalls.push("draw-shape-2"),
    floodFill: () => editorCalls.push("flood-fill-2"),
    floatingLayer: () => ({ x: 0, y: 0, width: 1, height: 1 }),
    moveFloatingLayer: (...args: number[]) => editorCalls.push(`move-layer:${args.join(",")}`),
    pasteArtButton: { disabled: false },
    pastePixelArt: () => editorCalls.push("paste-art-2"),
    paletteController: { pickColor: () => editorCalls.push("pick-color-2") },
    pixels: () => new Uint8ClampedArray([1, 2, 3, 4]),
    redo: () => editorCalls.push("redo-2"),
    redoButton: { disabled: false },
    releasePointerState: () => editorCalls.push("release-state-2"),
    renderController: {
      draw: () => editorCalls.push("draw-2"),
      pointInFloatingLayer: () => true,
    },
    selectionState: {
      cellLoaded: () => true,
      currentEntry: () => ({ key: "smile" }),
      layerDragOrigin: () => ({ x: 1, y: 1 }),
      layerDragStart: () => ({ x: 0, y: 0 }),
      pointerPrevious: () => ({ x: 0, y: 0 }),
      pointerStart: () => ({ x: 0, y: 0 }),
      shapeBase: () => new Uint8ClampedArray([1, 2, 3, 4]),
    },
    setLayerDragOrigin: () => editorCalls.push("set-layer-origin-2"),
    setLayerDragStart: () => editorCalls.push("set-layer-start-2"),
    setPointerPrevious: () => editorCalls.push("set-pointer-previous-2"),
    setPointerStart: () => editorCalls.push("set-pointer-start-2"),
    setSelection: () => editorCalls.push("set-selection-2"),
    setShapeBase: () => editorCalls.push("set-shape-base-2"),
    toolState: () => "select",
    transformFloatingLayer: (mode: string) => editorCalls.push(`transform-2:${mode}`),
    undo: () => editorCalls.push("undo-2"),
    undoButton: { disabled: false },
    updateTransferButtons: () => editorCalls.push("update-transfer-buttons-2"),
    view: { hidden: false },
  });

  floatingInput.onPointerDown({
    button: 0,
    clientX: 20,
    clientY: 30,
    pointerId: 2,
  });
  floatingInput.onPointerMove({
    clientX: 30,
    clientY: 40,
    pointerId: 2,
  });
  floatingInput.onCanvasKeyDown({
    ctrlKey: true,
    altKey: false,
    metaKey: false,
    key: "ArrowRight",
    preventDefault() {
      editorCalls.push("prevent-default-rotate-2");
    },
  });
  floatingInput.onCanvasKeyDown({
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: true,
    key: "ArrowLeft",
    preventDefault() {
      editorCalls.push("prevent-default-flip-2");
    },
  });
  floatingInput.onCanvasKeyDown({
    key: "Enter",
    preventDefault() {
      editorCalls.push("prevent-enter");
    },
  });
  floatingInput.onCanvasKeyDown({
    key: "Escape",
    preventDefault() {
      editorCalls.push("prevent-escape");
    },
  });

  input.onEditorKeyDown({
    altKey: false,
    ctrlKey: true,
    key: "z",
    metaKey: false,
    preventDefault() {
      editorCalls.push("prevent-undo");
    },
    shiftKey: false,
  });
  input.onEditorKeyDown({
    altKey: false,
    ctrlKey: true,
    key: "y",
    metaKey: false,
    preventDefault() {
      editorCalls.push("prevent-redo");
    },
  });
  input.onEditorKeyDown({
    altKey: false,
    ctrlKey: true,
    key: "c",
    metaKey: false,
    preventDefault() {
      editorCalls.push("prevent-copy");
    },
    shiftKey: false,
  });
  input.onEditorKeyDown({
    altKey: false,
    ctrlKey: true,
    key: "v",
    metaKey: false,
    preventDefault() {
      editorCalls.push("prevent-paste");
    },
    shiftKey: false,
  });

  assert.equal(editorCalls.includes("transform-2:rotate-right"), true);
  assert.equal(editorCalls.includes("transform-2:flip-horizontal"), true);
  assert.equal(
    editorCalls.some((entry) => String(entry).startsWith("move-layer:")),
    true,
  );
  assert.equal(editorCalls.includes("bake-2"), true);
  assert.equal(editorCalls.includes("cancel-2"), true);
  assert.equal(editorCalls.includes("undo"), true);
  assert.equal(editorCalls.includes("redo"), true);
  assert.equal(editorCalls.includes("copy-art"), true);
  assert.equal(editorCalls.includes("paste-art"), true);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalCreateImageBitmap) {
    Object.defineProperty(globalThis, "createImageBitmap", originalCreateImageBitmap);
  } else Reflect.deleteProperty(globalThis, "createImageBitmap");
}
