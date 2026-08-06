// @ts-nocheck -- Transitional bootstrap entry point; remove as features move into typed modules.
import {
  explorerLabelKeys,
  sequenceTranslationKeys,
  sequenceTypeEmoji,
  sequenceTypeLabels,
  sequenceTypeOrder,
  unicodeGroupLabelKeys,
  unicodeSubgroupLabelKeys,
} from "../../explorer/explorer-labels.js";
import * as route from "../route.js";
import { getExplorerSubGroup } from "../../explorer/category/category-rules.js";
import {
  formatUiNumber as formatUiNumberValue,
  formatUiPercent as formatUiPercentValue,
  normalizeCodePoints,
} from "../../explorer/emoji/emoji-format.js";
import { animateCopyConfirmation as animateEmojiCopyConfirmation } from "../../explorer/saved-emoji.js";
import { openPanelDialog } from "../../explorer/pwa/pwa-panels.js";
import { createExplorerApp } from "../../explorer-app.js";
import { parseExplorerModeParam } from "../../explorer/navigation/url-state.js";
import { createExplorerState } from "../../explorer-state.js";
import { createUiFormatters } from "../browser/browser-runtime.js";
import {
  assignExplorerBootstrapElements,
  createExplorerBootstrapBindings,
} from "./explorer-bootstrap-bindings.js";
import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapShellOptions,
} from "./explorer-bootstrap-options.js";
import { createExplorerBootstrapControllers } from "./explorer-bootstrap-controllers.js";
import { initializeExplorerBootstrapSessionRuntime } from "./explorer-bootstrap-session-runtime.js";
import { createExplorerBootstrapShell } from "./explorer-bootstrap-shell.js";
import { initializeExplorerPreferences } from "../explorer-preferences.js";
import { translate } from "../../utils/i18n.js";
import { renderThemeToggle } from "../../render-theme-toggle.js";
import * as audioToggle from "../../controls/audio/audio-toggle.js";
const UNASSIGNED = "\u0000";
const explorerState = createExplorerState();
const bindings = createExplorerBootstrapBindings();
initializeExplorerPreferences(explorerState);
const displayExplorerLabel = (label) =>
  translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
  filters: bindings.advancedFilters,
  favorites: bindings.savedDialog,
  help: bindings.helpDialog,
  language: bindings.languageDialog,
});
const isViteDevelopment =
  typeof import.meta.env !== "undefined" && import.meta.env.DEV === true;

const { formatUiNumber, formatUiPercent } = createUiFormatters({
  document,
  selectedSearchLocale: () => explorerState.selectedSearchLocale,
  formatNumber: formatUiNumberValue,
  formatPercent: formatUiPercentValue,
});

const shell = createExplorerBootstrapShell(
  buildExplorerBootstrapShellOptions({
    applyingUrlState: () => bindings.applyingUrlState,
    copyStatus: () => bindings.copyStatus,
    developerModeToggle: () => bindings.developerModeToggle,
    modeChoices: () => bindings.modeChoices,
    dialog: () =>
      bindings.bootstrapRuntime?.explorerRuntime.get("exampleDialog"),
    drawList: () => bindings.drawList(),
    emojiFontChoices: () => bindings.emojiFontChoices,
    genderCheckboxes: () => bindings.genderCheckboxes,
    getPixelEditor: () => bindings.pixelEditor,
    hairCheckboxes: () => bindings.hairCheckboxes,
    installAppButton: () => bindings.installAppButton,
    installDialog: () => bindings.installDialog,
    loadVersionData: () => bindings.loadVersionData(),
    normalizeCodePoints,
    offlineStatus: () => bindings.offlineStatus,
    orderButtons: () => bindings.orderButtons,
    renderCategoryFilters: () => bindings.renderCategoryFilters(),
    renderSearchLanguages: () => bindings.renderSearchLanguages(),
    renderVersionModeToggle: () => bindings.renderVersionModeToggle(),
    savedDialog: () => bindings.savedDialog,
    setDialogView: (...args) => bindings.setEmojiDialogView(...args),
    showEmoji: (...args) => bindings.showEmoji(...args),
    skinToneCheckboxes: () => bindings.skinToneCheckboxes,
    state: () => explorerState,
    suppressDialogCloseSync: () => bindings.suppressDialogCloseSync,
    syncUrlState: (...args) => bindings.syncUrlState(...args),
    syncVersionRange: () => bindings.syncVersionRange(),
    themeChoices: () => bindings.themeChoices,
    translate,
    urlStateReady: () => bindings.urlStateReady,
    versionModeSelector: () => bindings.versionModeSelector,
    versionSelector: () => bindings.versionSelector,
  }),
);

