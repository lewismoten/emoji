import assert from "node:assert/strict";
import { describe, it } from "vitest";

import getInteractiveTarget from "../../../../src/explorer/audio/events/audio-target.js";

describe("audio-target", () => {
  it("exports an interactive target resolver", () => {
    assert.equal(typeof getInteractiveTarget, "function");
  });
});
