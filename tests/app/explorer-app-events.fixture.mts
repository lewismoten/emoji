import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const sourceModuleSpecifier = "build/src/app/explorer-app-events.js";

const root = process.cwd();
const sourcePath = path.join(root, sourceModuleSpecifier);
const tempRoot = path.join(root, "build/tests/.tmp");

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

export async function createExplorerAppEventsFixture() {
  const source = await fs.readFile(sourcePath, "utf8");
  const transformedSource = source
    .replace(
      'from "../explorer/navigation/event-accessibility.js";',
      'from "./event-accessibility-stub.mjs";',
    )
    .replace(
      'from "../explorer/pwa/pwa-panels.js";',
      'from "./pwa-panels-stub.mjs";',
    )
    .replace(
      'from "../controls/audio/audio-toggle.js";',
      'from "./audio-toggle-stub.mjs";',
    )
    .replace("from '../utils/themes.js';", 'from "./themes-stub.mjs";')
    .replace('from "../utils/themes.js";', 'from "./themes-stub.mjs";');

  await fs.mkdir(tempRoot, { recursive: true });
  const tempDirectory = await fs.mkdtemp(
    path.join(tempRoot, "explorer-app-events-"),
  );

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
    path.join(tempDirectory, "pwa-panels-stub.mjs"),
    [
      "export const bindPanelDialogCalls = [];",
      "export function bindPanelDialog(options) {",
      "  bindPanelDialogCalls.push(options);",
      "}",
    ].join("\n"),
  );
  await fs.writeFile(
    path.join(tempDirectory, "audio-toggle-stub.mjs"),
    [
      "export const renderCalls = [];",
      "export function render(...args) {",
      "  renderCalls.push(args);",
      "}",
    ].join("\n"),
  );
  await fs.writeFile(
    path.join(tempDirectory, "themes-stub.mjs"),
    ['export const getTheme = () => "dark";'].join("\n"),
  );
  await fs.writeFile(
    path.join(tempDirectory, "explorer-app-events.mjs"),
    transformedSource,
  );

  const module = await import(
    pathToFileURL(path.join(tempDirectory, "explorer-app-events.mjs")).href
  );
  const accessibilityStub = await import(
    pathToFileURL(path.join(tempDirectory, "event-accessibility-stub.mjs")).href
  );
  const panelStub = await import(
    pathToFileURL(path.join(tempDirectory, "pwa-panels-stub.mjs")).href
  );

  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const mediaListeners: Function[] = [];
  const onlineOfflineListeners = new Map<string, Function[]>();
  const documentListeners = new Map<string, Function[]>();

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
  const installDialogClose = createEventTarget();
  const choiceOne = createEventTarget();
  const choiceTwo = createEventTarget();
  const themeChoice = createEventTarget();
  const installedQuery = createEventTarget();
  const orderButton = createEventTarget();
  const advancedFiltersButton = {
    ...createEventTarget(),
    focusCalled: 0,
    focus() {
      this.focusCalled += 1;
    },
  };
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

  return {
    accessibilityStub,
    bindsOptions,
    documentListeners,
    installDialog,
    installDialogClose,
    languageDialog,
    lifecycleCalls,
    mediaListeners,
    module,
    navigateCalls,
    onlineOfflineListeners,
    panelCloses,
    panelStub,
    restore() {
      if (originalWindow)
        Object.defineProperty(globalThis, "window", originalWindow);
      else Reflect.deleteProperty(globalThis, "window");
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
      else Reflect.deleteProperty(globalThis, "document");
    },
    stepCalls,
    versionNext,
    versionPrevious,
  };
}
