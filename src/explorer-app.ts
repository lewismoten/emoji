import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  createThemeChoiceKeyDownHandler,
} from "./explorer/navigation/event-accessibility.js";
import {
  finalizeExplorerStartup as finalizeExplorerStartupHelper,
  initializeExplorerControls as initializeExplorerControlsHelper,
} from "./explorer/control-startup.js";
import { bindPanelDialog } from "./explorer/pwa-panels.js";

type ApplicationWindow = {
  addEventListener(type: "load", listener: () => void): void;
  document: { readyState: string };
};

/**
 * The Explorer composition root. Feature modules remain independent; this
 * controller owns only application lifecycle and will gradually take over the
 * orchestration currently living in the legacy entry point.
 */
export function createExplorerApp(options: {
  window: ApplicationWindow;
  start: () => Promise<void> | void;
}) {
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    await options.start();
  };

  return {
    start,
    startWhenReady() {
      if (options.window.document.readyState === "complete") {
        void start();
        return;
      }
      options.window.addEventListener("load", () => void start());
    },
  };
}

/** Bind browser events after the Explorer has resolved its DOM references. */
export function bindExplorerEvents(options: any) {
  const getSavedDialog = () => options.getSavedDialog?.() ?? options.savedDialog;
  const getHelpDialog = () => options.getHelpDialog?.() ?? options.helpDialog;
  const getLanguageDialog = () =>
    options.getLanguageDialog?.() ?? options.languageDialog;
  const getAdvancedFiltersDialog = () =>
    options.getAdvancedFiltersDialog?.() ?? options.advancedFilters;
  const getLanguageList = () =>
    options.getLanguageList?.() ?? options.languageList;

  const syncDialogChoiceGroup = (
    dialog: HTMLElement | undefined | null,
    selector: string,
    datasetKey: string,
    selectedValue: string,
  ) => {
    if (!dialog) return;
    const choices = Array.from(
      dialog.querySelectorAll<HTMLElement>(selector),
    );
    choices.forEach((choice) => {
      const selected = choice.dataset[datasetKey] === selectedValue;
      choice.classList.toggle("is-active", selected);
      choice.setAttribute("aria-pressed", String(selected));
      choice.setAttribute("aria-checked", String(selected));
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
    });
  };

  const bindThemeChoices = () => {
    const choices = Array.from(
      document.querySelectorAll<HTMLElement>(".theme-choice"),
    );
    if (choices.length === 0) return;
    const onKeyDown = createThemeChoiceKeyDownHandler(choices);
    choices.forEach((choice) => {
      if (choice.dataset.themeBound === "true") return;
      choice.dataset.themeBound = "true";
      choice.addEventListener("click", options.selectTheme);
      choice.addEventListener("keydown", onKeyDown);
    });
  };

  const bindModeChoices = () => {
    const choices = Array.from(
      document.querySelectorAll<HTMLElement>(".mode-choice"),
    );
    if (choices.length === 0) return;
    const onKeyDown = createThemeChoiceKeyDownHandler(choices);
    choices.forEach((choice) => {
      if (choice.dataset.modeBound === "true") return;
      choice.dataset.modeBound = "true";
      choice.addEventListener("click", options.toggleDeveloperMode);
      choice
        .querySelector?.('input[type="radio"]')
        ?.addEventListener("change", options.toggleDeveloperMode);
      choice.addEventListener("keydown", onKeyDown);
    });
  };

  const bindLanguagePicker = () => {
    const button = document.querySelector<HTMLElement>(".language-picker");
    if (!button || button.dataset.panelBound === "true") return;
    button.dataset.panelBound = "true";
    bindPanelDialog({
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
            languageDialog.dataset.returnPanel = "help";
          }
          options.closePanel(helpDialog, options.suppressedPanelCloses);
        } else if (languageDialog) {
          delete languageDialog.dataset.returnPanel;
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

  const ensurePanelReady = async (panel: string) => {
    await options.ensureUtilityPanel?.(panel);
    options.refreshElements?.();
    options.renderDeveloperMode?.();
    options.renderThemeToggle?.();
    options.renderPixelFontToggle?.();
    options.renderSoundEffectsToggle?.();
    options.renderMusicToggle?.();
    options.renderSearchLanguages?.();
    bindThemeChoices();
    bindModeChoices();
    bindLanguagePicker();
    if (panel === "favorites" && getSavedDialog()) {
      const dialog = getSavedDialog();
      if (dialog && dialog.dataset.savedDialogBound !== "true") {
        dialog.dataset.savedDialogBound = "true";
        bindSavedDialogInteractions({
          ...options,
          savedDialog: dialog,
        });
      }
    }
  };
  window.addEventListener("online", options.updateOnlineStatus);
  window.addEventListener("offline", options.updateOnlineStatus);
  window
    .matchMedia("(max-width: 560px)")
    .addEventListener("change", options.positionFavoriteButton);
  options.updateOnlineStatus();
  options.renderInstallAppButton();
  options.applyBasicUrlState();

  bindModifierGroup(options.skinToneCheckboxes, options.onSkinToneChange);
  bindModifierGroup(options.hairCheckboxes, options.onHairChange);
  bindModifierGroup(options.genderCheckboxes, options.onGenderChange);
  options.searchText.addEventListener("input", options.scheduleSearchDraw);
  bindPanelDialog({
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
  bindPanelDialog({
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
          window.requestAnimationFrame(() => resolve()),
        );
      }
      options.refreshElements?.();
      options.renderDeveloperMode?.();
      options.renderThemeToggle?.();
      options.renderSoundEffectsToggle?.();
      options.renderMusicToggle?.();
      const helpDialog = getHelpDialog();
      syncDialogChoiceGroup(
        helpDialog,
        ".theme-choice",
        "theme",
        document.documentElement.dataset.theme ?? "dark",
      );
      syncDialogChoiceGroup(
        helpDialog,
        ".mode-choice",
        "mode",
        document.documentElement.dataset.explorerMode ?? "standard",
      );
    },
    openPanel: options.openPanel,
    panel: "help",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  bindPanelDialog({
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
  if (!(options.modeChoices?.length)) {
    options.developerModeToggle?.addEventListener(
      "change",
      options.toggleDeveloperMode,
    );
  }
  bindModeChoices();
  bindLanguagePicker();
  if (getSavedDialog()) {
    bindSavedDialogInteractions({
      ...options,
      savedDialog: getSavedDialog(),
    });
    getSavedDialog().dataset.savedDialogBound = "true";
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

/** Create the dynamic filter controls after the static page has loaded. */
export function initializeExplorerControls(options: any) {
  return initializeExplorerControlsHelper(options);
}

/** Complete the asynchronous page startup once controls and events exist. */
export async function finalizeExplorerStartup(options: any) {
  await finalizeExplorerStartupHelper(options);
}
