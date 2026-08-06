import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { loadControllerSessionFixture } from "./pixel-editor-controller-session-fixture.mjs";

describe("pixel-editor-controller-session-runtime", () => {
  it("wires session and atlas controllers into runtime state", async () => {
    const fixture = await loadControllerSessionFixture();

    assert.deepEqual(fixture.result, {
      atlasController: { kind: "atlas-controller" },
      inputController: { kind: "input-controller" },
      sessionController: { kind: "session-controller" },
    });

    const sessionOptions = fixture.sessionStub.sessionCalls[0];
    assert.equal(sessionOptions.cellSize, 12);
    assert.equal(
      sessionOptions.downloadButton,
      fixture.elements.downloadButton,
    );
    assert.equal(sessionOptions.saveButton, fixture.elements.saveButton);
    assert.equal(
      sessionOptions.loadManifest,
      fixture.visual.runtimeController.loadManifest,
    );
    assert.equal(
      sessionOptions.paletteController,
      fixture.visual.paletteController,
    );
    assert.equal(
      sessionOptions.previewController,
      fixture.visual.previewController,
    );
    assert.equal(
      sessionOptions.renderController,
      fixture.visual.renderController,
    );
    assert.equal(
      sessionOptions.refreshRuntimeFontBuild,
      fixture.visual.runtimeController.refreshFontBuild,
    );
    assert.equal(
      sessionOptions.refreshRuntimeTranslations,
      fixture.visual.runtimeController.refreshTranslations,
    );
    assert.equal(
      sessionOptions.renderLocationText,
      fixture.visual.runtimeController.renderLocationText,
    );
    sessionOptions.setAtlasDimensions(30, 40);
    sessionOptions.setCurrentEmoji("🙂");
    sessionOptions.setCurrentEntry({ key: "wave" });
    sessionOptions.setFloatingLayer("layer");
    sessionOptions.setLocationText("loc");
    sessionOptions.setPixels(new Uint8ClampedArray([9]));
    sessionOptions.setSelection("selection");
    sessionOptions.setStatusText("status");
    sessionOptions.setTraceOffsets(7, 8);
    assert.deepEqual(
      {
        atlasHeight: fixture.state.atlasHeight,
        atlasWidth: fixture.state.atlasWidth,
        currentEmoji: fixture.state.currentEmoji,
        currentEntry: fixture.state.currentEntry,
        floatingLayer: fixture.state.floatingLayer,
        pixels: Array.from(fixture.state.pixels),
        selection: fixture.state.selection,
        traceOffsetX: fixture.state.traceOffsetX,
        traceOffsetY: fixture.state.traceOffsetY,
        location: fixture.elements.location.textContent,
        status: fixture.elements.status.textContent,
      },
      {
        atlasHeight: 40,
        atlasWidth: 30,
        currentEmoji: "🙂",
        currentEntry: { key: "wave" },
        floatingLayer: "layer",
        pixels: [9],
        selection: "selection",
        traceOffsetX: 7,
        traceOffsetY: 8,
        location: "loc",
        status: "status",
      },
    );

    const atlasOptions = fixture.atlasStub.atlasCalls[0];
    assert.equal(atlasOptions.downloadButton, fixture.elements.downloadButton);
    assert.equal(
      atlasOptions.downloadEmojiButton,
      fixture.elements.downloadEmojiButton,
    );
    assert.equal(atlasOptions.translate, "translate");
    atlasOptions.setDirectoryHandle("new-dir");
    atlasOptions.setAtlasBlob("new-blob");
    atlasOptions.setAtlasExists(false);
    atlasOptions.writeStatus("atlas-status");
    assert.equal(fixture.state.directoryHandle, "new-dir");
    assert.equal(fixture.state.atlasBlob, "new-blob");
    assert.equal(fixture.state.atlasExists, false);
    assert.equal(fixture.elements.status.textContent, "atlas-status");
  });
});
