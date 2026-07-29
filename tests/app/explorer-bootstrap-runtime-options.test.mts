import assert from "node:assert/strict";
import { buildExplorerBootstrapRuntimeOptions } from "../../src/app/explorer-bootstrap-runtime-options.js";

const calls: Array<[string, unknown[]]> = [];
const mark =
  (name: string, value?: unknown) =>
  (...args: unknown[]) => {
    calls.push([name, args]);
    return value ?? `${name}-value`;
  };

const state = { id: "state" };
const options: any = {
  advancedFilters: mark("advancedFilters"),
  advancedFiltersButton: mark("advancedFiltersButton"),
  applyingUrlState: mark("applyingUrlState"),
  applyBasicUrlState: mark("applyBasicUrlState"),
  applyDialogUrlState: mark("applyDialogUrlState"),
  applyPixelArtworkClass: mark("applyPixelArtworkClass"),
  applyStandalonePixelArtwork: mark("applyStandalonePixelArtwork"),
  bindAudioInteractions: mark("bindAudioInteractions"),
  clearFiltersButton: mark("clearFiltersButton"),
  copyStatus: mark("copyStatus"),
  developerModeEnabled: mark("developerModeEnabled"),
  developerModeToggle: mark("developerModeToggle"),
  displayGroupName: mark("displayGroupName"),
  displayUnicodeSubGroupName: mark("displayUnicodeSubGroupName"),
  drawList: mark("drawList"),
  emojiFontChoices: mark("emojiFontChoices"),
  emojiList: mark("emojiList"),
  genderCheckboxes: mark("genderCheckboxes"),
  focusInitialEmojiDialogAction: mark("focusInitialEmojiDialogAction"),
  getIntroducedVersion: mark("getIntroducedVersion"),
  getPixelEditor: mark("getPixelEditor"),
  getPixelEditorPromise: mark("getPixelEditorPromise"),
  groupFilterDialog: mark("groupFilterDialog"),
  groupPickerTrigger: mark("groupPickerTrigger"),
  groupSelector: mark("groupSelector"),
  hairCheckboxes: mark("hairCheckboxes"),
  helpDialog: mark("helpDialog"),
  helpPicker: mark("helpPicker"),
  installApp: mark("installApp"),
  installAppButton: mark("installAppButton"),
  installDialog: mark("installDialog"),
  languageDialog: mark("languageDialog"),
  languageList: mark("languageList"),
  languagePicker: mark("languagePicker"),
  languagePickerFlag: mark("languagePickerFlag"),
  languagePickerLabel: mark("languagePickerLabel"),
  loadData: mark("loadData"),
  loadSearchLanguages: mark("loadSearchLanguages"),
  loadUiTranslations: mark("loadUiTranslations"),
  matchCount: mark("matchCount"),
  navigateEmoji: mark("navigateEmoji"),
  nextSearchLoadId: mark("nextSearchLoadId"),
  onClick: mark("onClick"),
  onCompactChoiceKeyDown: mark("onCompactChoiceKeyDown"),
  onDocumentKeyDown: mark("onDocumentKeyDown"),
  onEmojiDialogClick: mark("onEmojiDialogClick"),
  onEmojiDialogClose: mark("onEmojiDialogClose"),
  onEmojiFocus: mark("onEmojiFocus"),
  onHairChange: mark("onHairChange"),
  onEmojiKeyDown: mark("onEmojiKeyDown"),
  onGenderChange: mark("onGenderChange"),
  onSkinToneChange: mark("onSkinToneChange"),
  onOrderModeChange: mark("onOrderModeChange"),
  onVersionRangeInput: mark("onVersionRangeInput"),
  openFilterPicker: mark("openFilterPicker"),
  orderButtons: mark("orderButtons"),
  panelDialogs: mark("panelDialogs"),
  populateVersionModeOptions: mark("populateVersionModeOptions"),
  refreshLocalizedLabels: mark("refreshLocalizedLabels"),
  renderCategoryFilters: mark("renderCategoryFilters"),
  renderDeveloperMode: mark("renderDeveloperMode"),
  renderInstallAppButton: mark("renderInstallAppButton"),
  renderPixelFontToggle: mark("renderPixelFontToggle"),
  renderSavedEmoji: mark("renderSavedEmoji"),
  renderThemeToggle: mark("renderThemeToggle"),
  renderVersionModeToggle: mark("renderVersionModeToggle"),
  resetFilters: mark("resetFilters"),
  restoreDeveloperMode: mark("restoreDeveloperMode"),
  savePreference: mark("savePreference"),
  savedDialog: mark("savedDialog"),
  savedPicker: mark("savedPicker"),
  scheduleSearchDraw: mark("scheduleSearchDraw"),
  searchText: mark("searchText"),
  selectEmojiFont: mark("selectEmojiFont"),
  selectTheme: mark("selectTheme"),
  setApplyingUrlState: mark("setApplyingUrlState"),
  setControls: mark("setControls"),
  setDialogView: mark("setDialogView"),
  setElements: mark("setElements"),
  setFieldsets: mark("setFieldsets"),
  setPixelEditor: mark("setPixelEditor"),
  setPixelEditorPromise: mark("setPixelEditorPromise"),
  setSearchLanguage: mark("setSearchLanguage"),
  setSuppressDialogCloseSync: mark("setSuppressDialogCloseSync"),
  setUrlStateReady: mark("setUrlStateReady"),
  showEmoji: mark("showEmoji"),
  skinToneCheckboxes: mark("skinToneCheckboxes"),
  state: mark("state", state),
  stepVersion: mark("stepVersion"),
  subGroupFilterDialog: mark("subGroupFilterDialog"),
  subGroupPickerTrigger: mark("subGroupPickerTrigger"),
  subGroupSelector: mark("subGroupSelector"),
  suppressedPanelCloses: mark("suppressedPanelCloses"),
  syncUrlState: mark("syncUrlState"),
  syncVersionRange: mark("syncVersionRange"),
  themeChoices: mark("themeChoices"),
  toggleDeveloperMode: mark("toggleDeveloperMode"),
  toggleVersionMode: mark("toggleVersionMode"),
  toolbar: mark("toolbar"),
  translate: mark("translate"),
  updateCompositionBackButton: mark("updateCompositionBackButton"),
  updateDialogNavigation: mark("updateDialogNavigation"),
  updateEmojiComposition: mark("updateEmojiComposition"),
  updateFavoriteButton: mark("updateFavoriteButton"),
  updateModifierArtwork: mark("updateModifierArtwork"),
  updateOnlineStatus: mark("updateOnlineStatus"),
  updatePixelArtworkManifest: mark("updatePixelArtworkManifest"),
  updateRenderingDiagnostic: mark("updateRenderingDiagnostic"),
  urlStateReady: mark("urlStateReady"),
  versionModeSelector: mark("versionModeSelector"),
  versionModeToggle: mark("versionModeToggle"),
  versionNext: mark("versionNext"),
  versionPrevious: mark("versionPrevious"),
  versionRange: mark("versionRange"),
  versionSelector: mark("versionSelector"),
};

