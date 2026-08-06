import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
export class FakeElement {
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

export async function loadExplorerAudioModuleFixture() {
  const root = process.cwd();
  const sourcePath = path.join(root, "build/src/explorer-audio.js");
  const source = await fs.readFile(sourcePath, "utf8");
  const transformedSource = source.replace(
    'import * as preferences from "./preferences.js";',
    'import * as preferences from "./preferences-stub.mjs";',
  ).replace(
    'import { createExplorerAudioEngine } from "./explorer/audio/explorer-audio-engine.js";',
    'import { createExplorerAudioEngine, engineCalls, engineApi } from "./explorer-audio-engine-stub.mjs";',
  ).replace(
    'import * as audioHelpers from "./explorer/audio/audio-helpers.js";',
    'import * as audioHelpers from "./audio-helpers-stub.mjs";',
  ).replace(
    'import * as audioToggle from "./controls/audio/audio-toggle.js";',
    'import * as audioToggle from "./audio-toggle-stub.mjs";',
  ).replace(
    'import buildAudioHandlers from "./explorer/audio/events/audio-handlers.js";',
    'import buildAudioHandlers from "./audio-handlers-stub.mjs";',
  )
    .replace(
      'import * as dialogListeners from "./controls/dialog/dialog-listeners.js";',
      'import * as dialogListeners from "./dialog-listeners-stub.mjs";',
    )
    .replace(
      'import documentRef, { querySelector, selectAll, addEventListener, } from "./utils/document.js";',
      'import documentRef, { querySelector, selectAll, addEventListener } from "./document-stub.mjs";',
    )
    .replace(
      'import documentRef, { addEventListener, } from "./utils/document.js";',
      'import documentRef, { addEventListener } from "./document-stub.mjs";',
    )
    .replace(
      'import documentRef, { addEventListener } from "./utils/document.js";',
      'import documentRef, { addEventListener } from "./document-stub.mjs";',
    )
    .replace(
      'import { canThemeSupportAudio, } from "./utils/themes.js";',
      'import { canThemeSupportAudio } from "./themes-stub.mjs";',
    )
    .replace(
      'import { canThemeSupportAudio } from "./utils/themes.js";',
      'import { canThemeSupportAudio } from "./themes-stub.mjs";',
    )
    .replace(
      'import * as aria from "./utils/aria.js";',
      'import * as aria from "./aria-stub.mjs";',
    )
    .replace(
      'import { classifyElement, isInput } from "./utils/element.js";',
      'import { classifyElement, isInput } from "./element-stub.mjs";',
    )
    .replace(/^\/\/# sourceMappingURL=.*$/m, "");

  const tempRoot = path.join(root, "build/tests/.tmp");
  await fs.mkdir(tempRoot, { recursive: true });
  const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "explorer-audio-"));

  await fs.writeFile(
    path.join(tempDirectory, "explorer-audio-engine-stub.mjs"),
    `export const engineCalls = [];
export const engineApi = {
  musicEnabled: () => false,
  playClick() { engineCalls.push(["playClick"]); return Promise.resolve(); },
  playDialogClose() { engineCalls.push(["playDialogClose"]); return Promise.resolve(); },
  playDialogOpen() { engineCalls.push(["playDialogOpen"]); return Promise.resolve(); },
  playHover() { engineCalls.push(["playHover"]); return Promise.resolve(); },
  playInteraction(element, action) { engineCalls.push(["playInteraction", element, action]); return Promise.resolve(); },
  restartMusic() { engineCalls.push(["restartMusic"]); return Promise.resolve(); },
  resumeAudioContext() { engineCalls.push(["resumeAudioContext"]); return Promise.resolve(); },
  soundEffectsEnabled: () => false,
  stopMusic() { engineCalls.push(["stopMusic"]); },
  syncHelpMusic() { engineCalls.push(["syncHelpMusic"]); return Promise.resolve(); },
};
export function createExplorerAudioEngine(options) {
  engineCalls.push(["createExplorerAudioEngine", options]);
  return engineApi;
}`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "dialog-listeners-stub.mjs"),
    `export const listenerCalls = [];
export const add = (fn) => {
  listenerCalls.push(["add", fn]);
  return true;
};
export const remove = (fn) => {
  listenerCalls.push(["remove", fn]);
  return true;
};
export const clear = () => {
  listenerCalls.push(["clear"]);
};
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "preferences-stub.mjs"),
    `export const state = {};
export const calls = [];
export const init = (value = {}) => {
  calls.push(["init", value]);
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, value);
};
export const getBoolean = (name) => state[name] === true;
export const setBoolean = (name, value) => {
  calls.push(["setBoolean", name, value]);
  state[name] = value;
};
export const getString = (name) => String(state[name] ?? "");
export const setString = (name, value) => {
  calls.push(["setString", name, value]);
  state[name] = value;
};
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "document-stub.mjs"),
    `export default function documentRef() { return globalThis.document; }
export function querySelector(selector) { return globalThis.document?.querySelector?.(selector) ?? null; }
export function selectAll(selector) { return globalThis.document?.querySelectorAll?.(selector) ?? []; }
export function addEventListener(type, listener, options) { return globalThis.document?.addEventListener?.(type, listener, options); }
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "themes-stub.mjs"),
    `import documentRef from "./document-stub.mjs";
