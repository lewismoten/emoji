// @ts-nocheck -- Transitional bootstrap entry point; remove as features move into typed modules.
import {
  explorerLabelKeys,
  sequenceTranslationKeys,
  sequenceTypeEmoji,
  sequenceTypeLabels,
  sequenceTypeOrder,
  unicodeGroupLabelKeys,
  unicodeSubgroupLabelKeys
} from '../explorer/explorer-labels.js';
import { getExplorerSubGroup } from '../explorer/category-rules.js';
import {
  formatUiNumber as formatUiNumberValue,
  formatUiPercent as formatUiPercentValue,
  normalizeCodePoints
} from '../explorer/emoji-format.js';
import { animateCopyConfirmation as animateEmojiCopyConfirmation } from '../explorer/saved-emoji.js';
import { createExplorerApp } from '../explorer-app.js';
import { initializeExplorerPreferences } from './explorer-preferences.js';
import { createUiFormatters } from './browser-runtime.js';
import { createExplorerState } from '../explorer-state.js';
import { createExplorerBootstrapShell } from './explorer-bootstrap-shell.js';
import { createExplorerBootstrapControllers } from './explorer-bootstrap-controllers.js';
import { createExplorerBootstrapRuntime } from './explorer-bootstrap-runtime.js';
import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapRuntimeSourceOptions,
  buildExplorerBootstrapShellOptions
} from './explorer-bootstrap-options.js';
import { buildExplorerBootstrapRuntimeOptions } from './explorer-bootstrap-runtime-options.js';

const UNASSIGNED = '\u0000';
const explorerState = createExplorerState();

let searchText,
  languagePicker,
  languagePickerFlag,
  languagePickerLabel,
  languageDialog,
  languageList,
  savedPicker,
  savedDialog,
  helpPicker,
  helpDialog,
  developerModeToggle,
  emojiList,
  matchCount,
  toolbar,
  groupSelector,
  subGroupSelector,
  groupPickerTrigger,
  subGroupPickerTrigger,
  groupFilterDialog,
  subGroupFilterDialog,
  compactGroupChoices,
  compactSubGroupChoices,
  sequenceTypeSelector,
  compactSequenceChoices,
  compactGroupLabel,
  compactSubGroupLabel,
  compactSequenceLabel,
  versionModeSelector,
  versionSelector,
  versionModeToggle,
  versionRange,
  versionRangeValue,
  versionPrevious,
  versionNext,
  advancedFilters,
  activeFilterSummary,
  activeFilterText,
  clearFiltersButton,
  orderButtons,
  skinToneCheckboxes,
  hairCheckboxes,
  genderCheckboxes,
  modifierFilters,
  skinToneFieldset,
  hairFieldset,
  genderFieldset,
  copyStatus,
  pixelEditor,
  pixelEditorPromise,
  offlineStatus,
  installAppButton,
  installDialog;

let emojiFontChoices = [],
  themeChoices = [],
  listRenderGeneration = 0,
  urlStateReady = false,
  applyingUrlState = false,
  suppressDialogCloseSync = false,
  suppressedPanelCloses = new WeakSet();

const { save: saveExplorerPreference } = initializeExplorerPreferences(explorerState);
const translate = (key, fallback) => explorerState.uiStrings[key] ?? fallback;
const displayExplorerLabel = label => translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
  favorites: savedDialog,
  help: helpDialog,
  language: languageDialog
});
const isViteDevelopment =
  typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true;

const { formatUiNumber, formatUiPercent } = createUiFormatters({
  document,
  selectedSearchLocale: () => explorerState.selectedSearchLocale,
  formatNumber: formatUiNumberValue,
  formatPercent: formatUiPercentValue
});