const runtimeOptions = buildExplorerBootstrapRuntimeOptions(options);

assert.equal(runtimeOptions.applyBasicUrlState, options.applyBasicUrlState);
assert.equal(runtimeOptions.applyDialogUrlState, options.applyDialogUrlState);
assert.equal(
  runtimeOptions.applyPixelArtworkClass,
  options.applyPixelArtworkClass,
);
assert.equal(
  runtimeOptions.applyStandalonePixelArtwork,
  options.applyStandalonePixelArtwork,
);
assert.equal(
  runtimeOptions.bindAudioInteractions,
  options.bindAudioInteractions,
);
assert.equal(runtimeOptions.developerModeEnabled, options.developerModeEnabled);
assert.equal(runtimeOptions.displayGroupName, options.displayGroupName);
assert.equal(
  runtimeOptions.displayUnicodeSubGroupName,
  options.displayUnicodeSubGroupName,
);
assert.equal(
  runtimeOptions.focusInitialEmojiDialogAction,
  options.focusInitialEmojiDialogAction,
);
assert.equal(runtimeOptions.installApp, options.installApp);
assert.equal(runtimeOptions.loadData, options.loadData);
assert.equal(runtimeOptions.loadUiTranslations, options.loadUiTranslations);
assert.equal(runtimeOptions.onClick, options.onClick);
assert.equal(
  runtimeOptions.onCompactChoiceKeyDown,
  options.onCompactChoiceKeyDown,
);
assert.equal(runtimeOptions.onDocumentKeyDown, options.onDocumentKeyDown);
assert.equal(runtimeOptions.onEmojiDialogClick, options.onEmojiDialogClick);
assert.equal(runtimeOptions.onEmojiDialogClose, options.onEmojiDialogClose);
assert.equal(runtimeOptions.onEmojiFocus, options.onEmojiFocus);
assert.equal(runtimeOptions.onHairChange, options.onHairChange);
assert.equal(runtimeOptions.onEmojiKeyDown, options.onEmojiKeyDown);
assert.equal(runtimeOptions.onGenderChange, options.onGenderChange);
assert.equal(runtimeOptions.onSkinToneChange, options.onSkinToneChange);
assert.equal(runtimeOptions.onOrderModeChange, options.onOrderModeChange);
assert.equal(runtimeOptions.onVersionRangeInput, options.onVersionRangeInput);
assert.equal(runtimeOptions.openFilterPicker, options.openFilterPicker);
assert.equal(runtimeOptions.panelDialogs, options.panelDialogs);
assert.equal(
  runtimeOptions.refreshLocalizedLabels,
  options.refreshLocalizedLabels,
);
assert.equal(runtimeOptions.renderDeveloperMode, options.renderDeveloperMode);
assert.equal(
  runtimeOptions.renderInstallAppButton,
  options.renderInstallAppButton,
);
assert.equal(
  runtimeOptions.renderPixelFontToggle,
  options.renderPixelFontToggle,
);
assert.equal(runtimeOptions.renderSavedEmoji, options.renderSavedEmoji);
assert.equal(runtimeOptions.renderThemeToggle, options.renderThemeToggle);
assert.equal(runtimeOptions.restoreDeveloperMode, options.restoreDeveloperMode);
assert.equal(runtimeOptions.savePreference, options.savePreference);
assert.equal(runtimeOptions.scheduleSearchDraw, options.scheduleSearchDraw);
assert.equal(runtimeOptions.selectEmojiFont, options.selectEmojiFont);
assert.equal(runtimeOptions.selectTheme, options.selectTheme);
assert.equal(runtimeOptions.setApplyingUrlState, options.setApplyingUrlState);
assert.equal(runtimeOptions.setControls, options.setControls);
assert.equal(runtimeOptions.setElements, options.setElements);
assert.equal(runtimeOptions.setFieldsets, options.setFieldsets);
assert.equal(runtimeOptions.setPixelEditor, options.setPixelEditor);
assert.equal(
  runtimeOptions.setPixelEditorPromise,
  options.setPixelEditorPromise,
);
assert.equal(runtimeOptions.setSearchLanguage, options.setSearchLanguage);
assert.equal(
  runtimeOptions.setSuppressDialogCloseSync,
  options.setSuppressDialogCloseSync,
);
assert.equal(runtimeOptions.setUrlStateReady, options.setUrlStateReady);
assert.equal(runtimeOptions.stepVersion, options.stepVersion);
assert.equal(runtimeOptions.toggleDeveloperMode, options.toggleDeveloperMode);
assert.equal(runtimeOptions.translate, options.translate);
assert.equal(
  runtimeOptions.updateEmojiComposition,
  options.updateEmojiComposition,
);
assert.equal(runtimeOptions.updateFavoriteButton, options.updateFavoriteButton);
assert.equal(
  runtimeOptions.updateModifierArtwork,
  options.updateModifierArtwork,
);
assert.equal(runtimeOptions.updateOnlineStatus, options.updateOnlineStatus);
assert.equal(
  runtimeOptions.updatePixelArtworkManifest,
  options.updatePixelArtworkManifest,
);
assert.equal(
  runtimeOptions.updateRenderingDiagnostic,
  options.updateRenderingDiagnostic,
);

