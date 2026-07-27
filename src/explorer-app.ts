import {
  bindModifierGroup,
  bindSavedDialogInteractions,
  createThemeChoiceKeyDownHandler,
} from "./explorer/event-accessibility.js";
import {
  finalizeExplorerStartup as finalizeExplorerStartupHelper,
  initializeExplorerControls as initializeExplorerControlsHelper,
} from "./explorer/control-startup.js";

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
  const panel = (name: string) =>
    options.openPanel({
      panel: name,
      dialogs: options.panelDialogs(),
      languageList: options.languageList,
      renderSavedEmoji: options.renderSavedEmoji,
      syncUrlState: options.syncUrlState,
    });
  const onPanelClose = (event: Event) =>
    options.onPanelClose({
      event,
      suppressedPanelCloses: options.suppressedPanelCloses,
      urlStateReady: options.urlStateReady(),
      applyingUrlState: options.applyingUrlState(),
      syncUrlState: options.syncUrlState,
    });
  const onThemeChoiceKeyDown = createThemeChoiceKeyDownHandler(
    options.themeChoices ?? [],
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
  options.languagePicker.addEventListener("click", () => {
    if (options.helpDialog?.open) {
      if (options.languageDialog) {
        options.languageDialog.dataset.returnPanel = "help";
      }
      options.closePanel(options.helpDialog, options.suppressedPanelCloses);
    } else if (options.languageDialog) {
      delete options.languageDialog.dataset.returnPanel;
    }
    panel("language");
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
  options.savedPicker?.addEventListener("click", () => panel("favorites"));
  options.helpPicker?.addEventListener("click", () => panel("help"));
  options.developerModeToggle?.addEventListener(
    "change",
    options.toggleDeveloperMode,
  );
  options.languageDialog.addEventListener("close", onPanelClose);
  options.savedDialog?.addEventListener("close", onPanelClose);
  options.helpDialog?.addEventListener("close", onPanelClose);
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
  options.advancedFiltersButton?.addEventListener("click", () => {
    options.openPanel({
      panel: "filters",
      dialogs: options.panelDialogs(),
      languageList: options.languageList,
      renderSavedEmoji: options.renderSavedEmoji,
      syncUrlState: options.syncUrlState,
    });
  });
  options.advancedFilters?.addEventListener("close", () => {
    options.advancedFiltersButton?.focus();
  });
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
