import assert from "node:assert/strict";
import { createPixelEditorToolController } from "../../../src/pixel-editor/controllers/pixel-editor-tools.js";

const pixels = new Uint8ClampedArray(12 * 12 * 4);
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: { documentElement: { dir: "ltr" } },
});

const createToolButton = (toolName: string) => ({
  dataset: { tool: toolName },
  disabled: false,
  hidden: false,
  tabIndex: -1,
  focus() {},
  getAttribute(name: string) {
    if (name === "aria-pressed") return (this as any).pressed ?? null;
    return null;
  },
  getBoundingClientRect() {
    return { height: 20, left: 0, top: 0, width: 20 };
  },
  getClientRects() {
    return [1];
  },
});
const toolButtons = [
  {
    ...createToolButton("pencil"),
    active: false,
    label: "",
    title: "",
    querySelector() {
      return { textContent: "" };
    },
    setAttribute(name: string, value: string) {
      if (name === "aria-pressed") this.label = value;
    },
    classList: {
      contains: () => false,
      toggle: (_name: string, active: boolean) => {
        (toolButtons[0] as any).active = active;
      },
    },
  },
  {
    ...createToolButton("rectangle"),
    active: false,
    icon: { textContent: "" },
    title: "",
    querySelector(selector: string) {
      return selector === "[aria-hidden]" ? this.icon : null;
    },
    setAttribute(name: string, value: string) {
      if (name === "aria-label") this.label = value;
      if (name === "aria-pressed") this.pressed = value;
    },
    classList: {
      contains: () => false,
      toggle: (_name: string, active: boolean) => {
        (toolButtons[1] as any).active = active;
      },
    },
  },
  {
    ...createToolButton("ellipse"),
    active: false,
    icon: { textContent: "" },
    title: "",
    querySelector(selector: string) {
      return selector === "[aria-hidden]" ? this.icon : null;
    },
    setAttribute(name: string, value: string) {
      if (name === "aria-label") this.label = value;
      if (name === "aria-pressed") this.pressed = value;
    },
    classList: {
      contains: () => false,
      toggle: (_name: string, active: boolean) => {
        (toolButtons[2] as any).active = active;
      },
    },
  },
] as any[];

let selectedColor = "white";
selectedColor = "#ffffff";
let tool = "pencil";
let fillShapes = false;
let floatingLayer = false;
let selectionValue: unknown = { start: true };
let drawCalls = 0;

const controller = createPixelEditorToolController({
  fillShapesEnabled: () => fillShapes,
  getPixels: () => pixels,
  getSelectedColor: () => selectedColor,
  getTool: () => tool,
  hasFloatingLayer: () => floatingLayer,
  renderController: {
    draw() {
      drawCalls += 1;
    },
  },
  selection(value: unknown) {
    selectionValue = value;
  },
  setFillShapesEnabled(value: boolean) {
    fillShapes = value;
  },
  setTool(value: string) {
    tool = value;
  },
  toolButtons,
  translate: (_key: string, fallback: string) => fallback,
});

assert.deepEqual(controller.currentColor(), [255, 255, 255, 255]);
controller.paintPixel({ x: 0, y: 0 });
assert.equal(pixels[0], 255);
assert.equal(pixels[1], 255);
assert.equal(pixels[2], 255);
assert.equal(pixels[3], 255);

selectedColor = "#ff0000";
controller.drawLine({ x: 1, y: 0 }, { x: 3, y: 0 });
assert.equal(pixels[4] > 0, true);

controller.drawShape({ x: 1, y: 1 }, { x: 2, y: 2 }, "rectangle");
assert.equal(drawCalls, 0);

controller.floodFill({ x: 11, y: 11 });
assert.equal(pixels[(11 * 12 + 11) * 4] > 0, true);

controller.updateShapeToolButtons();
assert.equal(toolButtons[1].label, "Outline rectangle");
assert.equal(toolButtons[1].title, "Outline rectangle");
assert.equal(toolButtons[2].label, "Outline ellipse");

controller.selectTool("rectangle");
assert.equal(tool, "rectangle");
assert.equal(selectionValue, undefined);
assert.equal(drawCalls, 1);

controller.selectTool("rectangle");
assert.equal(fillShapes, true);
assert.equal(toolButtons[1].label, "Filled rectangle");
assert.equal(drawCalls, 2);

controller.selectTool("ellipse");
assert.equal(tool, "ellipse");
assert.equal(drawCalls, 3);
assert.equal(toolButtons[2].label, "Filled ellipse");

floatingLayer = true;
controller.selectTool("pencil");
assert.equal(tool, "ellipse");

floatingLayer = false;
controller.selectTool("bogus");
assert.equal(tool, "ellipse");

if (originalDocument)
  Object.defineProperty(globalThis, "document", originalDocument);
else Reflect.deleteProperty(globalThis, "document");
