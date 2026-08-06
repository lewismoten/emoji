import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { AudioEventDependencies } from "../../../../src/explorer/audio/events/audio-event-dependencies.js";

describe("audio-event-dependencies", () => {
  it("accepts the expected dependency shape", () => {
    const value = {
      audio: {} as AudioEventDependencies["audio"],
      document: {} as AudioEventDependencies["document"],
      getHoverTarget: () => null,
      getInteractiveTarget: () => null,
      setHoverTarget() {},
    } satisfies AudioEventDependencies;

    assert.equal(typeof value.getInteractiveTarget, "function");
  });
});
