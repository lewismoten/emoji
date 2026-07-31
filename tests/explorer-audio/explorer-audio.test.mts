import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createExplorerAudioController as createDirectExplorerAudioController } from "../../src/explorer-audio.js";
// Direct source under test: ../../src/explorer-audio.js

const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer-audio.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source.replace(
  'import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";',
  'import { createExplorerAudioEngine, engineCalls, engineApi } from "./explorer-audio-engine-stub.mjs";',
);

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "explorer-audio-"));

await fs.writeFile(
  path.join(tempDirectory, "explorer-audio-engine-stub.mjs"),
  `export const engineCalls = [];
export const engineApi = {
  musicEnabled: () => false,
  playClick() { engineCalls.push(["playClick"]); },
  playDialogClose() { engineCalls.push(["playDialogClose"]); },
  playDialogOpen() { engineCalls.push(["playDialogOpen"]); },
  playHover() { engineCalls.push(["playHover"]); },
  playInteraction(element, action) { engineCalls.push(["playInteraction", element, action]); },
  restartMusic() { engineCalls.push(["restartMusic"]); },
  resumeAudioContext() { engineCalls.push(["resumeAudioContext"]); return Promise.resolve(); },
  soundEffectsEnabled: () => false,
  stopMusic() { engineCalls.push(["stopMusic"]); },
  syncHelpMusic() { engineCalls.push(["syncHelpMusic"]); },
};
export function createExplorerAudioEngine(options) {
  engineCalls.push(["createExplorerAudioEngine", options]);
  return engineApi;
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-audio.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-audio.mjs")).href
);
const engineStub = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-audio-engine-stub.mjs")).href
);

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

class FakeElement {
  disabled = false;
  checked = false;
  open = false;
  tagName = "";
  type = "";
  attributes = new Map<string, string>();
  listeners = new Map<string, any[]>();
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

try {
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

  const preferences: {
    explorerPreferences: Record<string, unknown>;
  } = { explorerPreferences: { music: true, soundEffects: false } };
  const saves: Array<[string, unknown]> = [];
  const controller = module.createExplorerAudioController({
    savePreference(key: string, value: unknown) {
      preferences.explorerPreferences[key] = value;
      saves.push([key, value]);
    },
    state: () => preferences,
  });

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

  engineStub.engineApi.soundEffectsEnabled = () => true;
  listeners.get("pointerdown")?.[0]();
  listeners.get("keydown")?.[0]();
  assert.equal(
    engineStub.engineCalls.filter(
      (call: any[]) => call[0] === "resumeAudioContext",
    ).length >= 2,
    true,
  );

  soundToggle.checked = true;
  listeners.get("change")?.[0]({ target: soundToggle });
  assert.deepEqual(saves[0], ["soundEffects", true]);
  assert.equal(soundToggle.attributes.get("aria-checked"), "true");

  musicToggle.checked = false;
  listeners.get("change")?.[0]({ target: musicToggle });
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
  listeners.get("change")?.[0]({ target: soundToggle });
  musicToggle.checked = true;
  listeners.get("change")?.[0]({ target: musicToggle });
  assert.deepEqual(saves, [
    ["soundEffects", true],
    ["music", false],
  ]);

  const button = new FakeElement([], null);
  const interactive = new FakeElement([], null);
  interactive.tagName = "BUTTON";
  const target = new FakeElement([], interactive);
  listeners.get("click")?.[0]({ target });
  listeners.get("pointerover")?.[0]({ target });
  listeners.get("pointerover")?.[0]({ target });
  listeners.get("pointerout")?.[0]({ target, relatedTarget: null });
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.filter(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "button" &&
        call[2] === "hover",
    ).length,
    1,
  );

  const selectInteractive = new FakeElement([], null);
  selectInteractive.tagName = "SELECT";
  listeners.get("click")?.[0]({
    target: new FakeElement([], selectInteractive),
  });
  const radioInteractive = new FakeElement([], null);
  radioInteractive.tagName = "INPUT";
  radioInteractive.type = "radio";
  radioInteractive.checked = true;
  listeners.get("change")?.[0]({
    target: new FakeElement([], radioInteractive),
  });
  const linkInteractive = new FakeElement([], null);
  linkInteractive.tagName = "A";
  listeners.get("focusin")?.[0]({
    target: new FakeElement([], linkInteractive),
  });
  listeners.get("focusout")?.[0]({
    target: new FakeElement([], linkInteractive),
  });
  listeners.get("keydown")?.[1]({
    target: new FakeElement([], linkInteractive),
  });
  const genericInteractive = new FakeElement([], null);
  listeners.get("click")?.[0]({
    target: new FakeElement([], genericInteractive),
  });
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "dropdown" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "radio" &&
        call[2] === "check",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "focus",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "blur",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "keydown",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "generic" &&
        call[2] === "click",
    ),
    true,
  );

  const directEngineCalls: any[][] = [];
  let directEngineOptions: any;
  const directController = createDirectExplorerAudioController(
    {
      savePreference(key: string, value: unknown) {
        preferences.explorerPreferences[key] = value;
        saves.push([`direct:${key}`, value]);
      },
      state: () => preferences,
    },
    {
      createExplorerAudioEngine(options: any) {
        directEngineOptions = options;
        return {
          musicEnabled: () => false,
          playInteraction(element: string, action: string) {
            directEngineCalls.push(["playInteraction", element, action]);
          },
          resumeAudioContext() {
            directEngineCalls.push(["resumeAudioContext"]);
            return Promise.resolve();
          },
          soundEffectsEnabled: () => true,
          stopMusic() {
            directEngineCalls.push(["stopMusic"]);
          },
          syncHelpMusic() {
            directEngineCalls.push(["syncHelpMusic"]);
          },
          restartMusic() {
            directEngineCalls.push(["restartMusic"]);
          },
        } as any;
      },
    } as any,
  );
  directController.bindAudioInteractions();
  assert.equal(directEngineOptions.soundEffectsEnabled(), false);
  assert.equal(directEngineOptions.musicEnabled(), false);
  assert.equal(directEngineOptions.helpDialogOpen(), true);
  assert.equal(directEngineOptions.savedDialogOpen(), false);
  assert.equal(directEngineOptions.retroMode(), false);
  assert.equal(directEngineOptions.theme(), "base");
  const directClick = listeners.get("click")?.at(-1)!;
  const directChange = listeners.get("change")?.at(-1)!;
  const directFocusIn = listeners.get("focusin")?.at(-1)!;
  const directFocusOut = listeners.get("focusout")?.at(-1)!;
  const directKeyDown = listeners.get("keydown")?.at(-1)!;
  const listboxInteractive = new FakeElement([], null);
  listboxInteractive.attributes.set("aria-haspopup", "listbox");
  directClick({ target: new FakeElement([], listboxInteractive) });
  const roleRadioInteractive = new FakeElement([], null);
  roleRadioInteractive.attributes.set("role", "radio");
  roleRadioInteractive.attributes.set("aria-checked", "true");
  directChange({ target: new FakeElement([], roleRadioInteractive) });
  const roleLinkInteractive = new FakeElement([], null);
  roleLinkInteractive.attributes.set("role", "link");
  directFocusIn({ target: new FakeElement([], roleLinkInteractive) });
  directFocusOut({ target: new FakeElement([], roleLinkInteractive) });
  directKeyDown({ target: new FakeElement([], roleLinkInteractive) });
  const genericDirectInteractive = new FakeElement([], null);
  directClick({ target: new FakeElement([], genericDirectInteractive) });
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "dropdown" &&
        call[2] === "click",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "radio" &&
        call[2] === "check",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "focus",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "blur",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "link" &&
        call[2] === "keydown",
    ),
    true,
  );
  assert.equal(
    directEngineCalls.some(
      (call) =>
        call[0] === "playInteraction" &&
        call[1] === "generic" &&
        call[2] === "click",
    ),
    true,
  );

  (globalThis.document as any).hidden = true;
  listeners.get("visibilitychange")?.[0]();
  (globalThis.document as any).hidden = false;
  listeners.get("visibilitychange")?.[0]();
  assert.equal(
    engineStub.engineCalls.some((call: any[]) => call[0] === "stopMusic"),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some((call: any[]) => call[0] === "syncHelpMusic"),
    true,
  );

  const otherDialog = new FakeElement();
  otherDialog.open = true;
  otherDialog.matches = () => false;
  dialogObserver?.callback([
    { target: otherDialog },
    { target: helpDialog },
    { target: savedDialog },
  ]);
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
        call[0] === "playInteraction" &&
        call[1] === "dialog" &&
        call[2] === "open",
    ),
    true,
  );
  assert.equal(
    engineStub.engineCalls.some(
      (call: any[]) =>
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
    engineStub.engineCalls.some((call: any[]) => call[0] === "restartMusic"),
    true,
  );
  assert.equal(
    engineStub.engineCalls.filter((call: any[]) => call[0] === "syncHelpMusic")
      .length >= 1,
    true,
  );

  controller.syncHelpMusic();
  assert.equal(
    engineStub.engineCalls.filter((call: any[]) => call[0] === "syncHelpMusic")
      .length >= 3,
    true,
  );
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalMutationObserver) {
    Object.defineProperty(
      globalThis,
      "MutationObserver",
      originalMutationObserver,
    );
  } else Reflect.deleteProperty(globalThis, "MutationObserver");
  if (originalElement)
    Object.defineProperty(globalThis, "Element", originalElement);
  else Reflect.deleteProperty(globalThis, "Element");
  if (originalHTMLElement)
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElement);
  else Reflect.deleteProperty(globalThis, "HTMLElement");
  if (originalHTMLDialogElement) {
    Object.defineProperty(
      globalThis,
      "HTMLDialogElement",
      originalHTMLDialogElement,
    );
  } else Reflect.deleteProperty(globalThis, "HTMLDialogElement");
}
