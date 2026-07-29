import assert from "node:assert/strict";
import { CELL_SIZE } from "../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  createPixelEditorElements,
  createPixelEditorState,
} from "../../src/pixel-editor/canvas/pixel-editor-elements.js";

class FakeElement {
  className = "";
  hidden = false;
  innerHTML = "";
  width = 0;
  height = 0;
  children: FakeElement[] = [];
  constructor(
    readonly selectorMap = new Map<string, FakeElement>(),
    readonly selectorAllMap = new Map<string, FakeElement[]>(),
  ) {}
  append(child: FakeElement) {
    this.children.push(child);
  }
  querySelector(selector: string) {
    return this.selectorMap.get(selector) ?? null;
  }
  querySelectorAll(selector: string) {
    return this.selectorAllMap.get(selector) ?? [];
  }
}

const selectors = new Map<string, FakeElement>();
const selectorAll = new Map<string, FakeElement[]>();
const one = (selector: string) => {
  const element = new FakeElement();
  selectors.set(selector, element);
  return element;
};
const many = (selector: string, count: number) => {
  const elements = Array.from({ length: count }, () => new FakeElement());
  selectorAll.set(selector, elements);
  return elements;
};

one(".pixel-editor-canvas");
one(".pixel-editor-trace-alpha");
one(".pixel-editor-trace-value");
one(".pixel-editor-preview-official");
one(".pixel-editor-preview-font");
one(".pixel-editor-preview-artwork");
one(".pixel-editor-download-preview");
one(".pixel-editor-undo");
one(".pixel-editor-redo");
one(".pixel-editor-tools");
one(".pixel-editor-history");
one(".pixel-editor-drawing");
one(".pixel-editor-tracing");
one(".pixel-editor-transfer");
one(".pixel-editor-file");
one(".pixel-editor-preview-actions");
one(".pixel-editor-dirty");
one(".pixel-editor-copy-art");
one(".pixel-editor-copy-font");
one(".pixel-editor-copy-selection");
one(".pixel-editor-paste-art");
one(".pixel-editor-layer");
one(".pixel-editor-bake-layer");
one(".pixel-editor-cancel-layer");
one(".pixel-editor-invert-layer");
one(".pixel-editor-layer-help");
one(".pixel-editor-save");
one(".pixel-editor-download");
one(".pixel-editor-download-emoji");
one(".pixel-editor-location");
one(".pixel-editor-status");
many(".pixel-editor-layer-nudge", 4);
many("[data-layer-transform]", 5);
many("[data-tool]", 6);
many(".pixel-editor-swatch", 8);
many(".pixel-editor-trace-nudge", 4);

const view = new FakeElement(selectors, selectorAll);
const dialog = new FakeElement();

const browserGlobal = globalThis as any;
const originalDocument = browserGlobal.document;
browserGlobal.document = {
  createElement(tag: string) {
    if (tag === "section") return view;
    if (tag === "canvas") {
      const canvas = new FakeElement();
      canvas.width = CELL_SIZE;
      canvas.height = CELL_SIZE;
      return canvas;
    }
    throw new Error(`Unexpected ${tag}`);
  },
};

const elements = createPixelEditorElements(dialog as any);
assert.equal(dialog.children.includes(view), true);
assert.equal(view.className, "pixel-editor-view");
assert.equal(view.hidden, true);
assert.equal(elements.canvas, selectors.get(".pixel-editor-canvas"));
assert.equal(elements.historyButtons.length, 2);
assert.equal(elements.paletteButtons.length, 8);
assert.equal(elements.previewActionButtons.length, 3);
assert.equal(elements.traceCanvas.width, CELL_SIZE);
assert.equal(elements.traceCanvas.height, CELL_SIZE);

const state = createPixelEditorState();
assert.equal(state.currentEmoji, "");
assert.equal(state.selectedColor, "#ffff55");
assert.equal(state.tool, "pencil");
assert.equal(state.fillShapesEnabled, false);
assert.equal(state.traceOffsetX, 0);
assert.equal(state.traceOffsetY, 0);
assert.equal(state.pixels.length, CELL_SIZE * CELL_SIZE * 4);
assert.equal(state.artworkDrafts instanceof Map, true);
assert.equal(state.persistedArtwork instanceof Map, true);
assert.equal(state.dirtyKeys instanceof Set, true);

browserGlobal.document = originalDocument;
