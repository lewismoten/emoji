import assert from "node:assert/strict";

import {
  focusPanelDialog,
  getInstalledDisplayQueries,
  installApp,
  isInstalledApp,
  isIosDevice,
  openPanelDialog,
  updateWebAppManifest,
} from "../../../src/explorer/pwa/pwa-panels.js";

class FakeElement {
  hidden = false;
  dataset: Record<string, string | undefined> = {};
  focused = false;
  blurred = false;
  queryMap = new Map<string, unknown>();

  querySelector(selector: string) {
    return this.queryMap.get(selector) ?? null;
  }

  focus() {
    this.focused = true;
  }

  blur() {
    this.blurred = true;
  }
}

class FakeDialog extends FakeElement {
  open = false;
  modalCalls = 0;

  showModal() {
    this.open = true;
    this.modalCalls += 1;
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalNavigator = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalHTMLElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLElement",
);

Object.defineProperty(globalThis, "HTMLElement", {
  configurable: true,
  value: FakeElement,
});

try {
  if (originalWindow) {
    Reflect.deleteProperty(globalThis, "window");
  }
  assert.deepEqual(getInstalledDisplayQueries(), []);

  const manifest = new FakeElement() as FakeElement & {
    getAttribute(name: string): string | null;
    setAttribute(name: string, value: string): void;
  };
  const attributes = new Map<string, string>([["href", "./manifest.webmanifest"]]);
  manifest.getAttribute = (name: string) => attributes.get(name) ?? null;
  manifest.setAttribute = (name: string, value: string) => {
    attributes.set(name, value);
  };

  const warnCalls: unknown[][] = [];
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    warnCalls.push(args);
  };

  const windowStub = {
    history: { state: { existing: true } },
    location: {
      hash: "#top",
      pathname: "/index.html",
      search: "?mode=retro",
    },
    matchMedia() {
      return { matches: false };
    },
    navigator: {
      standalone: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      userAgentData: undefined,
      maxTouchPoints: 0,
    },
  };
  const documentStub = {
    referrer: "",
    querySelector(selector: string) {
      if (selector === 'link[rel="manifest"]') return manifest;
      return null;
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: windowStub,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: windowStub.navigator,
  });

  assert.equal(isInstalledApp(), false);
  assert.equal(isIosDevice(), false);

  updateWebAppManifest("");
  assert.equal(attributes.get("href"), "./manifest.webmanifest");

  const missingManifestDocument = {
    referrer: "",
    querySelector() {
      return null;
    },
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: missingManifestDocument,
  });
  assert.doesNotThrow(() => updateWebAppManifest("fr"));
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });

  const browserInstructionsOnly = new FakeDialog();
  browserInstructionsOnly.queryMap.set(
    ".install-instructions-browser",
    new FakeElement(),
  );
  const noPromptResult = await installApp({
    deferredInstallPrompt: undefined,
    installDialog: browserInstructionsOnly as unknown as HTMLDialogElement,
    renderInstallAppButton() {},
  });
  assert.equal(noPromptResult.deferredInstallPrompt, undefined);
  assert.equal(browserInstructionsOnly.open, true);

  const promptWithoutBlur = await installApp({
    deferredInstallPrompt: {
      async prompt() {},
      userChoice: Promise.resolve({}),
    } as unknown as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<unknown>;
    },
    event: {
      currentTarget: { blur() {} },
      detail: 0,
    } as unknown as Event & {
      currentTarget?: EventTarget | null;
      detail?: number;
    },
    renderInstallAppButton() {},
  });
  assert.equal(promptWithoutBlur.deferredInstallPrompt, undefined);

  await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw new Error("missing prompt support");
      },
      userChoice: Promise.resolve({}),
    } as unknown as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<unknown>;
    },
    renderInstallAppButton() {},
  });
  assert.equal(warnCalls.length, 1);

  await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw { name: "OtherError" };
      },
      userChoice: Promise.resolve({}),
    } as unknown as Event & {
      prompt(): Promise<void>;
      userChoice: Promise<unknown>;
    },
    renderInstallAppButton() {},
  });
  assert.equal(warnCalls.length, 2);

  const favoriteDialog = new FakeDialog();
  const favoriteClose = new FakeElement();
  favoriteDialog.queryMap.set(".dialog-close", favoriteClose);
  focusPanelDialog("favorites", favoriteDialog as unknown as HTMLDialogElement, {
    renderSavedEmoji() {},
  });
  assert.equal(favoriteClose.focused, true);

  const openDialog = new FakeDialog();
  openDialog.open = true;
  openDialog.dataset.panelClosing = "true";
  openDialog.queryMap.set(".dialog-close", new FakeElement());
  const syncCalls: unknown[] = [];
  openPanelDialog({
    panel: "help",
    dialogs: {
      favorites: undefined,
      filters: undefined,
      help: openDialog as unknown as HTMLDialogElement,
      language: undefined,
    },
    renderSavedEmoji() {},
    syncUrlState(...args) {
      syncCalls.push(args);
    },
  });
  assert.equal(openDialog.modalCalls, 0);
  assert.equal(openDialog.dataset.panelClosing, undefined);
  assert.deepEqual(syncCalls, [["push", { existing: true, panelDialogEntry: true }]]);

  console.warn = originalWarn;
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalNavigator) {
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  } else {
    Reflect.deleteProperty(globalThis, "navigator");
  }
  if (originalHTMLElement) {
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElement);
  } else {
    Reflect.deleteProperty(globalThis, "HTMLElement");
  }
}
