import * as bind from "./emoji-wire-up.js";
import {
  bindChoiceGroup,
  bindDeveloperModeToggleIfNeeded,
  bindInstallDialogClose,
  bindSavedDialogInteractionsIfPresent,
  bindSavedDialogInteractionsIfUnbound,
  createHelpAfterOpen,
  createLanguageBeforeOpen,
  ensurePanelBound,
  resolveLanguagePickerButton,
  resolveOption,
} from "./explorer-app-events-helpers.js";

type DocumentLike = Pick<
  Document,
  | "documentElement"
  | "addEventListener"
  | "removeEventListener"
  | "querySelector"
  | "querySelectorAll"
> & {
  documentElement: Pick<Document["documentElement"], "dataset">;
};

type WindowLike = Pick<
  Window,
  | "addEventListener"
  | "removeEventListener"
  | "matchMedia"
  | "requestAnimationFrame"
  | "setTimeout"
>;

export const bindExplorerEventsWithEnvironment = (
  options: any,
  dependencies: any,
  documentRef: DocumentLike | undefined,
  windowRef: WindowLike | undefined,
): Function => {
  const bound: Function[] = [];
  const getSavedDialog = () =>
    resolveOption(options.getSavedDialog, options.savedDialog);
  const getHelpDialog = () =>
    resolveOption(options.getHelpDialog, options.helpDialog);
  const getLanguageDialog = () =>
    resolveOption(options.getLanguageDialog, options.languageDialog);
  const getAdvancedFiltersDialog = () =>
    resolveOption(options.getAdvancedFiltersDialog, options.advancedFilters);
  const getLanguageList = () =>
    resolveOption(options.getLanguageList, options.languageList);

  const bindThemeChoices = () => {
    bindChoiceGroup(
      documentRef,
      ".theme-choice",
      options.selectTheme,
      dependencies.createThemeChoiceKeyDownHandler,
    );
  };

  const bindModeChoices = () => {
    bindChoiceGroup(
      documentRef,
      ".mode-choice",
      options.toggleDeveloperMode,
      dependencies.createThemeChoiceKeyDownHandler,
    );
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
    bindSavedDialogInteractionsIfUnbound(
      panel === "favorites" ? getSavedDialog() : undefined,
      options,
      dependencies.bindSavedDialogInteractions,
    );
  };

  const bindLanguagePicker = () => {
    const button = resolveLanguagePickerButton(
      options.languagePicker,
      documentRef,
    );
    if (!button) return;
    if (!ensurePanelBound(button)) return;

    dependencies.bindPanelDialog({
      applyingUrlState: options.applyingUrlState,
      button,
      dialog: getLanguageDialog(),
      ensureDialog: () => ensurePanelReady("language"),
      getDialog: getLanguageDialog,
      getDialogs: () => options.panelDialogs(),
      getLanguageList,
      onBeforeOpen: createLanguageBeforeOpen(
        getHelpDialog,
        getLanguageDialog,
        options.closePanel,
        options.suppressedPanelCloses,
      ),
      openPanel: options.openPanel,
      panel: "language",
      renderSavedEmoji: options.renderSavedEmoji,
      suppressedPanelCloses: options.suppressedPanelCloses,
      syncUrlState: options.syncUrlState,
      urlStateReady: options.urlStateReady,
    });
  };

  bind.online(windowRef, options.updateOnlineStatus);
  bind.offline(windowRef, options.updateOnlineStatus);
  bind.change(
    windowRef?.matchMedia?.("(max-width: 560px)"),
    options.positionFavoriteButton,
  );
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
  bound.push(bind.input(options.searchText, options.scheduleSearchDraw));
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
    onAfterOpen: createHelpAfterOpen(
      windowRef,
      documentRef,
      dependencies,
      options,
      getHelpDialog,
    ),
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
    bound.push(bind.click(choice, options.selectEmojiFont)),
  );
  bindThemeChoices();
  bound.push(bind.click(options.installAppButton, options.installApp));
  options.installedDisplayQueries.forEach((query: any) =>
    bound.push(bind.change(query, options.renderInstallAppButton)),
  );
  bound.push(bindInstallDialogClose(options.installDialog, bind.click));
  bound.push(
    bindDeveloperModeToggleIfNeeded(
      options.modeChoices,
      options.developerModeToggle,
      options.toggleDeveloperMode,
      bind.change,
    ),
  );
  bindModeChoices();
  bindLanguagePicker();
  bindSavedDialogInteractionsIfPresent(
    getSavedDialog(),
    options,
    dependencies.bindSavedDialogInteractions,
  );
  bound.push(
    bind.click(options.emojiList, options.onClick),
    bind.focusIn(options.emojiList, options.onEmojiFocus),
    bind.keyDown(options.emojiList, options.onEmojiKeyDown),
    bind.close(options.exampleDialog, options.onEmojiDialogClose),
    bind.click(options.exampleDialog, options.onEmojiDialogClick),
    bind.click(options.versionModeToggle, options.toggleVersionMode),
    bind.click(options.versionPrevious, () => options.stepVersion(-1)),
    bind.click(options.versionNext, () => options.stepVersion(1)),
    bind.click(options.clearFiltersButton, options.resetFilters),
    bind.click(options.emojiPrevious, () => options.navigateEmoji(-1)),
    bind.click(options.emojiNext, () => options.navigateEmoji(1)),
    bind.change(options.versionSelector, () => {
      options.syncVersionRange();
      options.drawList();
    }),
    bind.input(options.versionRange, options.onVersionRangeInput),
    bind.keyDown(documentRef, options.onDocumentKeyDown),
  );
  options.orderButtons.map((button: any) =>
    bound.push(bind.click(button, options.onOrderModeChange)),
  );
  return () => bound.flat().forEach((fn) => fn());
};
