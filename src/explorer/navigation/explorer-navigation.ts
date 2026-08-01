import { buildExplorerUrlQuery, parseExplorerUrlState, type ExplorerUrlState } from "./url-state.js";
import {
  applyBasicUrlStateToControls,
  applyExclusiveCheckboxSelection,
  applyLoadedUrlStateToControls,
  resetFilterControls,
  stepVersionIndex,
} from "../filters/filter-controls.js";
import {
  closePanelDialog,
  ensurePanelDialogLifecycleBound,
  getOpenPanel,
  getPanelDialog,
  openPanelDialog,
} from "../pwa-panels.js";
import { applyLanguagePanelParent } from "./panel-parent.js";

type Checkbox = { checked: boolean; value: string };

export function createExplorerNavigationDependencies() {
  return {
    applyBasicUrlStateToControls,
    applyExclusiveCheckboxSelection,
    applyLoadedUrlStateToControls,
    buildExplorerUrlQuery,
    closePanelDialog,
    ensurePanelDialogLifecycleBound,
    getOpenPanel,
    getPanelDialog,
    openPanelDialog,
    parseExplorerUrlState,
    resetFilterControls,
    stepVersionIndex,
  };
}

export function createExplorerNavigation(
  options: {
    allowedSequenceTypes: string[];
    applyingUrlState: () => boolean;
    closeEmojiDialog: () => void;
    compositionMode: () => "condensed" | "full";
    developerModeEnabled: () => boolean;
    fullDeveloperModeEnabled: () => boolean;
    dialog: () => HTMLDialogElement;
    currentEmojiKey: () => string;
    drawList: () => void;
    ensurePanelDialog?: (
      panel: "" | "favorites" | "help" | "language" | "filters",
    ) => Promise<void> | void;
    emojiByKey: () => Record<string, string>;
    genderCheckboxes: () => Checkbox[];
    getOrderMode: () => "grouped" | "popular" | "unicode" | "sequence";
    groups: () => string[];
    getSelectedGroup: () => string;
    getSelectedSequenceType: () => string;
    getSelectedSubGroup: () => string;
    hairCheckboxes: () => Checkbox[];
    helpDialog: () => HTMLDialogElement | undefined;
    latestReleasedVersion: () => string | undefined;
    navigateEmoji: (amount: number) => void;
    openEmoji: (
      key: string,
      openDialog?: boolean,
      navigationKeys?: string[],
      initialMode?: ExplorerUrlState["emojiMode"],
    ) => void;
    orderButtons: () => any[];
    panelDialogs: () => any;
    languageList: () => HTMLElement | undefined;
    preferredOrder: () => string;
    renderCategoryFilters: () => void;
    renderSavedEmoji: () => void;
    renderVersionModeToggle: () => void;
    searchText: () => HTMLInputElement;
    setCompositionMode: (mode: "condensed" | "full") => void;
    setDialogView: (
      mode: ExplorerUrlState["emojiMode"],
      updateUrl: boolean,
    ) => void;
    setOrderMode: (
      mode: "grouped" | "popular" | "unicode" | "sequence",
    ) => void;
    setSelectedGroup: (value: string) => void;
    setSelectedSequenceType: (value: string) => void;
    setSelectedSubGroup: (value: string) => void;
    showEmojiDialog: () => void;
    skinToneCheckboxes: () => Checkbox[];
    subGroupSelectionKey: (group: string, subGroup: string) => string;
    subGroups: () => Record<string, string[]>;
    suppressedPanelCloses: () => WeakSet<HTMLDialogElement>;
    syncVersionRange: () => void;
    urlStateReady: () => boolean;
    versionModeSelector: () => HTMLSelectElement;
    versionRange: () => HTMLInputElement;
    versionSelector: () => HTMLSelectElement;
  },
  dependencies = createExplorerNavigationDependencies(),
) {
  const resolveExplorerMode = (): "standard" | "advanced" | "developer" => {
    const datasetMode =
      typeof document === "undefined"
        ? ""
        : (document.documentElement?.dataset?.explorerMode ?? "");
    if (
      datasetMode === "standard" ||
      datasetMode === "advanced" ||
      datasetMode === "developer"
    ) {
      return datasetMode;
    }
    if (options.fullDeveloperModeEnabled?.()) return "developer";
    if (options.developerModeEnabled()) return "advanced";
    return "standard";
  };
  const panelDialogs = () => {
    const dialogs = options.panelDialogs();
    return {
      dialogs,
      all: [dialogs.favorites, dialogs.help, dialogs.language, dialogs.filters] as (HTMLDialogElement | undefined)[],
    };
  };
  const createExclusiveCheckboxHandler =
    (checkboxes: () => Checkbox[]) => (event: Event) => {
      dependencies.applyExclusiveCheckboxSelection(
        checkboxes(),
        event.currentTarget as unknown as Checkbox,
      );
      options.drawList();
    };
  const getWindowLocation = () => (typeof window === "undefined" ? undefined : window.location);
  const getWindowHistory = () => (typeof window === "undefined" ? undefined : window.history);
  const getUrlState = () =>
    dependencies.parseExplorerUrlState({
      search: getWindowLocation()?.search ?? "",
      developerMode: resolveExplorerMode() !== "standard",
      preferredOrder: options.preferredOrder(),
      allowedSequenceTypes: options.allowedSequenceTypes,
    });

  const applyBasicUrlState = () => {
    const nextState = dependencies.applyBasicUrlStateToControls({
      state: getUrlState(),
      searchText: options.searchText(),
      orderButtons: options.orderButtons(),
    });
    options.setOrderMode(nextState.orderMode);
    options.setSelectedSequenceType(nextState.selectedSequenceType);
    options.setCompositionMode(nextState.compositionMode);
  };

  const applyLoadedUrlState = () => {
    const selections = dependencies.applyLoadedUrlStateToControls({
      state: getUrlState(),
      versionSelector: options.versionSelector(),
      versionModeSelector: options.versionModeSelector(),
      groups: options.groups(),
      subGroups: options.subGroups(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      genderCheckboxes: options.genderCheckboxes(),
      subGroupSelectionKey: options.subGroupSelectionKey,
    });
    options.setSelectedGroup(selections.selectedGroup);
    options.setSelectedSubGroup(selections.selectedSubGroup);
    options.renderVersionModeToggle();
    options.syncVersionRange();
  };
  const applyDialogUrlState = async () => {
    const state = getUrlState();
    options.setCompositionMode(state.compositionMode);
    let { dialogs, all } = panelDialogs();
    if (state.emoji && options.emojiByKey()[state.emoji] !== undefined) {
      all.forEach((dialog) =>
        dependencies.closePanelDialog(dialog, options.suppressedPanelCloses()),
      );
      options.openEmoji(state.emoji, true, undefined, state.emojiMode);
      if (!options.dialog().open) options.showEmojiDialog();
      return;
    }
    if (options.dialog().open) options.closeEmojiDialog();
    let desiredPanelDialog = dependencies.getPanelDialog(state.panel, dialogs);
    if (!desiredPanelDialog && state.panel) {
      await options.ensurePanelDialog?.(
        state.panel as "" | "favorites" | "help" | "language" | "filters",
      );
      ({ dialogs, all } = panelDialogs());
      desiredPanelDialog = dependencies.getPanelDialog(state.panel, dialogs);
    }
    applyLanguagePanelParent(dialogs, state.panel, "help");
    all.forEach((dialog) => {
    if (dialog !== desiredPanelDialog)
        dependencies.closePanelDialog(dialog, options.suppressedPanelCloses());
    });
    dependencies.ensurePanelDialogLifecycleBound?.({
      applyingUrlState: options.applyingUrlState,
      dialog: desiredPanelDialog,
      panel: state.panel as "favorites" | "help" | "language" | "filters",
      suppressedPanelCloses: options.suppressedPanelCloses(),
      syncUrlState,
      urlStateReady: options.urlStateReady,
    });
    if (desiredPanelDialog && !desiredPanelDialog.open) {
      dependencies.openPanelDialog({
        panel: state.panel as "favorites" | "help" | "language" | "filters",
        addHistory: false,
        dialogs,
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState,
      });
    }
  };
  const syncUrlState = (
    method: "replace" | "push" = "replace",
    historyState = getWindowHistory()?.state,
  ) => {
    if (!options.urlStateReady() || options.applyingUrlState()) return;
    const location = getWindowLocation();
    const history = getWindowHistory();
    if (!location || !history) return;
    const checkedValues = (checkboxes: Checkbox[]) =>
      checkboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
    const dialog = options.dialog();
    const openPanel = dependencies.getOpenPanel(options.panelDialogs());
    const explorerMode = resolveExplorerMode();
    const query = dependencies.buildExplorerUrlQuery({
      search: options.searchText().value,
      explorerMode,
      latestReleasedVersion: options.latestReleasedVersion(),
      version: options.versionSelector().value,
      versionMode: options.versionModeSelector().value as
        "through" | "selected",
      order: options.getOrderMode(),
      group: options.getSelectedGroup(),
      subGroup: options.getSelectedSubGroup(),
      sequenceType: options.getSelectedSequenceType(),
      skin: checkedValues(options.skinToneCheckboxes()),
      hair: checkedValues(options.hairCheckboxes()),
      gender: checkedValues(options.genderCheckboxes()),
      compositionMode: options.compositionMode(),
      currentEmojiKey: options.currentEmojiKey(),
      emojiMode: dialog.classList.contains("is-editor-view")
        ? "editor"
        : dialog.classList.contains("is-code-view")
          ? "code"
          : "details",
      panel: openPanel,
      dialogOpen: dialog.open,
    });
    const url = `${location.pathname}${query ? `?${query}` : ""}${location.hash}`;
    history[`${method}State`](historyState, "", url);
  };
  const resetFilters = () => {
    dependencies.resetFilterControls({
      searchText: options.searchText(),
      versionModeSelector: options.versionModeSelector(),
      versionSelector: options.versionSelector(),
      latestReleasedVersion: options.latestReleasedVersion(),
      skinToneCheckboxes: options.skinToneCheckboxes(),
      hairCheckboxes: options.hairCheckboxes(),
      genderCheckboxes: options.genderCheckboxes(),
    });
    options.setSelectedGroup("");
    options.setSelectedSubGroup("");
    options.setSelectedSequenceType("");
    options.renderVersionModeToggle();
    options.syncVersionRange();
    options.renderCategoryFilters();
    options.drawList();
    options.searchText().focus();
  };
  const onGenderChange = createExclusiveCheckboxHandler(options.genderCheckboxes);
  const onSkinToneChange = createExclusiveCheckboxHandler(options.skinToneCheckboxes);
  const onHairChange = createExclusiveCheckboxHandler(options.hairCheckboxes);
  const stepVersion = (amount: number) => {
    const range = options.versionRange();
    const nextIndex = dependencies.stepVersionIndex(
      Number(range.value),
      options.versionSelector().options.length,
      amount,
    );
    if (nextIndex === Number(range.value)) return;
    range.value = String(nextIndex);
    range.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const onDocumentKeyDown = (event: KeyboardEvent) => {
    const activeTag = document.activeElement?.tagName;
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag ?? "");
    const hasOpenDialog = Boolean(document.querySelector("dialog[open]"));
    if (event.key === "?" && !isTyping && !hasOpenDialog && options.helpDialog()) {
      event.preventDefault();
      dependencies.openPanelDialog({
        panel: "help",
        dialogs: options.panelDialogs(),
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState,
      });
      return;
    }
    if (event.key === "/" && !isTyping && !hasOpenDialog) {
      event.preventDefault();
      options.searchText().focus();
      return;
    }
    if (event.key === "Escape" && !hasOpenDialog && options.searchText().value) {
      options.searchText().value = "";
      options.drawList();
      options.searchText().focus();
      return;
    }
    if (!options.dialog().open || isTyping) return;
    const rtl = document.documentElement.dir === "rtl";
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const previous = event.key === "ArrowLeft";
      options.navigateEmoji((previous ? -1 : 1) * (rtl ? -1 : 1));
    }
  };
  return {
    applyBasicUrlState,
    applyDialogUrlState,
    applyLoadedUrlState,
    onDocumentKeyDown,
    onGenderChange,
    onHairChange,
    onSkinToneChange,
    resetFilters,
    stepVersion,
    syncUrlState,
  };
}
