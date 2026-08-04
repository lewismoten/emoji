import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import { createExplorerAudioEngine } from "../../../src/explorer/audio/explorer-audio-engine.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalAudioContext = Object.getOwnPropertyDescriptor(
  globalThis,
  "AudioContext",
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
  gain = {
    value: 0,
    cancelScheduledValues() {},
    exponentialRampToValueAtTime() {},
    setValueAtTime() {},
    setTargetAtTime() {},
  };
  connect() {}
  disconnect() {}
}

class FakeAudioContext {
  state: "running" | "suspended" = "running";
  currentTime = 1;
  destination = {};
  createGain() {
    return new FakeGain();
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
    };
  }
  createPeriodicWave() {
    return {};
  }
  async resume() {}
}

try {
  const timeouts: Array<() => void> = [];
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
    value() {},
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
        if (selector === ".dialog.musical") return [helpDialog, savedDialog];
        return [];
      },
    },
  });
  preferences.init({ soundEffects: true, music: false });

  let theme: "base" | "dark" | "light" | "retro" = "retro";
  const engine = createExplorerAudioEngine();

  engine.stopMusic();
  const context = (await engine.resumeAudioContext()) as any;
  context.state = "suspended";
  await engine.playSoundEffect("ui-click");
  assert.equal(timeouts.length, 0);

  context.state = "running";
  await engine.playInteraction("generic", "check");
  assert.equal(timeouts.length, 0);
  theme = "base";
  (globalThis.document as any).documentElement.dataset.theme = "base";
  preferences.setBoolean("music", true);
  helpDialog.open = true;
  await engine.syncHelpMusic();
  assert.equal(timeouts.length, 0);

  theme = "retro";
  (globalThis.document as any).documentElement.dataset.theme = "retro";
  helpDialog.open = true;
  await engine.syncHelpMusic();
  await flush();
  assert.equal(timeouts.length > 0, true);

  class ClosedAudioContext extends FakeAudioContext {
    override state = "closed" as any;
  }
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
      setTimeout(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    },
  });
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: ClosedAudioContext,
  });
  const closedMusicEngine = createExplorerAudioEngine();
  helpDialog.open = true;
  await closedMusicEngine.resumeAudioContext();
  const beforeClosedAttempt = timeouts.length;
  await closedMusicEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length, beforeClosedAttempt);

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
      setTimeout(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    },
  });
  Reflect.deleteProperty(globalThis, "AudioContext");
  const noContextEngine = createExplorerAudioEngine();
  assert.equal(await noContextEngine.resumeAudioContext(), undefined);
  await noContextEngine.playSoundEffect("ui-click");
  await noContextEngine.restartMusic();

  class FlakyDialogAudioContext extends FakeAudioContext {
    override state: "running" | "suspended" = "suspended";
    override async resume() {
      helpDialog.open = false;
      this.state = "running";
    }
  }
  Object.defineProperty(globalThis, "AudioContext", {
    configurable: true,
    value: FlakyDialogAudioContext,
  });
  const flakyMusicEngine = createExplorerAudioEngine();
  preferences.setBoolean("music", true);
  helpDialog.open = true;
  savedDialog.open = false;
  const beforeFlakySync = timeouts.length;
  await flakyMusicEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length, beforeFlakySync);

  helpDialog.open = true;
  const beforeFlakyRestart = timeouts.length;
  await flakyMusicEngine.restartMusic();
  await Promise.resolve();
  assert.equal(timeouts.length, beforeFlakyRestart + 1);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalAudioContext) Object.defineProperty(globalThis, "AudioContext", originalAudioContext);
  else Reflect.deleteProperty(globalThis, "AudioContext");
  if (originalSetTimeout) Object.defineProperty(globalThis, "setTimeout", originalSetTimeout);
  if (originalClearTimeout) Object.defineProperty(globalThis, "clearTimeout", originalClearTimeout);
}
