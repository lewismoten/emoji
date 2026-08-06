import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, vi } from "vitest";

const geometryCalls: any[] = [];
const helperCalls: any[] = [];
const layerCalls: any[] = [];
const skinToneCalls: any[] = [];
let helperImplementation: (options: any) => Promise<any>;

vi.mock(
  "../../../src/pixel-editor/core/pixel-editor-geometry-helpers.js",
  () => ({
    clamp(value: number, minimum: number, maximum: number) {
      geometryCalls.push(["clamp", value, minimum, maximum]);
      return Math.min(Math.max(value, minimum), maximum);
    },
    extractPixels() {
      geometryCalls.push(["extractPixels"]);
      return new Uint8ClampedArray([1, 2, 3, 4]);
    },
    hasVisiblePixels(value: Uint8ClampedArray) {
      geometryCalls.push(["hasVisiblePixels", Array.from(value)]);
      return value[3] > 0;
    },
    layerAxisBounds(size: number) {
      geometryCalls.push(["layerAxisBounds", size]);
      return [0, 12 - size];
    },
    layerPositionAllowed(_layer: unknown, x: number, y: number) {
      geometryCalls.push(["layerPositionAllowed", x, y]);
      return x >= 0 && x <= 10 && y >= 0 && y <= 10;
    },
    pixelsEqual(left: Uint8ClampedArray, right: Uint8ClampedArray) {
      geometryCalls.push(["pixelsEqual"]);
      return (
        left.length === right.length &&
        left.every((value, index) => value === right[index])
      );
    },
    trimVisiblePixels() {
      geometryCalls.push(["trimVisiblePixels"]);
      return {
        height: 1,
        pixels: new Uint8ClampedArray([9, 9, 9, 255]),
        width: 1,
        x: 2,
        y: 3,
      };
    },
  }),
);

vi.mock(
  "../../../src/pixel-editor/controllers/pixel-editor-transfer-skin-tone.js",
  () => ({
    async findSkinTonePasteHelper(options: any) {
      helperCalls.push(options);
      return helperImplementation(options);
    },
  }),
);

vi.mock(
  "../../../src/pixel-editor/layers/pixel-editor-layer-helpers.js",
  () => ({
    compositeLayer(pixels: Uint8ClampedArray, layer: any) {
      layerCalls.push(["compositeLayer", Array.from(pixels), layer]);
    },
    effectiveLayerPixels(layer: any) {
      layerCalls.push(["effectiveLayerPixels", layer]);
      return layer.pixels;
    },
    flipPixels(_layer: any, horizontal: boolean) {
      layerCalls.push(["flipPixels", horizontal]);
      return horizontal
        ? new Uint8ClampedArray([7, 7, 7, 255])
        : new Uint8ClampedArray([8, 8, 8, 255]);
    },
    layerTransformChangesPixels(_layer: any, rotated: { changed?: boolean }) {
      layerCalls.push(["layerTransformChangesPixels"]);
      return rotated.changed !== false;
    },
    nextLayerRotation(_layer: any, clockwise: boolean) {
      layerCalls.push(["nextLayerRotation", clockwise]);
      return {
        height: 3,
        pixels: new Uint8ClampedArray([6, 6, 6, 255]),
        rotationDegrees: clockwise ? 90 : -90,
        rotationSource: { pixels: new Uint8ClampedArray([5, 5, 5, 255]) },
        width: 2,
      };
    },
    resetLayerRotation(layer: any) {
      layerCalls.push(["resetLayerRotation", layer]);
      layer.rotationDegrees = 0;
    },
  }),
);

