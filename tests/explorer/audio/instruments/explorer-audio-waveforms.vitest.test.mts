import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { applyExplorerWaveform } from "../../../../src/explorer/audio/instruments/explorer-audio-waveforms.js";

describe("explorer-audio-waveforms", () => {
  it("creates and applies a periodic wave", () => {
    const createdWaves: Array<{ real: Float32Array; imag: Float32Array }> = [];
    const oscillator = {
      setPeriodicWave(wave: unknown) {
        assert.ok(wave);
      },
    } as unknown as OscillatorNode;
    const context = {
      createPeriodicWave(real: Float32Array, imag: Float32Array) {
        createdWaves.push({ real, imag });
        return { real, imag };
      },
    } as unknown as AudioContext;

    applyExplorerWaveform(context, oscillator, "pad-soft");

    assert.equal(createdWaves.length, 1);
    assert.ok(createdWaves[0].real.length > 0);
    assert.ok(createdWaves[0].imag.length > 0);
  });
});
