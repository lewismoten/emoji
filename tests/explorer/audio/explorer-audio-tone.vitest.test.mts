import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { scheduleExplorerTone } from "../../../src/explorer/audio/explorer-audio-tone.js";

describe("explorer-audio-tone", () => {
  it("schedules oscillator frequency and gain ramps for a tone", () => {
    const frequencyCalls: unknown[] = [];
    const gainCalls: unknown[] = [];
    const oscillator = {
      type: "square",
      frequency: {
        setValueAtTime(...args: unknown[]) {
          frequencyCalls.push(["set", ...args]);
        },
        exponentialRampToValueAtTime(...args: unknown[]) {
          frequencyCalls.push(["ramp", ...args]);
        },
      },
      connect() {},
      start() {},
      stop() {},
      setPeriodicWave() {},
    };
    const gain = {
      gain: {
        setValueAtTime(...args: unknown[]) {
          gainCalls.push(["set", ...args]);
        },
        exponentialRampToValueAtTime(...args: unknown[]) {
          gainCalls.push(["ramp", ...args]);
        },
      },
      connect() {},
    };
    const context = {
      createOscillator() {
        return oscillator;
      },
      createGain() {
        return gain;
      },
      createPeriodicWave() {
        return {};
      },
    } as unknown as AudioContext;

    scheduleExplorerTone({
      context,
      output: { connect() {} } as unknown as GainNode,
      start: 0,
      tone: {
        duration: 0.1,
        frequency: 440,
        volume: 0.2,
        waveform: "pad-soft",
      },
    });

    assert.ok(frequencyCalls.length > 0);
    assert.ok(gainCalls.length > 0);
  });
});
