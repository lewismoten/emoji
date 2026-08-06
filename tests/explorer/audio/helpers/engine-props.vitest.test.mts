import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { EngineProps } from "../../../../src/explorer/audio/engine-props.js";

describe("engine-props", () => {
  it("accepts the expected engine prop shape", () => {
    const props: EngineProps = {
      audioContext: undefined,
      getAudioContext: () => undefined,
      masterGain: undefined,
      musicBeat: 0,
      musicGain: undefined,
      musicTimer: undefined,
      resetMusicPlayback: () => undefined,
      resumeAudioContext: async () => undefined,
      scheduleMusic: async () => undefined,
      stopMusic: () => undefined,
    };

    assert.equal(props.musicBeat, 0);
    assert.equal(typeof props.stopMusic, "function");
  });
});
