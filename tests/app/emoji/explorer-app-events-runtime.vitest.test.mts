import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bindExplorerEventsWithEnvironment,
} from "../../../src/app/emoji/explorer-app-events-runtime.js";
import {
  bindExplorerEvents,
  createExplorerAppEventDependencies,
} from "../../../src/app/explorer-app-events.js";

const createEventTarget = () => {
  const listeners = new Map<string, Array<(...args: any[]) => void>>();
  return {
    addEventListener(type: string, handler: (...args: any[]) => void) {
      const list = listeners.get(type) ?? [];
      list.push(handler);
      listeners.set(type, list);
    },
    removeEventListener(type: string, handler?: (...args: any[]) => void) {
      const list = listeners.get(type) ?? [];
      listeners.set(
        type,
        handler ? list.filter((item) => item !== handler) : [],
      );
    },
    listeners,
  };
};

const createChoice = (dataset: Record<string, string>) => {
  const inputListeners = new Map<string, Array<(...args: any[]) => void>>();
  const input = {
    checked: false,
    defaultChecked: false,
    addEventListener(type: string, handler: (...args: any[]) => void) {
      const list = inputListeners.get(type) ?? [];
      list.push(handler);
      inputListeners.set(type, list);
    },
    listeners: inputListeners,
    removeAttribute() {},
    setAttribute() {},
  };
  const choice = {
    ...createEventTarget(),
    attributes: new Map<string, string>(),
    classStates: new Map<string, boolean>(),
    classList: {
      owner: undefined as any,
      toggle(name: string, active: boolean) {
        this.owner.classStates.set(name, active);
      },
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
  choice.classList.owner = choice;
  return choice;
};

const createWindowDocumentPair = () => {
  const mediaListeners: Array<(...args: any[]) => void> = [];
  const onlineOfflineListeners = new Map<string, Array<(...args: any[]) => void>>();
  const documentListeners = new Map<string, Array<(...args: any[]) => void>>();
  const themeChoices = [
    createChoice({ theme: "dark" }),
    createChoice({ theme: "light" }),
  ];
  const modeChoices = [
    createChoice({ mode: "advanced" }),
    createChoice({ mode: "standard" }),
  ];
  const languagePicker = createEventTarget();
  return {
    documentListeners,
    languagePicker,
    mediaListeners,
    modeChoices,
    themeChoices,
    windowRef: {
      addEventListener(type: string, handler: (...args: any[]) => void) {
        const list = onlineOfflineListeners.get(type) ?? [];
        list.push(handler);
        onlineOfflineListeners.set(type, list);
      },
      matchMedia() {
        return {
          addEventListener(type: string, handler: (...args: any[]) => void) {
            if (type === "change") mediaListeners.push(handler);
          },
        };
      },
      requestAnimationFrame(callback: () => void) {
        callback();
        return 1;
      },
      removeEventListener() {},
      setTimeout,
    },
    documentRef: {
      addEventListener(type: string, handler: (...args: any[]) => void) {
        const list = documentListeners.get(type) ?? [];
        list.push(handler);
        documentListeners.set(type, list);
      },
      documentElement: { dataset: { explorerMode: "advanced" } },
      querySelector(selector: string) {
        return selector === ".language-picker" ? languagePicker : null;
      },
      querySelectorAll(selector: string) {
        if (selector === ".theme-choice") return themeChoices;
        if (selector === ".mode-choice") return modeChoices;
        return [];
      },
      removeEventListener() {},
    },
    onlineOfflineListeners,
  };
};

const createRuntimeHarness = () => {
  const env = createWindowDocumentPair();
  const lifecycleCalls: string[] = [];
  const stepCalls: number[] = [];
  const navigateCalls: number[] = [];
  const panelCloses: any[] = [];
  const bindPanelDialogCalls: any[] = [];
  const bindSavedDialogInteractionsCalls: any[] = [];
  const installDialogClose = createEventTarget();
  const advancedFiltersButton = {
    ...createEventTarget(),
    focusCalled: 0,
    focus() {
      this.focusCalled += 1;
    },
  };
  const helpDialog = {
    open: true,
    querySelectorAll(selector: string) {
      if (selector === ".theme-choice") return env.themeChoices;
      if (selector === ".mode-choice") return env.modeChoices;
      return [];
    },
  };
  const languageDialog = { dataset: {} as Record<string, string> };
  const savedDialog = createEventTarget();
  const options = {
    advancedFilters: {},
    advancedFiltersButton,
    applyBasicUrlState: vi.fn(() => lifecycleCalls.push("apply-basic-url-state")),
    applyingUrlState: false,
    clearFiltersButton: createEventTarget(),
    closePanel: vi.fn((...args: any[]) => panelCloses.push(args)),
    developerModeToggle: createEventTarget(),
    drawList: vi.fn(() => lifecycleCalls.push("draw-list")),
    emojiFontChoices: [createEventTarget(), createEventTarget()],
    emojiList: createEventTarget(),
    emojiNext: createEventTarget(),
    emojiPrevious: createEventTarget(),
    ensureUtilityPanel: vi.fn((panel: string) =>
      lifecycleCalls.push(`ensure-panel:${panel}`),
    ),
    exampleDialog: createEventTarget(),
    genderCheckboxes: ["neutral"],
    getAdvancedFiltersDialog: vi.fn(() => options.advancedFilters),
    getHelpDialog: vi.fn(() => helpDialog),
    getLanguageDialog: vi.fn(() => languageDialog),
    getLanguageList: vi.fn(() => ["en", "ar"]),
    getSavedDialog: vi.fn(() => savedDialog),
    hairCheckboxes: ["red"],
    helpDialog,
    helpPicker: createEventTarget(),
    installApp: vi.fn(() => lifecycleCalls.push("install-app")),
    installAppButton: createEventTarget(),
    installDialog: {
      close: vi.fn(),
      querySelector(selector: string) {
        return selector === ".install-dialog-close" ? installDialogClose : null;
      },
    },
    installedDisplayQueries: [createEventTarget()],
    languageDialog,
    languagePicker: env.languagePicker,
    navigateEmoji: vi.fn((step: number) => navigateCalls.push(step)),
    onClick: vi.fn(() => lifecycleCalls.push("emoji-click")),
    onDocumentKeyDown: vi.fn(() => lifecycleCalls.push("doc-keydown")),
    onEmojiDialogClick: vi.fn(() => lifecycleCalls.push("dialog-click")),
    onEmojiDialogClose: vi.fn(() => lifecycleCalls.push("dialog-close")),
    onEmojiFocus: vi.fn(() => lifecycleCalls.push("emoji-focus")),
    onEmojiKeyDown: vi.fn(() => lifecycleCalls.push("emoji-keydown")),
    onGenderChange: vi.fn(() => lifecycleCalls.push("gender-change")),
    onHairChange: vi.fn(() => lifecycleCalls.push("hair-change")),
    onSkinToneChange: vi.fn(() => lifecycleCalls.push("skin-change")),
    onVersionRangeInput: vi.fn(() => lifecycleCalls.push("range-input")),
    openPanel: vi.fn(() => lifecycleCalls.push("open-panel")),
    orderButtons: [],
    panelDialogs: vi.fn(() => [{ id: "saved" }, { id: "help" }]),
    positionFavoriteButton: vi.fn(() =>
      lifecycleCalls.push("position-favorite"),
    ),
    refreshElements: vi.fn(() => lifecycleCalls.push("refresh-elements")),
    renderDeveloperMode: vi.fn(() =>
      lifecycleCalls.push("render-developer-mode"),
    ),
    renderInstallAppButton: vi.fn(() =>
      lifecycleCalls.push("render-install-button"),
    ),
    renderPixelFontToggle: vi.fn(() =>
      lifecycleCalls.push("render-pixel-font-toggle"),
    ),
    renderSavedEmoji: vi.fn(() => lifecycleCalls.push("render-saved")),
    renderSearchLanguages: vi.fn(() =>
      lifecycleCalls.push("render-search-languages"),
    ),
    resetFilters: vi.fn(() => lifecycleCalls.push("reset-filters")),
    savedDialog,
    savedPicker: createEventTarget(),
    scheduleSearchDraw: vi.fn(() => lifecycleCalls.push("search-draw")),
    searchText: createEventTarget(),
    selectEmojiFont: vi.fn(() => lifecycleCalls.push("select-emoji-font")),
    skinToneCheckboxes: ["light"],
    stepVersion: vi.fn((step: number) => stepCalls.push(step)),
    suppressedPanelCloses: new Set<string>(),
    syncUrlState: vi.fn(() => lifecycleCalls.push("sync-url")),
    syncVersionRange: vi.fn(() =>
      lifecycleCalls.push("sync-version-range"),
    ),
    toggleDeveloperMode: vi.fn(() =>
      lifecycleCalls.push("toggle-developer"),
    ),
    toggleVersionMode: vi.fn(() =>
      lifecycleCalls.push("toggle-version-mode"),
    ),
    updateOnlineStatus: vi.fn(() => lifecycleCalls.push("update-online")),
    urlStateReady: true,
    versionModeToggle: createEventTarget(),
    versionNext: createEventTarget(),
    versionPrevious: createEventTarget(),
    versionRange: createEventTarget(),
    versionSelector: createEventTarget(),
  };
  const dependencies = {
    audioToggle: { render: vi.fn(() => lifecycleCalls.push("render-audio")) },
    bindModifierGroup: vi.fn(),
    bindPanelDialog: vi.fn((value: unknown) => bindPanelDialogCalls.push(value)),
    bindSavedDialogInteractions: vi.fn((value: unknown) =>
      bindSavedDialogInteractionsCalls.push(value),
    ),
    createThemeChoiceKeyDownHandler: vi.fn(() => vi.fn()),
    themes: { getTheme: vi.fn(() => "dark") },
  };

  return {
    bindPanelDialogCalls,
    bindSavedDialogInteractionsCalls,
    dependencies,
    env,
    installDialogClose,
    lifecycleCalls,
    navigateCalls,
    options,
    panelCloses,
    stepCalls,
  };
};

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

afterEach(() => {
  vi.restoreAllMocks();
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else Reflect.deleteProperty(globalThis, "document");
});

describe("bindExplorerEventsWithEnvironment", () => {
  it("wires panels, modifiers, and runtime events through shared helpers", async () => {
    const harness = createRuntimeHarness();

    const cleanup = bindExplorerEventsWithEnvironment(
      harness.options,
      harness.dependencies,
      harness.env.documentRef as any,
      harness.env.windowRef as any,
    );

    expect(harness.dependencies.bindModifierGroup).toHaveBeenNthCalledWith(
      1,
      ["light"],
      harness.options.onSkinToneChange,
    );
    expect(harness.dependencies.bindModifierGroup).toHaveBeenNthCalledWith(
      2,
      ["red"],
      harness.options.onHairChange,
    );
    expect(harness.dependencies.bindModifierGroup).toHaveBeenNthCalledWith(
      3,
      ["neutral"],
      harness.options.onGenderChange,
    );
    expect(harness.bindSavedDialogInteractionsCalls).toHaveLength(1);
    expect(harness.bindPanelDialogCalls).toHaveLength(4);
    expect(harness.lifecycleCalls.slice(0, 3)).toEqual([
      "update-online",
      "render-install-button",
      "apply-basic-url-state",
    ]);

    harness.options.versionPrevious.listeners.get("click")?.[0]?.();
    harness.options.versionNext.listeners.get("click")?.[0]?.();
    harness.options.emojiPrevious.listeners.get("click")?.[0]?.();
    harness.options.emojiNext.listeners.get("click")?.[0]?.();
    harness.options.versionSelector.listeners.get("change")?.[0]?.();
    harness.installDialogClose.listeners.get("click")?.[0]?.();
    harness.env.documentListeners.get("keydown")?.[0]?.({} as KeyboardEvent);

    expect(harness.stepCalls).toEqual([-1, 1]);
    expect(harness.navigateCalls).toEqual([-1, 1]);
    expect(harness.options.installDialog.close).toHaveBeenCalledTimes(1);
    expect(harness.lifecycleCalls).toContain("sync-version-range");
    expect(harness.lifecycleCalls).toContain("draw-list");
    expect(harness.lifecycleCalls).toContain("doc-keydown");

    const savedPanel: any = harness.bindPanelDialogCalls[0];
    const languagePanel: any = harness.bindPanelDialogCalls[1];
    const helpPanel: any = harness.bindPanelDialogCalls[2];
    const filtersPanel: any = harness.bindPanelDialogCalls[3];

    await savedPanel.ensureDialog();
    await languagePanel.ensureDialog();
    await helpPanel.onAfterOpen();
    await helpPanel.ensureDialog();
    languagePanel.onBeforeOpen();
    harness.options.helpDialog.open = false;
    languagePanel.onBeforeOpen();
    await filtersPanel.ensureDialog();
    filtersPanel.onAfterClose();

    expect(harness.options.languageDialog.dataset.returnPanel).toBeUndefined();
    expect(harness.options.advancedFiltersButton.focusCalled).toBe(1);
    expect(harness.lifecycleCalls).toContain("refresh-elements");
    expect(harness.lifecycleCalls).toContain("render-developer-mode");
    expect(harness.lifecycleCalls).toContain("render-pixel-font-toggle");
    expect(harness.lifecycleCalls).toContain("render-search-languages");
    expect(harness.lifecycleCalls).toContain("render-audio");
    expect(harness.lifecycleCalls).toContain("ensure-panel:favorites");
    expect(harness.lifecycleCalls).toContain("ensure-panel:language");
    expect(harness.lifecycleCalls).toContain("ensure-panel:help");
    expect(harness.lifecycleCalls).toContain("ensure-panel:filters");
    expect(harness.panelCloses).toHaveLength(1);
    expect(harness.env.themeChoices[0].attributes.get("aria-checked")).toBe(
      "true",
    );
    expect(harness.env.modeChoices[0].attributes.get("aria-checked")).toBe(
      "true",
    );

    cleanup();
  });

  it("binds dialogs on demand and cleans up fallback listeners", async () => {
    const listeners = new Map<string, Array<(...args: any[]) => void>>();
    const removals: string[] = [];
    const bindPanelDialogCalls: any[] = [];
    const bindSavedDialogInteractionsCalls: any[] = [];
    const createTarget = () => ({
      listeners: new Map<string, Array<(...args: any[]) => void>>(),
      addEventListener(type: string, handler: (...args: any[]) => void) {
        const list = this.listeners.get(type) ?? [];
        list.push(handler);
        this.listeners.set(type, list);
        const all = listeners.get(type) ?? [];
        all.push(handler);
        listeners.set(type, all);
      },
      removeEventListener(type: string) {
        removals.push(type);
      },
    });
    const installDialogClose = createTarget();

    const cleanup = bindExplorerEventsWithEnvironment(
      {
        advancedFiltersButton: undefined,
        applyBasicUrlState() {},
        applyingUrlState: false,
        clearFiltersButton: createTarget(),
        closePanel() {},
        developerModeToggle: createTarget(),
        emojiFontChoices: [],
        emojiList: createTarget(),
        emojiNext: createTarget(),
        emojiPrevious: createTarget(),
        exampleDialog: createTarget(),
        genderCheckboxes: [],
        getSavedDialog() {
          return "saved-dialog";
        },
        hairCheckboxes: [],
        helpPicker: {},
        installDialog: { querySelector: () => installDialogClose },
        installedDisplayQueries: [],
        openPanel() {},
        orderButtons: [],
        panelDialogs: () => [],
        renderInstallAppButton() {},
        renderSavedEmoji() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: createTarget(),
        skinToneCheckboxes: [],
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        toggleDeveloperMode() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionModeToggle: createTarget(),
        versionNext: createTarget(),
        versionPrevious: createTarget(),
        versionRange: createTarget(),
        versionSelector: createTarget(),
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog(options: unknown) {
          bindPanelDialogCalls.push(options);
        },
        bindSavedDialogInteractions(options: unknown) {
          bindSavedDialogInteractionsCalls.push(options);
        },
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
      {
        addEventListener() {},
        documentElement: { dataset: {} },
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
        removeEventListener(type: string) {
          removals.push(type);
        },
      } as any,
      undefined,
    );

    expect(listeners.get("change")).toHaveLength(2);
    await bindPanelDialogCalls[0].ensureDialog();
    await bindPanelDialogCalls[1].ensureDialog();
    bindPanelDialogCalls[2].onAfterClose();
    installDialogClose.listeners.get("click")?.[0]?.();
    expect(bindSavedDialogInteractionsCalls).toHaveLength(2);

    cleanup();
    expect(removals).toContain("change");
    expect(removals).toContain("input");
  });

  it("avoids rebinding a saved dialog that is already marked as bound", () => {
    const bindSavedDialogInteractions = vi.fn();
    let currentSavedDialog: any;

    bindExplorerEventsWithEnvironment(
      {
        advancedFiltersButton: { focus() {} },
        applyBasicUrlState() {},
        applyingUrlState: false,
        clearFiltersButton: { addEventListener() {}, removeEventListener() {} },
        closePanel() {},
        developerModeToggle: { addEventListener() {}, removeEventListener() {} },
        emojiFontChoices: [],
        emojiList: { addEventListener() {}, removeEventListener() {} },
        emojiNext: { addEventListener() {}, removeEventListener() {} },
        emojiPrevious: { addEventListener() {}, removeEventListener() {} },
        exampleDialog: { addEventListener() {}, removeEventListener() {} },
        genderCheckboxes: [],
        getSavedDialog() {
          return currentSavedDialog;
        },
        hairCheckboxes: [],
        helpPicker: {},
        installedDisplayQueries: [],
        openPanel() {},
        orderButtons: [],
        panelDialogs: () => [],
        renderInstallAppButton() {},
        renderSavedEmoji() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: { addEventListener() {}, removeEventListener() {} },
        skinToneCheckboxes: [],
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionModeToggle: { addEventListener() {}, removeEventListener() {} },
        versionNext: { addEventListener() {}, removeEventListener() {} },
        versionPrevious: { addEventListener() {}, removeEventListener() {} },
        versionRange: { addEventListener() {}, removeEventListener() {} },
        versionSelector: { addEventListener() {}, removeEventListener() {} },
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog() {},
        bindSavedDialogInteractions,
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
      {
        addEventListener() {},
        documentElement: { dataset: {} },
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
        removeEventListener() {},
      } as any,
      undefined,
    );

    currentSavedDialog = { dataset: { savedDialogBound: "true" } };
    expect(bindSavedDialogInteractions).not.toHaveBeenCalled();
  });
});

describe("bindExplorerEvents", () => {
  it("exposes the production dependency shape", () => {
    const dependencies = createExplorerAppEventDependencies();
    expect(typeof dependencies.bindPanelDialog).toBe("function");
  });

  it("binds against ambient browser globals and supports fallback getters", async () => {
    const bindPanelDialogCalls: any[] = [];
    const fallbackLanguagePicker = { addEventListener() {} } as any;
    const bindSavedDialogInteractionsCalls: any[] = [];
    const requestAnimationFrameCalls: Array<() => void> = [];
    let currentSavedDialog: any;
    const savedDialog = {} as any;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener() {},
        matchMedia: () => ({ addEventListener() {} }),
        requestAnimationFrame(callback: () => void) {
          requestAnimationFrameCalls.push(callback);
          callback();
        },
        setTimeout,
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        addEventListener() {},
        documentElement: { dataset: { explorerMode: "standard" } },
        querySelector(selector: string) {
          return selector === ".language-picker" ? fallbackLanguagePicker : null;
        },
        querySelectorAll() {
          return [];
        },
      },
    });

    const dialogs = [{ id: "fallback" }];
    const languageList = ["es"];
    const lifecycleCalls: string[] = [];

    bindExplorerEvents(
      {
        advancedFiltersButton: { focus() {} },
        applyBasicUrlState() {},
        applyingUrlState: false,
        clearFiltersButton: { addEventListener() {} },
        closePanel() {},
        developerModeToggle: { addEventListener() {} },
        emojiFontChoices: [],
        emojiList: { addEventListener() {} },
        emojiNext: { addEventListener() {} },
        emojiPrevious: { addEventListener() {} },
        ensureUtilityPanel(panel: string) {
          if (panel === "favorites") currentSavedDialog = savedDialog;
        },
        exampleDialog: { addEventListener() {} },
        genderCheckboxes: [],
        getAdvancedFiltersDialog() {
          return { id: "filters" };
        },
        getHelpDialog() {
          return undefined;
        },
        getLanguageDialog() {
          return undefined;
        },
        getLanguageList() {
          return languageList;
        },
        getSavedDialog() {
          return currentSavedDialog;
        },
        hairCheckboxes: [],
        helpPicker: {},
        installApp() {},
        installAppButton: { addEventListener() {} },
        installDialog: {
          close() {},
          querySelector: () => ({ addEventListener() {} }),
        },
        installedDisplayQueries: [],
        navigateEmoji() {},
        onClick() {},
        onDocumentKeyDown() {},
        onEmojiDialogClick() {},
        onEmojiDialogClose() {},
        onEmojiFocus() {},
        onEmojiKeyDown() {},
        onGenderChange() {},
        onHairChange() {},
        onOrderModeChange() {},
        onSkinToneChange() {},
        onVersionRangeInput() {},
        openPanel() {},
        orderButtons: [],
        panelDialogs: () => dialogs,
        positionFavoriteButton() {},
        refreshElements() {
          lifecycleCalls.push("refresh-elements");
        },
        renderDeveloperMode() {
          lifecycleCalls.push("render-developer-mode");
        },
        renderInstallAppButton() {},
        renderPixelFontToggle() {
          lifecycleCalls.push("render-pixel-font-toggle");
        },
        renderSavedEmoji() {},
        renderSearchLanguages() {
          lifecycleCalls.push("render-search-languages");
        },
        resetFilters() {},
        savedPicker: {},
        scheduleSearchDraw() {},
        searchText: { addEventListener() {} },
        selectEmojiFont() {},
        skinToneCheckboxes: [],
        suppressedPanelCloses: new Set(),
        syncUrlState() {},
        syncVersionRange() {},
        toggleDeveloperMode() {},
        toggleVersionMode() {},
        updateOnlineStatus() {},
        urlStateReady: true,
        versionModeToggle: { addEventListener() {} },
        versionNext: { addEventListener() {} },
        versionPrevious: { addEventListener() {} },
        versionRange: { addEventListener() {} },
        versionSelector: { addEventListener() {} },
      } as any,
      {
        audioToggle: { render() {} },
        bindModifierGroup() {},
        bindPanelDialog(options: unknown) {
          bindPanelDialogCalls.push(options);
        },
        bindSavedDialogInteractions(options: unknown) {
          bindSavedDialogInteractionsCalls.push(options);
        },
        createThemeChoiceKeyDownHandler() {
          return () => {};
        },
        themes: { getTheme: () => "dark" },
      },
    );

    expect(bindPanelDialogCalls[1].button).toBe(fallbackLanguagePicker);
    expect(bindPanelDialogCalls[1].getDialog()).toBeUndefined();
    expect(bindPanelDialogCalls[2].getDialog()).toBeUndefined();
    expect(bindPanelDialogCalls[3].getDialog()).toEqual({ id: "filters" });
    expect(bindPanelDialogCalls[1].getDialogs()).toEqual(dialogs);
    expect(bindPanelDialogCalls[1].getLanguageList()).toEqual(languageList);
    expect(bindPanelDialogCalls[0].getDialog()).toBeUndefined();
    await bindPanelDialogCalls[0].ensureDialog();
    await bindPanelDialogCalls[1].ensureDialog();
    await bindPanelDialogCalls[2].onAfterOpen();
    await bindPanelDialogCalls[2].ensureDialog();
    await bindPanelDialogCalls[3].ensureDialog();
    expect(requestAnimationFrameCalls).toHaveLength(1);
    expect(lifecycleCalls).toContain("refresh-elements");
    expect(bindSavedDialogInteractionsCalls).toHaveLength(1);
    expect(savedDialog.dataset.savedDialogBound).toBe("true");
  });

  it("does not require ambient document or window globals", () => {
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");

    expect(() =>
      bindExplorerEvents(
        {
          advancedFiltersButton: { addEventListener() {}, focus() {} },
          applyBasicUrlState() {},
          applyingUrlState: false,
          clearFiltersButton: { addEventListener() {} },
          closePanel() {},
          developerModeToggle: { addEventListener() {} },
          emojiFontChoices: [],
          emojiList: { addEventListener() {} },
          emojiNext: { addEventListener() {} },
          emojiPrevious: { addEventListener() {} },
          exampleDialog: { addEventListener() {} },
          genderCheckboxes: [],
          hairCheckboxes: [],
          helpPicker: {},
          installAppButton: { addEventListener() {} },
          installedDisplayQueries: [],
          openPanel() {},
          orderButtons: [],
          panelDialogs: () => [],
          renderInstallAppButton() {},
          renderSavedEmoji() {},
          savedPicker: {},
          scheduleSearchDraw() {},
          searchText: { addEventListener() {} },
          skinToneCheckboxes: [],
          suppressedPanelCloses: new Set(),
          syncUrlState() {},
          updateOnlineStatus() {},
          urlStateReady: true,
          versionModeToggle: { addEventListener() {} },
          versionNext: { addEventListener() {} },
          versionPrevious: { addEventListener() {} },
          versionRange: { addEventListener() {} },
          versionSelector: { addEventListener() {} },
        } as any,
        {
          audioToggle: { render() {} },
          bindModifierGroup() {},
          bindPanelDialog() {},
          bindSavedDialogInteractions() {},
          createThemeChoiceKeyDownHandler() {
            return () => {};
          },
          themes: { getTheme: () => "dark" },
        },
      ),
    ).not.toThrow();
  });
});