vi.mock("../../../src/pixel-editor/palette/pixel-editor-skin-tone.js", () => ({
  remapSkinTonePixels(
    pixels: Uint8ClampedArray,
    fromTones: unknown,
    toTones: unknown,
    helper: unknown,
  ) {
    skinToneCalls.push([
      "remap",
      Array.from(pixels),
      fromTones,
      toTones,
      helper,
    ]);
    return new Uint8ClampedArray([4, 4, 4, 255]);
  },
  skinToneBaseSequence(codePoints: unknown) {
    skinToneCalls.push(["base", codePoints]);
    return ["base"];
  },
  skinToneSequence(codePoints: unknown) {
    skinToneCalls.push(["sequence", codePoints]);
    return ["tone"];
  },
}));

const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
const originalWarn = console.warn;

describe("pixel-editor-transfer", () => {
  beforeEach(() => {
    geometryCalls.length = 0;
    helperCalls.length = 0;
    layerCalls.length = 0;
    skinToneCalls.length = 0;
    helperImplementation = async () => ({ ownership: ["left"] });
  });

  afterEach(() => {
    console.warn = originalWarn;
    if (originalFetch) {
      Object.defineProperty(globalThis, "fetch", originalFetch);
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }
  });

  it("handles transfer workflows through the real source module", async () => {
    const module =
      await import("../../../src/pixel-editor/controllers/pixel-editor-transfer.js");

    let currentEntry: any = {
      atlas: "people/hand.png",
      codePoints: ["1F44D"],
      key: "thumbsUp",
      painted: true,
    };
    let loaded = true;
    let selection: any = { height: 4, width: 3, x: 1, y: 2 };
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
          headers: { get: () => "image/png" },
          ok: true,
          async blob() {
            return { atlas: "font-blob" };
          },
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
        selectionHasVisibleArtwork: () => true,
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

    await controller.copyPixelArt();
    assert.equal(clipboard?.kind, "art");
    assert.equal(calls.includes("set-artwork-clipboard"), true);

    await controller.copySelection();
    assert.equal(clipboard?.kind, "selection");

    await controller.pastePixelArt();
    assert.equal(calls.includes("set-paste-pending:true"), true);
    assert.equal(calls.includes("update-transfer-buttons"), true);
    assert.equal(calls.includes("draw"), true);

    floatingLayer = {
      height: 1,
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
      width: 1,
      x: 0,
      y: 0,
    };
    controller.moveFloatingLayer(4, 5);
    assert.equal(floatingLayer.x, 4);
    assert.equal(floatingLayer.y, 5);

    controller.transformFloatingLayer("flip-horizontal");
    controller.transformFloatingLayer("flip-vertical");
    controller.transformFloatingLayer("rotate-right");
    controller.transformFloatingLayer("rotate-left");
    controller.transformFloatingLayer("unknown");

    controller.toggleFloatingLayerInversion();
    controller.bakeFloatingLayer();
    controller.cancelFloatingLayer();
    assert.equal(calls.includes("push-history"), true);

    loaded = false;
    await controller.pastePixelArt();
    loaded = true;

    clipboard = { kind: "selection", pixels: new Uint8ClampedArray([1]) };
    selection = undefined;
    await controller.pastePixelArt();

    clipboard = {
      atlas: "people/helper.png",
      baseSequence: "1F44D",
      kind: "artwork",
      key: "thumbsUp",
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
      skinTones: ["1F3FB"],
      sourceKey: "thumbsUp",
    };
    selection = { height: 1, width: 1, x: 0, y: 0 };
    currentEntry = {
      atlas: "people/hand.png",
      codePoints: ["1F44D", "1F3FB"],
      key: "thumbsUpLight",
      painted: true,
    };
    await controller.pastePixelArt();

    clipboard = {
      atlas: "people/fail.png",
      baseSequence: "1F44D",
      kind: "artwork",
      key: "thumbsUp",
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
      skinTones: ["1F3FB"],
      sourceKey: "thumbsUp",
    };
    await controller.pastePixelArt();

    console.warn = (...args: unknown[]) => {
      calls.push(`warn:${args.length}`);
    };
    await controller.copyFontGlyph({
      dataset: { glyph: "A" },
      disabled: false,
    });

    assert.equal(statuses.length > 0, true);
    assert.equal(canvasFocusCalls.length > 0, true);
    assert.equal(geometryCalls.length > 0, true);
    assert.equal(helperCalls.length > 0, true);
    assert.equal(layerCalls.length > 0, true);
    assert.equal(skinToneCalls.length > 0, true);
  });

  it("covers paste cancellation after async work and explicit layer cancel", async () => {
    const module =
      await import("../../../src/pixel-editor/controllers/pixel-editor-transfer.js");
    const calls: string[] = [];
    let currentEntry: any = { atlas: "a.png", codePoints: ["1F44D"], key: "a" };
    let floatingLayer: any = {
      x: 1,
      y: 1,
      width: 1,
      height: 1,
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
    };
    const controller = module.createPixelEditorTransferController({
      artworkDrafts: () => new Map(),
      canvas: { focus() {} },
      cellLoaded: () => true,
      cellSize: 12,
      cloneFloatingLayer: (value: any) =>
        value ? { ...value, pixels: value.pixels.slice() } : value,
      currentEntry: () => currentEntry,
      downloadBlob() {},
      draftController: {
        hasVisibleArtwork: () => true,
        pushHistory() {},
        selectionHasVisibleArtwork: () => true,
      },
      extractCell: async () => new Uint8ClampedArray([1, 1, 1, 255]),
      floatingLayer: () => floatingLayer,
      formatClipboardStatus: (_: string, fallback: string) => fallback,
      formatStatus: (_: string, fallback: string) => fallback,
      getArtworkClipboard: () => ({
        kind: "art",
        pixels: new Uint8ClampedArray([1, 1, 1, 255]),
        width: 1,
        height: 1,
        x: 0,
        y: 0,
        skinTones: ["tone"],
      }),
      getPixels: () => new Uint8ClampedArray([1, 1, 1, 255]),
      getSelection: () => ({ x: 0, y: 0, width: 1, height: 1 }),
      getTool: () => "pencil",
      loadManifest: async () => {
        currentEntry = { atlas: "b.png", codePoints: ["1F44D"], key: "b" };
        return {};
      },
      paletteController: { activePaletteColors: () => ["#fff"] },
      pastePending: () => false,
      renderController: { draw: () => calls.push("draw") },
      setArtworkClipboard() {},
      setFloatingLayer: (value: unknown) => {
        floatingLayer = value;
        calls.push(`set-floating:${value ? "set" : "clear"}`);
      },
      setPastePending() {},
      setSelection() {},
      trimVisiblePixels: undefined,
      updateTransferButtons: () => calls.push("update"),
      writeStatus: (value: string) => calls.push(`status:${value}`),
    });
    await controller.pastePixelArt();
    assert.equal(calls.includes("update"), true);
    controller.cancelFloatingLayer();
    assert.equal(calls.includes("set-floating:clear"), true);
    assert.equal(calls.includes("status:"), true);
  });

  it("covers transfer guard and failure branches through the real source module", async () => {
    const module =
      await import("../../../src/pixel-editor/controllers/pixel-editor-transfer.js");

    const calls: string[] = [];
    const statuses: string[] = [];
    let currentEntry: any = undefined;
    let loaded = false;
    let selection: any = undefined;
    let tool = "select";
    let pastePending = false;
    let floatingLayer: any = undefined;
    let clipboard: any = undefined;
    let visibleArtwork = false;
    let trimmed: any = undefined;

    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      calls.push(`warn:${args.length}`);
    };

    Object.defineProperty(globalThis, "fetch", {
      configurable: true,
      value: async () => ({
        headers: { get: () => "text/plain" },
        ok: false,
      }),
    });

    const controller = module.createPixelEditorTransferController({
      artworkDrafts: () => new Map(),
      canvas: {
        focus() {
          calls.push("focus");
        },
      },
      cellLoaded: () => loaded,
      cellSize: 12,
      cloneFloatingLayer: (value: any) => value,
      currentEntry: () => currentEntry,
      downloadBlob() {},
      draftController: {
        hasVisibleArtwork: () => visibleArtwork,
        pushHistory() {
          calls.push("push-history");
        },
        selectionHasVisibleArtwork: () => false,
      },
      extractCell: async () => new Uint8ClampedArray([1, 1, 1, 255]),
      floatingLayer: () => floatingLayer,
      formatClipboardStatus: (key: string, fallback: string) =>
        `${key}:${fallback}`,
      formatStatus: (key: string, fallback: string) => `${key}:${fallback}`,
      getArtworkClipboard: () => clipboard,
      getPixels: () => new Uint8ClampedArray([1, 1, 1, 255]),
      getSelection: () => selection,
      getTool: () => tool,
      loadManifest: async () => ({}),
      paletteController: {
        activePaletteColors: () => ["#fff"],
      },
      pastePending: () => pastePending,
      renderController: {
        draw() {
          calls.push("draw");
        },
      },
      setArtworkClipboard(value: unknown) {
        clipboard = value;
        calls.push(`clipboard:${value ? "set" : "clear"}`);
      },
      setFloatingLayer(value: unknown) {
        floatingLayer = value;
        calls.push(`floating:${value ? "set" : "clear"}`);
      },
      setPastePending(value: boolean) {
        pastePending = value;
        calls.push(`pending:${value}`);
      },
      setSelection(value: unknown) {
        selection = value;
        calls.push(`selection:${value ? "set" : "clear"}`);
      },
      trimVisiblePixels: () => trimmed,
      updateTransferButtons() {
        calls.push("update");
      },
      writeStatus(value: string) {
        statuses.push(value);
      },
    });

    controller.copyPixelArt();
    currentEntry = {
      atlas: "atlas.png",
      codePoints: ["1F44D"],
      key: "wave",
      painted: true,
    };
    controller.copyPixelArt();
    loaded = true;
    controller.copyPixelArt();
    visibleArtwork = true;
    controller.copyPixelArt();
    trimmed = {
      height: 1,
      pixels: new Uint8ClampedArray([1, 2, 3, 255]),
      width: 1,
      x: 0,
      y: 0,
    };
    controller.copyPixelArt();

    selection = { x: 0, y: 0, width: 1, height: 1 };
    clipboard = undefined;
    controller.copySelection();

    clipboard = {
      kind: "art",
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      skinTones: ["tone"],
    };
    pastePending = true;
    await controller.pastePixelArt();
    pastePending = false;

    tool = "pencil";
    helperImplementation = async () => {
      throw new Error("helper failed");
    };
    await controller.pastePixelArt();
    assert.equal(calls.includes("warn:2"), true);

    helperImplementation = async () => {
      currentEntry = {
        atlas: "changed.png",
        codePoints: ["1F44D"],
        key: "changed",
        painted: true,
      };
      return { ownership: ["right"] };
    };
    await controller.pastePixelArt();
    assert.equal(calls.filter((entry) => entry === "update").length >= 2, true);

    tool = "select";
    clipboard = { kind: "art" };
    await controller.pastePixelArt();
    clipboard = {
      kind: "selection",
      pixels: new Uint8ClampedArray([1, 1, 1, 255]),
      width: 1,
      height: 1,
      x: 0,
      y: 0,
      skinTones: ["tone"],
    };
    await controller.pastePixelArt();

    await controller.copyFontGlyph({ disabled: false });
    assert.equal(
      statuses.includes(
        "fontGlyphCopyFailed:The custom font glyph could not be copied.",
      ),
      true,
    );

    floatingLayer = undefined;
    controller.moveFloatingLayer(1, 1);
    controller.setFloatingLayerPosition(1, 1);
    controller.transformFloatingLayer("flip-horizontal");
    controller.bakeFloatingLayer();
    controller.cancelFloatingLayer();
    controller.toggleFloatingLayerInversion();

    console.warn = originalWarn;
  });
});
