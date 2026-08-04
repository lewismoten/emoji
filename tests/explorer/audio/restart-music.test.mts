import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import buildRestart from "../../../src/explorer/audio/restart-music.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

try {
  const storage = new Map<string, string>();
  const dialogs = [{ open: false }];
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
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { theme: "retro" } },
      querySelectorAll(selector: string) {
        return selector === ".dialog.musical" ? dialogs : [];
      },
    },
  });

  preferences.init({});
  let resetCalls = 0;
  let scheduleCalls = 0;
  let resumeCalls = 0;
  const props = {
    musicTimer: undefined as number | undefined,
    resetMusicPlayback: () => {
      resetCalls += 1;
    },
    resumeAudioContext: async () => {
      resumeCalls += 1;
      return { state: "running" } as AudioContext;
    },
    scheduleMusic: async () => {
      scheduleCalls += 1;
    },
  };
  const restartMusic = buildRestart(props);

  await restartMusic();
  assert.equal(resetCalls, 1);
  assert.equal(scheduleCalls, 0);

  dialogs[0]!.open = true;
  preferences.setBoolean("music", true);
  await restartMusic();
  assert.equal(resumeCalls, 1);
  assert.equal(scheduleCalls, 1);

  const restartWithoutContext = buildRestart({
    ...props,
    resumeAudioContext: async () => {
      resumeCalls += 1;
      return undefined;
    },
  });
  await restartWithoutContext();
  assert.equal(scheduleCalls, 1);

  const restartAfterDialogClose = buildRestart({
    ...props,
    resumeAudioContext: async () => {
      dialogs[0]!.open = false;
      resumeCalls += 1;
      return { state: "running" } as AudioContext;
    },
  });
  dialogs[0]!.open = true;
  await restartAfterDialogClose();
  assert.equal(scheduleCalls, 1);

  const restartWithTimer = buildRestart({
    ...props,
    musicTimer: 8,
  });
  dialogs[0]!.open = true;
  await restartWithTimer();
  assert.equal(scheduleCalls, 1);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
