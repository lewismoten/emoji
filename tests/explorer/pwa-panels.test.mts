import assert from "node:assert/strict";
import {
  bindPanelDialog,
  closePanelDialog,
  ensurePanelDialogLifecycleBound,
  focusPanelDialog,
  getInstalledDisplayQueries,
  getOpenPanel,
  getPanelDialog,
  installApp,
  isInstalledApp,
  isIosDevice,
  onPanelDialogClose,
  openPanelDialog,
  renderInstallAppButton,
  updateWebAppManifest,
} from "../../src/explorer/pwa/pwa-panels.js";

class FakeElement {
  hidden = false;
  open = false;
  title = "";
  dataset: Record<string, string | undefined> = {};
  listeners = new Map<string, Array<(event: any) => void>>();
  attributes = new Map<string, string>();
  focused = false;
  blurred = false;
  queryMap = new Map<string, any>();

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type: string, listener: (event: any) => void) {
    const entries = this.listeners.get(type) ?? [];
    entries.push(listener);
    this.listeners.set(type, entries);
  }

  dispatch(type: string, event: any = {}) {
    for (const listener of this.listeners.get(type) ?? [])
      listener({ currentTarget: this, ...event });
  }

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
  ownerDocument: any;

  constructor(ownerDocument?: any) {
    super();
    this.ownerDocument = ownerDocument;
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }
}

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "window",
);
const originalDocumentDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalNavigatorDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalHTMLElementDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLElement",
);
const originalHTMLDialogElementDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLDialogElement",
);

const manifestLink = new FakeElement();
manifestLink.setAttribute("href", "./manifest.webmanifest");

