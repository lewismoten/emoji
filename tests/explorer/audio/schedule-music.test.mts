import assert from "node:assert/strict";
import * as preferences from "../../../src/preferences.js";
import buildScheduler, {
  canSchedule,
  schedule,
} from "../../../src/explorer/audio/schedule-music.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalSetTimeout = Object.getOwnPropertyDescriptor(
  globalThis,
  "setTimeout",
);

class FakeGain {
  connectedTo: unknown[] = [];
  gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  connect(target: unknown) {
    this.connectedTo.push(target);
  }
}

class FakeAudioContext {
  currentTime = 1;
  state: "running" | "suspended" = "running";
  destination = {};
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

try {
  const storage = new Map<string, string>();
  const dialogs = [{ open: false }];
  const timeouts: number[] = [];
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
  Object.defineProperty(globalThis, "setTimeout", {
    configurable: true,
    value(_callback: () => void, timeout: number) {
      timeouts.push(timeout);
      return timeouts.length;
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
  const context = new FakeAudioContext();
  const masterGain = context.createGain();
  const props: any = {
    getAudioContext: () => context as unknown as AudioContext,
    masterGain: masterGain as GainNode | undefined,
    musicBeat: 0,
    musicGain: undefined as GainNode | undefined,
    musicTimer: undefined as number | undefined,
    stopMusicCalls: 0,
    stopMusic() {
      props.stopMusicCalls += 1;
    },
  };
  const scheduleMusic = buildScheduler(props);

  assert.equal(canSchedule({}), false);
  assert.equal(canSchedule({ context: context as unknown as AudioContext }), false);
  assert.equal(
    canSchedule({
      context: { ...context, state: "suspended" } as AudioContext,
      masterGain: masterGain as GainNode,
    }),
    false,
  );
  assert.equal(
    canSchedule({
      context: context as unknown as AudioContext,
      masterGain: masterGain as GainNode,
    }),
    true,
  );

  await scheduleMusic();
  assert.equal(props.stopMusicCalls, 1);

  dialogs[0]!.open = true;
  preferences.setBoolean("music", true);
  context.state = "suspended";
  await scheduleMusic();
  assert.equal(props.musicTimer, undefined);

  context.state = "running";
  props.getAudioContext = () => undefined;
  await scheduleMusic();
  assert.equal(props.musicTimer, undefined);

  props.getAudioContext = () => context as unknown as AudioContext;
  props.masterGain = undefined;
  await scheduleMusic();
  assert.equal(props.musicTimer, undefined);

  props.masterGain = masterGain;
  (globalThis.document as any).documentElement.dataset.theme = "base";
  await scheduleMusic();
  assert.equal(props.musicTimer, undefined);

  const directProps: any = {
    musicBeat: 10,
    musicGain: undefined,
    musicTimer: undefined,
  };
  await schedule(
    directProps,
    {
      context: context as unknown as AudioContext,
      masterGain: masterGain as GainNode,
    },
    async () => undefined,
  );
  assert.equal(directProps.musicTimer, undefined);

  (globalThis.document as any).documentElement.dataset.theme = "retro";
  await scheduleMusic();
  assert.equal((props.musicBeat ?? 0) > 0, true);
  assert.equal((props.musicTimer ?? 0) > 0, true);
  assert.equal(props.musicGain != null, true);
  assert.equal(timeouts.length > 0, true);

  const directScheduledProps: any = {
    musicBeat: 1,
    musicGain: undefined,
    musicTimer: undefined,
  };
  await schedule(
    directScheduledProps,
    {
      context: context as unknown as AudioContext,
      masterGain: masterGain as GainNode,
    },
    async () => undefined,
  );
  assert.equal((directScheduledProps.musicBeat ?? 0) > 1, true);
  assert.equal((directScheduledProps.musicTimer ?? 0) > 0, true);
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalSetTimeout) Object.defineProperty(globalThis, "setTimeout", originalSetTimeout);
  else Reflect.deleteProperty(globalThis, "setTimeout");
}
