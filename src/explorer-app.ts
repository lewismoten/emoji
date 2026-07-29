import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  createThemeChoiceKeyDownHandler,
} from "./explorer/event-accessibility.js";
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
  const onThemeChoiceKeyDown = createThemeChoiceKeyDownHandler(
    options.themeChoices ?? [],
  );
  const onModeChoiceKeyDown = createThemeChoiceKeyDownHandler(
    options.modeChoices ?? [],
  );

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
    button: options.languagePicker,
    dialog: options.languageDialog,
    dialogs: options.panelDialogs(),
    languageList: options.languageList,
    onBeforeOpen: () => {
      if (options.helpDialog?.open) {
        if (options.languageDialog) {
          options.languageDialog.dataset.returnPanel = "help";
        }
        options.closePanel(options.helpDialog, options.suppressedPanelCloses);
      } else if (options.languageDialog) {
        delete options.languageDialog.dataset.returnPanel;
      }
    },
    openPanel: options.openPanel,
    panel: "language",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  bindPanelDialog({
    applyingUrlState: options.applyingUrlState,
    button: options.savedPicker,
    dialog: options.savedDialog,
    dialogs: options.panelDialogs(),
    languageList: options.languageList,
    openPanel: options.openPanel,
    panel: "favorites",
    renderSavedEmoji: options.renderSavedEmoji,
    suppressedPanelCloses: options.suppressedPanelCloses,
    syncUrlState: options.syncUrlState,
    urlStateReady: options.urlStateReady,
  });
  bindPanelDialog({
    applyingUrlState: options.applyingUrlState,
    button: options.helpPicker,
    dialog: options.helpDialog,
    dialogs: options.panelDialogs(),
    languageList: options.languageList,
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
    dialog: options.advancedFilters,
    dialogs: options.panelDialogs(),
    languageList: options.languageList,
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
  options.themeChoices?.forEach((choice: any) =>
    choice.addEventListener("click", options.selectTheme),
  );
  options.themeChoices?.forEach((choice: any) =>
    choice.addEventListener("keydown", onThemeChoiceKeyDown),
  );
  options.installAppButton?.addEventListener("click", options.installApp);
  options.installedDisplayQueries.forEach((query: any) =>
    query.addEventListener?.("change", options.renderInstallAppButton),
  );
  options.installDialog
    ?.querySelector(".install-dialog-close")
    ?.addEventListener("click", () => options.installDialog.close());
  if (options.modeChoices?.length) {
    options.modeChoices.forEach((choice: any) =>
      choice.addEventListener("click", options.toggleDeveloperMode),
    );
    options.modeChoices.forEach((choice: any) =>
      choice
        .querySelector?.('input[type="radio"]')
        ?.addEventListener("change", options.toggleDeveloperMode),
    );
    options.modeChoices.forEach((choice: any) =>
      choice.addEventListener("keydown", onModeChoiceKeyDown),
    );
  } else {
    options.developerModeToggle?.addEventListener(
      "change",
      options.toggleDeveloperMode,
    );
  }
  bindSavedDialogInteractions(options);
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