const historyBackCalls: string[] = [];
const historyState = { existing: true };
const mediaQueries = [
  { matches: false },
  { matches: true },
  { matches: false },
  { matches: false },
];
const windowStub: any = {
  location: {
    pathname: "/index.en.html",
    search: "?panel=help&mode=developer",
    hash: "#top",
  },
  matchMedia(query: string) {
    const index = [
      "(display-mode: standalone)",
      "(display-mode: fullscreen)",
      "(display-mode: minimal-ui)",
      "(display-mode: window-controls-overlay)",
    ].indexOf(query);
    return mediaQueries[index] ?? { matches: false };
  },
  navigator: {
    standalone: false,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    userAgentData: undefined,
    maxTouchPoints: 2,
  },
  history: {
    state: historyState,
    back() {
      historyBackCalls.push("back");
    },
    replaceState(_state: any, _title: string, url: string) {
      historyBackCalls.push(`replace:${url}`);
    },
  },
  requestAnimationFrame(handler: () => void) {
    handler();
  },
};
const documentStub = {
  referrer: "",
  querySelector(selector: string) {
    if (selector === 'link[rel="manifest"]') return manifestLink;
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
Object.defineProperty(globalThis, "HTMLElement", {
  configurable: true,
  value: FakeElement,
});
Object.defineProperty(globalThis, "HTMLDialogElement", {
  configurable: true,
  value: FakeDialog,
});

try {
  assert.equal(getInstalledDisplayQueries().length, 4);
  assert.equal(isInstalledApp(), true);

  mediaQueries[1].matches = false;
  windowStub.navigator.standalone = true;
  assert.equal(isInstalledApp(), true);

  windowStub.navigator.standalone = false;
  documentStub.referrer = "android-app://emoji";
  assert.equal(isInstalledApp(), true);
  documentStub.referrer = "";

  windowStub.navigator.userAgentData = { platform: "macOS" };
  assert.equal(isIosDevice(), false);
  windowStub.navigator.userAgentData = undefined;
  assert.equal(isIosDevice(), true);
  windowStub.navigator.userAgent = "Macintosh Mobile";
  windowStub.navigator.maxTouchPoints = 2;
  assert.equal(isIosDevice(), true);
  windowStub.navigator.userAgent = "iPhone";

  const installButton = new FakeElement();
  renderInstallAppButton(installButton as any);
  assert.equal(installButton.hidden, false);
  renderInstallAppButton(undefined);

  updateWebAppManifest("ar");
  assert.equal(manifestLink.getAttribute("href"), "./manifest.ar.webmanifest");
  updateWebAppManifest("");
  assert.equal(manifestLink.getAttribute("href"), "./manifest.webmanifest");

  const iosInstructions = new FakeElement();
  const browserInstructions = new FakeElement();
  const installDialog = new FakeDialog();
  installDialog.queryMap.set(".install-instructions-ios", iosInstructions);
  installDialog.queryMap.set(
    ".install-instructions-browser",
    browserInstructions,
  );
  const noPromptResult = await installApp({
    deferredInstallPrompt: undefined,
    installDialog: installDialog as any,
    renderInstallAppButton() {},
  });
  assert.equal(noPromptResult.deferredInstallPrompt, undefined);
  assert.equal(installDialog.open, true);
  assert.equal(iosInstructions.hidden, false);
  assert.equal(browserInstructions.hidden, true);

  let prompted = 0;
  let renderedInstallButton = 0;
  const trigger = new FakeElement();
  const promptResult = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        prompted += 1;
      },
      userChoice: Promise.resolve({}),
    } as any,
    event: { currentTarget: trigger, detail: 1 } as any,
    renderInstallAppButton() {
      renderedInstallButton += 1;
    },
  });
  assert.equal(prompted, 1);
  assert.equal(renderedInstallButton, 1);
  assert.equal(trigger.blurred, true);
  assert.equal(promptResult.deferredInstallPrompt, undefined);
  const failedPrompt = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw new Error("cancelled");
      },
      userChoice: Promise.resolve({}),
    } as any,
    renderInstallAppButton() {},
  });
  assert.equal(failedPrompt.deferredInstallPrompt, undefined);
  const abortedPrompt = await installApp({
    deferredInstallPrompt: {
      async prompt() {
        throw { name: "AbortError" };
      },
      userChoice: Promise.resolve({}),
    } as any,
    renderInstallAppButton() {},
  });
  assert.equal(abortedPrompt.deferredInstallPrompt, undefined);

  const suppressedPanelCloses = new WeakSet<any>();
  const dialogs = {
    filters: new FakeDialog(),
    favorites: new FakeDialog(),
    help: new FakeDialog(),
    language: new FakeDialog(),
  };
  assert.equal(getPanelDialog("help", dialogs as any), dialogs.help);
  assert.equal(getPanelDialog("filters", dialogs as any), dialogs.filters);
  assert.equal(getPanelDialog("favorites", dialogs as any), dialogs.favorites);
  assert.equal(getPanelDialog("language", dialogs as any), dialogs.language);
  assert.equal(getPanelDialog("", dialogs as any), undefined);
  assert.equal(getOpenPanel({} as any), "");
  dialogs.filters.open = true;
  assert.equal(getOpenPanel(dialogs as any), "filters");
  dialogs.filters.open = false;
  dialogs.language.open = true;
  assert.equal(getOpenPanel(dialogs as any), "language");
  dialogs.language.open = false;
  dialogs.help.open = true;
  assert.equal(getOpenPanel(dialogs as any), "help");
  dialogs.help.open = false;
  dialogs.favorites.open = true;
  assert.equal(getOpenPanel(dialogs as any), "favorites");
  dialogs.favorites.open = false;
  dialogs.favorites.open = true;
  dialogs.favorites.dataset.panelClosing = "true";
  assert.equal(getOpenPanel(dialogs as any), "");
  delete dialogs.favorites.dataset.panelClosing;
  dialogs.favorites.open = false;

  const savedButton = new FakeElement();
  dialogs.favorites.queryMap.set(".saved-emoji-list button", savedButton);
  dialogs.favorites.queryMap.set(".dialog-close", new FakeElement());
  let renderSavedEmojiCalls = 0;
  focusPanelDialog("favorites", dialogs.favorites as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {
      renderSavedEmojiCalls += 1;
    },
  });
  assert.equal(renderSavedEmojiCalls, 1);
  assert.equal(savedButton.focused, true);

  const selectedLanguage = new FakeElement();
  const languageList = new FakeElement();
  languageList.queryMap.set(".is-selected", selectedLanguage);
  dialogs.language.queryMap.set(".dialog-close", new FakeElement());
  focusPanelDialog("language", dialogs.language as any, {
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
  });
  assert.equal(selectedLanguage.focused, true);
  const languageFallbackClose = new FakeElement();
  dialogs.language.queryMap.set(".dialog-close", languageFallbackClose);
  languageList.queryMap.delete(".is-selected");
  focusPanelDialog("language", dialogs.language as any, {
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
  });
  assert.equal(languageFallbackClose.focused, true);

  const filterTarget = new FakeElement();
  dialogs.filters.queryMap.set(
    ".version-mode-toggle, .compact-choice, .modifier-filters label, .dialog-close",
    filterTarget,
  );
  focusPanelDialog("filters", dialogs.filters as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(filterTarget.focused, true);
  const filterFallbackClose = new FakeElement();
  dialogs.filters.queryMap.delete(
    ".version-mode-toggle, .compact-choice, .modifier-filters label, .dialog-close",
  );
  dialogs.filters.queryMap.set(".dialog-close", filterFallbackClose);
  focusPanelDialog("filters", dialogs.filters as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(filterFallbackClose.focused, true);

  dialogs.help.queryMap.set(".dialog-close", new FakeElement());
  focusPanelDialog("help", dialogs.help as any, {
    dialogs: dialogs as any,
    renderSavedEmoji() {},
  });
  assert.equal(
    (dialogs.help.queryMap.get(".dialog-close") as FakeElement).focused,
    true,
  );
  const emptyLanguageDialog = new FakeDialog();
  assert.doesNotThrow(() =>
    focusPanelDialog("language", emptyLanguageDialog as any, {
      dialogs: dialogs as any,
      renderSavedEmoji() {},
    }),
  );
  assert.equal(
    getPanelDialog("filters", { filters: undefined } as any),
    undefined,
  );

  const syncCalls: any[] = [];
  assert.doesNotThrow(() =>
    openPanelDialog({
      panel: "help",
      renderSavedEmoji() {},
      syncUrlState() {},
    } as any),
  );
  openPanelDialog({
    panel: "help",
    dialogs: dialogs as any,
    languageList: languageList as any,
    renderSavedEmoji() {},
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
  });
  assert.equal(dialogs.help.open, true);
  assert.deepEqual(syncCalls, [["push", { ...historyState, panelDialogEntry: true }]]);
  dialogs.help.dataset.panelClosing = "true";
  openPanelDialog({
    addHistory: false,
    panel: "help",
    dialogs: dialogs as any,
    renderSavedEmoji() {},
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
  });
  assert.equal(syncCalls.length, 1);
  assert.equal(dialogs.help.dataset.panelClosing, undefined);
  openPanelDialog({
    panel: "help",
    dialogs: { ...dialogs, help: undefined } as any,
    renderSavedEmoji() {},
    syncUrlState() {
      syncCalls.push(["unexpected"]);
    },
  });
  assert.equal(syncCalls.some((entry) => entry[0] === "unexpected"), false);

  closePanelDialog(dialogs.help as any, suppressedPanelCloses);
  assert.equal(dialogs.help.open, false);
  assert.doesNotThrow(() =>
    closePanelDialog(new FakeDialog() as any, suppressedPanelCloses),
  );
  assert.equal(suppressedPanelCloses.has(dialogs.help as any), true);

  const lifecycleDialog = new FakeDialog();
  lifecycleDialog.dataset = {};
  const lifecycleClose = new FakeElement();
  const lifecycleForm = new FakeElement();
  (lifecycleClose as any).closest = () => lifecycleForm;
  lifecycleDialog.queryMap.set(".dialog-close", lifecycleClose);
  let lifecycleAfterClose = 0;
  ensurePanelDialogLifecycleBound({
    applyingUrlState: () => false,
    dialog: lifecycleDialog as any,
    onAfterClose() {
      lifecycleAfterClose += 1;
    },
    panel: "help",
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  lifecycleClose.dispatch("click");
  assert.equal(lifecycleDialog.dataset.panelClosing, "true");
  lifecycleDialog.dispatch("close");
  assert.equal(lifecycleAfterClose, 1);
  lifecycleForm.dispatch("submit");

  const originalRequestAnimationFrame = windowStub.requestAnimationFrame;
  windowStub.requestAnimationFrame = undefined;
  windowStub.location.search = "?panel=help&mode=developer";
  const immediateDialog = new FakeDialog();
  immediateDialog.dataset = {};
  const immediateClose = new FakeElement();
  const immediateForm = new FakeElement();
  (immediateClose as any).closest = () => immediateForm;
  immediateDialog.queryMap.set(".dialog-close", immediateClose);
  ensurePanelDialogLifecycleBound({
    applyingUrlState: () => false,
    dialog: immediateDialog as any,
    panel: "help",
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  immediateClose.dispatch("click");
  assert.equal(
    historyBackCalls.at(-1),
    "replace:/index.en.html?mode=developer#top",
  );
  immediateForm.dispatch("submit");

  const noRafSyncCalls: any[] = [];
  const directCloseDialog = new FakeDialog();
  (directCloseDialog as any).classList = { contains: (name: string) => name === "help-dialog" };
  directCloseDialog.dataset = {};
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: directCloseDialog } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      noRafSyncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(noRafSyncCalls, [[]]);
  windowStub.requestAnimationFrame = originalRequestAnimationFrame;

  const unknownDialog = new FakeDialog();
  (unknownDialog as any).classList = { contains: () => false };
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: unknownDialog } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), []);

  syncCalls.length = 0;
  dialogs.help.open = true;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses,
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.equal(syncCalls.length, 0);

  dialogs.help.open = true;
  windowStub.history.state = { panelDialogEntry: true };
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: (...args: any[]) => {
      syncCalls.push(args as any);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), ["replace", {}]);
  assert.equal(
    historyBackCalls.at(-1),
    "replace:/index.en.html?mode=developer#top",
  );

  windowStub.history.state = undefined as any;
  onPanelDialogClose({
    applyingUrlState: false,
    event: { currentTarget: dialogs.help } as any,
    suppressedPanelCloses: new WeakSet(),
    syncUrlState: () => {
      syncCalls.push(["synced"]);
    },
    urlStateReady: true,
  });
  assert.deepEqual(syncCalls.at(-1), ["synced"]);

  const button = new FakeElement();
  const dialog = new FakeDialog();
  let beforeOpen = 0;
  let afterClose = 0;
  const panelOpens: any[] = [];
  bindPanelDialog({
    applyingUrlState: () => false,
    button: button as any,
    dialog: dialog as any,
    dialogs: dialogs as any,
    languageList: languageList as any,
    onBeforeOpen() {
      beforeOpen += 1;
    },
    onAfterClose() {
      afterClose += 1;
    },
    openPanel(options: any) {
      panelOpens.push(options);
    },
    panel: "language",
    renderSavedEmoji() {},
    suppressedPanelCloses: new WeakSet(),
    syncUrlState() {},
    urlStateReady: () => true,
  });
  button.dispatch("click");
  await Promise.resolve();
  assert.equal(beforeOpen, 1);
  assert.equal(panelOpens.length, 1);
  dialog.dispatch("close");
  assert.equal(afterClose, 1);
} finally {
  if (originalWindowDescriptor)
    Object.defineProperty(globalThis, "window", originalWindowDescriptor);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocumentDescriptor)
    Object.defineProperty(globalThis, "document", originalDocumentDescriptor);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalNavigatorDescriptor)
    Object.defineProperty(globalThis, "navigator", originalNavigatorDescriptor);
  else Reflect.deleteProperty(globalThis, "navigator");
  if (originalHTMLElementDescriptor)
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElementDescriptor);
  else Reflect.deleteProperty(globalThis, "HTMLElement");
  if (originalHTMLDialogElementDescriptor)
    Object.defineProperty(
      globalThis,
      "HTMLDialogElement",
      originalHTMLDialogElementDescriptor,
    );
  else Reflect.deleteProperty(globalThis, "HTMLDialogElement");
}
