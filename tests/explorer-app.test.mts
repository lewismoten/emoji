import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sourceModuleSpecifier = "../src/explorer-app.js";
const root = process.cwd();
const sourcePath = path.join(root, "build/src/explorer-app.js");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'from "./explorer/event-accessibility.js";',
    'from "./event-accessibility-stub.mjs";',
  )
  .replace(
    'from "./explorer/control-startup.js";',
    'from "./control-startup-stub.mjs";',
  )
  .replace(
    'from "./explorer/pwa-panels.js";',
    'from "./pwa-panels-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "explorer-app-"));

await fs.writeFile(
  path.join(tempDirectory, "event-accessibility-stub.mjs"),
  [
    "export const bindModifierGroupCalls = [];",
    "export const bindSavedDialogInteractionsCalls = [];",
    "export const themeChoiceKeyDownCalls = [];",
    "export function bindModifierGroup(group, handler) {",
    "  bindModifierGroupCalls.push([group, handler]);",
    "}",
    "export function bindSavedDialogInteractions(options) {",
    "  bindSavedDialogInteractionsCalls.push(options);",
    "}",
    "export function createThemeChoiceKeyDownHandler(choices) {",
    "  themeChoiceKeyDownCalls.push(choices);",
    "  return 'theme-keydown-handler';",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "control-startup-stub.mjs"),
  [
    "export const finalizeCalls = [];",
    "export const initializeCalls = [];",
    "export function initializeExplorerControls(options) {",
    "  initializeCalls.push(options);",
    "  return { initialized: true, options };",
    "}",
    "export async function finalizeExplorerStartup(options) {",
    "  finalizeCalls.push(options);",
    "  return { finalized: true, options };",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pwa-panels-stub.mjs"),
  [
    "export const bindPanelDialogCalls = [];",
    "export function bindPanelDialog(options) {",
    "  bindPanelDialogCalls.push(options);",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-app.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-app.mjs")).href,
);
const accessibilityStub = await import(
  pathToFileURL(path.join(tempDirectory, "event-accessibility-stub.mjs")).href,
);
const controlStub = await import(
  pathToFileURL(path.join(tempDirectory, "control-startup-stub.mjs")).href,
);
const panelStub = await import(
  pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href,
);

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

const createEventTarget = () => {
  const listeners = new Map<string, Function[]>();
  return {
    addEventListener(type: string, handler: Function) {
      const list = listeners.get(type) ?? [];
      list.push(handler);
      listeners.set(type, list);
    },
    listeners,
  };
};

try {
  const immediateWindowListeners = new Map<string, Function[]>();
  const immediateWindow = {
    addEventListener(type: string, listener: () => void) {
      const list = immediateWindowListeners.get(type) ?? [];
      list.push(listener);
      immediateWindowListeners.set(type, list);
    },
    document: { readyState: "complete" },
  };
  const startCalls: string[] = [];
  const app = module.createExplorerApp({
    start: async () => {
      startCalls.push("start");
    },
    window: immediateWindow,
  });
  await app.start();
  await app.start();
  assert.deepEqual(startCalls, ["start"]);

  app.startWhenReady();
  assert.deepEqual(startCalls, ["start"]);

  const delayedWindowListeners = new Map<string, Function[]>();
  const delayedWindow = {
    addEventListener(type: string, listener: () => void) {
      const list = delayedWindowListeners.get(type) ?? [];
      list.push(listener);
      delayedWindowListeners.set(type, list);
    },
    document: { readyState: "loading" },
  };
  const delayedCalls: string[] = [];
  const delayedApp = module.createExplorerApp({
    start: () => {
      delayedCalls.push("start");
    },
    window: delayedWindow,
  });
  delayedApp.startWhenReady();
  assert.equal(delayedCalls.length, 0);
  delayedWindowListeners.get("load")?.[0]();
  delayedWindowListeners.get("load")?.[0]();
  assert.deepEqual(delayedCalls, ["start"]);

  const mediaListeners: Function[] = [];
  const onlineOfflineListeners = new Map<string, Function[]>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      addEventListener(type: string, handler: Function) {
        const list = onlineOfflineListeners.get(type) ?? [];
        list.push(handler);
        onlineOfflineListeners.set(type, list);
      },
      matchMedia() {
        return {
          addEventListener(type: string, handler: Function) {
            if (type === "change") mediaListeners.push(handler);
          },
        };
      },
    },
  });

  const documentListeners = new Map<string, Function[]>();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      addEventListener(type: string, handler: Function) {
        const list = documentListeners.get(type) ?? [];
        list.push(handler);
        documentListeners.set(type, list);
      },
    },
  });

  const searchText = createEventTarget();
  const emojiList = createEventTarget();
  const exampleDialog = createEventTarget();
  const versionSelector = createEventTarget();
  const versionRange = createEventTarget();
  const versionModeToggle = createEventTarget();
  const versionPrevious = createEventTarget();
  const versionNext = createEventTarget();
  const clearFiltersButton = createEventTarget();
  const emojiPrevious = createEventTarget();
  const emojiNext = createEventTarget();
  const installAppButton = createEventTarget();
  const developerModeToggle = createEventTarget();
  const languagePicker = createEventTarget();
  const savedPicker = createEventTarget();
  const helpPicker = createEventTarget();
  const advancedFiltersButton = {
    ...createEventTarget(),
    focusCalled: 0,
    focus() {
      this.focusCalled += 1;
    },
  };
  const installDialogClose = createEventTarget();
  const installDialog = {
    closeCalled: 0,
    close() {
      this.closeCalled += 1;
    },
    querySelector(selector: string) {
      return selector === ".install-dialog-close" ? installDialogClose : null;
    },
  };
  const helpDialog = { open: true };
  const languageDialog = { dataset: {} as Record<string, string> };
  const savedDialog = {};
  const advancedFilters = {};
  const choiceOne = createEventTarget();
  const choiceTwo = createEventTarget();
  const themeChoice = createEventTarget();
  const installedQuery = createEventTarget();
  const orderButton = createEventTarget();

  const panelDialogsValue = [{ id: "saved" }, { id: "help" }];
  const lifecycleCalls: string[] = [];
  const stepCalls: number[] = [];
  const navigateCalls: number[] = [];
  const panelCloses: any[] = [];
  const bindsOptions = {
    advancedFilters,
    advancedFiltersButton,
    applyBasicUrlState: () => lifecycleCalls.push("apply-basic-url-state"),
    applyingUrlState: false,
    clearFiltersButton,
    closePanel: (...args: any[]) => panelCloses.push(args),
    developerModeToggle,
    drawList: () => lifecycleCalls.push("draw-list"),
    emojiFontChoices: [choiceOne, choiceTwo],
    emojiList,
    emojiNext,
    emojiPrevious,
    exampleDialog,
    genderCheckboxes: ["neutral"],
    hairCheckboxes: ["red"],
    helpDialog,
    helpPicker,
    installApp: () => lifecycleCalls.push("install-app"),
    installedDisplayQueries: [installedQuery],
    installAppButton,
    installDialog,
    languageDialog,
    languageList: ["en", "ar"],
    languagePicker,
    navigateEmoji: (step: number) => navigateCalls.push(step),
    onClick: () => lifecycleCalls.push("emoji-click"),
    onDocumentKeyDown: () => lifecycleCalls.push("doc-keydown"),
    onEmojiDialogClick: () => lifecycleCalls.push("dialog-click"),
    onEmojiDialogClose: () => lifecycleCalls.push("dialog-close"),
    onEmojiFocus: () => lifecycleCalls.push("emoji-focus"),
    onEmojiKeyDown: () => lifecycleCalls.push("emoji-keydown"),
    onGenderChange: () => lifecycleCalls.push("gender-change"),
    onHairChange: () => lifecycleCalls.push("hair-change"),
    onOrderModeChange: () => lifecycleCalls.push("order-change"),
    onSkinToneChange: () => lifecycleCalls.push("skin-change"),
    onVersionRangeInput: () => lifecycleCalls.push("range-input"),
    openPanel: () => lifecycleCalls.push("open-panel"),
    orderButtons: [orderButton],
    panelDialogs: () => panelDialogsValue,
    positionFavoriteButton: () => lifecycleCalls.push("position-favorite"),
    renderInstallAppButton: () => lifecycleCalls.push("render-install-button"),
    renderSavedEmoji: () => lifecycleCalls.push("render-saved"),
    resetFilters: () => lifecycleCalls.push("reset-filters"),
    savedDialog,
    savedPicker,
    scheduleSearchDraw: () => lifecycleCalls.push("search-draw"),
    searchText,
    selectEmojiFont: () => lifecycleCalls.push("select-emoji-font"),
    selectTheme: () => lifecycleCalls.push("select-theme"),
    skinToneCheckboxes: ["light"],
    stepVersion: (step: number) => stepCalls.push(step),
    suppressedPanelCloses: new Set<string>(),
    syncUrlState: () => lifecycleCalls.push("sync-url"),
    syncVersionRange: () => lifecycleCalls.push("sync-version-range"),
    themeChoices: [themeChoice],
    toggleDeveloperMode: () => lifecycleCalls.push("toggle-developer"),
    toggleVersionMode: () => lifecycleCalls.push("toggle-version-mode"),
    updateOnlineStatus: () => lifecycleCalls.push("update-online"),
    urlStateReady: true,
    versionModeToggle,
    versionNext,
    versionPrevious,
    versionRange,
    versionSelector,
  };

  module.bindExplorerEvents(bindsOptions);
  assert.deepEqual(accessibilityStub.bindModifierGroupCalls, [
    [["light"], bindsOptions.onSkinToneChange],
    [["red"], bindsOptions.onHairChange],
    [["neutral"], bindsOptions.onGenderChange],
  ]);
  assert.deepEqual(accessibilityStub.themeChoiceKeyDownCalls, [[themeChoice]]);
  assert.equal(accessibilityStub.bindSavedDialogInteractionsCalls.length, 1);
  assert.equal(panelStub.bindPanelDialogCalls.length, 4);
  assert.deepEqual(lifecycleCalls.slice(0, 3), [
    "update-online",
    "render-install-button",
    "apply-basic-url-state",
  ]);
  assert.equal(onlineOfflineListeners.get("online")?.length, 1);
  assert.equal(onlineOfflineListeners.get("offline")?.length, 1);
  assert.equal(mediaListeners.length, 1);
  assert.equal(searchText.listeners.get("input")?.[0], bindsOptions.scheduleSearchDraw);
  assert.equal(choiceOne.listeners.get("click")?.[0], bindsOptions.selectEmojiFont);
  assert.equal(themeChoice.listeners.get("click")?.[0], bindsOptions.selectTheme);
  assert.equal(themeChoice.listeners.get("keydown")?.[0], "theme-keydown-handler");
  assert.equal(versionModeToggle.listeners.get("click")?.[0], bindsOptions.toggleVersionMode);
  versionPrevious.listeners.get("click")?.[0]();
  versionNext.listeners.get("click")?.[0]();
  emojiPrevious.listeners.get("click")?.[0]();
  emojiNext.listeners.get("click")?.[0]();
  assert.deepEqual(stepCalls, [-1, 1]);
  assert.deepEqual(navigateCalls, [-1, 1]);
  versionSelector.listeners.get("change")?.[0]();
  assert.ok(lifecycleCalls.includes("sync-version-range"));
  assert.ok(lifecycleCalls.includes("render-saved") === false);
  installDialogClose.listeners.get("click")?.[0]();
  assert.equal(installDialog.closeCalled, 1);
  documentListeners.get("keydown")?.[0]();
  assert.ok(lifecycleCalls.includes("doc-keydown"));

  panelStub.bindPanelDialogCalls[0].onBeforeOpen();
  assert.equal(languageDialog.dataset.returnPanel, "help");
  assert.equal(panelCloses.length, 1);
  panelStub.bindPanelDialogCalls[3].onAfterClose();
  assert.equal(advancedFiltersButton.focusCalled, 1);

  const initialized = module.initializeExplorerControls({ id: "controls" });
  assert.deepEqual(initialized, {
    initialized: true,
    options: { id: "controls" },
  });
  assert.deepEqual(controlStub.initializeCalls, [{ id: "controls" }]);

  await module.finalizeExplorerStartup({ id: "startup" });
  assert.deepEqual(controlStub.finalizeCalls, [{ id: "startup" }]);
  assert.equal(sourceModuleSpecifier, "../src/explorer-app.js");
} finally {
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
