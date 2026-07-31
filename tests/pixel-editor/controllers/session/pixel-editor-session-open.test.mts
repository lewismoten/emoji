import assert from "node:assert/strict";
import { createSessionFixture } from "./pixel-editor-session-fixture.mjs";

const fixture = createSessionFixture();

try {
  await fixture.controller.open("smilingFace", "😀");
  assert.deepEqual(fixture.setState.currentEmoji.at(-1), "😀");
  assert.deepEqual(fixture.setState.traceOffsets.slice(0, 2), [
    [0, 0],
    [2, -1],
  ]);
  assert.equal(fixture.setState.currentEntry[0], undefined);
  assert.equal(fixture.setState.currentEntry.at(-1)?.key, "smilingFace");
  assert.deepEqual(fixture.setState.atlasDimensions.at(-1), [96, 48]);
  assert.deepEqual(fixture.setState.atlasExists.at(-1), true);
  assert.deepEqual(fixture.setState.cellLoaded.at(-1), true);
  assert.deepEqual(
    Array.from(fixture.setState.pixels.at(-1) ?? []),
    Array.from(fixture.draftPixels),
  );
  assert.equal((fixture.setState.selection.at(-1) as any)?.cloned, true);
  assert.equal((fixture.setState.floatingLayer.at(-1) as any)?.cloned, true);
  assert.equal(fixture.setState.locationText.at(-1), "location:smilingFace");
  assert.equal(fixture.setState.statusText.at(-1), "");
  assert.deepEqual(
    Array.from(fixture.persistedArtwork.get("smilingFace") ?? []),
    Array.from(fixture.loadedPixels),
  );
  assert.equal(fixture.calls.includes("remember-draft"), true);
  assert.equal(
    fixture.calls.filter((entry) => entry === "reset-history").length >= 2,
    true,
  );
  assert.equal(fixture.calls.includes("palette:1F600"), true);
  assert.equal(fixture.calls.includes("update-transfer-buttons"), true);

  fixture.setFetchMode("missing");
  fixture.artworkDraftMap.clear();
  fixture.current.entry = undefined;
  await fixture.controller.open("smilingFace", "😀");
  assert.deepEqual(fixture.setState.atlasExists.at(-1), false);
  assert.deepEqual(fixture.setState.atlasBlob.at(-1), { atlas: "blank" });

  fixture.current.entry = undefined;
  await fixture.controller.open("unknownEmoji", "❓");
  assert.equal(fixture.setState.locationText.at(-1), "");
  assert.equal(
    fixture.setState.statusText.at(-1),
    "This modified emoji is not part of the base atlas set.",
  );
} finally {
  fixture.restore();
}
