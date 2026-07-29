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
const paletteButtons = [
  transparentButton,
  colorButton,
  toneButton,
  secondToneButton,
];

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
    colors.includes("#f2d2b6") && r === 4 && g === 5 && b === 6
      ? "#f2d2b6"
      : colors[0],
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
toneButton.hidden = true;
assert.equal(controller.activePaletteColors().includes("#f2d2b6"), false);
toneButton.hidden = false;

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
controller.selectPaletteColor(secondToneButton as any);
assert.equal(selectedSkinTone, "1F3FF");

(controller as any).updateSkinTonePalette(["1f3fb", "1f3ff"]);
assert.equal(toneButton.hidden, false);
assert.equal(secondToneButton.hidden, false);
assert.equal(palette.className.includes("has-multiple-skin-tones"), true);
assert.equal(toneButton.dataset.gridRow, "3");
assert.ok((toneButton.attributes.get("aria-label") ?? "").length > 0);

(controller as any).updatePaletteSelection();
assert.equal(
  paletteButtons.some(
    (button) => button.getAttribute("aria-pressed") === "true",
  ),
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
selectedSkinTone = "1F3FB";
selectedColor = "#f2d2b6";
(controller as any).updateSkinTonePalette([]);
assert.equal(selectedColor, "transparent");
(controller as any).updateSkinTonePalette(["1F3FF"]);
assert.equal(toneButton.hidden, true);
assert.equal(toneButton.dataset.cycleIndex, "0");
assert.equal(toneButton.dataset.gridColumn, undefined);
assert.equal(toneButton.dataset.gridRow, undefined);

(controller as any).updateSkinTonePalette(["1F3FB"]);
selectedColor = "transparent";
(controller as any).pickColor({ x: 0, y: 0 });
assert.notEqual(selectedColor, "transparent");
assert.equal(selectedSkinTone, "");

pixels[3] = 0;
(controller as any).pickColor({ x: 0, y: 0 });
assert.notEqual(selectedColor, "transparent");
assert.equal(selectedSkinTone, "1F3FB");
assert.ok((toneButton.dataset.shade ?? "").length > 0);
assert.ok((toneButton.dataset.cycleIndex ?? "").length > 0);
assert.ok((toneButton.title ?? "").length > 0);

const transparentTraceController = createPixelEditorPaletteController({
  getPixels: () => pixels,
  getSelectedColor: () => selectedColor,
  getSelectedSkinTone: () => selectedSkinTone,
  getTraceAlpha: () => ({ value: "0" }),
  getTraceCanvas: () => ({
    getContext: () => ({
      getImageData: () => ({ data: tracePixels }),
    }),
  }),
  nearestPaletteColor: () => "#000000",
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

selectedColor = "#000000";
selectedSkinTone = "1F3FB";
(transparentTraceController as any).pickColor({ x: 0, y: 0 });
assert.equal(selectedColor, "transparent");
assert.equal(selectedSkinTone, "");

selectedColor = "#f2d2b6";
selectedSkinTone = "";
(controller as any).updatePaletteSelection();
assert.equal(toneButton.getAttribute("aria-pressed"), "false");
assert.equal(secondToneButton.getAttribute("aria-pressed"), "false");
selectedSkinTone = "1F3FB";
selectedColor = "#654321";
(controller as any).updatePaletteSelection();
assert.equal(toneButton.getAttribute("aria-pressed"), "true");
selectedSkinTone = "";

const unknownToneButton = new FakeButton({ skinTone: "UNKNOWN" });
const unknownToneController = createPixelEditorPaletteController({
  getPixels: () => pixels,
  getSelectedColor: () => selectedColor,
  getSelectedSkinTone: () => selectedSkinTone,
  getTraceAlpha: () => ({ value: "0" }),
  getTraceCanvas: () => ({
    getContext: () => ({
      getImageData: () => ({ data: tracePixels }),
    }),
  }),
  nearestPaletteColor: () => "#000000",
  paletteButtons: [unknownToneButton],
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

(unknownToneController as any).updateSkinTonePalette(["UNKNOWN"]);
assert.equal(unknownToneButton.getAttribute("aria-label"), null);
assert.equal(unknownToneButton.title, "");

toneButton.dataset.cycleIndex = "1";
toneButton.title = "stale";
toneButton.attributes.delete("aria-label");
(controller as any).updateSkinTonePalette(["1F3FB"]);
assert.equal(toneButton.dataset.cycleIndex, "1");
assert.match(toneButton.getAttribute("aria-label") ?? "", /darkerColor/);
assert.match(toneButton.title, /darkerColor/);

secondToneButton.dataset.cycleIndex = "2";
(controller as any).updateSkinTonePalette(["1F3FB"]);
assert.equal(secondToneButton.hidden, true);
assert.equal(secondToneButton.dataset.cycleIndex, "0");
