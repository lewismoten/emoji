import assert from "node:assert/strict";
import { createExplorerAudioEngine } from "../../../src/explorer/audio/explorer-audio-engine.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

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
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: FakeAudioContext,
      clearTimeout() {},
      setTimeout(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    },
  });

  let musicalDialogOpen = false;
  let music = false;
  let sfx = true;
  let theme: "base" | "dark" | "light" | "retro" = "retro";
  const engine = createExplorerAudioEngine({
    isMusicalDialogOpen: () => musicalDialogOpen,
    retroMode: () => false,
    theme: () => theme,
  });

  engine.stopMusic();
  const context = (await engine.resumeAudioContext()) as any;
  context.state = "suspended";
  engine.playSoundEffect("ui-click");
  assert.equal(timeouts.length, 0);

  context.state = "running";
  engine.playInteraction("generic", "check");
  assert.equal(timeouts.length, 0);
  theme = "base";
  music = true;
  musicalDialogOpen = true;
  engine.syncHelpMusic();
  assert.equal(timeouts.length, 0);

  theme = "retro";
  musicalDialogOpen = true;
  engine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length > 0, true);

  class ClosedAudioContext extends FakeAudioContext {
    override state = "closed" as any;
  }
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      AudioContext: ClosedAudioContext,
      clearTimeout() {},
      setTimeout(callback: () => void) {
        timeouts.push(callback);
        return timeouts.length;
      },
    },
  });
  const closedMusicEngine = createExplorerAudioEngine({
    isMusicalDialogOpen: () => true,
    retroMode: () => false,
    theme: () => "retro",
  });
  await closedMusicEngine.resumeAudioContext();
  const beforeClosedAttempt = timeouts.length;
  closedMusicEngine.syncHelpMusic();
  await Promise.resolve();
  assert.equal(timeouts.length, beforeClosedAttempt);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
}