export const isTheme = (name) => documentRef()?.documentElement?.dataset?.theme === name;
export const canThemeSupportAudio = () => !isTheme("base");
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "audio-helpers-stub.mjs"),
    `import * as preferences from "./preferences-stub.mjs";
import { canThemeSupportAudio } from "./themes-stub.mjs";
import { selectAll } from "./document-stub.mjs";
const isEnabled = (name) => canThemeSupportAudio() && preferences.getBoolean(name);
export const isSoundEffectsEnabled = () => isEnabled("soundEffects");
export const isMusicEnabled = () => isEnabled("music");
export const isAudioEnabled = () => isSoundEffectsEnabled() || isMusicEnabled();
export const soundEffectsToggle = () =>
  globalThis.document?.querySelector?.('.audio-choice-input[value="soundEffects"]') ?? null;
export const musicToggle = () =>
  globalThis.document?.querySelector?.('.audio-choice-input[value="music"]') ?? null;
export const isMusicalDialogOpen = () =>
  Array.from(selectAll(".dialog.musical")).some((dialog) => dialog.open);
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "audio-toggle-stub.mjs"),
    `import * as preferences from "./preferences-stub.mjs";
import { canThemeSupportAudio } from "./themes-stub.mjs";
import * as audioHelpers from "./audio-helpers-stub.mjs";
import * as aria from "./aria-stub.mjs";
const renderAudioToggle = async (toggle, enabled) => {
  if (!toggle) return;
  const disabled = !(await canThemeSupportAudio());
  const isEnabled = await enabled;
  toggle.checked = isEnabled;
  toggle.disabled = disabled;
  aria.setChecked(toggle, isEnabled);
  aria.setDisabled(toggle, disabled);
  if (!toggle.parentElement) return;
  aria.setPressed(toggle.parentElement, isEnabled);
  aria.setDisabled(toggle.parentElement, disabled);
};
export const renderSoundEffects = async () =>
  renderAudioToggle(audioHelpers.soundEffectsToggle(), audioHelpers.isSoundEffectsEnabled());
export const renderMusic = async () =>
  renderAudioToggle(audioHelpers.musicToggle(), audioHelpers.isMusicEnabled());
export const render = async () => Promise.all([renderSoundEffects(), renderMusic()]);
export const enableSoundEffects = async (enabled) => {
  const disabled = !(await canThemeSupportAudio());
  if (disabled) {
    await renderSoundEffects();
    return false;
  }
  preferences.setBoolean("soundEffects", enabled);
  await renderSoundEffects();
  return enabled;
};
export const enableMusic = async (enabled) => {
  const disabled = !(await canThemeSupportAudio());
  if (disabled) {
    await renderMusic();
    return false;
  }
  preferences.setBoolean("music", enabled);
  await renderMusic();
  return enabled;
};
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "aria-stub.mjs"),
    `export const setDisabled = (el, value) => el?.setAttribute("aria-disabled", String(value));
export const setChecked = (el, value) => el?.setAttribute("aria-checked", String(value));
export const setPressed = (el, value) => el?.setAttribute("aria-pressed", String(value));
export const isDisabled = (el) => el?.getAttribute("aria-disabled") === "true";
export const isChecked = (el) => el?.getAttribute("aria-checked") === "true";
export const hasPopupListbox = (el) => el?.getAttribute("aria-haspopup") === "listbox";
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "element-stub.mjs"),
    `import * as aria from "./aria-stub.mjs";
