import assert from "node:assert/strict";
import { describe, it } from "vitest";

// Additional source coverage for ../../../src/pixel-editor/controllers/pixel-editor-atlas.js

describe("pixel-editor-atlas dimensions", () => {
  it("rejects atlases with the wrong dimensions", async () => {
    const module =
      await import("../../../src/pixel-editor/controllers/pixel-editor-atlas.js");

    const closed: string[] = [];
    const controller = module.createPixelEditorAtlasController({
      currentEntry: () => ({ atlas: "group/file.png", key: "thumbsUp" }),
      draftController: {
        artworkDrafts: () => new Map(),
        markAtlasClean() {},
        rememberCurrentDraft() {},
        updateFileButtons() {},
      },
      downloadButton: { disabled: false },
      downloadEmojiButton: { disabled: false },
      getAtlasBlob: () => ({ kind: "atlas-blob" }),
      getAtlasDimensions: () => ({ width: 10, height: 20 }),
      getDirectoryHandle: () => undefined,
      getNestedFileHandle: async () => undefined,
      getPixels: () => new Uint8ClampedArray([1, 2, 3, 4]),
      imageBitmapFactory: async () => ({
        close() {
          closed.push("closed");
        },
        height: 99,
        width: 98,
      }),
      setAtlasBlob() {},
      setAtlasExists() {},
      setDirectoryHandle() {},
      translate: (_key: string, fallback: string) => fallback,
      writeStatus() {},
    });

    await assert.rejects(
      controller.renderUpdatedAtlas({ kind: "source-blob" }),
      /exactly 10 by 20 pixels/,
    );
    assert.deepEqual(closed, ["closed"]);
  });
});
