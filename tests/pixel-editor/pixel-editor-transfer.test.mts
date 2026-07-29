import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceModuleSpecifier =
  "../../src/pixel-editor/controllers/pixel-editor-transfer.js";
const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/pixel-editor/controllers/pixel-editor-transfer.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'from "../core/pixel-editor-geometry-helpers.js";',
    'from "./pixel-editor-geometry-helpers-stub.mjs";',
  )
  .replace(
    'from "./pixel-editor-transfer-skin-tone.js";',
    'from "./pixel-editor-transfer-skin-tone-stub.mjs";',
  )
  .replace(
    'from "../layers/pixel-editor-layer-helpers.js";',
    'from "./pixel-editor-layer-helpers-stub.mjs";',
  )
  .replace(
    'from "../palette/pixel-editor-skin-tone.js";',
    'from "./pixel-editor-skin-tone-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-transfer-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  [
    "export const geometryCalls = [];",
    "export function clamp(value, minimum, maximum) {",
    "  geometryCalls.push(['clamp', value, minimum, maximum]);",
    "  return Math.min(Math.max(value, minimum), maximum);",
    "}",
    "export function extractPixels() {",
    "  geometryCalls.push(['extractPixels']);",
    "  return new Uint8ClampedArray([1,2,3,4]);",
    "}",
    "export function hasVisiblePixels(value) {",
    "  geometryCalls.push(['hasVisiblePixels', Array.from(value)]);",
    "  return value[3] > 0;",
    "}",
    "export function layerAxisBounds(size) {",
    "  geometryCalls.push(['layerAxisBounds', size]);",
    "  return [0, 12 - size];",
    "}",
    "export function layerPositionAllowed(_layer, x, y) {",
    "  geometryCalls.push(['layerPositionAllowed', x, y]);",
    "  return x >= 0 && x <= 10 && y >= 0 && y <= 10;",
    "}",
    "export function pixelsEqual(left, right) {",
    "  geometryCalls.push(['pixelsEqual']);",
    "  return left.length === right.length && left.every((value, index) => value === right[index]);",
    "}",
    "export function trimVisiblePixels() {",
    "  geometryCalls.push(['trimVisiblePixels']);",
    "  return { pixels: new Uint8ClampedArray([9,9,9,255]), width: 1, height: 1, x: 2, y: 3 };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-transfer-skin-tone-stub.mjs"),
  [
    "export const helperCalls = [];",
    "export async function findSkinTonePasteHelper(options) {",
    "  helperCalls.push(options);",
    "  return { ownership: ['left'] };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-layer-helpers-stub.mjs"),
  [
    "export const layerCalls = [];",
    "export function compositeLayer(pixels, layer) {",
    "  layerCalls.push(['compositeLayer', Array.from(pixels), layer]);",
    "}",
    "export function effectiveLayerPixels(layer) {",
    "  layerCalls.push(['effectiveLayerPixels', layer]);",
    "  return layer.pixels;",
    "}",
    "export function flipPixels(layer, horizontal) {",
    "  layerCalls.push(['flipPixels', horizontal]);",
    "  return horizontal ? new Uint8ClampedArray([7,7,7,255]) : new Uint8ClampedArray([8,8,8,255]);",
    "}",
    "export function layerTransformChangesPixels(_layer, rotated) {",
    "  layerCalls.push(['layerTransformChangesPixels']);",
    "  return rotated.changed !== false;",
    "}",
    "export function nextLayerRotation(layer, clockwise) {",
    "  layerCalls.push(['nextLayerRotation', clockwise]);",
    "  return { pixels: new Uint8ClampedArray([6,6,6,255]), width: 2, height: 3, rotationSource: { pixels: new Uint8ClampedArray([5,5,5,255]) }, rotationDegrees: clockwise ? 90 : -90 };",
    "}",
    "export function resetLayerRotation(layer) {",
    "  layerCalls.push(['resetLayerRotation', layer]);",
    "  layer.rotationDegrees = 0;",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-skin-tone-stub.mjs"),
  [
    "export const skinToneCalls = [];",
    "export function remapSkinTonePixels(pixels, fromTones, toTones, helper) {",
    "  skinToneCalls.push(['remap', Array.from(pixels), fromTones, toTones, helper]);",
    "  return new Uint8ClampedArray([4,4,4,255]);",
    "}",
    "export function skinToneBaseSequence(codePoints) {",
    "  skinToneCalls.push(['base', codePoints]);",
    "  return ['base'];",
    "}",
    "export function skinToneSequence(codePoints) {",
    "  skinToneCalls.push(['sequence', codePoints]);",
    "  return ['tone'];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-transfer.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-transfer.mjs")).href,
);
const geometryStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
  ).href,
);
const helperStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-transfer-skin-tone-stub.mjs"),
  ).href,
);
const layerStub = await import(
  pathToFileURL(
    path.join(tempDirectory, "pixel-editor-layer-helpers-stub.mjs"),
  ).href,
);
const skinToneStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-skin-tone-stub.mjs"))
    .href,
);