let drawList = () => {};
let loadVersionData = () => {};
let loadSearchLanguages = () => {};
let renderSearchLanguages = () => {};
let renderCategoryFilters = () => {};
let renderVersionModeToggle = () => {};
let setEmojiDialogView = () => {};
let syncUrlState = () => {};
let syncVersionRange = () => {};
let showEmoji = () => {};
let navigateEmoji = () => {};
let updateDialogNavigation = () => {};
let updateCompositionBackButton = () => {};
let focusInitialEmojiDialogAction = () => {};
let populateVersionModeOptions = () => {};
let toggleVersionMode = () => {};
let revealExplorer = () => {};
let resetFilters = () => {};

let bootstrapRuntime;

const shell = createExplorerBootstrapShell(
  buildExplorerBootstrapShellOptions({
    applyingUrlState: () => applyingUrlState,
    copyStatus: () => copyStatus,
    developerModeToggle: () => developerModeToggle,
    dialog: () => bootstrapRuntime?.explorerRuntime.get('exampleDialog'),
    drawList: () => drawList(),
    emojiFontChoices: () => emojiFontChoices,
    genderCheckboxes: () => genderCheckboxes,
    getPixelEditor: () => pixelEditor,
    hairCheckboxes: () => hairCheckboxes,
    installAppButton: () => installAppButton,
    installDialog: () => installDialog,
    loadVersionData: () => loadVersionData(),
    normalizeCodePoints,
    offlineStatus: () => offlineStatus,
    orderButtons: () => orderButtons,
    renderCategoryFilters: () => renderCategoryFilters(),
    renderSearchLanguages: () => renderSearchLanguages(),
    renderVersionModeToggle: () => renderVersionModeToggle(),
    savePreference: saveExplorerPreference,
    savedDialog: () => savedDialog,
    setDialogView: (...args) => setEmojiDialogView(...args),
    showEmoji: (...args) => showEmoji(...args),
    skinToneCheckboxes: () => skinToneCheckboxes,
    state: () => explorerState,
    suppressDialogCloseSync: () => suppressDialogCloseSync,
    syncUrlState: (...args) => syncUrlState(...args),
    syncVersionRange: () => syncVersionRange(),
    themeChoices: () => themeChoices,
    translate,
    urlStateReady: () => urlStateReady,
    versionModeSelector: () => versionModeSelector,
    versionSelector: () => versionSelector
  })
);

