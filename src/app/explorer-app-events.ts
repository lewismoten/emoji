import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  createThemeChoiceKeyDownHandler,
} from "../explorer/navigation/event-accessibility.js";
import { bindPanelDialog } from "../explorer/pwa/pwa-panels.js";
import * as audioToggle from "../controls/audio/audio-toggle.js";
import * as themes from "../utils/themes.js";
import * as aria from "../utils/aria.js";

export function createExplorerAppEventDependencies() {
  return {
    audioToggle,
    bindModifierGroup,
    bindPanelDialog,
    bindSavedDialogInteractions,
    createThemeChoiceKeyDownHandler,
    themes,
  };
}

/** Bind browser events after the Explorer has resolved its DOM references. */
export function bindExplorerEvents(
  options: any,
  dependencies: any = createExplorerAppEventDependencies(),
) {
  const documentRef = typeof document === "undefined" ? undefined : document;
  const windowRef = typeof window === "undefined" ? undefined : window;
  const getSavedDialog = () =>
    options.getSavedDialog?.() ?? options.savedDialog;
  const getHelpDialog = () => options.getHelpDialog?.() ?? options.helpDialog;
  const getLanguageDialog = () =>
    options.getLanguageDialog?.() ?? options.languageDialog;
  const getAdvancedFiltersDialog = () =>
    options.getAdvancedFiltersDialog?.() ?? options.advancedFilters;
  const getLanguageList = () =>
    options.getLanguageList?.() ?? options.languageList;
  const ensureDataset = (value: unknown) => {
    if (!value || typeof value !== "object") return undefined;
    const target = value as { dataset?: Record<string, string> };
    if (target.dataset) return target.dataset;
    target.dataset = {};
    return target.dataset;
  };
  const getChoices = (selector: string) =>
    Array.from(documentRef?.querySelectorAll?.<HTMLElement>(selector) ?? []);

  const syncDialogChoiceGroup = (
    dialog: HTMLElement | undefined | null,
    selector: string,
    datasetKey: string,
    selectedValue: string,
  ) => {
    if (!dialog) return;
    const choices = Array.from(dialog.querySelectorAll<HTMLElement>(selector));
    choices.forEach(renderChoiceSelected(datasetKey, selectedValue));
  };

  const renderChoiceSelected =
    (datasetKey: string, selectedValue: string) => (choice: HTMLElement) => {
      const selected = choice.dataset[datasetKey] === selectedValue;
      choice.classList.toggle("is-active", selected);
      aria.setPressed(choice, selected);
      aria.setChecked(choice, selected);
      choice.tabIndex = selected ? 0 : -1;
      const input = choice.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement | null;
      if (input) {
        input.checked = selected;
        input.defaultChecked = selected;
        if (selected) input.setAttribute("checked", "checked");
        else input.removeAttribute("checked");
      }
    };

  const bindThemeChoices = () => {
    const choices = getChoices(".theme-choice");
    if (choices.length === 0) return;
    const onKeyDown = createThemeChoiceKeyDownHandler(choices);
    choices.forEach(bindChoiceEvents(onKeyDown, options.selectTheme));
  };

  const bindModeChoices = () => {
    const choices = getChoices(".mode-choice");
    if (choices.length === 0) return;
    const onKeyDown = createThemeChoiceKeyDownHandler(choices);
    choices.forEach(bindChoiceEvents(onKeyDown, options.toggleDeveloperMode));
  };

  const bindChoiceEvents =
    (onKeyDown: (event: KeyboardEvent) => void, toggleCallback: () => void) =>
    (choice: HTMLElement) => {
      if (choice.dataset.modeBound === "true") return;
      choice.dataset.modeBound = "true";
      choice.addEventListener("click", toggleCallback);
      choice.addEventListener("keydown", onKeyDown);
      choice
        .querySelector?.('input[type="radio"]')
        ?.addEventListener("change", toggleCallback);
    };

  const ensurePanelReady = async (panel: string) => {
    await options.ensureUtilityPanel?.(panel);
    options.refreshElements?.();
    options.renderDeveloperMode?.();
    options.renderThemeToggle?.();
    options.renderPixelFontToggle?.();
    dependencies.audioToggle.render();
    options.renderSearchLanguages?.();
    bindThemeChoices();
    bindModeChoices();
    bindLanguagePicker();
    if (panel === "favorites" && getSavedDialog()) {
      const dialog = getSavedDialog();
      const dialogDataset = dialog ? ensureDataset(dialog) : undefined;
      if (dialog && dialogDataset?.savedDialogBound !== "true") {
        if (dialogDataset) dialogDataset.savedDialogBound = "true";
        dependencies.bindSavedDialogInteractions({
          ...options,
          savedDialog: dialog,
        });
      }
    }
  };

  const bindLanguagePicker = () => {
    const button =
      (typeof options.languagePicker === "function"
        ? options.languagePicker()
        : options.languagePicker) ??
      documentRef?.querySelector?.<HTMLElement>(".language-picker");
    if (!button) return;
    const buttonDataset =
      "dataset" in button && button.dataset
        ? button.dataset
        : ((
            button as HTMLElement & { dataset: Record<string, string> }
          ).dataset = {});
    if (buttonDataset.panelBound === "true") return;
    buttonDataset.panelBound = "true";
    dependencies.bindPanelDialog({
      applyingUrlState: options.applyingUrlState,
      button,
      dialog: getLanguageDialog(),
      ensureDialog: () => ensurePanelReady("language"),
      getDialog: getLanguageDialog,
      getDialogs: () => options.panelDialogs(),
      getLanguageList,
      onBeforeOpen: () => {
        const helpDialog = getHelpDialog();
        const languageDialog = getLanguageDialog();
        if (helpDialog?.open) {
          if (languageDialog) {
            ensureDataset(languageDialog)!.returnPanel = "help";
          }
          options.closePanel(helpDialog, options.suppressedPanelCloses);
        } else if (languageDialog && ensureDataset(languageDialog)) {
          delete ensureDataset(languageDialog)!.returnPanel;
        }
      },
      openPanel: options.openPanel,
      panel: "language",
      renderSavedEmoji: options.renderSavedEmoji,
      suppressedPanelCloses: options.suppressedPanelCloses,
      syncUrlState: options.syncUrlState,
      urlStateReady: options.urlStateReady,
    });
  };

  windowRef?.addEventListener("online", options.updateOnlineStatus);
  windowRef?.addEventListener("offline", options.updateOnlineStatus);
  windowRef
    ?.matchMedia?.("(max-width: 560px)")
    ?.addEventListener?.("change", options.positionFavoriteButton);
  options.updateOnlineStatus();
  options.renderInstallAppButton();
  options.applyBasicUrlState();

  dependencies.bindModifierGroup(
    options.skinToneCheckboxes,
    options.onSkinToneChange,
  );
  dependencies.bindModifierGroup(options.hairCheckboxes, options.onHairChange);
  dependencies.bindModifierGroup(
    options.genderCheckboxes,
    options.onGenderChange,
  );
  options.searchText.addEventListener("input", options.scheduleSearchDraw);
  dependencies.bindPanelDialog({
    applyingUrlState: options.applyingUrlState,
    button: options.savedPicker,
    dialog: getSavedDialog(),
    ensureDialog: () => ensurePanelReady("favorites"),
    getDialog: getSavedDialog,
    getDialogs: () => options.panelDialogs(),
    getLanguageList,
    openPanel: options.openPanel,
    panel: "favorites",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  bindLanguagePicker();
  dependencies.bindPanelDialog({
    applyingUrlState: options.applyingUrlState,
    button: options.helpPicker,
    dialog: getHelpDialog(),
    ensureDialog: () => ensurePanelReady("help"),
    getDialog: getHelpDialog,
    getDialogs: () => options.panelDialogs(),
    getLanguageList,
    onAfterOpen: async () => {
      if (typeof window !== "undefined") {
        await new Promise<void>((resolve) =>
          typeof window.requestAnimationFrame === "function"
            ? window.requestAnimationFrame(() => resolve())
            : window.setTimeout(resolve, 0),
        );
      }
      options.refreshElements?.();
      options.renderDeveloperMode?.();
      options.renderThemeToggle?.();
      dependencies.audioToggle.render();
      const helpDialog = getHelpDialog();
      syncDialogChoiceGroup(
        helpDialog,
        ".theme-choice",
        "theme",
        dependencies.themes.getTheme(),
      );
      syncDialogChoiceGroup(
        helpDialog,
        ".mode-choice",
        "mode",
        documentRef?.documentElement?.dataset?.explorerMode ?? "standard",
      );
    },
    openPanel: options.openPanel,
    panel: "help",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  dependencies.bindPanelDialog({
    applyingUrlState: options.applyingUrlState,
    button: options.advancedFiltersButton,
    dialog: getAdvancedFiltersDialog(),
    ensureDialog: () => ensurePanelReady("filters"),
    getDialog: getAdvancedFiltersDialog,
    getDialogs: () => options.panelDialogs(),
    getLanguageList,
    onAfterClose: () => {
      options.advancedFiltersButton?.focus();
    },
    openPanel: options.openPanel,
    panel: "filters",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  options.emojiFontChoices.forEach((choice: any) =>
    choice.addEventListener("click", options.selectEmojiFont),
  );
  bindThemeChoices();
  options.installAppButton?.addEventListener("click", options.installApp);
  options.installedDisplayQueries.forEach((query: any) =>
    query.addEventListener?.("change", options.renderInstallAppButton),
  );
  options.installDialog
    ?.querySelector(".install-dialog-close")
    ?.addEventListener("click", () => options.installDialog.close());
  if (!options.modeChoices?.length) {
    options.developerModeToggle?.addEventListener(
      "change",
      options.toggleDeveloperMode,
    );
  }
  bindModeChoices();
  bindLanguagePicker();
  if (getSavedDialog()) {
    const savedDialogDataset = ensureDataset(getSavedDialog());
    dependencies.bindSavedDialogInteractions({
      ...options,
      savedDialog: getSavedDialog(),
    });
    if (savedDialogDataset) savedDialogDataset.savedDialogBound = "true";
  }
  options.emojiList.addEventListener("click", options.onClick);
  options.emojiList.addEventListener("focusin", options.onEmojiFocus);
  options.emojiList.addEventListener("keydown", options.onEmojiKeyDown);
  options.exampleDialog.addEventListener("click", options.onEmojiDialogClick);
  options.exampleDialog.addEventListener("close", options.onEmojiDialogClose);
  options.versionModeToggle?.addEventListener(
    "click",
    options.toggleVersionMode,
  );
  options.versionPrevious?.addEventListener("click", () =>
    options.stepVersion(-1),
  );
  options.versionNext?.addEventListener("click", () => options.stepVersion(1));
  options.clearFiltersButton?.addEventListener("click", options.resetFilters);
  options.emojiPrevious?.addEventListener("click", () =>
    options.navigateEmoji(-1),
  );
  options.emojiNext?.addEventListener("click", () => options.navigateEmoji(1));
  options.versionSelector.addEventListener("change", () => {
    options.syncVersionRange();
    options.drawList();
  });
  options.versionRange?.addEventListener("input", options.onVersionRangeInput);
  options.orderButtons.forEach((button: any) =>
    button.addEventListener("click", options.onOrderModeChange),
  );
  document.addEventListener("keydown", options.onDocumentKeyDown);
}
