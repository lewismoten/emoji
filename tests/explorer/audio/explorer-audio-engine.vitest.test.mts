import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalAudioContext = Object.getOwnPropertyDescriptor(
  globalThis,
  "AudioContext",
);
const originalWebkitAudioContext = Object.getOwnPropertyDescriptor(
  globalThis,
  "webkitAudioContext",
);
const originalSetTimeout = Object.getOwnPropertyDescriptor(
  globalThis,
  "setTimeout",
);
const originalClearTimeout = Object.getOwnPropertyDescriptor(
  globalThis,
  "clearTimeout",
);

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

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

const restoreGlobals = () => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalAudioContext) {
    Object.defineProperty(globalThis, "AudioContext", originalAudioContext);
  } else {
    Reflect.deleteProperty(globalThis, "AudioContext");
  }
  if (originalWebkitAudioContext) {
    Object.defineProperty(
      globalThis,
      "webkitAudioContext",
      originalWebkitAudioContext,
    );
  } else {
    Reflect.deleteProperty(globalThis, "webkitAudioContext");
  }
  if (originalSetTimeout) {
    Object.defineProperty(globalThis, "setTimeout", originalSetTimeout);
  }
  if (originalClearTimeout) {
    Object.defineProperty(globalThis, "clearTimeout", originalClearTimeout);
  }
};

const loadModules = async () => {
  vi.resetModules();
  const preferences = await import("../../../src/preferences.js");
  const { createExplorerAudioEngine } = await import(
    "../../../src/explorer/audio/explorer-audio-engine.js"
  );
  return { createExplorerAudioEngine, preferences };
};

