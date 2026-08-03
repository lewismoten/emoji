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
      'import { isBaseTheme, isRetroTheme, canThemeSupportAudio, } from "./utils/themes.js";',
      'import { isBaseTheme, isRetroTheme, canThemeSupportAudio } from "./themes-stub.mjs";',
    )
    .replace(
      'import * as aria from "./utils/aria.js";',
      'import * as aria from "./aria-stub.mjs";',
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
export const isBaseTheme = () => isTheme("base");
export const isRetroTheme = () => isTheme("retro");
export const canThemeSupportAudio = () => !isTheme("base");
`,
  );
  await fs.writeFile(
    path.join(tempDirectory, "audio-helpers-stub.mjs"),
    `import * as preferences from "./preferences-stub.mjs";
import { canThemeSupportAudio } from "./themes-stub.mjs";
const isEnabled = (name) => canThemeSupportAudio() && preferences.getBoolean(name);
export const isSoundEffectsEnabled = () => isEnabled("soundEffects");
export const isMusicEnabled = () => isEnabled("music");
export const isAudioEnabled = () => isSoundEffectsEnabled() || isMusicEnabled();
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
