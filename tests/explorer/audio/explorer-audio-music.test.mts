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
}

const light = getExplorerMusicConfig("light");
assert.equal(light.pattern.length, 16);
assert.equal(light.drums.length, 16);
assert.equal(light.leadType, "triangle");

const dark = getExplorerMusicConfig("dark");
assert.equal(dark.harmony.length > 0, true);
assert.equal(dark.drums.length, 0);
assert.equal(dark.padType, "sawtooth");

const retro = getExplorerMusicConfig("retro");
assert.equal(retro.harmony.length, 0);
assert.equal(retro.pattern.length, 8);
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
assert.equal(firstTimeouts[0], light.beatLength * light.pattern.length * 1000 - 60);
assert.equal(context.oscillators.length, 56);

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
assert.equal(secondTimeouts[0], dark.beatLength * dark.pattern.length * 1000 - 60);
assert.equal(context.oscillators.length, 86);
assert.equal(
  (context.oscillators.at(-1) as FakeOscillator).frequency.calls.length > 0,
  true,
);
