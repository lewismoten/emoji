import assert from "node:assert/strict";
import { createExplorerAudioEngine } from "../../../src/explorer/audio/explorer-audio-engine.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

class FakeGain {
  connectedTo: unknown[] = [];
  gain = {
    value: 0,
    calls: [] as Array<[string, number, number?]>,
    cancelScheduledValues: (time: number) => {
      this.gain.calls.push(["cancelScheduledValues", time]);
    },
    setTargetAtTime: (value: number, time: number, constant: number) => {
      this.gain.calls.push(["setTargetAtTime", value, time + constant]);
    },
    setValueAtTime: (value: number, time: number) => {
      this.gain.calls.push(["setValueAtTime", value, time]);
    },
    exponentialRampToValueAtTime: (value: number, time: number) => {
      this.gain.calls.push(["exponentialRampToValueAtTime", value, time]);
    },
  };

  connect(target: unknown) {
    this.connectedTo.push(target);
  }

  disconnect() {
    this.connectedTo.length = 0;
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
  static instances: FakeAudioContext[] = [];
  state: "suspended" | "running" = "suspended";
  currentTime = 1;
  destination = { id: "destination" };
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  createGain() {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createOscillator() {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  async resume() {
    this.state = "running";
  }
}

try {
  const timeouts: Array<() => void> = [];
  const cleared: number[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: FakeAudioContext,
      clearTimeout(value: number) {
        cleared.push(value);
      },
      setTimeout(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    },
  });

  let retro = false;
  let sfx = false;
  let music = false;
  let helpOpen = false;
  let savedOpen = false;
  const engine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => music,
    retroMode: () => retro,
    savedDialogOpen: () => savedOpen,
    soundEffectsEnabled: () => sfx,
  });

  await engine.resumeAudioContext();
  assert.equal(FakeAudioContext.instances.length, 1);
  assert.equal(FakeAudioContext.instances[0]?.state, "running");

  engine.playClick();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 0);

  retro = true;
  sfx = true;
  engine.playHover();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 1);
  engine.playDialogOpen();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 4);
  engine.playDialogClose();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 7);

  music = true;
  helpOpen = true;
  engine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length > 0, true);
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length > 7, true);

  helpOpen = false;
  savedOpen = false;
  engine.syncHelpMusic();
  assert.deepEqual(cleared, [1]);
  assert.equal(timeouts.length >= 2, true);
  timeouts.at(-1)?.();
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
