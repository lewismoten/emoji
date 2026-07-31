import assert from "node:assert/strict";
import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapRuntimeSourceOptions,
  buildExplorerBootstrapShellOptions,
} from "../../src/app/bootstrap/explorer-bootstrap-options.js";

const calls: Array<[string, unknown[]]> = [];
const mark =
  (name: string, value?: unknown) =>
  (...args: unknown[]) => {
    calls.push([name, args]);
    return value ?? `${name}-value`;
  };

const state = { id: "state" };
const options: any = {
  activeFilterSummary: mark("activeFilterSummary"),
  activeFilterText: mark("activeFilterText"),
  advancedFilters: mark("advancedFilters"),
  advancedFiltersButton: mark("advancedFiltersButton"),
  animateCopy: mark("animateCopy"),
  applyingUrlState: mark("applyingUrlState"),
  applyBasicUrlState: mark("applyBasicUrlState"),
  applyDialogUrlState: mark("applyDialogUrlState"),
  applyPixelArtworkClass: mark("applyPixelArtworkClass"),
  applyStandalonePixelArtwork: mark("applyStandalonePixelArtwork"),
  bindAudioInteractions: mark("bindAudioInteractions"),
  clearFiltersButton: mark("clearFiltersButton"),
  compactGroupChoices: mark("compactGroupChoices"),
  compactGroupLabel: mark("compactGroupLabel"),
  compactSequenceChoices: mark("compactSequenceChoices"),
  compactSequenceLabel: mark("compactSequenceLabel"),
  compactSubGroupChoices: mark("compactSubGroupChoices"),
  compactSubGroupLabel: mark("compactSubGroupLabel"),
  copyStatus: mark("copyStatus"),
  copyToClipboardValue: mark("copyToClipboardValue"),
  developerModeEnabled: mark("developerModeEnabled"),
  developerModeToggle: mark("developerModeToggle"),
  dialog: mark("dialog"),
  displayExplorerLabel: mark("displayExplorerLabel"),
  displayGroupName: mark("displayGroupName"),
  displayUnicodeSubGroupName: mark("displayUnicodeSubGroupName"),
  drawList: mark("drawList"),
  emojiFontChoices: mark("emojiFontChoices"),
  emojiList: mark("emojiList"),
  emojiParent: mark("emojiParent"),
  ensurePixelEditor: mark("ensurePixelEditor"),
  focusInitialEmojiDialogAction: mark("focusInitialEmojiDialogAction"),
  formatNumber: mark("formatNumber"),
  genderCheckboxes: mark("genderCheckboxes"),
  genderFieldset: mark("genderFieldset"),
  getEmojiGenders: mark("getEmojiGenders"),
  getExplorerSubGroup: mark("getExplorerSubGroup"),
  getIntroducedVersion: mark("getIntroducedVersion"),
  getPixelEditor: mark("getPixelEditor"),
  getPixelEditorPromise: mark("getPixelEditorPromise"),
  groupFilterDialog: mark("groupFilterDialog"),
  groupPickerTrigger: mark("groupPickerTrigger"),
  groupSelector: mark("groupSelector"),
  hairCheckboxes: mark("hairCheckboxes"),
  hairFieldset: mark("hairFieldset"),
  helpDialog: mark("helpDialog"),
  helpPicker: mark("helpPicker"),
  installApp: mark("installApp"),
  installAppButton: mark("installAppButton"),
  installDialog: mark("installDialog"),
  isViteDevelopment: true,
  languageDialog: mark("languageDialog"),
  languageList: mark("languageList"),
  languagePicker: mark("languagePicker"),
  languagePickerFlag: mark("languagePickerFlag"),
  languagePickerLabel: mark("languagePickerLabel"),
  loadData: mark("loadData"),
  loadPackageManifest: mark("loadPackageManifest"),
  loadSearchLanguages: mark("loadSearchLanguages"),
  loadUiTranslations: mark("loadUiTranslations"),
  loadVersionData: mark("loadVersionData"),
  matchCount: mark("matchCount"),
  modifierFilters: mark("modifierFilters"),
  navigateEmoji: mark("navigateEmoji"),
  nextRenderGeneration: mark("nextRenderGeneration"),
  nextSearchLoadId: mark("nextSearchLoadId"),
  normalizeCodePoints: mark("normalizeCodePoints"),
  offlineStatus: mark("offlineStatus"),
  onClick: mark("onClick"),
  onCompactChoiceKeyDown: mark("onCompactChoiceKeyDown"),
  onDocumentKeyDown: mark("onDocumentKeyDown"),
  onEmojiDialogClick: mark("onEmojiDialogClick"),
  onEmojiDialogClose: mark("onEmojiDialogClose"),
  onEmojiFocus: mark("onEmojiFocus"),
  onEmojiKeyDown: mark("onEmojiKeyDown"),
  onGenderChange: mark("onGenderChange"),
  onHairChange: mark("onHairChange"),
  onOrderModeChange: mark("onOrderModeChange"),
  onSkinToneChange: mark("onSkinToneChange"),
  onVersionRangeInput: mark("onVersionRangeInput"),
  openFilterPicker: mark("openFilterPicker"),
  openPanel: mark("openPanel"),
  orderButtons: mark("orderButtons"),
  panelDialogs: mark("panelDialogs"),
  populateVersionModeOptions: mark("populateVersionModeOptions"),
  recordCopiedEmoji: mark("recordCopiedEmoji"),
  rebuildEmojiCodePointLookup: mark("rebuildEmojiCodePointLookup"),
  refreshLocalizedLabels: mark("refreshLocalizedLabels"),
  renderCategoryFilters: mark("renderCategoryFilters"),
  renderDeveloperMode: mark("renderDeveloperMode"),
  renderGeneration: mark("renderGeneration"),
  renderInstallAppButton: mark("renderInstallAppButton"),
  renderPixelFontToggle: mark("renderPixelFontToggle"),
  renderSavedEmoji: mark("renderSavedEmoji"),
  renderSearchLanguages: mark("renderSearchLanguages"),
  renderThemeToggle: mark("renderThemeToggle"),
  renderVersionModeToggle: mark("renderVersionModeToggle"),
  resetFilters: mark("resetFilters"),
  restoreDeveloperMode: mark("restoreDeveloperMode"),
  revealExplorer: mark("revealExplorer"),
  savePreference: mark("savePreference"),
  savedDialog: mark("savedDialog"),
  savedPicker: mark("savedPicker"),
  scheduleSearchDraw: mark("scheduleSearchDraw"),
  searchText: mark("searchText"),
  selectEmojiFont: mark("selectEmojiFont"),
  selectTheme: mark("selectTheme"),
  sequenceTranslationKeys: { zwj: "zwjLabel" },
  sequenceTypeEmoji: { zwj: "🧩" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  sequenceTypeOrder: ["zwj"],
  sequenceTypeSelector: mark("sequenceTypeSelector"),
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
  skinToneFieldset: mark("skinToneFieldset"),
  state: mark("state", state),
  stepVersion: mark("stepVersion"),
  subGroupFilterDialog: mark("subGroupFilterDialog"),
  subGroupPickerTrigger: mark("subGroupPickerTrigger"),
  subGroupSelector: mark("subGroupSelector"),
  suppressDialogCloseSync: mark("suppressDialogCloseSync"),
  suppressedPanelCloses: mark("suppressedPanelCloses"),
  syncUrlState: mark("syncUrlState"),
  syncVersionRange: mark("syncVersionRange"),
  themeChoices: mark("themeChoices"),
  toggleDeveloperMode: mark("toggleDeveloperMode"),
  toggleVersionMode: mark("toggleVersionMode"),
  toolbar: mark("toolbar"),
  translate: mark("translate"),
  unassigned: "\u0000",
  unicodeGroupLabelKeys: { A: "a" },
  unicodeSubgroupLabelKeys: { B: "b" },
  updateCompositionBackButton: mark("updateCompositionBackButton"),
  updateDialogNavigation: mark("updateDialogNavigation"),
  updateEmojiComposition: mark("updateEmojiComposition"),
  updateEmojiImportExamples: mark("updateEmojiImportExamples"),
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
  versionRangeValue: mark("versionRangeValue"),
  versionSelector: mark("versionSelector"),
};

const shell = buildExplorerBootstrapShellOptions(options);
assert.equal(shell.normalizeCodePoints, options.normalizeCodePoints);
assert.equal(shell.savePreference, options.savePreference);
assert.equal(shell.translate, options.translate);
assert.equal(shell.applyingUrlState(), "applyingUrlState-value");
assert.equal(shell.copyStatus(), "copyStatus-value");
assert.equal(shell.developerModeToggle(), "developerModeToggle-value");
assert.equal(shell.dialog(), "dialog-value");
assert.equal(shell.drawList(), "drawList-value");
assert.equal(shell.emojiFontChoices(), "emojiFontChoices-value");
assert.equal(shell.genderCheckboxes(), "genderCheckboxes-value");
assert.equal(shell.getPixelEditor(), "getPixelEditor-value");
assert.equal(shell.hairCheckboxes(), "hairCheckboxes-value");
assert.equal(shell.installAppButton(), "installAppButton-value");
assert.equal(shell.installDialog(), "installDialog-value");
assert.equal(shell.loadVersionData(), "loadVersionData-value");
assert.equal(shell.offlineStatus(), "offlineStatus-value");
assert.equal(shell.orderButtons(), "orderButtons-value");
assert.equal(shell.renderCategoryFilters(), "renderCategoryFilters-value");
assert.equal(shell.renderSearchLanguages(), "renderSearchLanguages-value");
assert.equal(shell.renderVersionModeToggle(), "renderVersionModeToggle-value");
assert.equal(shell.savedDialog(), "savedDialog-value");
assert.equal(shell.skinToneCheckboxes(), "skinToneCheckboxes-value");
assert.equal(shell.state(), state);
assert.equal(shell.suppressDialogCloseSync(), "suppressDialogCloseSync-value");
assert.equal(shell.syncVersionRange(), "syncVersionRange-value");
assert.equal(shell.themeChoices(), "themeChoices-value");
assert.equal(shell.urlStateReady(), "urlStateReady-value");
assert.equal(shell.versionModeSelector(), "versionModeSelector-value");
assert.equal(shell.versionSelector(), "versionSelector-value");
assert.equal(
  calls.some(
    (call) =>
      call[0] === "state" && Array.isArray(call[1]) && call[1].length === 0,
  ),
  true,
);
shell.setDialogView("code", false);
shell.showEmoji("wrappedGift", true);
shell.syncUrlState("replace", { ok: true });
assert.deepEqual(calls.slice(-3), [
  ["setDialogView", ["code", false]],
  ["showEmoji", ["wrappedGift", true]],
  ["syncUrlState", ["replace", { ok: true }]],
]);

const controller = buildExplorerBootstrapControllerOptions(options);
assert.equal(controller.animateCopy, options.animateCopy);
assert.equal(controller.applyPixelArtworkClass, options.applyPixelArtworkClass);
assert.equal(
  controller.sequenceTranslationKeys,
  options.sequenceTranslationKeys,
);
assert.equal(controller.unassigned, "\u0000");
assert.equal(controller.activeFilterSummary(), "activeFilterSummary-value");
assert.equal(controller.activeFilterText(), "activeFilterText-value");
assert.equal(controller.applyingUrlState(), "applyingUrlState-value");
assert.equal(controller.compactGroupChoices(), "compactGroupChoices-value");
assert.equal(controller.compactGroupLabel(), "compactGroupLabel-value");
assert.equal(
  controller.compactSequenceChoices(),
  "compactSequenceChoices-value",
);
assert.equal(controller.compactSequenceLabel(), "compactSequenceLabel-value");
assert.equal(
  controller.compactSubGroupChoices(),
  "compactSubGroupChoices-value",
);
assert.equal(controller.compactSubGroupLabel(), "compactSubGroupLabel-value");
assert.equal(controller.groupSelector(), "groupSelector-value");
assert.equal(controller.dialog(), "dialog-value");
assert.equal(controller.drawList(), "drawList-value");
assert.equal(controller.emojiList(), "emojiList-value");
assert.equal(controller.emojiParent(), "emojiParent-value");
assert.equal(controller.ensurePixelEditor(), "ensurePixelEditor-value");
assert.equal(
  controller.focusInitialEmojiDialogAction(),
  "focusInitialEmojiDialogAction-value",
);
assert.equal(controller.genderCheckboxes(), "genderCheckboxes-value");
assert.equal(controller.genderFieldset(), "genderFieldset-value");
assert.equal(controller.getEmojiGenders("item"), "getEmojiGenders-value");
assert.equal(controller.groupFilterDialog(), "groupFilterDialog-value");
assert.equal(controller.groupPickerTrigger(), "groupPickerTrigger-value");
assert.equal(controller.hairCheckboxes(), "hairCheckboxes-value");
assert.equal(controller.hairFieldset(), "hairFieldset-value");
assert.equal(controller.helpDialog(), "helpDialog-value");
assert.equal(controller.matchCount(), "matchCount-value");
assert.equal(controller.modifierFilters(), "modifierFilters-value");
assert.equal(controller.nextRenderGeneration(), "nextRenderGeneration-value");
assert.equal(controller.orderButtons(), "orderButtons-value");
assert.equal(controller.panelDialogs(), "panelDialogs-value");
assert.equal(controller.renderCategoryFilters(), "renderCategoryFilters-value");
assert.equal(controller.renderGeneration(), "renderGeneration-value");
assert.equal(controller.searchText(), "searchText-value");
assert.equal(controller.sequenceTypeSelector(), "sequenceTypeSelector-value");
assert.equal(controller.skinToneCheckboxes(), "skinToneCheckboxes-value");
assert.equal(controller.skinToneFieldset(), "skinToneFieldset-value");
assert.equal(controller.state(), state);
assert.equal(controller.subGroupFilterDialog(), "subGroupFilterDialog-value");
assert.equal(controller.subGroupPickerTrigger(), "subGroupPickerTrigger-value");
assert.equal(controller.subGroupSelector(), "subGroupSelector-value");
assert.equal(controller.suppressedPanelCloses(), "suppressedPanelCloses-value");
assert.equal(controller.urlStateReady(), "urlStateReady-value");
assert.equal(controller.versionModeSelector(), "versionModeSelector-value");
assert.equal(controller.versionNext(), "versionNext-value");
assert.equal(controller.versionPrevious(), "versionPrevious-value");
assert.equal(controller.versionRange(), "versionRange-value");
assert.equal(controller.versionRangeValue(), "versionRangeValue-value");
assert.equal(controller.versionSelector(), "versionSelector-value");
controller.navigateEmoji(2);
controller.openPanel("favorites");
controller.setDialogView("details");
controller.setSuppressDialogCloseSync(true);
controller.showEmoji("partyPopper", false);
controller.updateCompositionBackButton("left");
controller.updateDialogNavigation("previous", "next");
controller.syncUrlState("push", { next: true });
assert.deepEqual(calls.slice(-8), [
  ["navigateEmoji", [2]],
  ["openPanel", ["favorites"]],
  ["setDialogView", ["details"]],
  ["setSuppressDialogCloseSync", [true]],
  ["showEmoji", ["partyPopper", false]],
  ["updateCompositionBackButton", ["left"]],
  ["updateDialogNavigation", ["previous", "next"]],
  ["syncUrlState", ["push", { next: true }]],
]);

const runtime = buildExplorerBootstrapRuntimeSourceOptions(options);
assert.equal(runtime.applyBasicUrlState, options.applyBasicUrlState);
assert.equal(runtime.applyDialogUrlState, options.applyDialogUrlState);
assert.equal(runtime.bindAudioInteractions, options.bindAudioInteractions);
assert.equal(runtime.installApp, options.installApp);
assert.equal(runtime.panelDialogs, options.panelDialogs);
assert.equal(runtime.translate, options.translate);
assert.equal(runtime.advancedFilters(), "advancedFilters-value");
assert.equal(runtime.advancedFiltersButton(), "advancedFiltersButton-value");
assert.equal(runtime.applyingUrlState(), "applyingUrlState-value");
assert.equal(runtime.clearFiltersButton(), "clearFiltersButton-value");
assert.equal(runtime.copyStatus(), "copyStatus-value");
assert.equal(runtime.developerModeToggle(), "developerModeToggle-value");
assert.equal(runtime.drawList("warm"), "drawList-value");
assert.equal(runtime.emojiFontChoices(), "emojiFontChoices-value");
assert.equal(runtime.emojiList(), "emojiList-value");
assert.equal(runtime.genderCheckboxes(), "genderCheckboxes-value");
assert.equal(runtime.getPixelEditor(), "getPixelEditor-value");
assert.equal(runtime.getPixelEditorPromise(), "getPixelEditorPromise-value");
assert.equal(runtime.groupFilterDialog(), "groupFilterDialog-value");
assert.equal(runtime.groupPickerTrigger(), "groupPickerTrigger-value");
assert.equal(runtime.groupSelector(), "groupSelector-value");
assert.equal(runtime.hairCheckboxes(), "hairCheckboxes-value");
assert.equal(runtime.helpDialog(), "helpDialog-value");
assert.equal(runtime.helpPicker(), "helpPicker-value");
assert.equal(runtime.installAppButton(), "installAppButton-value");
assert.equal(runtime.installDialog(), "installDialog-value");
assert.equal(runtime.languageDialog(), "languageDialog-value");
assert.equal(runtime.languageList(), "languageList-value");
assert.equal(runtime.languagePicker(), "languagePicker-value");
assert.equal(runtime.languagePickerFlag(), "languagePickerFlag-value");
assert.equal(runtime.languagePickerLabel(), "languagePickerLabel-value");
assert.equal(runtime.loadSearchLanguages(), "loadSearchLanguages-value");
assert.equal(runtime.matchCount(), "matchCount-value");
assert.equal(runtime.navigateEmoji(3), "navigateEmoji-value");
assert.equal(runtime.orderButtons(), "orderButtons-value");
assert.equal(runtime.savedDialog(), "savedDialog-value");
assert.equal(runtime.savedPicker(), "savedPicker-value");
assert.equal(runtime.searchText(), "searchText-value");
assert.equal(runtime.skinToneCheckboxes(), "skinToneCheckboxes-value");
assert.equal(runtime.state(), state);
assert.equal(runtime.subGroupFilterDialog(), "subGroupFilterDialog-value");
assert.equal(runtime.subGroupPickerTrigger(), "subGroupPickerTrigger-value");
assert.equal(runtime.subGroupSelector(), "subGroupSelector-value");
assert.equal(runtime.suppressedPanelCloses(), "suppressedPanelCloses-value");
assert.equal(runtime.toolbar(), "toolbar-value");
assert.equal(runtime.themeChoices(), "themeChoices-value");
assert.equal(runtime.urlStateReady(), "urlStateReady-value");
assert.equal(runtime.versionModeSelector(), "versionModeSelector-value");
assert.equal(runtime.versionModeToggle(), "versionModeToggle-value");
assert.equal(runtime.versionNext(), "versionNext-value");
assert.equal(runtime.versionPrevious(), "versionPrevious-value");
assert.equal(runtime.versionRange(), "versionRange-value");
assert.equal(runtime.versionSelector(), "versionSelector-value");
runtime.populateVersionModeOptions("b");
runtime.renderCategoryFilters("c");
runtime.setDialogView("editor");
runtime.showEmoji("wrappedGift", true);
runtime.syncUrlState("replace", { hello: "world" });
runtime.syncVersionRange("x");
runtime.toggleVersionMode("selected");
const recentCalls = calls.slice(-7);
assert.equal(
  recentCalls.some(
    (call) =>
      call[0] === "populateVersionModeOptions" &&
      JSON.stringify(call[1]) === '["b"]',
  ),
  true,
);
assert.deepEqual(recentCalls.slice(-6), [
  ["renderCategoryFilters", ["c"]],
  ["setDialogView", ["editor"]],
  ["showEmoji", ["wrappedGift", true]],
  ["syncUrlState", ["replace", { hello: "world" }]],
  ["syncVersionRange", ["x"]],
  ["toggleVersionMode", ["selected"]],
]);