const controllers = createExplorerBootstrapControllers(
  buildExplorerBootstrapControllerOptions({
    activeFilterSummary: () => activeFilterSummary,
    activeFilterText: () => activeFilterText,
    animateCopy: animateEmojiCopyConfirmation,
    applyingUrlState: () => applyingUrlState,
    applyPixelArtworkClass: shell.applyPixelArtworkClass,
    compactGroupChoices: () => compactGroupChoices,
    compactGroupLabel: () => compactGroupLabel,
    compactSequenceChoices: () => compactSequenceChoices,
    compactSequenceLabel: () => compactSequenceLabel,
    compactSubGroupChoices: () => compactSubGroupChoices,
    compactSubGroupLabel: () => compactSubGroupLabel,
    copyToClipboardValue: shell.copyToClipboardValue,
    developerModeEnabled: shell.developerModeEnabled,
    dialog: () => bootstrapRuntime?.explorerRuntime.get('exampleDialog'),
    displayExplorerLabel,
    drawList: () => drawList(),
    emojiList: () => emojiList,
    emojiParent: () => bootstrapRuntime?.explorerRuntime.get('emojiParent'),
    ensurePixelEditor: () => bootstrapRuntime?.ensurePixelEditor(),
    focusInitialEmojiDialogAction: () => focusInitialEmojiDialogAction(),
    formatNumber: formatUiNumber,
    genderCheckboxes: () => genderCheckboxes,
    genderFieldset: () => genderFieldset,
    getEmojiGenders: item => bootstrapRuntime?.getEmojiGenders(item),
    getExplorerSubGroup,
    getIntroducedVersion: shell.getIntroducedVersion,
    groupFilterDialog: () => groupFilterDialog,
    groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector,
    hairCheckboxes: () => hairCheckboxes,
    hairFieldset: () => hairFieldset,
    helpDialog: () => helpDialog,
    isViteDevelopment,
    languageList: () => languageList,
    loadPackageManifest: shell.loadPackageManifest,
    matchCount: () => matchCount,
    modifierFilters: () => modifierFilters,
    nextRenderGeneration: () => ++listRenderGeneration,
    onClick: shell.onClick,
    openPanel: (...args) => openPanelDialog(...args),
    orderButtons: () => orderButtons,
    panelDialogs,
    recordCopiedEmoji: shell.recordCopiedEmoji,
    rebuildEmojiCodePointLookup: shell.rebuildEmojiCodePointLookup,
    renderCategoryFilters: () => renderCategoryFilters(),
    renderGeneration: () => listRenderGeneration,
    renderSavedEmoji: shell.renderSavedEmoji,
    renderVersionModeToggle: () => renderVersionModeToggle(),
    resetFilters: () => resetFilters(),
    revealExplorer: () => revealExplorer(),
    savePreference: saveExplorerPreference,
    searchText: () => searchText,
    sequenceTranslationKeys,
    sequenceTypeEmoji,
    sequenceTypeLabels,
    sequenceTypeOrder,
    sequenceTypeSelector: () => sequenceTypeSelector,
    setDialogView: (...args) => setEmojiDialogView(...args),
    setSuppressDialogCloseSync: value => (suppressDialogCloseSync = value),
    showEmoji: (...args) => showEmoji(...args),
    skinToneCheckboxes: () => skinToneCheckboxes,
    skinToneFieldset: () => skinToneFieldset,
    state: () => explorerState,
    subGroupFilterDialog: () => subGroupFilterDialog,
    subGroupPickerTrigger: () => subGroupPickerTrigger,
    subGroupSelector: () => subGroupSelector,
    suppressedPanelCloses: () => suppressedPanelCloses,
    syncUrlState: (...args) => syncUrlState(...args),
    translate,
    unassigned: UNASSIGNED,
    unicodeGroupLabelKeys,
    unicodeSubgroupLabelKeys,
    updateCompositionBackButton: (...args) => updateCompositionBackButton(...args),
    updateDialogNavigation: (...args) => updateDialogNavigation(...args),
    updateEmojiComposition: shell.updateEmojiComposition,
    updateEmojiImportExamples: shell.updateEmojiImportExamples,
    updateModifierArtwork: shell.updateModifierPixelArtwork,
    updatePixelArtworkManifest: shell.updatePixelArtworkManifest,
    urlStateReady: () => urlStateReady,
    versionModeSelector: () => versionModeSelector,
    versionNext: () => versionNext,
    versionPrevious: () => versionPrevious,
    versionRange: () => versionRange,
    versionRangeValue: () => versionRangeValue,
    versionSelector: () => versionSelector
  })
);

drawList = controllers.drawList;
loadVersionData = controllers.loadVersionData;
resetFilters = controllers.resetFilters;
syncUrlState = controllers.syncUrlState;
focusInitialEmojiDialogAction = controllers.focusInitialAction;
setEmojiDialogView = controllers.setView;

