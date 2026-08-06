import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createPixelEditorSessionController } from "../../../../src/pixel-editor/controllers/pixel-editor-session.js";
import { createSessionFixture } from "./pixel-editor-session-fixture.mjs";

describe("pixel-editor-session-refresh", () => {
  it("refreshes translations and font builds while handling failures", async () => {
    const fixture = createSessionFixture();

    try {
      const warnings: unknown[] = [];
      const originalWarn = console.warn;
      console.warn = (...args: unknown[]) => warnings.push(args);

      const mismatchedController = createPixelEditorSessionController({
        artworkDrafts: () => new Map(),
        cellSize: 12,
        cloneFloatingLayer: (value: any) => value,
        cloneSelection: (value: any) => value,
        createBlankAtlas: async () => ({ atlas: "blank" }),
        currentEntry: () => fixture.current.entry,
        currentEmoji: () => fixture.current.emoji,
        draftController: {
          rememberCurrentDraft() {},
          resetHistory() {},
        },
        downloadButton: { disabled: false },
        extractCell: async () => fixture.loadedPixels,
        getAtlasDimensions: () => ({ width: 0, height: 0 }),
        getAtlasState: () => ({}),
        getPixels: () => fixture.pixels,
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
          fixture.setState.statusText.push(value);
        },
        setTraceOffsets() {},
        translate: (_key: string, fallback: string) => fallback,
        updateTransferButtons() {},
      });
      await mismatchedController.open("smilingFace", "😀");

      fixture.setFetchMode("failure");
      await fixture.controller.open("smilingFace", "😀");
      console.warn = originalWarn;
      assert.equal(warnings.length >= 1, true);
      assert.deepEqual(fixture.setState.atlasBlob.at(-1), { atlas: "blank" });

      fixture.current.entry = fixture.manifest.glyphs.smilingFace;
      fixture.controller.refreshTranslations();
      assert.equal(
        fixture.setState.locationText.at(-1),
        "location:smilingFace",
      );
      assert.equal(
        fixture.calls.includes("refresh-runtime-translations"),
        true,
      );

      await fixture.controller.refreshFontBuild();
      assert.equal(fixture.calls.includes("refresh-runtime-font"), true);
      assert.equal(
        fixture.setState.locationText.at(-1),
        "location:smilingFace",
      );
    } finally {
      fixture.restore();
    }
  });
});
