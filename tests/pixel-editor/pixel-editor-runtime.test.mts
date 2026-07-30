import assert from "node:assert/strict";
import { createPixelEditorRuntimeController } from "../../src/pixel-editor/controllers/pixel-editor-runtime.js";

const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
const originalDateNow = Date.now;

try {
  let manifestPromise: Promise<any> | undefined;
  const setManifestValues: Array<Promise<any> | undefined> = [];
  const draftCalls: string[] = [];
  const paletteCalls: Array<string[] | undefined> = [];
  const previewCalls: string[] = [];
  const renderCalls: string[] = [];
  const runtimeState = {
    entry: {
      atlas: "people/smile.png",
      codePoints: ["1F600"],
      key: "smilingFace",
      row: 1,
      column: 2,
    } as any,
  };
  const manifest = {
    glyphs: {
      smilingFace: { key: "smilingFace", row: 0, column: 0 },
    },
  };
  const translatedLabel = { dataset: { i18n: "pencil" }, textContent: "Pencil" };
  const translatedButton = {
    dataset: { i18nAriaLabel: "paintBucket" },
    attributes: new Map([
      ["aria-label", "Paint bucket"],
      ["title", "Paint bucket"],
    ]),
    getAttribute(name: string) {
      return this.attributes.get(name) ?? null;
    },
    hasAttribute(name: string) {
      return this.attributes.has(name);
    },
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
  };
  const layerPositionElement = {
    attributes: new Map([["title", "Move floating layer"]]),
    hasAttribute(name: string) {
      return this.attributes.has(name);
    },
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
  };
  const translatedRoot = {
    querySelector(selector: string) {
      if (selector === ".pixel-editor-layer-position") return layerPositionElement;
      return null;
    },
    querySelectorAll(selector: string) {
      if (selector === "[data-i18n]") return [translatedLabel];
      if (selector === "[data-i18n-aria-label]") return [translatedButton];
      return [];
    },
  };
  const fetchCalls: Array<[string, any]> = [];
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string, options?: unknown) => {
      fetchCalls.push([url, options]);
      return {
        ok: true,
        async json() {
          return manifest;
        },
      };
    },
  });
  Date.now = () => 2468;

  const controller = createPixelEditorRuntimeController({
    currentEntry: () => runtimeState.entry,
    draftController: {
      updatePreviewActionLabels() {
        draftCalls.push("preview-labels");
      },
      undo() {
        draftCalls.push("undo");
      },
      redo() {
        draftCalls.push("redo");
      },
    },
    formatNumber: (value: number) => `[${value}]`,
    formatPercent: (value: number) => `${Math.round(value * 100)} percent`,
    getLoadId: () => 1,
    getManifestPromise: () => manifestPromise,
    isViteDevelopment: true,
    paletteController: {
      updateSkinTonePalette(codePoints?: string[]) {
        paletteCalls.push(codePoints);
      },
    },
    previewController: {
      drawFontPreview() {
        previewCalls.push("font-preview");
      },
    },
    renderController: {
      draw() {
        renderCalls.push("draw");
      },
    },
    setCurrentEntry(entry: any) {
      runtimeState.entry = entry;
    },
    setManifestPromise(value: Promise<any> | undefined) {
      manifestPromise = value;
      setManifestValues.push(value);
    },
    status: {
      closest(selector: string) {
        return selector === ".pixel-editor-view" ? translatedRoot : null;
      },
    },
    traceAlpha: { value: "42" },
    traceOutput: { value: "" },
    translate: (key: string, fallback: string) =>
      (
        {
          column: "column",
          row: "row",
          pencil: "thing",
          paintBucket: "color pour",
        } as Record<string, string>
      )[key] ?? fallback,
    updateLocation() {
      draftCalls.push("update-location");
    },
    updateShapeToolButtons() {
      draftCalls.push("shape-buttons");
    },
    updateTransferButtons() {
      draftCalls.push("transfer-buttons");
    },
  });

  controller.updateTraceOutput();
  assert.equal(
    controller.renderLocationText(runtimeState.entry),
    "people/smile.png · row [2] · column [3]",
  );
  assert.equal((controller as any).updateTraceOutput !== undefined, true);
  assert.equal((controller as any) !== undefined, true);

  controller.refreshTranslations();
  assert.equal(draftCalls.includes("update-location"), true);
  assert.equal(draftCalls.includes("shape-buttons"), true);
  assert.equal(draftCalls.includes("preview-labels"), true);
  assert.deepEqual(paletteCalls, [["1F600"]]);
  assert.equal(translatedLabel.textContent, "thing");
  assert.equal(translatedButton.getAttribute("aria-label"), "color pour");
  assert.equal(translatedButton.getAttribute("title"), "color pour");
  assert.equal(
    layerPositionElement.attributes.get("aria-label"),
    "Move floating layer",
  );

  assert.equal(
    controller.renderLocationText(runtimeState.entry),
    "people/smile.png · row [2] · column [3]",
  );
  controller.undo();
  controller.redo();
  assert.equal(renderCalls.length, 2);

  const loaded = await controller.loadManifest();
  assert.equal(loaded, manifest);
  assert.deepEqual(fetchCalls, [
    ["pixel-font/build/editor-manifest.json?v=2468", { cache: "no-store" }],
  ]);
  assert.equal(Boolean(manifestPromise), true);

  await controller.refreshFontBuild();
  assert.deepEqual(runtimeState.entry, manifest.glyphs.smilingFace);
  assert.deepEqual(previewCalls, ["font-preview"]);
  assert.equal(draftCalls.includes("transfer-buttons"), true);

  fetchCalls.length = 0;
  manifestPromise = Promise.resolve(manifest);
  await controller.loadManifest(true);
  assert.equal(setManifestValues[setManifestValues.length - 2], undefined);
  assert.equal(fetchCalls.length, 1);

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({ ok: false }),
  });
  manifestPromise = undefined;
  await assert.rejects(controller.loadManifest(), /manifest is unavailable/);

  const warnings: unknown[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args);
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => {
      throw new Error("boom");
    },
  });
  manifestPromise = undefined;
  await controller.refreshFontBuild();
  console.warn = originalWarn;
  assert.equal(warnings.length, 1);
} finally {
  Date.now = originalDateNow;
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else Reflect.deleteProperty(globalThis, "fetch");
}
