export const sourceModuleSpecifier = "build/src/app/explorer-app-events.js";
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

const createChoice = (dataset: Record<string, string>) => {
  const inputListeners = new Map<string, Function[]>();
  const input = {
    checked: false,
    defaultChecked: false,
    addEventListener(type: string, handler: Function) {
      const list = inputListeners.get(type) ?? [];
      list.push(handler);
      inputListeners.set(type, list);
    },
    listeners: inputListeners,
    removeAttribute() {},
    setAttribute() {},
  };
  return {
    ...createEventTarget(),
    attributes: new Map<string, string>(),
    classStates: new Map<string, boolean>(),
    classList: {
      toggle(name: string, active: boolean) {
        this.owner.classStates.set(name, active);
      },
      owner: undefined as any,
    },
    dataset,
    querySelector(selector: string) {
      return selector === 'input[type="radio"]' ? input : null;
    },
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
    tabIndex: -1,
  };
};

export async function createExplorerAppEventsFixture() {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const mediaListeners: Function[] = [];
  const onlineOfflineListeners = new Map<string, Function[]>();
  const documentListeners = new Map<string, Function[]>();
  const [themeChoiceOne, themeChoiceTwo] = [
    createChoice({ theme: "dark" }),
    createChoice({ theme: "light" }),
  ];
  themeChoiceOne.classList.owner = themeChoiceOne;
  themeChoiceTwo.classList.owner = themeChoiceTwo;
  const modeChoiceOne = createChoice({ mode: "advanced" });
  const modeChoiceTwo = createChoice({ mode: "standard" });
  modeChoiceOne.classList.owner = modeChoiceOne;
  modeChoiceTwo.classList.owner = modeChoiceTwo;
  const accessibilityStub = {
    bindModifierGroupCalls: [] as any[],
    bindSavedDialogInteractionsCalls: [] as any[],
    themeChoiceKeyDownCalls: [] as any[],
    bindModifierGroup(group: unknown, handler: unknown) {
      this.bindModifierGroupCalls.push([group, handler]);
    },
    bindSavedDialogInteractions(options: unknown) {
      this.bindSavedDialogInteractionsCalls.push(options);
    },
    createThemeChoiceKeyDownHandler(choices: unknown) {
      this.themeChoiceKeyDownCalls.push(choices);
      return "theme-keydown-handler";
    },
  };
  const panelStub = {
    bindPanelDialogCalls: [] as any[],
    bindPanelDialog(options: unknown) {
      this.bindPanelDialogCalls.push(options);
    },
  };
  const audioToggleStub = {
    renderCalls: [] as any[],
    render(...args: any[]) {
      this.renderCalls.push(args);
    },
  };
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
      setTimeout,
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { explorerMode: "advanced" } },
      addEventListener(type: string, handler: Function) {
        const list = documentListeners.get(type) ?? [];
        list.push(handler);
        documentListeners.set(type, list);
      },
      querySelector(selector: string) {
        return selector === ".language-picker" ? languagePicker : null;
      },
      querySelectorAll(selector: string) {
        if (selector === ".theme-choice")
          return [themeChoiceOne, themeChoiceTwo];
        if (selector === ".mode-choice") return [modeChoiceOne, modeChoiceTwo];
        return [];
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
  const helpDialog = {
    open: true,
    querySelectorAll(selector: string) {
      if (selector === ".theme-choice") return [themeChoiceOne, themeChoiceTwo];
      if (selector === ".mode-choice") return [modeChoiceOne, modeChoiceTwo];
      return [];
    },
  };
  const languageDialog = { dataset: {} as Record<string, string> };
  const savedDialog = createEventTarget();
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
    refreshElements: () => lifecycleCalls.push("refresh-elements"),
    renderDeveloperMode: () => lifecycleCalls.push("render-developer-mode"),
    renderInstallAppButton: () => lifecycleCalls.push("render-install-button"),
    renderPixelFontToggle: () =>
      lifecycleCalls.push("render-pixel-font-toggle"),
    renderSavedEmoji: () => lifecycleCalls.push("render-saved"),
    renderSearchLanguages: () => lifecycleCalls.push("render-search-languages"),
    resetFilters: () => lifecycleCalls.push("reset-filters"),
    savedDialog,
    savedPicker,
    scheduleSearchDraw: () => lifecycleCalls.push("search-draw"),
    searchText,
    selectEmojiFont: () => lifecycleCalls.push("select-emoji-font"),
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
    ensureUtilityPanel: (panel: string) =>
      lifecycleCalls.push(`ensure-panel:${panel}`),
  };
  return {
    accessibilityStub,
    bindsOptions,
    dependencies: {
      audioToggle: audioToggleStub,
      bindModifierGroup:
        accessibilityStub.bindModifierGroup.bind(accessibilityStub),
      bindPanelDialog: panelStub.bindPanelDialog.bind(panelStub),
      bindSavedDialogInteractions:
        accessibilityStub.bindSavedDialogInteractions.bind(accessibilityStub),
      createThemeChoiceKeyDownHandler:
        accessibilityStub.createThemeChoiceKeyDownHandler.bind(
          accessibilityStub,
        ),
      themes: { getTheme: () => "dark" },
    },
    documentListeners,
    installDialog,
    installDialogClose,
    languageDialog,
    lifecycleCalls,
    mediaListeners,
    modeChoices: [modeChoiceOne, modeChoiceTwo],
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
    themeChoices: [themeChoiceOne, themeChoiceTwo],
    versionNext,
    versionPrevious,
  };
}
