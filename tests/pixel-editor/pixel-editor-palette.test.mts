import assert from "node:assert/strict";
import { createPixelEditorPaletteController } from "../../src/pixel-editor/palette/pixel-editor-palette.js";

class FakeButton {
  hidden = false;
  disabled = false;
  tabIndex = -1;
  title = "";
  dataset: Record<string, string | undefined> = {};
  style = {
    values: new Map<string, string>(),
    setProperty: (name: string, value: string) => {
      this.style.values.set(name, value);
    },
    removeProperty: (name: string) => {
      this.style.values.delete(name);
    },
    gridColumn: "",
  };
  attributes = new Map<string, string>();
  className = "";
  classList = {
    toggle: (name: string, force?: boolean) => {
      const classes = new Set(this.className.split(/\s+/).filter(Boolean));
      const active = force ?? !classes.has(name);
      if (active) classes.add(name);
      else classes.delete(name);
      this.className = [...classes].join(" ");
    },
    contains: (name: string) => this.className.split(/\s+/).includes(name),
  };

  constructor(init: Partial<FakeButton["dataset"]> = {}) {
    this.dataset = { ...init };
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  getClientRects() {
    return this.hidden ? [] : [{}];
  }
}

const palette = {
  className: "",
  classList: {
    toggle(name: string, force?: boolean) {
      const classes = new Set(palette.className.split(/\s+/).filter(Boolean));
      const active = force ?? !classes.has(name);
      if (active) classes.add(name);
      else classes.delete(name);
      palette.className = [...classes].join(" ");
    },
  },
};

const view = {
  querySelector(selector: string) {
    if (selector === ".pixel-editor-palette") return palette;
    return null;
  },
};

let selectedColor = "#ffff55";
let selectedSkinTone = "";
const pixels = new Uint8ClampedArray([1, 2, 3, 255, 0, 0, 0, 0]);
const tracePixels = new Uint8ClampedArray([4, 5, 6, 255]);
const transparentButton = new FakeButton({ transparent: "true" });
const colorButton = new FakeButton({ color: "#112233" });
const toneButton = new FakeButton({ skinTone: "1F3FB" });
const secondToneButton = new FakeButton({ skinTone: "1F3FF" });
const paletteButtons = [transparentButton, colorButton, toneButton, secondToneButton];

const controller = createPixelEditorPaletteController({
  getPixels: () => pixels,
  getSelectedColor: () => selectedColor,
  getSelectedSkinTone: () => selectedSkinTone,
  getTraceAlpha: () => ({ value: "1" }),
  getTraceCanvas: () => ({
    getContext: () => ({
      getImageData: () => ({ data: tracePixels }),
    }),
  }),
  nearestPaletteColor: (r: number, g: number, b: number, colors: string[]) =>
    colors.includes("#f5cfa0") && r === 4 && g === 5 && b === 6 ? "#f5cfa0" : colors[0],
  paletteButtons,
  setSelectedColor: (value: string) => {
    selectedColor = value;
  },
  setSelectedSkinTone: (value: string) => {
    selectedSkinTone = value;
  },
  translate: (key: string, fallback: string) => `${key}:${fallback}`,
  view,
  pixelOffset: (x: number, y: number) => (y * 1 + x) * 4,
});

assert.equal(controller.activePaletteColors().includes("#000000"), true);

controller.selectPaletteColor(colorButton as any);
assert.equal(selectedColor, "#112233");
assert.equal(selectedSkinTone, "");

controller.selectPaletteColor(transparentButton as any);
assert.equal(selectedColor, "transparent");

controller.selectPaletteColor(toneButton as any);
const firstToneColor = selectedColor;
assert.equal(selectedSkinTone, "1F3FB");
controller.selectPaletteColor(toneButton as any);
assert.notEqual(selectedColor, firstToneColor);

(controller as any).updateSkinTonePalette(["1f3fb", "1f3ff"]);
assert.equal(toneButton.hidden, false);
assert.equal(secondToneButton.hidden, false);
assert.equal(palette.className.includes("has-multiple-skin-tones"), true);
assert.equal(toneButton.dataset.gridRow, "3");
assert.ok((toneButton.attributes.get("aria-label") ?? "").length > 0);

(controller as any).updatePaletteSelection();
assert.equal(
  paletteButtons.some((button) => button.getAttribute("aria-pressed") === "true"),
  true,
);

selectedSkinTone = "1F3FB";
(controller as any).updateSkinTonePalette(["1F3FB"]);
assert.equal(secondToneButton.hidden, true);
assert.equal(palette.className.includes("has-one-skin-tone"), true);
assert.equal(toneButton.dataset.gridColumn, "9");
assert.equal(selectedSkinTone, "1F3FB");
assert.notEqual(selectedColor, "transparent");

selectedColor = "#123456";
selectedSkinTone = "";
(controller as any).updateSkinTonePalette([]);
assert.equal(selectedColor, "transparent");

selectedColor = "transparent";
(controller as any).pickColor({ x: 0, y: 0 });
assert.notEqual(selectedColor, "transparent");

pixels[3] = 0;
(controller as any).pickColor({ x: 0, y: 0 });
assert.notEqual(selectedColor, "transparent");
