import assert from "node:assert/strict";
import * as preferences from "../../../../src/preferences.js";
import buildSyncMusic from "../../../../src/explorer/audio/sync-help-music.js";

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
  let stopCalls = 0;
  let resumeCalls = 0;
  let scheduleCalls = 0;
  const props = {
    audioContext: undefined,
    getAudioContext: () => undefined,
    masterGain: undefined,
    musicBeat: 0,
    musicGain: undefined,
    musicTimer: undefined as number | undefined,
    resumeAudioContext: async () => {
      resumeCalls += 1;
      return { state: "running" } as AudioContext;
    },
    resetMusicPlayback: () => undefined,
    scheduleMusic: async () => {
      scheduleCalls += 1;
    },
    stopMusic: () => {
      stopCalls += 1;
    },
  };
  const syncHelpMusic = buildSyncMusic(props);

  await syncHelpMusic();
  assert.equal(stopCalls, 1);

  dialogs[0]!.open = true;
  preferences.setBoolean("music", true);
  await syncHelpMusic();
  assert.equal(resumeCalls, 1);
  assert.equal(scheduleCalls, 1);

  const syncAfterDialogClose = buildSyncMusic({
    ...props,
    resumeAudioContext: async () => {
      dialogs[0]!.open = false;
      resumeCalls += 1;
      return { state: "running" } as AudioContext;
    },
  });
  dialogs[0]!.open = true;
  await syncAfterDialogClose();
  assert.equal(scheduleCalls, 1);

  const syncWithoutContext = buildSyncMusic({
    ...props,
    resumeAudioContext: async () => {
      resumeCalls += 1;
      return undefined;
    },
  });
  dialogs[0]!.open = true;
  await syncWithoutContext();
  assert.equal(scheduleCalls, 1);

  props.musicTimer = 4;
  await syncHelpMusic();
  assert.equal(resumeCalls >= 2, true);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
