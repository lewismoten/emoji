import { applyLanguagePanelParent } from "./panel-parent.js";
import {
  createExplorerNavigationDependencies,
  type ExplorerNavigationDependencies,
} from "./explorer-navigation-dependencies.js";
import type {
  Checkbox,
  ExplorerNavigationOptions,
  ExplorerPanel,
} from "./explorer-navigation-types.js";
import * as route from '../../app/route.js';
import * as state from "../../state.js";
const globalState = state;

export function createExplorerNavigation(
  options: ExplorerNavigationOptions,
  dependencies: ExplorerNavigationDependencies =
    createExplorerNavigationDependencies(),
) {
  const panelDialogs = () => {
    const dialogs = options.panelDialogs();
    return {
      dialogs,
      all: [dialogs.favorites, dialogs.help, dialogs.language, dialogs.filters] as (
        | HTMLDialogElement
        | undefined
      )[],
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
  const getUrlState = () =>
    dependencies.parseExplorerUrlState({
      search: route.getSearch(),
      developerMode: route.getIsDeveloper(),
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

  const syncUrlState = (
    method: "replace" | "push" = "replace",
    historyState?: unknown,
  ) => {
    if (!options.urlStateReady() || options.applyingUrlState()) return;
    if (!route.hasLocation() || !route.hasHistory()) return;
    const nextHistoryState =
      historyState === undefined ? route.getHistoryState() : historyState;
    const checkedValues = (checkboxes: Checkbox[]) =>
      checkboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
    const dialog = options.dialog();
    const openPanel = dependencies.getOpenPanel(options.panelDialogs());
    const explorerMode = state.getExplorerMode();
    const query = dependencies.buildExplorerUrlQuery({
      search: options.searchText().value,
      explorerMode,
      latestReleasedVersion: options.latestReleasedVersion(),
      version: options.versionSelector().value,
      versionMode: options.versionModeSelector().value as
        | "through"
        | "selected",
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
    const url = `${route.getPathName()}${query ? `?${query}` : ""}${route.getHash()}`;
    route.applyHistory(method, nextHistoryState, url);
  };

  const applyDialogUrlState = async () => {
    const state = getUrlState();
    options.setCompositionMode(state.compositionMode);
    let { dialogs, all } = panelDialogs();
    if (state.emoji && globalState.emojiByKey.get(state.emoji) !== undefined) {
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
      await options.ensurePanelDialog?.(state.panel as ExplorerPanel);
      ({ dialogs, all } = panelDialogs());
      desiredPanelDialog = dependencies.getPanelDialog(state.panel, dialogs);
    }
    applyLanguagePanelParent(dialogs, state.panel, "help");
    all.forEach((dialog) => {
      if (dialog !== desiredPanelDialog) {
        dependencies.closePanelDialog(dialog, options.suppressedPanelCloses());
      }
    });
    dependencies.ensurePanelDialogLifecycleBound?.({
      applyingUrlState: options.applyingUrlState,
      dialog: desiredPanelDialog,
      panel: state.panel as Exclude<ExplorerPanel, "">,
      suppressedPanelCloses: options.suppressedPanelCloses(),
      syncUrlState,
      urlStateReady: options.urlStateReady,
    });
    if (desiredPanelDialog && !desiredPanelDialog.open) {
      dependencies.openPanelDialog({
        panel: state.panel as Exclude<ExplorerPanel, "">,
        addHistory: false,
        dialogs,
        languageList: options.languageList(),
        renderSavedEmoji: options.renderSavedEmoji,
        syncUrlState,
      });
    }
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
  const onSkinToneChange = createExclusiveCheckboxHandler(
    options.skinToneCheckboxes,
  );
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
