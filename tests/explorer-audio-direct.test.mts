import assert from "node:assert/strict";

import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../src/explorer-audio.js";

class FakeElement {
  disabled = false;
  checked = false;
  open = false;
  attributes = new Map<string, string>();
  classList = {
    values: new Set<string>(),
    contains: (value: string) => this.classList.values.has(value),
  };

  constructor(
    readonly matchesSet: string[] = [],
    readonly closestResult: FakeElement | null = null,
  ) {}

  closest() {
    return this.closestResult;
  }

  contains(target: unknown) {
    return target === this;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  matches(selector: string) {
    return this.matchesSet.includes(selector);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalMutationObserver = Object.getOwnPropertyDescriptor(
  globalThis,
  "MutationObserver",
);
const originalElement = Object.getOwnPropertyDescriptor(globalThis, "Element");
const originalHTMLElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLElement",
);
const originalHTMLDialogElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLDialogElement",
);

try {
  const dependencyDefaults = createExplorerAudioDependencies();
  assert.equal(typeof dependencyDefaults.createExplorerAudioEngine, "function");

  const listeners = new Map<string, Function[]>();
  let observedTarget: unknown;
  let observedOptions: unknown;
  let observerCallback: ((records: any[]) => void) | undefined;
  const dialogSelector =
    ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";
  const soundToggle = new FakeElement([".sound-effects-toggle"]);
  const musicToggle = new FakeElement([".music-toggle"]);
  const helpDialog = new FakeElement([dialogSelector]);
  helpDialog.classList.values.add("help-dialog");
  helpDialog.open = true;
  const savedDialog = new FakeElement([dialogSelector]);
  savedDialog.classList.values.add("saved-dialog");
  savedDialog.open = false;
  const body = {};

  Object.defineProperty(globalThis, "Element", {
    configurable: true,
    value: FakeElement,
  });
  Object.defineProperty(globalThis, "HTMLElement", {
    configurable: true,
    value: FakeElement,
  });
  Object.defineProperty(globalThis, "HTMLDialogElement", {
    configurable: true,
    value: FakeElement,
  });
  Object.defineProperty(globalThis, "MutationObserver", {
    configurable: true,
    value: class FakeMutationObserver {
      constructor(callback: (records: any[]) => void) {
        observerCallback = callback;
      }
      observe(target: unknown, options: unknown) {
        observedTarget = target;
        observedOptions = options;
      }
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      body,
      documentElement: { dataset: { theme: "retro" } },
      hidden: false,
      addEventListener(type: string, handler: Function) {
        const list = listeners.get(type) ?? [];
        list.push(handler);
        listeners.set(type, list);
      },
      querySelector(selector: string) {
        if (selector === ".sound-effects-toggle") return soundToggle;
        if (selector === ".music-toggle") return musicToggle;
        if (selector === ".help-dialog") return helpDialog;
        if (selector === ".saved-dialog") return savedDialog;
        return null;
      },
    },
  });

  const engineCalls: Array<[string, unknown?]> = [];
  const engine = {
    musicEnabled: () => false,
    playClick() {
      engineCalls.push(["playClick"]);
    },
    playDialogClose() {
      engineCalls.push(["playDialogClose"]);
    },
    playDialogOpen() {
      engineCalls.push(["playDialogOpen"]);
    },
    playHover() {
      engineCalls.push(["playHover"]);
    },
    resumeAudioContext() {
      engineCalls.push(["resumeAudioContext"]);
      return Promise.resolve(undefined);
    },
    soundEffectsEnabled: () => false,
    stopMusic() {
      engineCalls.push(["stopMusic"]);
    },
    syncHelpMusic() {
      engineCalls.push(["syncHelpMusic"]);
    },
  };

  const preferences: {
    explorerPreferences: Record<string, unknown>;
  } = { explorerPreferences: { music: true, soundEffects: false } };
  const saves: Array<[string, unknown]> = [];
  const controller = createExplorerAudioController(
    {
      savePreference(key: string, value: unknown) {
        preferences.explorerPreferences[key] = value;
        saves.push([key, value]);
      },
      state: () => preferences,
    },
    {
      createExplorerAudioEngine(options) {
        engineCalls.push(["createExplorerAudioEngine", options]);
        return engine;
      },
    },
  );

  controller.renderSoundEffectsToggle();
  controller.renderMusicToggle();
  assert.equal(soundToggle.checked, false);
  assert.equal(soundToggle.attributes.get("aria-checked"), "false");
  assert.equal(musicToggle.checked, true);
  assert.equal(musicToggle.attributes.get("aria-checked"), "true");

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      ...globalThis.document,
      querySelector() {
        return null;
      },
    },
  });
  controller.renderSoundEffectsToggle();
  controller.renderMusicToggle();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      body,
      documentElement: { dataset: { theme: "retro" } },
      hidden: false,
      addEventListener(type: string, handler: Function) {
        const list = listeners.get(type) ?? [];
        list.push(handler);
        listeners.set(type, list);
      },
      querySelector(selector: string) {
        if (selector === ".sound-effects-toggle") return soundToggle;
        if (selector === ".music-toggle") return musicToggle;
        if (selector === ".help-dialog") return helpDialog;
        if (selector === ".saved-dialog") return savedDialog;
        return null;
      },
    },
  });

  controller.bindAudioInteractions();
  controller.bindAudioInteractions();
  assert.equal(observedTarget, body);
  assert.deepEqual(observedOptions, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });

  engine.soundEffectsEnabled = () => true;
  listeners.get("pointerdown")?.[0]?.();
  listeners.get("keydown")?.[0]?.();
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 2,
    true,
  );

  soundToggle.checked = true;
  listeners.get("change")?.[0]?.({ target: soundToggle });
  assert.deepEqual(saves[0], ["soundEffects", true]);
  assert.equal(soundToggle.attributes.get("aria-checked"), "true");

  musicToggle.checked = false;
  listeners.get("change")?.[0]?.({ target: musicToggle });
  assert.deepEqual(saves[1], ["music", false]);
  assert.equal(musicToggle.attributes.get("aria-checked"), "false");

  listeners.get("change")?.[0]?.({ target: {} });

  const interactive = new FakeElement([], null);
  const target = new FakeElement([], interactive);
  listeners.get("click")?.[0]?.({ target });
  listeners.get("click")?.[0]?.({ target: {} });
  listeners.get("pointerover")?.[0]?.({ target });
  listeners.get("pointerover")?.[0]?.({ target });
  listeners.get("pointerover")?.[0]?.({ target: {} });
  listeners.get("pointerout")?.[0]?.({ target, relatedTarget: target });
  listeners.get("pointerout")?.[0]?.({ target, relatedTarget: null });
  listeners.get("pointerout")?.[0]?.({ target: {}, relatedTarget: null });
  assert.equal(engineCalls.some((call) => call[0] === "playClick"), true);
  assert.equal(
    engineCalls.filter((call) => call[0] === "playHover").length,
    1,
  );

  (globalThis.document as any).hidden = true;
  listeners.get("visibilitychange")?.[0]?.();
  (globalThis.document as any).hidden = false;
  listeners.get("visibilitychange")?.[0]?.();
  assert.equal(engineCalls.some((call) => call[0] === "stopMusic"), true);
  assert.equal(engineCalls.some((call) => call[0] === "syncHelpMusic"), true);

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  observerCallback?.([
    { target: {} },
    { target: otherDialog },
    { target: helpDialog },
    { target: savedDialog },
  ]);
  assert.equal(engineCalls.some((call) => call[0] === "playDialogOpen"), true);
  assert.equal(
    engineCalls.some((call) => call[0] === "playDialogClose"),
    true,
  );

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      ...globalThis.document,
      body: null,
    },
  });
  const secondController = createExplorerAudioController(
    {
      savePreference() {},
      state: () => ({ explorerPreferences: {} }),
    },
    {
      createExplorerAudioEngine() {
        return engine;
      },
    },
  );
  secondController.bindAudioInteractions();
} finally {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalMutationObserver) {
    Object.defineProperty(
      globalThis,
      "MutationObserver",
      originalMutationObserver,
    );
  } else {
    Reflect.deleteProperty(globalThis, "MutationObserver");
  }
  if (originalElement) {
    Object.defineProperty(globalThis, "Element", originalElement);
  } else {
    Reflect.deleteProperty(globalThis, "Element");
  }
  if (originalHTMLElement) {
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElement);
  } else {
    Reflect.deleteProperty(globalThis, "HTMLElement");
  }
  if (originalHTMLDialogElement) {
    Object.defineProperty(
      globalThis,
      "HTMLDialogElement",
      originalHTMLDialogElement,
    );
  } else {
    Reflect.deleteProperty(globalThis, "HTMLDialogElement");
  }
}