bootstrapRuntime = createExplorerBootstrapRuntime(
  buildExplorerBootstrapRuntimeOptions({
    ...buildExplorerBootstrapRuntimeSourceOptions({
      advancedFilters: () => advancedFilters,
      applyingUrlState: () => applyingUrlState,
      applyBasicUrlState: controllers.applyBasicUrlState,
      applyDialogUrlState: controllers.applyDialogUrlState,
      applyPixelArtworkClass: shell.applyPixelArtworkClass,
      applyStandalonePixelArtwork: shell.applyStandalonePixelArtwork,
      clearFiltersButton: () => clearFiltersButton,
      copyStatus: () => copyStatus,
      developerModeEnabled: shell.developerModeEnabled,
      developerModeToggle: () => developerModeToggle,
      displayGroupName: controllers.displayGroupName,
      displayUnicodeSubGroupName: controllers.displayUnicodeSubGroupName,
      drawList: (...args) => drawList(...args),
      emojiFontChoices: () => emojiFontChoices,
      emojiList: () => emojiList,
      genderCheckboxes: () => genderCheckboxes,
      getIntroducedVersion: shell.getIntroducedVersion,
      getPixelEditor: () => pixelEditor,
      getPixelEditorPromise: () => pixelEditorPromise,
      groupFilterDialog: () => groupFilterDialog,
      groupPickerTrigger: () => groupPickerTrigger,
      groupSelector: () => groupSelector,
      hairCheckboxes: () => hairCheckboxes,
      helpDialog: () => helpDialog,
      helpPicker: () => helpPicker,
      installApp: shell.installApp,
      installAppButton: () => installAppButton,
      installDialog: () => installDialog,
      languageDialog: () => languageDialog,
      languageList: () => languageList,
      languagePicker: () => languagePicker,
      languagePickerFlag: () => languagePickerFlag,
      languagePickerLabel: () => languagePickerLabel,
      loadData: controllers.loadData,
      loadSearchLanguages: () => loadSearchLanguages(),
      loadUiTranslations: shell.loadUiTranslations,
      matchCount: () => matchCount,
      navigateEmoji: amount => navigateEmoji(amount),
      nextSearchLoadId: () => ++explorerState.searchLoadId,
      onClick: shell.onClick,
      onCompactChoiceKeyDown: controllers.onCompactChoiceKeyDown,
      onDocumentKeyDown: controllers.onDocumentKeyDown,
      onEmojiDialogClick: controllers.onEmojiDialogClick,
      onEmojiDialogClose: shell.onEmojiDialogClose,
      onEmojiFocus: controllers.onEmojiFocus,
      onEmojiKeyDown: controllers.onEmojiKeyDown,
      onGenderChange: controllers.onGenderChange,
      onOrderModeChange: controllers.onOrderModeChange,
      onVersionRangeInput: controllers.onVersionRangeInput,
      openFilterPicker: controllers.openFilterPicker,
      orderButtons: () => orderButtons,
      panelDialogs,
      populateVersionModeOptions: (...args) => populateVersionModeOptions(...args),
      renderCategoryFilters: (...args) => controllers.renderCategoryFilters(...args),
      renderDeveloperMode: shell.renderDeveloperMode,
      renderInstallAppButton: shell.renderInstallAppButton,
      renderPixelFontToggle: shell.renderPixelFontToggle,
      renderSavedEmoji: shell.renderSavedEmoji,
      renderThemeToggle: shell.renderThemeToggle,
      renderVersionModeToggle: () => renderVersionModeToggle(),
      restoreDeveloperMode: () => {
        explorerState.developerModeFromUrl =
          new URLSearchParams(window.location.search).get('developer') === '1';
        shell.renderDeveloperMode();
      },
      savePreference: saveExplorerPreference,
      savedDialog: () => savedDialog,
      savedPicker: () => savedPicker,
      scheduleSearchDraw: controllers.scheduleSearchDraw,
      searchText: () => searchText,
      selectEmojiFont: shell.selectEmojiFont,
      selectTheme: shell.selectTheme,
      setApplyingUrlState: value => (applyingUrlState = value),
      setControls(values) {
        ({
          activeFilterSummary,
          activeFilterText,
          clearFiltersButton,
          compactGroupChoices,
          compactGroupLabel,
          compactSequenceChoices,
          compactSequenceLabel,
          compactSubGroupChoices,
          compactSubGroupLabel,
          sequenceTypeSelector,
          versionModeToggle,
          versionRange,
          versionRangeValue
        } = values);
      },
      setElements(values) {
        ({
          advancedFilters,
          copyStatus,
          developerModeToggle,
          emojiFontChoices,
          emojiList,
          genderCheckboxes,
          groupFilterDialog,
          groupPickerTrigger,
          groupSelector,
          hairCheckboxes,
          helpDialog,
          helpPicker,
          installAppButton,
          installDialog,
          languageDialog,
          languageList,
          languagePicker,
          languagePickerFlag,
          languagePickerLabel,
          matchCount,
          modifierFilters,
          offlineStatus,
          orderButtons,
          savedDialog,
          savedPicker,
          searchText,
          skinToneCheckboxes,
          subGroupFilterDialog,
          subGroupPickerTrigger,
          subGroupSelector,
          themeChoices,
          toolbar,
          versionModeSelector,
          versionNext,
          versionPrevious,
          versionSelector
        } = values);
      },
      setFieldsets(values) {
        ({ skinToneFieldset, hairFieldset, genderFieldset } = values);
      },
      setPixelEditor: editor => {
        pixelEditor = editor;
      },
      setPixelEditorPromise: promise => {
        pixelEditorPromise = promise;
      },
      setSearchLanguage: locale => {
        explorerState.selectedSearchLocale = locale;
      },
      setSuppressDialogCloseSync: value => (suppressDialogCloseSync = value),
      setUrlStateReady: value => (urlStateReady = value),
      showEmoji: (...args) => showEmoji(...args),
      skinToneCheckboxes: () => skinToneCheckboxes,
      state: () => explorerState,
      subGroupFilterDialog: () => subGroupFilterDialog,
      subGroupPickerTrigger: () => subGroupPickerTrigger,
      subGroupSelector: () => subGroupSelector,
      suppressedPanelCloses: () => suppressedPanelCloses,
      syncUrlState: (...args) => syncUrlState(...args),
      syncVersionRange: (...args) => controllers.syncVersionRange(...args),
      themeChoices: () => themeChoices,
      toggleDeveloperMode: shell.toggleDeveloperMode,
      toolbar: () => toolbar,
      translate,
      updateCompositionBackButton: (...args) => updateCompositionBackButton(...args),
      updateDialogNavigation: (...args) => updateDialogNavigation(...args),
      updateEmojiComposition: shell.updateEmojiComposition,
      updateFavoriteButton: shell.updateFavoriteButton,
      updateModifierArtwork: shell.updateModifierPixelArtwork,
      updateOnlineStatus: shell.updateOnlineStatus,
      updatePixelArtworkManifest: shell.updatePixelArtworkManifest,
      updateRenderingDiagnostic: shell.updateRenderingDiagnostic,
      urlStateReady: () => urlStateReady,
      versionModeSelector: () => versionModeSelector,
      versionModeToggle: () => versionModeToggle,
      versionNext: () => versionNext,
      versionPrevious: () => versionPrevious,
      versionRange: () => versionRange,
      versionSelector: () => versionSelector
    })
  })
);

populateVersionModeOptions = bootstrapRuntime.populateVersionModeOptions;
renderVersionModeToggle = bootstrapRuntime.renderVersionModeToggleController;
toggleVersionMode = bootstrapRuntime.toggleVersionMode;
loadSearchLanguages = bootstrapRuntime.loadSearchLanguages;
renderSearchLanguages = bootstrapRuntime.renderSearchLanguages;
showEmoji = bootstrapRuntime.showEmoji;
navigateEmoji = bootstrapRuntime.navigateEmoji;
updateDialogNavigation = bootstrapRuntime.updateDialogNavigation;
updateCompositionBackButton = bootstrapRuntime.updateCompositionBackButton;
revealExplorer = bootstrapRuntime.revealExplorer;

bootstrapRuntime.removeLegacyDialogElements();
createExplorerApp({ window, start: bootstrapRuntime.onLoad }).startWhenReady();
