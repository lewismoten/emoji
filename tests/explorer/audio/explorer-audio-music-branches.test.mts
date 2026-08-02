import assert from "node:assert/strict";
import { scheduleExplorerMusic } from "../../../src/explorer/audio/explorer-audio-music.js";

class FakeGain {
  connectedTo: unknown[] = [];
  gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  connect(target: unknown) {
    this.connectedTo.push(target);
  }
}

class FakeAudioContext {
  currentTime = 0;
  createGain() {
    return new FakeGain() as unknown as GainNode;
  }
  createOscillator() {
    return {
      type: "",
      frequency: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect() {},
      setPeriodicWave() {},
      start() {},
      stop() {},
    } as unknown as OscillatorNode;
  }
  createPeriodicWave() {
    return {} as PeriodicWave;
  }
}

const context = new FakeAudioContext();
const masterGain = context.createGain();
const calls: number[] = [];
const retroSchedule = scheduleExplorerMusic({
  context: context as unknown as AudioContext,
  createGain: () => context.createGain(),
  masterGain,
  musicBeat: 1,
  scheduleNext: (_callback, timeout) => {
    calls.push(timeout);
    return 11;
  },
  schedulePlayback() {},
  theme: "retro",
});

assert.equal(retroSchedule.musicTimer, 11);
assert.equal(retroSchedule.musicBeat > 1, true);
assert.equal(calls.length, 1);
assert.equal(
  (retroSchedule.musicGain as unknown as FakeGain).connectedTo[0],
  masterGain,
);
