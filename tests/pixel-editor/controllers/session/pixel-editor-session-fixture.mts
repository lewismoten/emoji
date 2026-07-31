import { createPixelEditorSessionController } from "../../../../src/pixel-editor/controllers/pixel-editor-session.js";

export function createSessionFixture() {
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
  const calls: string[] = [];
  const draftPixels = new Uint8ClampedArray([1, 2, 3, 4]);
  const loadedPixels = new Uint8ClampedArray([5, 6, 7, 8]);
  const artworkDraftMap = new Map<string, any>([
    [
      "smilingFace",
      {
        floatingLayer: {
          pixels: new Uint8ClampedArray([8, 8, 8, 8]),
          width: 1,
          height: 1,
        },
        pixels: draftPixels,
        selection: { x: 1, y: 2, width: 3, height: 4 },
        traceOffsetX: 2,
        traceOffsetY: -1,
      },
    ],
  ]);
  const persistedArtwork = new Map<string, Uint8ClampedArray>();
  const current = { entry: undefined as any, emoji: "" };
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
        headers: {
          get: (name: string) => (name === "content-type" ? "image/png" : null),
        },
      };
    },
  });

  const controller = createPixelEditorSessionController({
    artworkDrafts: () => artworkDraftMap,
    cellSize: 12,
    cloneFloatingLayer: (value: any) =>
      value
        ? { ...value, cloned: true, pixels: value.pixels.slice() }
        : undefined,
    cloneSelection: (value: any) =>
      value ? { ...value, cloned: true } : undefined,
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
      calls.push(
        `extract:${entry.key}:${String((blob as any).atlas ?? (blob as any).blob ?? "blob")}`,
      );
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

  return {
    artworkDraftMap,
    calls,
    controller,
    current,
    draftPixels,
    loadedPixels,
    manifest,
    persistedArtwork,
    pixels,
    setFetchMode(value: "png" | "missing" | "failure") {
      fetchMode = value;
    },
    setState,
    restore() {
      if (originalFetch)
        Object.defineProperty(globalThis, "fetch", originalFetch);
      else Reflect.deleteProperty(globalThis, "fetch");
    },
  };
}
