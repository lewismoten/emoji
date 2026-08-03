import assert from "node:assert/strict";

import type { AudioEventDependencies } from "../../../../src/explorer/audio/events/audio-event-dependencies.js";

const value = {
  audio: {} as AudioEventDependencies["audio"],
  document: {} as AudioEventDependencies["document"],
  getHoverTarget: () => null,
  getInteractiveTarget: () => null,
  setHoverTarget() {},
} satisfies AudioEventDependencies;

assert.equal(typeof value.getInteractiveTarget, "function");