const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");

try {
  let currentEntry: any = {
    atlas: "people/hand.png",
    codePoints: ["1F44D"],
    key: "thumbsUp",
    painted: true,
  };
  let loaded = true;
  let selection: any = { x: 1, y: 2, width: 3, height: 4 };
  let tool = "pencil";
  let pastePending = false;
  let floatingLayer: any;
  let clipboard: any;
  const pixels = new Uint8ClampedArray([1, 1, 1, 255]);
  const calls: string[] = [];
  const statuses: string[] = [];
  const canvasFocusCalls: any[] = [];

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      calls.push(`fetch:${url}`);
      if (url.includes("fail")) throw new Error("boom");
      return {
        ok: true,
        async blob() {
          return { atlas: "font-blob" };
        },
        headers: { get: () => "image/png" },
      };
    },
  });

  const controller = module.createPixelEditorTransferController({
    artworkDrafts: () => new Map(),
    canvas: {
      focus(options: unknown) {
        canvasFocusCalls.push(options);
      },
    },
    cellLoaded: () => loaded,
    cellSize: 12,
    cloneFloatingLayer: (value: any) =>
      value
        ? {
            ...value,
            pixels: value.pixels.slice(),
            skinTones: value.skinTones?.slice(),
          }
        : value,
    currentEntry: () => currentEntry,
    downloadBlob: () => {},
    draftController: {
      hasVisibleArtwork: () => true,
      pushHistory() {
        calls.push("push-history");
      },
    },
    extractCell: async (blob: unknown, entry: any) => {
      calls.push(`extract:${entry.key}:${String((blob as any).atlas)}`);
      return new Uint8ClampedArray([2, 2, 2, 255]);
    },
    floatingLayer: () => floatingLayer,
    formatClipboardStatus: (_key: string, fallback: string) => fallback,
    formatStatus: (_key: string, fallback: string) => fallback,
    getArtworkClipboard: () => clipboard,
    getPixels: () => pixels,
    getSelection: () => selection,
    getTool: () => tool,
    loadManifest: async () => ({ glyphs: {} }),
    paletteController: {
      activePaletteColors: () => ["#ffffff", "#000000"],
    },
    pastePending: () => pastePending,
    renderController: {
      draw() {
        calls.push("draw");
      },
    },
    setArtworkClipboard(value: unknown) {
      clipboard = value;
      calls.push("set-artwork-clipboard");
    },
    setFloatingLayer(value: unknown) {
      floatingLayer = value;
      calls.push(`set-floating-layer:${value ? "set" : "clear"}`);
    },
    setPastePending(value: boolean) {
      pastePending = value;
      calls.push(`set-paste-pending:${value}`);
    },
    setSelection(value: unknown) {
      selection = value;
      calls.push(`set-selection:${value ? "set" : "clear"}`);
    },
    trimVisiblePixels: undefined,
    updateTransferButtons() {
      calls.push("update-transfer-buttons");
    },
    writeStatus(value: string) {
      statuses.push(value);
    },
  });

  controller.copyPixelArt();
  assert.equal(sourceModuleSpecifier, "../../src/pixel-editor/controllers/pixel-editor-transfer.js");
  assert.equal(clipboard.kind, "art");
  assert.deepEqual(Array.from(clipboard.pixels), [9, 9, 9, 255]);
  assert.equal(statuses.at(-1), "Pixel art copied.");

  controller.copySelection();
  assert.equal(clipboard.kind, "selection");
  assert.deepEqual(Array.from(clipboard.pixels), [1, 2, 3, 4]);
  assert.equal(statuses.at(-1), "Selected artwork copied.");

  const copyFontButton = { disabled: false };
  await controller.copyFontGlyph(copyFontButton);
  assert.equal(copyFontButton.disabled, true);
  assert.equal(clipboard.kind, "font");
  assert.equal(statuses.at(-1), "Custom font glyph copied.");

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: false,
      headers: { get: () => "text/plain" },
    }),
  });
  currentEntry = { ...currentEntry, atlas: "fail.png" };
  await controller.copyFontGlyph({ disabled: false });
  assert.equal(statuses.at(-1), "The custom font glyph could not be copied.");

  Object.defineProperty(globalThis, "fetch", originalFetch?.value
    ? originalFetch
    : {
        configurable: true,
        value: async (url: string) => {
          calls.push(`fetch:${url}`);
          return {
            ok: true,
            async blob() {
              return { atlas: "font-blob" };
            },
            headers: { get: () => "image/png" },
          };
        },
      });

  clipboard = {
    kind: "art",
    pixels: new Uint8ClampedArray([7, 7, 7, 255]),
    width: 1,
    height: 1,
    x: 0,
    y: 0,
    skinTones: ["tone"],
    sourceKey: "thumbsUp",
  };
  await controller.pastePixelArt();
  assert.equal(pastePending, false);
  assert.equal((floatingLayer.pixels as Uint8ClampedArray)[0], 4);
  assert.equal(floatingLayer.inverted, false);
  assert.equal(selection, undefined);
  assert.deepEqual(canvasFocusCalls.at(-1), { preventScroll: true });
  assert.equal(statuses.at(-1), "Artwork pasted as a floating layer.");
  assert.equal(helperStub.helperCalls.length, 1);
  assert.equal(skinToneStub.skinToneCalls.some((entry: any[]) => entry[0] === "remap"), true);

  floatingLayer = { ...floatingLayer, x: 1, y: 1, width: 2, height: 2 };
  controller.moveFloatingLayer(1, 2);
  assert.equal(floatingLayer.x, 2);
  assert.equal(floatingLayer.y, 3);
  controller.moveFloatingLayer(100, 0);
  assert.equal(floatingLayer.x, 2);

  controller.setFloatingLayerPosition(20, 20);
  assert.equal(floatingLayer.x, 10);
  assert.equal(floatingLayer.y, 10);

  controller.transformFloatingLayer("rotate-right");
  assert.equal(floatingLayer.rotationDegrees, 90);
  controller.transformFloatingLayer("flip-horizontal");
  assert.equal((floatingLayer.pixels as Uint8ClampedArray)[0], 7);
  controller.transformFloatingLayer("flip-vertical");
  assert.equal((floatingLayer.pixels as Uint8ClampedArray)[0], 8);

  controller.bakeFloatingLayer();
  assert.equal(calls.includes("push-history"), true);
  assert.equal(floatingLayer, undefined);
  assert.equal(statuses.at(-1), "Floating layer merged into the artwork.");

  floatingLayer = { x: 0, y: 0, width: 1, height: 1, pixels: new Uint8ClampedArray([1, 1, 1, 255]), inverted: false };
  controller.toggleFloatingLayerInversion();
  assert.equal(floatingLayer.inverted, true);
  controller.cancelFloatingLayer();
  assert.equal(floatingLayer, undefined);
  assert.equal(statuses.at(-1), "");

  currentEntry = undefined;
  clipboard = undefined;
  selection = undefined;
  loaded = false;
  controller.copyPixelArt();
  controller.copySelection();
  await controller.pastePixelArt();
  assert.equal(geometryStub.geometryCalls.some((entry: any[]) => entry[0] === "trimVisiblePixels"), true);
  assert.equal(layerStub.layerCalls.some((entry: any[]) => entry[0] === "compositeLayer"), true);
} finally {
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else Reflect.deleteProperty(globalThis, "fetch");
}
