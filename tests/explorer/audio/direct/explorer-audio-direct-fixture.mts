export class FakeElement {
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

export function installAudioDomFixture() {
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
  helpDialog.classList.values.add("dialog");
  helpDialog.classList.values.add("help-dialog");
  helpDialog.classList.values.add("musical");
  helpDialog.open = true;
  const savedDialog = new FakeElement([dialogSelector]);
  savedDialog.matchesSet.push(".dialog");
  savedDialog.classList.values.add("dialog");
  savedDialog.classList.values.add("saved-dialog");
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
        observers.push({ callback });
      }
      observe(target: unknown, options: unknown) {
        const current = observers.at(-1)!;
        current.target = target;
        current.options = options;
      }
    },
  });

  const applyDocument = (overrides: Record<string, unknown> = {}) => {
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
        ...overrides,
      },
    });
  };

  applyDocument();

  return {
    body,
    dialogSelector,
    helpDialog,
    listeners,
    musicToggle,
    observers,
    restore() {
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
    },
    savedDialog,
    soundToggle,
    setDocument: applyDocument,
  };
}

export function createAudioEngineFixture(engineCalls: Array<unknown[]>) {
  return {
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
}
