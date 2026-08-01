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
  static instances: FakeAudioContext[] = [];
  state: "suspended" | "running" = "suspended";
  currentTime = 1;
  destination = { id: "destination" };
  gains: FakeGain[] = [];
  oscillators: FakeOscillator[] = [];
  periodicWaves: Array<{ imag: Float32Array; real: Float32Array }> = [];

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

  createPeriodicWave(real: Float32Array, imag: Float32Array) {
    const wave = { imag, real };
    this.periodicWaves.push(wave);
    return wave as unknown as PeriodicWave;
  }

  async resume() {
    this.state = "running";
  }
}

try {
  const timeouts: Array<() => void> = [];
  const cleared: number[] = [];
  FakeAudioContext.instances.length = 0;
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
  let theme: "base" | "dark" | "light" | "retro" = "retro";
  const engine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => music,
    retroMode: () => retro,
    theme: () => theme,
    savedDialogOpen: () => savedOpen,
    soundEffectsEnabled: () => sfx,
  });

  await engine.resumeAudioContext();
  assert.equal(FakeAudioContext.instances.length, 1);
  assert.equal(FakeAudioContext.instances[0]?.state, "running");
  assert.equal(await engine.resumeAudioContext(), FakeAudioContext.instances[0]);

  engine.playClick();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 0);

  retro = true;
  sfx = true;
  engine.playClick();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 2);
  engine.playHover();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 3);
  engine.playDialogOpen();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 6);
  engine.playDialogClose();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 9);
  engine.playSoundEffect("missing" as any);
  engine.playInteraction("generic", "focus");
  assert.equal(engine.theme().voices.length > 0, true);

  retro = false;
  theme = "light";
  const lightSfxStart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
  engine.playClick();
  engine.playHover();
  engine.playDialogOpen();
  assert.equal(
    (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > lightSfxStart,
    true,
  );
  assert.equal(
    FakeAudioContext.instances[0]?.periodicWaves.length > 0,
    true,
  );

  theme = "dark";
  const darkSfxStart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
  engine.playDialogClose();
  engine.playInteraction("checkbox", "check");
  engine.playInteraction("button", "focus");
  assert.equal(
    (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > darkSfxStart,
    true,
  );
  assert.equal(
    FakeAudioContext.instances[0]?.oscillators.at(-1)?.periodicWave != null,
    true,
  );

  music = true;
  helpOpen = true;
  engine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length > 0, true);
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length > 7, true);
  const oscillatorsAfterFirstSchedule =
    FakeAudioContext.instances[0]?.oscillators.length ?? 0;
  engine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(
    FakeAudioContext.instances[0]?.oscillators.length,
    oscillatorsAfterFirstSchedule,
  );

  helpOpen = false;
  savedOpen = false;
  engine.syncHelpMusic();
  assert.deepEqual(cleared, [1]);
  assert.equal(timeouts.length >= 2, true);
  timeouts[0]?.();
  timeouts.at(-1)?.();

  FakeAudioContext.instances.length = 0;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      webkitAudioContext: FakeAudioContext,
      clearTimeout() {},
      setTimeout() {
        return 0;
      },
    },
  });
  let savedOnly = true;
  const fallbackEngine = createExplorerAudioEngine({
    helpDialogOpen: () => false,
    musicEnabled: () => true,
    retroMode: () => true,
    theme: () => "retro",
    savedDialogOpen: () => savedOnly,
    soundEffectsEnabled: () => false,
  });
  await fallbackEngine.resumeAudioContext();
  assert.equal(FakeAudioContext.instances.length, 1);
  fallbackEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length > 0, true);
  savedOnly = false;
  fallbackEngine.syncHelpMusic();

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      clearTimeout() {},
      setTimeout() {
        return 0;
      },
    },
  });
  const silentEngine = createExplorerAudioEngine({
    helpDialogOpen: () => false,
    musicEnabled: () => true,
    retroMode: () => true,
    theme: () => "retro",
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => true,
  });
  assert.equal(await silentEngine.resumeAudioContext(), undefined);
  silentEngine.playClick();
  silentEngine.syncHelpMusic();

  let noContextHelpOpen = true;
  const noContextMusicEngine = createExplorerAudioEngine({
    helpDialogOpen: () => noContextHelpOpen,
    musicEnabled: () => true,
    retroMode: () => true,
    theme: () => "retro",
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => false,
  });
  noContextMusicEngine.syncHelpMusic();
  noContextMusicEngine.restartMusic();
  noContextHelpOpen = false;
  noContextMusicEngine.restartMusic();

  class RejectingAudioContext extends FakeAudioContext {
    override async resume() {
      throw new Error("resume failed");
    }
  }
  class ClosedAudioContext extends FakeAudioContext {
    override state: "running" | "suspended" = "running";
    constructor() {
      super();
      (this as any).state = "closed";
    }
  }
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: RejectingAudioContext,
      clearTimeout() {},
      setTimeout() {
        return 0;
      },
    },
  });
  const rejectingEngine = createExplorerAudioEngine({
    helpDialogOpen: () => false,
    musicEnabled: () => false,
    retroMode: () => true,
    theme: () => "retro",
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => false,
  });
  assert.equal(await rejectingEngine.resumeAudioContext(), undefined);

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: ClosedAudioContext,
      clearTimeout() {},
      setTimeout() {
        return 0;
      },
    },
  });
  const closedEngine = createExplorerAudioEngine({
    helpDialogOpen: () => false,
    musicEnabled: () => false,
    retroMode: () => true,
    theme: () => "retro",
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => false,
  });
  const closedContext = await closedEngine.resumeAudioContext();
  assert.equal((closedContext as any)?.state, "closed");

  FakeAudioContext.instances.length = 0;
  const themedTimeouts: Array<() => void> = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: FakeAudioContext,
      clearTimeout() {},
      setTimeout(callback: () => void) {
        themedTimeouts.push(callback);
        return themedTimeouts.length;
      },
    },
  });
  theme = "light";
  retro = false;
  music = true;
  helpOpen = true;
  savedOpen = false;
  const lightEngine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => music,
    retroMode: () => retro,
    theme: () => theme,
    savedDialogOpen: () => savedOpen,
    soundEffectsEnabled: () => false,
  });
  await lightEngine.resumeAudioContext();
  lightEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 56);
  assert.equal(FakeAudioContext.instances[0]?.oscillators[0]?.type, "triangle");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[0]?.periodicWave != null, true);
  assert.equal(FakeAudioContext.instances[0]?.oscillators[15]?.type, "triangle");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[16]?.type, "sine");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[32]?.type, "triangle");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[40]?.type, "square");

  FakeAudioContext.instances.length = 0;
  theme = "dark";
  const darkEngine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => music,
    retroMode: () => retro,
    theme: () => theme,
    savedDialogOpen: () => savedOpen,
    soundEffectsEnabled: () => false,
  });
  await darkEngine.resumeAudioContext();
  darkEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length, 30);
  assert.equal(FakeAudioContext.instances[0]?.oscillators[0]?.type, "sine");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[0]?.periodicWave != null, true);
  assert.equal(FakeAudioContext.instances[0]?.oscillators[12]?.type, "sawtooth");
  assert.equal(FakeAudioContext.instances[0]?.oscillators[24]?.type, "triangle");

  FakeAudioContext.instances.length = 0;
  theme = "base";
  const baseThemeEngine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => true,
    retroMode: () => false,
    theme: () => theme,
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => false,
  });
  await baseThemeEngine.resumeAudioContext();
  baseThemeEngine.syncHelpMusic();
  assert.equal(FakeAudioContext.instances[0]?.oscillators.length ?? 0, 0);

  FakeAudioContext.instances.length = 0;
  const restartTimeouts: Array<() => void> = [];
  const restartCleared: number[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: FakeAudioContext,
      clearTimeout(value: number) {
        restartCleared.push(value);
      },
      setTimeout(callback: () => void) {
        restartTimeouts.push(callback);
        return restartTimeouts.length;
      },
    },
  });
  theme = "light";
  helpOpen = true;
  music = true;
  const restartEngine = createExplorerAudioEngine({
    helpDialogOpen: () => helpOpen,
    musicEnabled: () => music,
    retroMode: () => false,
    theme: () => theme,
    savedDialogOpen: () => false,
    soundEffectsEnabled: () => false,
  });
  await restartEngine.resumeAudioContext();
  restartEngine.syncHelpMusic();
  await Promise.resolve();
  const beforeRestart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
  theme = "dark";
  restartEngine.restartMusic();
  await Promise.resolve();
  assert.equal(restartCleared.includes(1), true);
  assert.equal(
    (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > beforeRestart,
    true,
  );
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