const controllers = createExplorerBootstrapControllers(
  buildExplorerBootstrapControllerOptions({
    activeFilterSummary: () => bindings.activeFilterSummary,
    activeFilterText: () => bindings.activeFilterText,
    animateCopy: animateEmojiCopyConfirmation,
    applyingUrlState: () => bindings.applyingUrlState,
    applyPixelArtworkClass: shell.applyPixelArtworkClass,
    compactGroupChoices: () => bindings.compactGroupChoices,
    compactGroupLabel: () => bindings.compactGroupLabel,
    compactSequenceChoices: () => bindings.compactSequenceChoices,
    compactSequenceLabel: () => bindings.compactSequenceLabel,
    compactSubGroupChoices: () => bindings.compactSubGroupChoices,
    compactSubGroupLabel: () => bindings.compactSubGroupLabel,
    copyToClipboardValue: shell.copyToClipboardValue,
    developerModeEnabled: shell.developerModeEnabled,
    fullDeveloperModeEnabled: shell.fullDeveloperModeEnabled,
    dialog: () =>
      bindings.bootstrapRuntime?.explorerRuntime.get("exampleDialog"),
    displayExplorerLabel,
    drawList: () => bindings.drawList(),
    ensurePanelDialog: async (panel) => {
      await bindings.bootstrapRuntime?.ensureUtilityPanel?.(panel);
      const elements =
        bindings.bootstrapRuntime?.explorerRuntime?.resolveElements?.();
      if (elements) {
        assignExplorerBootstrapElements(bindings, elements);
      }
      shell.renderDeveloperMode();
      renderThemeToggle();
      shell.renderPixelFontToggle();
      audioToggle.render();
      bindings.renderSearchLanguages?.();
    },
    emojiList: () => bindings.emojiList,
    emojiParent: () =>
      bindings.bootstrapRuntime?.explorerRuntime.get("emojiParent"),
    ensurePixelEditor: () => bindings.bootstrapRuntime?.ensurePixelEditor(),
    focusInitialEmojiDialogAction: () =>
      bindings.focusInitialEmojiDialogAction(),
    formatNumber: formatUiNumber,
    getPixelEditor: () => bindings.pixelEditor,
    genderCheckboxes: () => bindings.genderCheckboxes,
    genderFieldset: () => bindings.genderFieldset,
    getEmojiGenders: (item) => bindings.bootstrapRuntime?.getEmojiGenders(item),
    getExplorerSubGroup,
    getIntroducedVersion: shell.getIntroducedVersion,
    groupFilterDialog: () => bindings.groupFilterDialog,
    groupPickerTrigger: () => bindings.groupPickerTrigger,
    groupSelector: () => bindings.groupSelector,
    hairCheckboxes: () => bindings.hairCheckboxes,
    hairFieldset: () => bindings.hairFieldset,
    helpDialog: () => bindings.helpDialog,
    isViteDevelopment,
    languageList: () => bindings.languageList,
    loadPackageManifest: shell.loadPackageManifest,
    matchCount: () => bindings.matchCount,
    modifierFilters: () => bindings.modifierFilters,
    navigateEmoji: (amount) => bindings.bootstrapRuntime?.navigateEmoji(amount),
    nextRenderGeneration: () => ++bindings.listRenderGeneration,
    onClick: shell.onClick,
    openPanel: (...args) => openPanelDialog(...args),
    orderButtons: () => bindings.orderButtons,
    panelDialogs,
    recordCopiedEmoji: shell.recordCopiedEmoji,
    rebuildEmojiCodePointLookup: shell.rebuildEmojiCodePointLookup,
    renderCategoryFilters: () => bindings.renderCategoryFilters(),
    renderGeneration: () => bindings.listRenderGeneration,
    renderSavedEmoji: shell.renderSavedEmoji,
    renderVersionModeToggle: () => bindings.renderVersionModeToggle(),
    resetFilters: () => bindings.resetFilters(),
    revealExplorer: () => bindings.revealExplorer(),
    searchText: () => bindings.searchText,
    sequenceTranslationKeys,
    sequenceTypeEmoji,
    sequenceTypeLabels,
    sequenceTypeOrder,
    sequenceTypeSelector: () => bindings.sequenceTypeSelector,
    setDialogView: (...args) => bindings.setEmojiDialogView(...args),
    setSuppressDialogCloseSync: (value) =>
      (bindings.suppressDialogCloseSync = value),
    showEmoji: (...args) => bindings.showEmoji(...args),
    skinToneCheckboxes: () => bindings.skinToneCheckboxes,
    skinToneFieldset: () => bindings.skinToneFieldset,
    state: () => explorerState,
    subGroupFilterDialog: () => bindings.subGroupFilterDialog,
    subGroupPickerTrigger: () => bindings.subGroupPickerTrigger,
    subGroupSelector: () => bindings.subGroupSelector,
    suppressedPanelCloses: () => bindings.suppressedPanelCloses,
    syncUrlState: (...args) => bindings.syncUrlState(...args),
    toggleFavorite: shell.toggleFavorite,
    translate,
    unassigned: UNASSIGNED,
    unicodeGroupLabelKeys,
    unicodeSubgroupLabelKeys,
    updateCompositionBackButton: (...args) =>
      bindings.updateCompositionBackButton(...args),
    updateDialogNavigation: (...args) =>
      bindings.updateDialogNavigation(...args),
    updateEmojiComposition: shell.updateEmojiComposition,
    updateEmojiImportExamples: shell.updateEmojiImportExamples,
    updateModifierArtwork: shell.updateModifierPixelArtwork,
    updatePixelArtworkManifest: shell.updatePixelArtworkManifest,
    urlStateReady: () => bindings.urlStateReady,
    versionModeSelector: () => bindings.versionModeSelector,
    versionNext: () => bindings.versionNext,
    versionPrevious: () => bindings.versionPrevious,
    versionRange: () => bindings.versionRange,
    versionRangeValue: () => bindings.versionRangeValue,
    versionSelector: () => bindings.versionSelector,
  }),
);

Object.assign(bindings, {
  drawList: controllers.drawList,
  loadVersionData: controllers.loadVersionData,
  resetFilters: controllers.resetFilters,
  syncUrlState: controllers.syncUrlState,
  focusInitialEmojiDialogAction: controllers.focusInitialAction,
  setEmojiDialogView: controllers.setView,
});

bindings.bootstrapRuntime = initializeExplorerBootstrapSessionRuntime({
  bindings,
  controllers,
  panelDialogs,
  restoreDeveloperMode: () => {
    const explorerModeFromUrl = parseExplorerModeParam(route.getSearch());
    explorerState.explorerModeFromUrl = explorerModeFromUrl;
    explorerState.developerModeFromUrl = explorerModeFromUrl !== "";
    shell.renderDeveloperMode();
  },
  shell,
  state: () => explorerState,
  translate,
});

bindings.bootstrapRuntime.removeLegacyDialogElements();
createExplorerApp({
  window,
  start: bindings.bootstrapRuntime.onLoad,
}).startWhenReady();