const hasTag = (el, tagName) => el?.tagName?.toUpperCase() === tagName.toUpperCase();
const hasRole = (el, name) => el?.getAttribute?.("role") === name;
export const isInput = (el) => hasTag(el, "INPUT");
const isInputType = (el, type) => isInput(el) && el.type === type;
const isSelect = (el) => hasTag(el, "SELECT");
export const isDropdown = (el) => isSelect(el) || aria.hasPopupListbox(el);
export const isCheckbox = (el) =>
  isInputType(el, "checkbox") || hasRole(el, "checkbox") || hasRole(el, "switch");
export const isRadio = (el) => isInputType(el, "radio") || hasRole(el, "radio");
export const isLink = (el) => hasTag(el, "A") || hasRole(el, "link");
export const isButton = (el) => hasTag(el, "BUTTON") || hasRole(el, "button");
export const classifyElement = (el) => {
  if (isDropdown(el)) return "dropdown";
  if (isCheckbox(el)) return "checkbox";
  if (isRadio(el)) return "radio";
  if (isLink(el)) return "link";
  if (isButton(el)) return "button";
  return "generic";
};
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "audio-handlers-stub.mjs"),
    `import * as audioHelpers from "./audio-helpers-stub.mjs";
import * as audioToggle from "./audio-toggle-stub.mjs";
import * as aria from "./aria-stub.mjs";
import { classifyElement, isInput } from "./element-stub.mjs";

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "select",
  "input",
  "label",
  "[tabindex]",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="switch"]',
  '[aria-haspopup="listbox"]',
  ".modifier-filter-option",
  ".setting-choice",
  ".theme-choice",
  ".mode-choice",
  ".audio-choice",
  ".emoji-font-choice",
  ".language-option",
  ".saved-picker",
  ".help-picker",
  ".order-mode",
  ".compact-choice",
  ".version-mode-toggle",
  ".version-step",
  ".filter-picker-trigger",
  "[data-emoji-key]",
].join(", ");

const getInteractiveTarget = (target) => {
  if (!(target instanceof Element)) return null;
  const interactive = target.closest(INTERACTIVE_SELECTOR);
  if (!(interactive instanceof HTMLElement)) return null;
  if ("disabled" in interactive && interactive.disabled) return null;
  if (aria.isDisabled(interactive)) return null;
  return interactive;
};

export default function buildAudioHandlers(dependencies) {
  const complete = {
    ...dependencies,
    getInteractiveTarget,
  };

  const playTargetAction = (target, action) =>
    complete.audio.playInteraction(classifyElement(target), action);

  const setSoundEffects = async (enabled) => {
    if (await audioToggle.enableSoundEffects(enabled)) {
      await complete.audio.resumeAudioContext();
    }
  };

  const setMusic = async (enabled) => {
    if (await audioToggle.enableMusic(enabled)) {
      await complete.audio.resumeAudioContext();
      await complete.audio.restartMusic();
      return;
    }
    await complete.audio.syncHelpMusic();
  };

  return {
    pointer: {
      down: async () => {
        const enabled = await audioHelpers.isAudioEnabled();
        return enabled && complete.audio.resumeAudioContext();
      },
      click: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (target) complete.audio.playInteraction(classifyElement(target), "click");
      },
      over: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (!target || target === complete.getHoverTarget()) return;
        complete.setHoverTarget(target);
        complete.audio.playInteraction(classifyElement(target), "hover");
      },
      out: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (!target || target !== complete.getHoverTarget()) return;
        const relatedTarget = event.relatedTarget;
        if (relatedTarget instanceof Element && target.contains(relatedTarget)) return;
        complete.setHoverTarget(null);
      },
    },
    focus: {
      in: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (target) playTargetAction(target, "focus");
      },
      out: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (target) complete.audio.playInteraction(classifyElement(target), "blur");
      },
    },
    keyboard: {
      down: (event) => {
        const target = complete.getInteractiveTarget(event.target);
        if (target) complete.audio.playInteraction(classifyElement(target), "keydown");
      },
    },
    visibility: {
      change: () => {
        if (complete.document.hidden) complete.audio.stopMusic();
        else complete.audio.syncHelpMusic();
      },
    },
    dialog: (action, dialog) => {
      complete.audio.playInteraction("dialog", action);
      if (dialog.classList.contains("musical")) complete.audio.syncHelpMusic();
    },
    change: async (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.matches('.audio-choice-input[value="soundEffects"]') ||
        target.closest?.("[data-audio-preference]")?.matches?.('[data-audio-preference="soundEffects"]')
      ) {
        const input = target;
        await setSoundEffects(input.checked);
        return playTargetAction(target, input.checked ? "check" : "uncheck");
      }
      if (
        target.matches('.audio-choice-input[value="music"]') ||
        target.closest?.("[data-audio-preference]")?.matches?.('[data-audio-preference="music"]')
      ) {
        const input = target;
        await setMusic(input.checked);
        return playTargetAction(target, input.checked ? "check" : "uncheck");
      }
      if (!(target instanceof HTMLElement)) return;
      const interactive = complete.getInteractiveTarget(target);
      if (!interactive) return;
      const type = classifyElement(interactive);
      if (type !== "checkbox" && type !== "radio") return;
      const checked = isInput(interactive)
        ? interactive.checked
        : aria.isChecked(interactive);
      complete.audio.playInteraction(type, checked ? "check" : "uncheck");
    },
  };
}
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "explorer-audio.mjs"),
    transformedSource,
  );

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-audio.mjs")).href
  );
  const engineStub = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-audio-engine-stub.mjs"))
      .href
  );
  const dialogListenersStub = await import(
    pathToFileURL(path.join(tempDirectory, "dialog-listeners-stub.mjs")).href
  );
  const preferencesStub = await import(
    pathToFileURL(path.join(tempDirectory, "preferences-stub.mjs")).href
  );

  return { dialogListenersStub, engineStub, module, preferencesStub };
}

export function installExplorerAudioDomFixture() {
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

  const listeners = new Map<string, Function[]>();
  const observers: Array<{
    callback: (records: any[]) => void;
    target?: unknown;
    options?: unknown;
  }> = [];
  let observerCallback: ((records: any[]) => void) | undefined;
  const dialogSelector =
    ".example-dialog, .help-dialog, .saved-dialog, .language-dialog, .filter-picker-dialog, .install-dialog";
  const soundToggle = new FakeElement([
    ".sound-effects-toggle",
    '.audio-choice-input[value="soundEffects"]',
  ]);
  soundToggle.tagName = "INPUT";
  soundToggle.type = "checkbox";
  const musicToggle = new FakeElement([
    ".music-toggle",
    '.audio-choice-input[value="music"]',
  ]);
  musicToggle.tagName = "INPUT";
  musicToggle.type = "checkbox";
  const helpDialog = new FakeElement([dialogSelector]);
  helpDialog.matchesSet.push(".dialog");
  helpDialog.classList.values.add("help-dialog");
  helpDialog.classList.values.add("dialog");
  helpDialog.classList.values.add("musical");
  helpDialog.open = true;
  const savedDialog = new FakeElement([dialogSelector]);
  savedDialog.matchesSet.push(".dialog");
  savedDialog.classList.values.add("saved-dialog");
  savedDialog.classList.values.add("dialog");
  savedDialog.classList.values.add("musical");
  savedDialog.open = false;
  const bodyAttributes = new Map<string, string>();
  const body = {
    getAttribute(name: string) {
      return bodyAttributes.get(name) ?? null;
    },
    hasAttribute(name: string) {
      return bodyAttributes.has(name);
    },
    removeAttribute(name: string) {
      bodyAttributes.delete(name);
    },
    setAttribute(name: string, value: string) {
      bodyAttributes.set(name, value);
    },
  };

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
        if (
          selector === ".sound-effects-toggle" ||
          selector === '.audio-choice-input[value="soundEffects"]'
        )
          return soundToggle;
        if (
          selector === ".music-toggle" ||
          selector === '.audio-choice-input[value="music"]'
        )
          return musicToggle;
        if (selector === ".help-dialog") return helpDialog;
        if (selector === ".saved-dialog") return savedDialog;
        return null;
      },
      querySelectorAll(selector: string) {
        if (selector === ".dialog.musical") {
          return [helpDialog, savedDialog].filter(
            (dialog) =>
              dialog.classList.contains("dialog") &&
              dialog.classList.contains("musical"),
          );
        }
        return [];
      },
    },
  });

  return {
    body,
    helpDialog,
    listeners,
    musicToggle,
    observerCallback: () => observerCallback,
    observers,
    restore() {
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
    },
    savedDialog,
    soundToggle,
  };
}
