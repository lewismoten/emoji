import assert from "node:assert/strict";

import {
  createExplorerAudioController,
  createExplorerAudioDependencies,
} from "../src/explorer-audio.js";

class FakeElement {
  disabled = false;
  checked = false;
  open = false;
  tagName = "";
  type = "";
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

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
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
  const observers: Array<{
    callback: (records: any[]) => void;
    target?: unknown;
    options?: unknown;
  }> = [];
  const dialogSelector =
    ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";
  const soundToggle = new FakeElement([".sound-effects-toggle"]);
  soundToggle.tagName = "INPUT";
  soundToggle.type = "checkbox";
  const musicToggle = new FakeElement([".music-toggle"]);
  musicToggle.tagName = "INPUT";
  musicToggle.type = "checkbox";
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
        observers.push({ callback });
      }
      observe(target: unknown, options: unknown) {
        const current = observers.at(-1)!;
        current.target = target;
        current.options = options;
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

  const engineCalls: Array<unknown[]> = [];
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
    playInteraction(element: unknown, action: unknown) {
      engineCalls.push(["playInteraction", element, action]);
    },
    playSoundEffect(effect: unknown) {
      engineCalls.push(["playSoundEffect", effect]);
    },
    restartMusic() {
      engineCalls.push(["restartMusic"]);
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
    theme() {
      return { beatLength: 0.18, gain: 0.09, voices: [] };
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
  assert.equal(soundToggle.disabled, false);
  assert.equal(soundToggle.attributes.get("aria-checked"), "false");
  assert.equal(soundToggle.attributes.get("aria-disabled"), "false");
  assert.equal(musicToggle.checked, true);
  assert.equal(musicToggle.disabled, false);
  assert.equal(musicToggle.attributes.get("aria-checked"), "true");
  assert.equal(musicToggle.attributes.get("aria-disabled"), "false");

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
  const dialogObserver = observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any).attributeFilter[0] === "open",
  )!;
  const themeObserver = observers.find(
    (observer) =>
      Array.isArray((observer.options as any)?.attributeFilter) &&
      (observer.options as any).attributeFilter[0] === "data-theme",
  )!;
  assert.equal(dialogObserver?.target, body);
  assert.deepEqual(dialogObserver?.options, {
    subtree: true,
    attributes: true,
    attributeFilter: ["open"],
  });
  assert.equal(observers.length, 2);
  assert.equal(
    themeObserver?.target,
    (globalThis.document as any).documentElement,
  );
  assert.deepEqual(themeObserver?.options, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const engineOptions = engineCalls.find(
    (call) => call[0] === "createExplorerAudioEngine",
  )?.[1] as { theme?: () => string };
  assert.equal(engineOptions.theme?.(), "retro");

  engine.soundEffectsEnabled = () => true;
  listeners.get("pointerdown")?.[0]?.();
  listeners.get("keydown")?.[0]?.();
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 2,
    true,
  );
  engine.soundEffectsEnabled = () => false;
  engine.musicEnabled = () => true;
  listeners.get("pointerdown")?.[0]?.();
  assert.equal(
    engineCalls.filter((call) => call[0] === "resumeAudioContext").length >= 3,
    true,
  );
  engine.musicEnabled = () => false;

  soundToggle.checked = true;
  listeners.get("change")?.[0]?.({ target: soundToggle });
  assert.deepEqual(saves[0], ["soundEffects", true]);
  assert.equal(soundToggle.attributes.get("aria-checked"), "true");

  musicToggle.checked = false;
  listeners.get("change")?.[0]?.({ target: musicToggle });
  assert.deepEqual(saves[1], ["music", false]);
  assert.equal(musicToggle.attributes.get("aria-checked"), "false");

  (globalThis.document as any).documentElement.dataset.theme = "base";
  observerCallback?.([{ type: "attributes", attributeName: "data-theme" }]);
  assert.equal(soundToggle.checked, false);
  assert.equal(soundToggle.disabled, true);
  assert.equal(soundToggle.attributes.get("aria-disabled"), "true");
  assert.equal(musicToggle.checked, false);
  assert.equal(musicToggle.disabled, true);
  assert.equal(musicToggle.attributes.get("aria-disabled"), "true");

  soundToggle.checked = true;
  listeners.get("change")?.[0]?.({ target: soundToggle });
  musicToggle.checked = true;
  listeners.get("change")?.[0]?.({ target: musicToggle });
  assert.deepEqual(saves, [
    ["soundEffects", true],
    ["music", false],
  ]);

  listeners.get("change")?.[0]?.({ target: {} });

  const interactive = new FakeElement([], null);
  interactive.tagName = "BUTTON";
  const target = new FakeElement([], interactive);
  listeners.get("click")?.[0]?.({ target });
  listeners.get("click")?.[0]?.({ target: {} });
  const disabledInteractive = new FakeElement([], null);
  disabledInteractive.disabled = true;
  const disabledTarget = new FakeElement([], disabledInteractive);
  listeners.get("click")?.[0]?.({ target: disabledTarget });
  const ariaDisabledInteractive = new FakeElement([], null);
  ariaDisabledInteractive.setAttribute("aria-disabled", "true");
  const ariaDisabledTarget = new FakeElement([], ariaDisabledInteractive);
  listeners.get("click")?.[0]?.({ target: ariaDisabledTarget });
  listeners.get("pointerover")?.[0]?.({ target });
  listeners.get("pointerover")?.[0]?.({ target });
  listeners.get("pointerover")?.[0]?.({ target: {} });
  listeners.get("pointerover")?.[0]?.({ target: disabledTarget });
  listeners.get("pointerover")?.[0]?.({ target: ariaDisabledTarget });
  listeners.get("pointerout")?.[0]?.({ target, relatedTarget: interactive });
  listeners.get("pointerout")?.[0]?.({ target, relatedTarget: null });
  listeners.get("pointerout")?.[0]?.({ target: {}, relatedTarget: null });
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineCalls.filter(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length,
    1,
  );

  (globalThis.document as any).hidden = true;
  listeners.get("visibilitychange")?.[0]?.();
  (globalThis.document as any).hidden = false;
  listeners.get("visibilitychange")?.[0]?.();
  assert.equal(
    engineCalls.some((call) => call[0] === "stopMusic"),
    true,
  );
  assert.equal(
    engineCalls.some((call) => call[0] === "syncHelpMusic"),
    true,
  );

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  dialogObserver?.callback([
    { target: {} },
    { target: otherDialog },
    { target: helpDialog },
    { target: savedDialog },
  ]);
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "open",
    ),
    true,
  );
  assert.equal(
    engineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "close",
    ),
    true,
  );
  themeObserver?.callback([
    {
      type: "attributes",
      attributeName: "data-theme",
      target: (globalThis.document as any).documentElement,
    },
  ]);
  assert.equal(
    engineCalls.some((call) => call[0] === "restartMusic"),
    true,
  );
  assert.equal(
    engineCalls.filter((call) => call[0] === "syncHelpMusic").length >= 2,
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
