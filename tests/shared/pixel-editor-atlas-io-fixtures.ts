export const createFakeCanvas = (calls: string[]) => ({
  captured: false,
  focus() {},
  getBoundingClientRect() {
    return { height: 120, left: 0, top: 0, width: 120 };
  },
  hasPointerCapture() {
    return this.captured;
  },
  releasePointerCapture() {
    this.captured = false;
    calls.push("release");
  },
  setPointerCapture() {
    this.captured = true;
  },
});

export const createSelectionState = (
  overrides: Record<string, unknown> = {},
) => ({
  cellLoaded: () => true,
  currentEntry: () => ({ key: "x" }),
  layerDragOrigin: () => ({ x: 0, y: 0 }),
  layerDragStart: () => undefined,
  pointerPrevious: () => ({ x: 0, y: 0 }),
  pointerStart: () => undefined,
  shapeBase: () => undefined,
  ...overrides,
});

export const createInputOptions = (
  calls: string[],
  canvas: any,
  selectionState: any,
  tool: string,
  floatingLayer: () => any = () => undefined,
  pixels = new Uint8ClampedArray([1, 2, 3, 4]),
) => ({
  bakeFloatingLayer: () => calls.push("bake"),
  boundsFromPoints: () => ({ height: 1, width: 1, x: 0, y: 0 }),
  canvas,
  cancelFloatingLayer: () => calls.push("cancel"),
  cellSize: 12,
  clamp: (value: number, minimum: number, maximum: number) =>
    Math.min(Math.max(value, minimum), maximum),
  copyArtButton: { disabled: true },
  copyPixelArt: () => calls.push("copy-art"),
  copySelection: () => calls.push("copy-selection"),
  copySelectionButton: { disabled: false },
  dialog: { open: true },
  draftController: { pushHistory: () => calls.push("history") },
  drawLine: () => calls.push("draw-line"),
  drawShape: (_a: any, _b: any, mode: string) =>
    calls.push(`draw-shape:${mode}`),
  floodFill: () => calls.push("fill"),
  floatingLayer,
  moveFloatingLayer: (...args: number[]) =>
    calls.push(`move:${args.join(",")}`),
  pasteArtButton: { disabled: true },
  pastePixelArt: () => calls.push("paste"),
  paletteController: { pickColor: () => calls.push("pick") },
  pixels: () => pixels,
  redo: () => calls.push("redo"),
  redoButton: { disabled: false },
  releasePointerState: () => calls.push("release-state"),
  renderController: {
    draw: () => calls.push("draw"),
    pointInFloatingLayer: () => true,
  },
  selectionState,
  setLayerDragOrigin: () => calls.push("set-layer-origin"),
  setLayerDragStart: () => calls.push("set-layer-start"),
  setPointerPrevious: () => calls.push("set-prev"),
  setPointerStart: () => calls.push("set-start"),
  setSelection: () => calls.push("select"),
  setShapeBase: () => calls.push("shape-base"),
  toolState: () => tool,
  transformFloatingLayer: (mode: string) => calls.push(`transform:${mode}`),
  undo: () => calls.push("undo"),
  undoButton: { disabled: false },
  updateTransferButtons: () => calls.push("update"),
  view: { hidden: false },
});
