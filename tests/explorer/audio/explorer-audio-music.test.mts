import assert from "node:assert/strict";
import {
  getExplorerMusicConfig,
  scheduleExplorerMusic,
} from "../../../src/explorer/audio/explorer-audio-music.js";

class FakeGain {
  connectedTo: unknown[] = [];
  gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  connect(target: unknown) {
    this.connectedTo.push(target);
  }
}

class FakeOscillator {
  type = "";
  periodicWave: unknown;
  started: number[] = [];
  stopped: number[] = [];
  connectedTo: unknown[] = [];
  frequency = {
    calls: [] as Array<[string, number, number]>,
    setValueAtTime: (value: number, time: number) => {
      this.frequency.calls.push(["setValueAtTime", value, time]);
    },
    exponentialRampToValueAtTime: (value: number, time: number) => {
      this.frequency.calls.push(["exponentialRampToValueAtTime", value, time]);
    },
  };
  connect(target: unknown) {
    this.connectedTo.push(target);
  }
  setPeriodicWave(wave: unknown) {
    this.periodicWave = wave;
  }
  start(time: number) {
    this.started.push(time);
  }
  stop(time: number) {
    this.stopped.push(time);
  }
}

class FakeAudioContext {
  currentTime = 1;
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];
  periodicWaves: Array<{ imag: Float32Array; real: Float32Array }> = [];
  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain as unknown as GainNode;
  }
  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator as unknown as OscillatorNode;
  }
  createPeriodicWave(real: Float32Array, imag: Float32Array) {
    const wave = { imag, real };
    this.periodicWaves.push(wave);
    return wave as unknown as PeriodicWave;
  }
}

const light = getExplorerMusicConfig("light");
assert.equal(light.voices.length, 4);
assert.equal(light.voices[0]?.events.length, 16);
assert.equal(light.voices[0]?.instrument, "bell-bright");
assert.equal(light.voices[3]?.instrument, "drum-chip");

const dark = getExplorerMusicConfig("dark");
assert.equal(dark.voices.length, 3);
assert.equal(dark.voices[1]?.events.length > 0, true);
assert.equal(dark.voices[1]?.instrument, "pad-warm");

const retro = getExplorerMusicConfig("retro");
assert.equal(retro.voices.length, 2);
assert.equal(retro.voices[0]?.events.length, 8);
assert.equal(retro.voices[0]?.instrument, "lead-chip");
assert.equal(getExplorerMusicConfig("base"), retro);

const context = new FakeAudioContext();
const masterGain = context.createGain() as unknown as GainNode;
const firstTimeouts: number[] = [];
const lightSchedule = scheduleExplorerMusic({
  context: context as unknown as AudioContext,
  createGain: () => context.createGain() as unknown as GainNode,
  masterGain,
  musicBeat: 4,
  scheduleNext: (_callback, timeout) => {
    firstTimeouts.push(timeout);
    return 7;
  },
  schedulePlayback() {},
  theme: "light",
});
assert.equal(lightSchedule.musicBeat, 20);
assert.equal(lightSchedule.musicTimer, 7);
assert.equal((lightSchedule.musicGain as unknown as FakeGain).gain.value, 0.1);
assert.equal((lightSchedule.musicGain as unknown as FakeGain).connectedTo[0], masterGain);
assert.equal(firstTimeouts[0], light.beatLength * 16 * 1000 - 60);
assert.equal(context.oscillators.length, 56);
assert.equal(context.periodicWaves.length > 0, true);
assert.equal((context.oscillators[0] as FakeOscillator).periodicWave != null, true);

const secondTimeouts: number[] = [];
const darkSchedule = scheduleExplorerMusic({
  context: context as unknown as AudioContext,
  createGain: () => context.createGain() as unknown as GainNode,
  masterGain,
  musicBeat: 0,
  musicGain: lightSchedule.musicGain,
  scheduleNext: (_callback, timeout) => {
    secondTimeouts.push(timeout);
    return 8;
  },
  schedulePlayback() {},
  theme: "dark",
});
assert.equal(darkSchedule.musicBeat, 12);
assert.equal(darkSchedule.musicTimer, 8);
assert.equal(darkSchedule.musicGain, lightSchedule.musicGain);
assert.equal(secondTimeouts[0], dark.beatLength * 12 * 1000 - 60);
assert.equal(context.oscillators.length, 86);
assert.equal((context.oscillators.at(-1) as FakeOscillator).periodicWave != null, true);
assert.equal(
  (context.oscillators.at(-1) as FakeOscillator).frequency.calls.length > 0,
  true,
);
