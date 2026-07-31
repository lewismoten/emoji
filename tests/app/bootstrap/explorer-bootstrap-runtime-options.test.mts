import assert from "node:assert/strict";
import { buildExplorerBootstrapRuntimeOptions } from "../../../src/app/bootstrap/explorer-bootstrap-runtime-options.js";

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
  fullDeveloperModeEnabled: mark("fullDeveloperModeEnabled"),
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

for (const key of [
  "applyBasicUrlState",
  "applyDialogUrlState",
  "applyPixelArtworkClass",
  "applyStandalonePixelArtwork",
  "bindAudioInteractions",
  "developerModeEnabled",
  "fullDeveloperModeEnabled",
  "displayGroupName",
  "displayUnicodeSubGroupName",
  "focusInitialEmojiDialogAction",
  "installApp",
  "loadData",
  "loadUiTranslations",
  "onClick",
  "onCompactChoiceKeyDown",
  "onDocumentKeyDown",
  "onEmojiDialogClick",
  "onEmojiDialogClose",
  "onEmojiFocus",
  "onHairChange",
  "onEmojiKeyDown",
  "onGenderChange",
  "onSkinToneChange",
  "onOrderModeChange",
  "onVersionRangeInput",
  "openFilterPicker",
  "panelDialogs",
  "refreshLocalizedLabels",
  "renderDeveloperMode",
  "renderInstallAppButton",
  "renderPixelFontToggle",
  "renderSavedEmoji",
  "renderThemeToggle",
  "restoreDeveloperMode",
  "savePreference",
  "scheduleSearchDraw",
  "selectEmojiFont",
  "selectTheme",
  "setApplyingUrlState",
  "setControls",
  "setElements",
  "setFieldsets",
  "setPixelEditor",
  "setPixelEditorPromise",
  "setSearchLanguage",
  "setSuppressDialogCloseSync",
  "setUrlStateReady",
  "stepVersion",
  "toggleDeveloperMode",
  "translate",
  "updateEmojiComposition",
  "updateFavoriteButton",
  "updateModifierArtwork",
  "updateOnlineStatus",
  "updatePixelArtworkManifest",
  "updateRenderingDiagnostic",
] as const) {
  assert.equal(runtimeOptions[key], options[key]);
}

assert.equal(runtimeOptions.activeFilters(), "advancedFilters-value");
assert.equal(runtimeOptions.modeChoices(), undefined);
for (const [key, expected] of [
  ["advancedFilters", "advancedFilters-value"],
  ["advancedFiltersButton", "advancedFiltersButton-value"],
  ["applyingUrlState", "applyingUrlState-value"],
  ["clearFiltersButton", "clearFiltersButton-value"],
  ["copyStatus", "copyStatus-value"],
  ["developerModeToggle", "developerModeToggle-value"],
  ["drawList", "drawList-value"],
  ["emojiFontChoices", "emojiFontChoices-value"],
  ["emojiList", "emojiList-value"],
  ["genderCheckboxes", "genderCheckboxes-value"],
  ["getIntroducedVersion", "getIntroducedVersion-value"],
  ["getPixelEditor", "getPixelEditor-value"],
  ["getPixelEditorPromise", "getPixelEditorPromise-value"],
  ["groupFilterDialog", "groupFilterDialog-value"],
  ["groupPickerTrigger", "groupPickerTrigger-value"],
  ["groupSelector", "groupSelector-value"],
  ["hairCheckboxes", "hairCheckboxes-value"],
  ["helpDialog", "helpDialog-value"],
  ["helpPicker", "helpPicker-value"],
  ["installAppButton", "installAppButton-value"],
  ["installDialog", "installDialog-value"],
  ["languageDialog", "languageDialog-value"],
  ["languageList", "languageList-value"],
  ["languagePicker", "languagePicker-value"],
  ["languagePickerFlag", "languagePickerFlag-value"],
  ["languagePickerLabel", "languagePickerLabel-value"],
  ["loadSearchLanguages", "loadSearchLanguages-value"],
  ["matchCount", "matchCount-value"],
  ["navigateEmoji", "navigateEmoji-value"],
  ["nextSearchLoadId", "nextSearchLoadId-value"],
  ["orderButtons", "orderButtons-value"],
  ["populateVersionModeOptions", "populateVersionModeOptions-value"],
  ["renderCategoryFilters", "renderCategoryFilters-value"],
  ["renderVersionModeToggle", "renderVersionModeToggle-value"],
  ["resetFilters", "resetFilters-value"],
  ["savedDialog", "savedDialog-value"],
  ["savedPicker", "savedPicker-value"],
  ["searchText", "searchText-value"],
  ["setDialogView", "setDialogView-value"],
  ["showEmoji", "showEmoji-value"],
  ["skinToneCheckboxes", "skinToneCheckboxes-value"],
  ["subGroupFilterDialog", "subGroupFilterDialog-value"],
  ["subGroupPickerTrigger", "subGroupPickerTrigger-value"],
  ["subGroupSelector", "subGroupSelector-value"],
  ["suppressedPanelCloses", "suppressedPanelCloses-value"],
  ["syncUrlState", "syncUrlState-value"],
  ["syncVersionRange", "syncVersionRange-value"],
  ["themeChoices", "themeChoices-value"],
  ["toggleVersionMode", "toggleVersionMode-value"],
  ["toolbar", "toolbar-value"],
  ["updateCompositionBackButton", "updateCompositionBackButton-value"],
  ["updateDialogNavigation", "updateDialogNavigation-value"],
  ["urlStateReady", "urlStateReady-value"],
  ["versionModeSelector", "versionModeSelector-value"],
  ["versionModeToggle", "versionModeToggle-value"],
  ["versionNext", "versionNext-value"],
  ["versionPrevious", "versionPrevious-value"],
  ["versionRange", "versionRange-value"],
  ["versionSelector", "versionSelector-value"],
] as const) {
  const value =
    key === "drawList"
      ? runtimeOptions[key]("render")
      : key === "navigateEmoji"
        ? runtimeOptions[key](2)
        : key === "populateVersionModeOptions"
          ? runtimeOptions[key]("through")
          : key === "renderCategoryFilters"
            ? runtimeOptions[key]("filters")
            : key === "setDialogView"
              ? runtimeOptions[key]("code")
              : key === "showEmoji"
                ? runtimeOptions[key]("wrappedGift", true)
                : key === "syncUrlState"
                  ? runtimeOptions[key]("replace")
                  : key === "syncVersionRange"
                    ? runtimeOptions[key]("current")
                    : key === "toggleVersionMode"
                      ? runtimeOptions[key]("selected")
                      : key === "updateCompositionBackButton"
                        ? runtimeOptions[key]("stack")
                        : key === "updateDialogNavigation"
                          ? runtimeOptions[key]("next")
                          : runtimeOptions[key]();
  assert.equal(value, expected);
}
assert.equal(runtimeOptions.state(), state);

options.modeChoices = mark("modeChoices");
const runtimeWithModes = buildExplorerBootstrapRuntimeOptions(options);
assert.equal(runtimeWithModes.modeChoices(), "modeChoices-value");

assert.ok(calls.length > 30);