describe("explorer-audio-engine", () => {
  beforeEach(() => {
    FakeAudioContext.instances.length = 0;
  });

  afterEach(() => {
    restoreGlobals();
  });

  it("plays themed sound effects and syncs music with timeouts", async () => {
    const timeouts: Array<() => void> = [];
    const cleared: number[] = [];
    const storage = new Map<string, string>();
    const helpDialog = { open: false };
    const savedDialog = { open: false };

    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: FakeAudioContext,
    });
    Object.defineProperty(globalThis, "setTimeout", {
      configurable: true,
      value(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      configurable: true,
      value(value: number) {
        cleared.push(value);
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem(key: string) {
            return storage.get(key) ?? null;
          },
          setItem(key: string, value: string) {
            storage.set(key, value);
          },
        },
        clearTimeout(value: number) {
          cleared.push(value);
        },
        setTimeout(callback: () => void) {
          timeouts.push(callback);
          return timeouts.length;
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { theme: "retro" } },
        querySelectorAll(selector: string) {
          if (selector === ".dialog.musical") {
            return [helpDialog, savedDialog];
          }
          return [];
        },
      },
    });

    const { createExplorerAudioEngine, preferences } = await loadModules();
    preferences.init({});
    const engine = createExplorerAudioEngine();

    await expect(engine.resumeAudioContext()).resolves.toBe(
      FakeAudioContext.instances[0],
    );
    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(FakeAudioContext.instances[0]?.state).toBe("running");
    await expect(engine.resumeAudioContext()).resolves.toBe(
      FakeAudioContext.instances[0],
    );

    await engine.playClick();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(0);

    preferences.setBoolean("soundEffects", true);
    await engine.playClick();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(2);
    await engine.playHover();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(3);
    await engine.playDialogOpen();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(6);
    await engine.playDialogClose();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(9);
    await engine.playSoundEffect("missing" as never);
    await engine.playInteraction("generic", "focus");

    (globalThis.document as any).documentElement.dataset.theme = "light";
    const lightSfxStart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
    await engine.playClick();
    await engine.playHover();
    await engine.playDialogOpen();
    expect(
      (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > lightSfxStart,
    ).toBe(true);
    expect(FakeAudioContext.instances[0]?.periodicWaves.length).toBeGreaterThan(
      0,
    );

    (globalThis.document as any).documentElement.dataset.theme = "dark";
    const darkSfxStart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
    await engine.playDialogClose();
    await engine.playInteraction("checkbox", "check");
    await engine.playInteraction("button", "focus");
    expect(
      (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > darkSfxStart,
    ).toBe(true);
    expect(
      FakeAudioContext.instances[0]?.oscillators.at(-1)?.periodicWave != null,
    ).toBe(true);

    preferences.setBoolean("music", true);
    helpDialog.open = true;
    await engine.syncHelpMusic();
    await flush();
    expect(timeouts.length).toBeGreaterThan(0);
    expect(FakeAudioContext.instances[0]?.oscillators.length).toBeGreaterThan(7);
    const oscillatorsAfterFirstSchedule =
      FakeAudioContext.instances[0]?.oscillators.length ?? 0;
    await engine.syncHelpMusic();
    await flush();
    expect(FakeAudioContext.instances[0]?.oscillators.length).toBe(
      oscillatorsAfterFirstSchedule,
    );

    helpDialog.open = false;
    await engine.syncHelpMusic();
    expect(cleared).toEqual([1]);
    expect(timeouts.length).toBeGreaterThanOrEqual(2);
    timeouts[0]?.();
    timeouts.at(-1)?.();
  });

  it("falls back across webkit, missing, rejected, and closed contexts", async () => {
    const storage = new Map<string, string>();
    let savedOnly = true;
    const helpDialog = { open: false };
    const savedDialog = { open: false };

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { theme: "retro" } },
        querySelectorAll(selector: string) {
          if (selector === ".dialog.musical") {
            return [helpDialog, savedDialog];
          }
          return [];
        },
      },
    });

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem(key: string) {
            return storage.get(key) ?? null;
          },
          setItem(key: string, value: string) {
            storage.set(key, value);
          },
        },
        clearTimeout() {},
        setTimeout() {
          return 0;
        },
      },
    });
    Reflect.deleteProperty(globalThis, "AudioContext");
    Object.defineProperty(globalThis, "webkitAudioContext", {
      configurable: true,
      value: FakeAudioContext,
    });

    let loaded = await loadModules();
    loaded.preferences.init({ music: true });
    const fallbackEngine = loaded.createExplorerAudioEngine();
    helpDialog.open = false;
    savedDialog.open = savedOnly;
    await fallbackEngine.resumeAudioContext();
    expect(FakeAudioContext.instances).toHaveLength(1);
    await fallbackEngine.syncHelpMusic();
    await Promise.resolve();
    expect(FakeAudioContext.instances[0]?.oscillators.length).toBeGreaterThan(0);
    savedOnly = false;
    savedDialog.open = savedOnly;
    await fallbackEngine.syncHelpMusic();

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        clearTimeout() {},
        setTimeout() {
          return 0;
        },
      },
    });
    Reflect.deleteProperty(globalThis, "AudioContext");
    Reflect.deleteProperty(globalThis, "webkitAudioContext");
    loaded = await loadModules();
    const silentEngine = loaded.createExplorerAudioEngine();
    await expect(silentEngine.resumeAudioContext()).resolves.toBeUndefined();
    await silentEngine.playClick();
    await silentEngine.syncHelpMusic();

    const noContextMusicEngine = loaded.createExplorerAudioEngine();
    helpDialog.open = true;
    await noContextMusicEngine.syncHelpMusic();
    await noContextMusicEngine.restartMusic();
    helpDialog.open = false;
    await noContextMusicEngine.restartMusic();

    class RejectingAudioContext extends FakeAudioContext {
      override async resume() {
        throw new Error("resume failed");
      }
    }

    class ClosedAudioContext extends FakeAudioContext {
      override state: "running" | "suspended" = "running";

      constructor() {
        super();
        (this as { state: string }).state = "closed";
      }
    }

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        clearTimeout() {},
        setTimeout() {
          return 0;
        },
      },
    });
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: RejectingAudioContext,
    });
    loaded = await loadModules();
    const rejectingEngine = loaded.createExplorerAudioEngine();
    await expect(rejectingEngine.resumeAudioContext()).resolves.toBeUndefined();

    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: ClosedAudioContext,
    });
    loaded = await loadModules();
    const closedEngine = loaded.createExplorerAudioEngine();
    const closedContext = await closedEngine.resumeAudioContext();
    expect((closedContext as { state?: string } | undefined)?.state).toBe(
      "closed",
    );
  });

  it("schedules theme-specific music and restarts when the theme changes", async () => {
    const helpDialog = { open: true };

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        documentElement: { dataset: { theme: "light" } },
        querySelectorAll(selector: string) {
          if (selector === ".dialog.musical") {
            return [helpDialog];
          }
          return [];
        },
      },
    });

    const themedTimeouts: Array<() => void> = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        clearTimeout() {},
        setTimeout(callback: () => void) {
          themedTimeouts.push(callback);
          return themedTimeouts.length;
        },
      },
    });
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: FakeAudioContext,
    });
    Reflect.deleteProperty(globalThis, "webkitAudioContext");

    let loaded = await loadModules();
    loaded.preferences.init({ music: true });
    let engine = loaded.createExplorerAudioEngine();
    await engine.resumeAudioContext();
    await engine.syncHelpMusic();
    await Promise.resolve();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(56);
    expect(FakeAudioContext.instances[0]?.oscillators[0]?.type).toBe("triangle");
    expect(
      FakeAudioContext.instances[0]?.oscillators[0]?.periodicWave != null,
    ).toBe(true);
    expect(FakeAudioContext.instances[0]?.oscillators[15]?.type).toBe(
      "triangle",
    );
    expect(FakeAudioContext.instances[0]?.oscillators[16]?.type).toBe("sine");
    expect(FakeAudioContext.instances[0]?.oscillators[32]?.type).toBe(
      "triangle",
    );
    expect(FakeAudioContext.instances[0]?.oscillators[40]?.type).toBe("square");

    FakeAudioContext.instances.length = 0;
    (globalThis.document as any).documentElement.dataset.theme = "dark";
    loaded = await loadModules();
    loaded.preferences.init({ music: true });
    engine = loaded.createExplorerAudioEngine();
    await engine.resumeAudioContext();
    await engine.syncHelpMusic();
    await Promise.resolve();
    expect(FakeAudioContext.instances[0]?.oscillators).toHaveLength(30);
    expect(FakeAudioContext.instances[0]?.oscillators[0]?.type).toBe("sine");
    expect(
      FakeAudioContext.instances[0]?.oscillators[0]?.periodicWave != null,
    ).toBe(true);
    expect(FakeAudioContext.instances[0]?.oscillators[12]?.type).toBe(
      "sawtooth",
    );
    expect(FakeAudioContext.instances[0]?.oscillators[24]?.type).toBe(
      "triangle",
    );

    FakeAudioContext.instances.length = 0;
    (globalThis.document as any).documentElement.dataset.theme = "base";
    loaded = await loadModules();
    loaded.preferences.init({ music: true });
    engine = loaded.createExplorerAudioEngine();
    await engine.resumeAudioContext();
    await engine.syncHelpMusic();
    expect(FakeAudioContext.instances[0]?.oscillators.length ?? 0).toBe(0);

    FakeAudioContext.instances.length = 0;
    const restartTimeouts: Array<() => void> = [];
    const restartCleared: number[] = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        clearTimeout(value: number) {
          restartCleared.push(value);
        },
        setTimeout(callback: () => void) {
          restartTimeouts.push(callback);
          return restartTimeouts.length;
        },
      },
    });
    Object.defineProperty(globalThis, "clearTimeout", {
      configurable: true,
      value(value: number) {
        restartCleared.push(value);
      },
    });
    Object.defineProperty(globalThis, "setTimeout", {
      configurable: true,
      value(callback: () => void) {
        restartTimeouts.push(callback);
        return restartTimeouts.length;
      },
    });
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: FakeAudioContext,
    });
    (globalThis.document as any).documentElement.dataset.theme = "light";
    loaded = await loadModules();
    loaded.preferences.init({ music: true });
    engine = loaded.createExplorerAudioEngine();
    await engine.resumeAudioContext();
    await engine.syncHelpMusic();
    await Promise.resolve();
    const beforeRestart = FakeAudioContext.instances[0]?.oscillators.length ?? 0;
    (globalThis.document as any).documentElement.dataset.theme = "dark";
    await engine.restartMusic();
    await Promise.resolve();
    expect(restartCleared.includes(1)).toBe(true);
    expect(
      (FakeAudioContext.instances[0]?.oscillators.length ?? 0) > beforeRestart,
    ).toBe(true);
  });
});