assert.equal(runtimeOptions.activeFilters(), "advancedFilters-value");
assert.equal(runtimeOptions.advancedFilters(), "advancedFilters-value");
assert.equal(
  runtimeOptions.advancedFiltersButton(),
  "advancedFiltersButton-value",
);
assert.equal(runtimeOptions.applyingUrlState(), "applyingUrlState-value");
assert.equal(runtimeOptions.clearFiltersButton(), "clearFiltersButton-value");
assert.equal(runtimeOptions.copyStatus(), "copyStatus-value");
assert.equal(runtimeOptions.developerModeToggle(), "developerModeToggle-value");
assert.equal(runtimeOptions.drawList("render"), "drawList-value");
assert.equal(runtimeOptions.emojiFontChoices(), "emojiFontChoices-value");
assert.equal(runtimeOptions.emojiList(), "emojiList-value");
assert.equal(runtimeOptions.genderCheckboxes(), "genderCheckboxes-value");
assert.equal(
  runtimeOptions.getIntroducedVersion(),
  "getIntroducedVersion-value",
);
assert.equal(runtimeOptions.getPixelEditor(), "getPixelEditor-value");
assert.equal(
  runtimeOptions.getPixelEditorPromise(),
  "getPixelEditorPromise-value",
);
assert.equal(runtimeOptions.groupFilterDialog(), "groupFilterDialog-value");
assert.equal(runtimeOptions.groupPickerTrigger(), "groupPickerTrigger-value");
assert.equal(runtimeOptions.groupSelector(), "groupSelector-value");
assert.equal(runtimeOptions.hairCheckboxes(), "hairCheckboxes-value");
assert.equal(runtimeOptions.helpDialog(), "helpDialog-value");
assert.equal(runtimeOptions.helpPicker(), "helpPicker-value");
assert.equal(runtimeOptions.installAppButton(), "installAppButton-value");
assert.equal(runtimeOptions.installDialog(), "installDialog-value");
assert.equal(runtimeOptions.languageDialog(), "languageDialog-value");
assert.equal(runtimeOptions.languageList(), "languageList-value");
assert.equal(runtimeOptions.languagePicker(), "languagePicker-value");
assert.equal(runtimeOptions.languagePickerFlag(), "languagePickerFlag-value");
assert.equal(runtimeOptions.languagePickerLabel(), "languagePickerLabel-value");
assert.equal(runtimeOptions.loadSearchLanguages(), "loadSearchLanguages-value");
assert.equal(runtimeOptions.matchCount(), "matchCount-value");
assert.equal(runtimeOptions.navigateEmoji(2), "navigateEmoji-value");
assert.equal(runtimeOptions.nextSearchLoadId(), "nextSearchLoadId-value");
assert.equal(runtimeOptions.orderButtons(), "orderButtons-value");
assert.equal(
  runtimeOptions.populateVersionModeOptions("through"),
  "populateVersionModeOptions-value",
);
assert.equal(
  runtimeOptions.renderCategoryFilters("filters"),
  "renderCategoryFilters-value",
);
assert.equal(
  runtimeOptions.renderVersionModeToggle(),
  "renderVersionModeToggle-value",
);
assert.equal(runtimeOptions.resetFilters(), "resetFilters-value");
assert.equal(runtimeOptions.savedDialog(), "savedDialog-value");
assert.equal(runtimeOptions.savedPicker(), "savedPicker-value");
assert.equal(runtimeOptions.searchText(), "searchText-value");
assert.equal(runtimeOptions.setDialogView("code"), "setDialogView-value");
assert.equal(runtimeOptions.showEmoji("wrappedGift", true), "showEmoji-value");
assert.equal(runtimeOptions.skinToneCheckboxes(), "skinToneCheckboxes-value");
assert.equal(runtimeOptions.state(), state);
assert.equal(
  runtimeOptions.subGroupFilterDialog(),
  "subGroupFilterDialog-value",
);
assert.equal(
  runtimeOptions.subGroupPickerTrigger(),
  "subGroupPickerTrigger-value",
);
assert.equal(runtimeOptions.subGroupSelector(), "subGroupSelector-value");
assert.equal(
  runtimeOptions.suppressedPanelCloses(),
  "suppressedPanelCloses-value",
);
assert.equal(runtimeOptions.syncUrlState("replace"), "syncUrlState-value");
assert.equal(
  runtimeOptions.syncVersionRange("current"),
  "syncVersionRange-value",
);
assert.equal(runtimeOptions.themeChoices(), "themeChoices-value");
assert.equal(
  runtimeOptions.toggleVersionMode("selected"),
  "toggleVersionMode-value",
);
assert.equal(runtimeOptions.toolbar(), "toolbar-value");
assert.equal(
  runtimeOptions.updateCompositionBackButton("stack"),
  "updateCompositionBackButton-value",
);
assert.equal(
  runtimeOptions.updateDialogNavigation("next"),
  "updateDialogNavigation-value",
);
assert.equal(runtimeOptions.urlStateReady(), "urlStateReady-value");
assert.equal(runtimeOptions.versionModeSelector(), "versionModeSelector-value");
assert.equal(runtimeOptions.versionModeToggle(), "versionModeToggle-value");
assert.equal(runtimeOptions.versionNext(), "versionNext-value");
assert.equal(runtimeOptions.versionPrevious(), "versionPrevious-value");
assert.equal(runtimeOptions.versionRange(), "versionRange-value");
assert.equal(runtimeOptions.versionSelector(), "versionSelector-value");

assert.ok(calls.length > 30);
