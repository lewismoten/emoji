import assert from "node:assert/strict";
import { createPixelEditorSessionController } from "../../src/pixel-editor/controllers/pixel-editor-session.js";

const sourceModuleSpecifier = "../../src/pixel-editor/controllers/pixel-editor-session.js";
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");

const pixels = new Uint8ClampedArray(12 * 12 * 4).fill(9);

const setState = {
  atlasBlob: [] as unknown[],
  atlasDimensions: [] as Array<[number, number]>,
  atlasExists: [] as boolean[],
  cellLoaded: [] as boolean[],
  currentEmoji: [] as string[],
  currentEntry: [] as any[],
  floatingLayer: [] as unknown[],
  locationText: [] as string[],
  pixels: [] as Uint8ClampedArray[],
  selection: [] as unknown[],
  statusText: [] as string[],
  traceOffsets: [] as Array<[number, number]>,
};

try {
  const calls: string[] = [];
  const draftPixels = new Uint8ClampedArray([1, 2, 3, 4]);
  const loadedPixels = new Uint8ClampedArray([5, 6, 7, 8]);
  const artworkDraftMap = new Map<string, any>([
    [
      "smilingFace",
      {
        floatingLayer: { pixels: new Uint8ClampedArray([8, 8, 8, 8]), width: 1, height: 1 },
        pixels: draftPixels,
        selection: { x: 1, y: 2, width: 3, height: 4 },
        traceOffsetX: 2,
        traceOffsetY: -1,
      },
    ],
  ]);
  const persistedArtwork = new Map<string, Uint8ClampedArray>();
  const current = {
    entry: undefined as any,
    emoji: "",
  };

  const manifest = {
    cellSize: 12,
    glyphs: {
      smilingFace: {
        atlas: "smileys/face-smiling.png",
        atlasHeight: 48,
        atlasWidth: 96,
        codePoints: ["1F600"],
        key: "smilingFace",
        painted: true,
        row: 1,
        column: 2,
      },
    },
  };

  let fetchMode: "png" | "missing" | "failure" = "png";
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string) => {
      calls.push(`fetch:${url}`);
      if (fetchMode === "failure") throw new Error("network");
      if (fetchMode === "missing") {
        return {
          ok: false,
          headers: { get: () => "text/plain" },
        };
      }
      return {
        ok: true,
        async blob() {
          return { atlas: "blob" };
        },
        headers: { get: (name: string) => (name === "content-type" ? "image/png" : null) },
      };
    },
  });

  const controller = createPixelEditorSessionController({
    artworkDrafts: () => artworkDraftMap,
    cellSize: 12,
    cloneFloatingLayer: (value: any) =>
      value ? { ...value, cloned: true, pixels: value.pixels.slice() } : undefined,
    cloneSelection: (value: any) => (value ? { ...value, cloned: true } : undefined),
    createBlankAtlas: async () => ({ atlas: "blank" }),
    currentEntry: () => current.entry,
    currentEmoji: () => current.emoji,
    draftController: {
      rememberCurrentDraft() {
        calls.push("remember-draft");
      },
      resetHistory() {
        calls.push("reset-history");
      },
    },
    downloadButton: { disabled: false },
    extractCell: async (blob: unknown, entry: any) => {
      calls.push(`extract:${entry.key}:${String((blob as any).atlas ?? (blob as any).blob ?? "blob")}`);
      return loadedPixels;
    },
    getAtlasDimensions: () => ({ width: 0, height: 0 }),
    getAtlasState: () => ({}),
    getPixels: () => pixels,
    loadManifest: async () => manifest,
    paletteController: {
      updateSkinTonePalette(codePoints?: string[]) {
        calls.push(`palette:${codePoints?.join(",") ?? ""}`);
      },
    },
    persistedArtwork: () => persistedArtwork,
    previewController: {
      renderTrace() {
        calls.push("render-trace");
      },
    },
    refreshRuntimeFontBuild: async () => {
      calls.push("refresh-runtime-font");
    },
    refreshRuntimeTranslations: () => {
      calls.push("refresh-runtime-translations");
    },
    renderController: {
      draw() {
        calls.push("draw");
      },
    },
    renderLocationText: (entry: any) => `location:${entry.key}`,
    saveButton: { disabled: false },
    setAtlasBlob(value: unknown) {
      setState.atlasBlob.push(value);
    },
    setAtlasDimensions(width: number, height: number) {
      setState.atlasDimensions.push([width, height]);
    },
    setAtlasExists(value: boolean) {
      setState.atlasExists.push(value);
    },
    setCellLoaded(value: boolean) {
      setState.cellLoaded.push(value);
    },
    setCurrentEmoji(value: string) {
      current.emoji = value;
      setState.currentEmoji.push(value);
    },
    setCurrentEntry(value: any) {
      current.entry = value;
      setState.currentEntry.push(value);
    },
    setFloatingLayer(value: unknown) {
      setState.floatingLayer.push(value);
    },
    setLocationText(value: string) {
      setState.locationText.push(value);
    },
    setPixels(value: Uint8ClampedArray) {
      setState.pixels.push(value);
    },
    setSelection(value: unknown) {
      setState.selection.push(value);
    },
    setStatusText(value: string) {
      setState.statusText.push(value);
    },
    setTraceOffsets(x: number, y: number) {
      setState.traceOffsets.push([x, y]);
    },
    translate: (_key: string, fallback: string) => fallback,
    updateTransferButtons() {
      calls.push("update-transfer-buttons");
    },
  });

  await controller.open("smilingFace", "😀");
  assert.equal(sourceModuleSpecifier, "../../src/pixel-editor/controllers/pixel-editor-session.js");
  assert.deepEqual(setState.currentEmoji.at(-1), "😀");
  assert.deepEqual(setState.traceOffsets.slice(0, 2), [[0, 0], [2, -1]]);
  assert.equal(setState.currentEntry[0], undefined);
  assert.equal(setState.currentEntry.at(-1)?.key, "smilingFace");
  assert.deepEqual(setState.atlasDimensions.at(-1), [96, 48]);
  assert.deepEqual(setState.atlasExists.at(-1), true);
  assert.deepEqual(setState.cellLoaded.at(-1), true);
  assert.deepEqual(Array.from(setState.pixels.at(-1) ?? []), Array.from(draftPixels));
  assert.equal((setState.selection.at(-1) as any)?.cloned, true);
  assert.equal((setState.floatingLayer.at(-1) as any)?.cloned, true);
  assert.equal(setState.locationText.at(-1), "location:smilingFace");
  assert.equal(setState.statusText.at(-1), "");
  assert.deepEqual(Array.from(persistedArtwork.get("smilingFace") ?? []), Array.from(loadedPixels));
  assert.equal(calls.includes("remember-draft"), true);
  assert.equal(calls.filter((entry) => entry === "reset-history").length >= 2, true);
  assert.equal(calls.includes("palette:1F600"), true);
  assert.equal(calls.includes("update-transfer-buttons"), true);

  fetchMode = "missing";
  artworkDraftMap.clear();
  current.entry = undefined;
  await controller.open("smilingFace", "😀");
  assert.deepEqual(setState.atlasExists.at(-1), false);
  assert.deepEqual(setState.atlasBlob.at(-1), { atlas: "blank" });

  current.entry = undefined;
  await controller.open("unknownEmoji", "❓");
  assert.equal(setState.locationText.at(-1), "");
  assert.equal(
    setState.statusText.at(-1),
    "This modified emoji is not part of the base atlas set.",
  );

  const warnings: unknown[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args);
  const mismatchedController = createPixelEditorSessionController({
    ...({
      artworkDrafts: () => new Map(),
      cellSize: 12,
      cloneFloatingLayer: (value: any) => value,
      cloneSelection: (value: any) => value,
      createBlankAtlas: async () => ({ atlas: "blank" }),
      currentEntry: () => current.entry,
      currentEmoji: () => current.emoji,
      draftController: {
        rememberCurrentDraft() {},
        resetHistory() {},
      },
      downloadButton: { disabled: false },
      extractCell: async () => loadedPixels,
      getAtlasDimensions: () => ({ width: 0, height: 0 }),
      getAtlasState: () => ({}),
      getPixels: () => pixels,
      loadManifest: async () => ({ cellSize: 16, glyphs: {} }),
      paletteController: { updateSkinTonePalette() {} },
      persistedArtwork: () => new Map(),
      previewController: { renderTrace() {} },
      refreshRuntimeFontBuild: async () => {},
      refreshRuntimeTranslations: () => {},
      renderController: { draw() {} },
      renderLocationText: () => "",
      saveButton: { disabled: false },
      setAtlasBlob() {},
      setAtlasDimensions() {},
      setAtlasExists() {},
      setCellLoaded() {},
      setCurrentEmoji() {},
      setCurrentEntry() {},
      setFloatingLayer() {},
      setLocationText() {},
      setPixels() {},
      setSelection() {},
      setStatusText(value: string) {
        setState.statusText.push(value);
      },
      setTraceOffsets() {},
      translate: (_key: string, fallback: string) => fallback,
      updateTransferButtons() {},
    }) as any,
  });
  await mismatchedController.open("smilingFace", "😀");
  fetchMode = "failure";
  await controller.open("smilingFace", "😀");
  console.warn = originalWarn;
  assert.equal(warnings.length >= 1, true);
  assert.deepEqual(setState.atlasBlob.at(-1), { atlas: "blank" });

  current.entry = manifest.glyphs.smilingFace;
  controller.refreshTranslations();
  assert.equal(setState.locationText.at(-1), "location:smilingFace");
  assert.equal(calls.includes("refresh-runtime-translations"), true);

  await controller.refreshFontBuild();
  assert.equal(calls.includes("refresh-runtime-font"), true);
  assert.equal(setState.locationText.at(-1), "location:smilingFace");
} finally {
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else Reflect.deleteProperty(globalThis, "fetch");
}
