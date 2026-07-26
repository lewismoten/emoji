// @ts-nocheck -- Transitional entry point; remove as features move into typed modules.
import { explorerLabelKeys, languageFlags, sequenceTranslationKeys, sequenceTypeEmoji, sequenceTypeLabels, sequenceTypeOrder, statusTranslationKeys, unicodeGroupLabelKeys, unicodeSubgroupLabelKeys, versionModeDefinitions } from './explorer/explorer-labels.js';
import { getExplorerSubGroup } from './explorer/category-rules.js';
import { formatUiNumber as formatUiNumberValue, formatUiPercent as formatUiPercentValue, normalizeCodePoints } from './explorer/emoji-format.js';
import { animateCopyConfirmation as animateEmojiCopyConfirmation } from './explorer/saved-emoji.js';
import { ensureUtilityControls, positionFavoriteButton } from './explorer/utility-controls.js';
import { closePanelDialog, onPanelDialogClose, openPanelDialog, updateWebAppManifest } from './explorer/pwa-panels.js';
import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper } from './explorer/dialog-render.js';
import { getEmojiGenders as getEmojiGendersHelper } from './explorer/emoji-filter.js';
import { createEmojiDialogViewController } from './explorer/dialog-view.js';
import { createPixelArtworkManager } from './explorer/pixel-artwork.js';
import { getExplorerElements } from './explorer/explorer-dom.js';
import { createListOrchestration } from './app/list-orchestration.js';
import { initializeExplorerPreferences } from './app/explorer-preferences.js';
import { createExplorerApp } from './explorer-app.js';
import { createExplorerState } from './explorer-state.js';
import { createCategoryController } from './app/category-controller.js';
import { createExplorerRuntime } from './explorer-runtime.js';
import { createEmojiActions } from './app/emoji-actions.js';
import { createVersionModeController } from './app/version-mode-controller.js';
import { createExplorerShell } from './app/explorer-shell.js';
import { createUiFormatters } from './app/browser-runtime.js';
import { createBrowserRuntimeConfig } from './app/browser-runtime-config.js';
import { initializeDialogRuntime } from './app/dialog-runtime.js';
import { createEmojiDialogClickRuntime } from './app/emoji-dialog-click-runtime.js';
import { createNavigationRuntime } from './app/navigation-runtime.js';
import { createPixelEditorRuntime } from './app/pixel-editor-runtime.js';
import { createStartupRuntime } from './app/startup-runtime.js';
import { createVersionRuntime } from './app/version-runtime.js';
const UNASSIGNED = '\u0000';
const explorerState = createExplorerState();
let searchText, languagePicker, languagePickerFlag, languagePickerLabel, languageDialog, languageList, savedPicker, savedDialog, helpPicker, helpDialog, developerModeToggle, emojiList, matchCount, toolbar, groupSelector, subGroupSelector, groupPickerTrigger, subGroupPickerTrigger, groupFilterDialog, subGroupFilterDialog, compactGroupChoices, compactSubGroupChoices, sequenceTypeSelector, compactSequenceChoices, compactGroupLabel, compactSubGroupLabel, compactSequenceLabel, versionModeSelector, versionSelector, versionModeToggle, versionRange, versionRangeValue, versionPrevious, versionNext, advancedFilters, activeFilterSummary, activeFilterText, clearFiltersButton, orderButtons, skinToneCheckboxes, hairCheckboxes, genderCheckboxes, modifierFilters, skinToneFieldset, hairFieldset, genderFieldset, searchDrawTimer, copyStatus, pixelEditor, pixelEditorPromise, offlineStatus, installAppButton, installDialog;
let emojiFontChoices = [], themeChoices = [], listRenderGeneration = 0, urlStateReady = false, applyingUrlState = false, suppressDialogCloseSync = false, suppressedPanelCloses = new WeakSet();
const { save: saveExplorerPreference } = initializeExplorerPreferences(explorerState);
const translate = (key, fallback) => explorerState.uiStrings[key] ?? fallback;
const displayExplorerLabel = label => translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
    favorites: savedDialog,
    help: helpDialog,
    language: languageDialog
});
const isViteDevelopment = typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true;
const { formatUiNumber, formatUiPercent } = createUiFormatters({
    document,
    selectedSearchLocale: () => explorerState.selectedSearchLocale,
    formatNumber: formatUiNumberValue,
    formatPercent: formatUiPercentValue
});
const pixelArtwork = createPixelArtworkManager({
    byId: () => explorerState.byId,
    emojiByKey: () => explorerState.emojiByKey,
    emojiKeyByCodePoints: () => explorerState.emojiKeyByCodePoints,
    genderCheckboxes: () => genderCheckboxes,
    hairCheckboxes: () => hairCheckboxes,
    normalizeCodePoints,
    pixelFontPreferred: () => explorerState.explorerPreferences.pixelFont !== false,
    refreshEditor: () => {
        if (explorerRuntime.get('exampleDialog')?.classList.contains('is-editor-view'))
            pixelEditor?.refreshFontBuild();
    },
    skinToneCheckboxes: () => skinToneCheckboxes,
    updateRenderingDiagnostic: values => updateRenderingDiagnosticHelper({
        ...values,
        byId: explorerState.byId,
        developerMode: developerModeEnabled(),
        detailsVisible: !explorerRuntime.get('exampleDialog').classList.contains('is-code-view') &&
            !explorerRuntime.get('exampleDialog').classList.contains('is-editor-view'),
        exampleDialog: explorerRuntime.get('exampleDialog'),
        translate
    })
});
const { applyPixelArtworkClass, refreshRenderedPixelEmoji, renderedPixelEmoji, systemEmojiAppearsSplit, updateModifierPixelArtwork, updatePixelArtworkManifest, updateRenderingDiagnostic } = pixelArtwork;
const applyStandalonePixelArtwork = applyPixelArtworkClass;
const explorerShell = createExplorerShell({
    applyPixelArtworkClass: () => applyPixelArtworkClass,
    developerModeToggle: () => developerModeToggle,
    dialog: () => explorerRuntime.get('exampleDialog'),
    drawList: () => drawList(),
    emojiFontChoices: () => emojiFontChoices,
    installAppButton: () => installAppButton,
    installDialog: () => installDialog,
    loadVersionData: () => loadVersionData(),
    offlineStatus: () => offlineStatus,
    orderButtons: () => orderButtons,
    pixelEditor: () => pixelEditor,
    refreshRenderedPixelEmoji,
    renderCategoryFilters: () => renderCategoryFilters(),
    renderSearchLanguages: () => renderSearchLanguages(),
    renderVersionModeToggle: () => renderVersionModeToggle(),
    savedDialog: () => savedDialog,
    savePreference: saveExplorerPreference,
    setDialogView: (...args) => setEmojiDialogView(...args),
    state: () => explorerState,
    syncUrlState: () => syncUrlState(),
    syncVersionRange: () => syncVersionRange(),
    themeChoices: () => themeChoices,
    translate,
    versionModeSelector: () => versionModeSelector,
    versionSelector: () => versionSelector
});
const { applyUiTranslations, recordCopiedEmoji, renderList: renderSavedEmojiList, renderSavedEmoji, toggleFavorite, updateFavoriteButton, developerModeEnabled, installApp, loadUiTranslations, renderDeveloperMode, renderInstallAppButton, renderPixelFontToggle, renderThemeToggle, selectEmojiFont, selectTheme, toggleDeveloperMode, updateOnlineStatus } = explorerShell;
const emojiActions = createEmojiActions({
    applyingUrlState: () => applyingUrlState,
    applyPixelArtworkClass: () => applyPixelArtworkClass,
    applyStandalonePixelArtwork: () => applyStandalonePixelArtwork,
    copyStatus: () => copyStatus,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    normalizeCodePoints,
    setDialogView: (...args) => setEmojiDialogView(...args),
    showEmoji: (...args) => showEmoji(...args),
    state: () => explorerState,
    suppressDialogCloseSync: () => suppressDialogCloseSync,
    syncUrlState: (...args) => syncUrlState(...args),
    translate,
    urlStateReady: () => urlStateReady
});
const { copyToClipboardValue, getIntroducedVersion, loadPackageManifest, onClick, onEmojiDialogClose, rebuildEmojiCodePointLookup, updateEmojiComposition, updateEmojiImportExamples } = emojiActions;
const categoryController = createCategoryController({
    compactGroupChoices: () => compactGroupChoices,
    compactGroupLabel: () => compactGroupLabel,
    compactSequenceChoices: () => compactSequenceChoices,
    compactSequenceLabel: () => compactSequenceLabel,
    compactSubGroupChoices: () => compactSubGroupChoices,
    compactSubGroupLabel: () => compactSubGroupLabel,
    developerModeEnabled,
    drawList: () => drawList(),
    getVersionKeys: () => versionController.getVersionKeys(),
    groupFilterDialog: () => groupFilterDialog,
    groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector,
    orderButtons: () => orderButtons,
    savePreference: saveExplorerPreference,
    sequenceTranslationKeys,
    sequenceTypeEmoji,
    sequenceTypeLabels,
    sequenceTypeOrder,
    sequenceTypeSelector: () => sequenceTypeSelector,
    state: () => explorerState,
    subGroupFilterDialog: () => subGroupFilterDialog,
    subGroupPickerTrigger: () => subGroupPickerTrigger,
    subGroupSelector: () => subGroupSelector,
    syncVersionRange: () => versionController.syncVersionRange(),
    translate,
    unicodeGroupLabelKeys,
    unicodeSubgroupLabelKeys
});
const { buildRepresentatives: buildCategoryRepresentatives, closeFilterPicker, displayGroupName, displayUnicodeSubGroupName, focusCompactChoice, getGroupRepresentativeEmoji, getSubGroupRepresentativeEmoji, onCompactChoiceKeyDown, onGroupSelectorChange, onOrderModeChange, onSequenceTypeSelectorChange, onSubGroupSelectorChange, openFilterPicker, refreshLocalizedLabels, renderCategoryFilters, subGroupSelectionKey, updateAvailableCategories } = categoryController;
let versionController = createVersionRuntime({
    applyLoadedUrlState: (...args) => applyLoadedUrlState(...args),
    buildRepresentatives: buildCategoryRepresentatives,
    developerModeEnabled,
    drawList: (...args) => drawList(...args),
    getEmojiGenders: (...args) => getEmojiGenders(...args),
    getExplorerSubGroup,
    getIntroducedVersion,
    groupSelector: () => groupSelector,
    genderCheckboxes: () => genderCheckboxes,
    genderFieldset: () => genderFieldset,
    hairCheckboxes: () => hairCheckboxes,
    hairFieldset: () => hairFieldset,
    isViteDevelopment,
    modifierFilters: () => modifierFilters,
    onClick,
    onGroupChange: onGroupSelectorChange,
    onSequenceTypeChange: onSequenceTypeSelectorChange,
    onSubGroupChange: onSubGroupSelectorChange,
    rebuildCodePointLookup: rebuildEmojiCodePointLookup,
    renderCategoryFilters,
    sequenceTypeSelector: () => sequenceTypeSelector,
    setDialogView: (...args) => setEmojiDialogView(...args),
    skinToneCheckboxes: () => skinToneCheckboxes,
    skinToneFieldset: () => skinToneFieldset,
    state: () => explorerState,
    subGroupSelector: () => subGroupSelector,
    translate,
    updateModifierArtwork: updateModifierPixelArtwork,
    updatePixelArtworkManifest,
    versionModeSelector: () => versionModeSelector,
    versionNext: () => versionNext,
    versionPrevious: () => versionPrevious,
    versionRange: () => versionRange,
    versionRangeValue: () => versionRangeValue,
    versionSelector: () => versionSelector
});
const { getVersionKeys, loadData, loadVersionData, onVersionRangeInput, populateVersionSelector, syncVersionRange, updateModifierAvailability, versionSliderLabel } = versionController;
let resetFilters = () => { };
let syncUrlState = () => { };
let updateDialogNavigation = () => { };
let navigateEmoji = (amount) => { };
let renderVersionModeToggle = () => { };
let setEmojiDialogView = () => { };
let updateCompositionBackButton = () => { };
const { drawList, //used by createExplorerNavigation
onEmojiFocus, onEmojiKeyDown, scheduleSearchDraw, updateActiveFilterSummary } = createListOrchestration({
    activeFilterSummary: () => activeFilterSummary,
    activeFilterText: () => activeFilterText,
    applyPixelArtworkClass,
    displayExplorerLabel,
    displayGroupName,
    displayUnicodeSubGroupName,
    emojiList: () => emojiList,
    formatNumber: formatUiNumber,
    genderCheckboxes: () => genderCheckboxes,
    getIntroducedVersion,
    getVersionKeys,
    hairCheckboxes: () => hairCheckboxes,
    matchCount: () => matchCount,
    nextRenderGeneration: () => ++listRenderGeneration,
    onClick,
    renderGeneration: () => listRenderGeneration,
    resetFilters: () => resetFilters(),
    revealExplorer: () => revealExplorer(),
    searchText: () => searchText,
    sequenceTranslationKeys,
    sequenceTypeLabels,
    sequenceTypeOrder,
    skinToneCheckboxes: () => skinToneCheckboxes,
    state: () => explorerState,
    subGroupSelectionKey,
    syncUrlState: () => syncUrlState(),
    translate,
    unassigned: UNASSIGNED,
    updateDialogNavigation: () => updateDialogNavigation(),
    versionModeSelector: () => versionModeSelector,
    versionSelector: () => versionSelector,
    versionSliderLabel
});
const { applyBasicUrlState, applyDialogUrlState, applyLoadedUrlState, onDocumentKeyDown, onGenderChange, resetFilters: resetFiltersController, stepVersion, syncUrlState: syncUrlStateController } = createNavigationRuntime({
    allowedSequenceTypes: sequenceTypeOrder,
    applyingUrlState: () => applyingUrlState,
    compositionMode: () => explorerState.compositionMode,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    displayedKeys: () => explorerState.displayedKeys,
    drawList: (...args) => drawList(...args),
    emojiByKey: () => explorerState.emojiByKey,
    focusInitialAction: () => focusInitialEmojiDialogAction(),
    genderCheckboxes: () => genderCheckboxes,
    getOrderMode: () => explorerState.orderMode,
    getSelectedGroup: () => explorerState.selectedGroup,
    getSelectedSequenceType: () => explorerState.selectedSequenceType,
    getSelectedSubGroup: () => explorerState.selectedSubGroup,
    groups: () => explorerState.groups,
    hairCheckboxes: () => hairCheckboxes,
    helpDialog: () => helpDialog,
    languageList: () => languageList,
    latestReleasedVersion: () => explorerState.versionManifests.at(-1)?.version,
    navigateEmoji: amount => navigateEmoji(amount),
    orderButtons: () => orderButtons,
    panelDialogs,
    preferredOrder: () => explorerState.explorerPreferences.order,
    renderCategoryFilters: (...args) => renderCategoryFilters(...args),
    renderSavedEmoji,
    renderVersionModeToggle: () => renderVersionModeToggle(),
    searchText: () => searchText,
    setCompositionMode: value => (explorerState.compositionMode = value),
    setDialogView: (...args) => setEmojiDialogView(...args),
    setOrderMode: value => (explorerState.orderMode = value),
    setSelectedGroup: value => (explorerState.selectedGroup = value),
    setSelectedSequenceType: value => (explorerState.selectedSequenceType = value),
    setSelectedSubGroup: value => (explorerState.selectedSubGroup = value),
    setSuppressDialogCloseSync: value => (suppressDialogCloseSync = value),
    showEmoji: (...args) => showEmoji(...args),
    skinToneCheckboxes: () => skinToneCheckboxes,
    subGroupSelectionKey,
    subGroups: () => explorerState.subGroups,
    suppressedPanelCloses: () => suppressedPanelCloses,
    syncVersionRange: (...args) => syncVersionRange(...args),
    urlStateReady: () => urlStateReady,
    versionModeSelector: () => versionModeSelector,
    versionRange: () => versionRange,
    versionSelector: () => versionSelector
});
resetFilters = resetFiltersController;
syncUrlState = syncUrlStateController;
const { focusInitialAction: focusInitialEmojiDialogAction, setView: setEmojiDialogViewController } = createEmojiDialogViewController({
    byId: () => explorerState.byId,
    currentDialogParentStack: () => explorerState.currentDialogParentStack,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    emojiByKey: () => explorerState.emojiByKey,
    emojiParent: () => explorerRuntime.get('emojiParent'),
    ensurePixelEditor: () => ensurePixelEditor(),
    getPixelEditor: () => pixelEditor,
    loadPackageManifest,
    syncUrlState,
    translate,
    updateCompositionBackButton,
    updateImportExamples: updateEmojiImportExamples
});
setEmojiDialogView = setEmojiDialogViewController;
const onEmojiDialogClick = createEmojiDialogClickRuntime({
    animateCopy: animateEmojiCopyConfirmation,
    byId: () => explorerState.byId,
    copy: copyToClipboardValue,
    currentDialogParentStack: () => explorerState.currentDialogParentStack,
    currentEmojiCopies: () => explorerState.currentEmojiCopies,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => explorerRuntime.get('exampleDialog'),
    emojiByKey: () => explorerState.emojiByKey,
    languageList: () => languageList,
    openPanel: openPanelDialog,
    panelDialogs,
    recordCopiedEmoji,
    renderSavedEmoji,
    setSuppressDialogCloseSync: value => (suppressDialogCloseSync = value),
    setView: setEmojiDialogView,
    showEmoji: (...args) => showEmoji(...args),
    syncUrlState: (...args) => syncUrlState(...args),
    toggleComposition: () => (explorerState.compositionMode =
        explorerState.compositionMode === 'full' ? 'condensed' : 'full'),
    toggleFavorite,
    translate,
    updateCompositionBackButton: () => updateCompositionBackButton(),
    updateEmojiComposition,
    clearCurrentDialogParentStack: () => {
        explorerState.currentDialogParentStack = [];
    }
});
const explorerRuntime = createExplorerRuntime({
    ensureUtilityControls,
    getElements: getExplorerElements
});
const startupOrchestrator = createStartupRuntime({
    advancedFilters: () => advancedFilters,
    applyingUrlState: () => applyingUrlState,
    applyBasicUrlState,
    applyDialogUrlState,
    applyPixelArtworkClass,
    assignControls(controls) {
        ({ activeFilterSummary, activeFilterText, clearFiltersButton, compactGroupChoices,
            compactGroupLabel, compactSequenceChoices, compactSequenceLabel, compactSubGroupChoices,
            compactSubGroupLabel, sequenceTypeSelector, versionModeToggle, versionRange,
            versionRangeValue } = controls);
    },
    assignElements(elements) {
        ({ advancedFilters, copyStatus, developerModeToggle, emojiFontChoices, emojiList,
            genderCheckboxes, groupFilterDialog, groupPickerTrigger, groupSelector, hairCheckboxes,
            helpDialog, helpPicker, installAppButton, installDialog, languageDialog, languageList,
            languagePicker, languagePickerFlag, languagePickerLabel, matchCount, modifierFilters,
            offlineStatus, orderButtons, savedDialog, savedPicker, searchText, skinToneCheckboxes,
            subGroupFilterDialog, subGroupPickerTrigger, subGroupSelector, themeChoices, toolbar,
            versionModeSelector, versionNext, versionPrevious, versionSelector } = elements);
    },
    assignModifierFieldsets() {
        skinToneFieldset = skinToneCheckboxes[0]?.closest('fieldset');
        hairFieldset = hairCheckboxes[0]?.closest('fieldset');
        genderFieldset = genderCheckboxes[0]?.closest('fieldset');
    },
    clearFiltersButton: () => clearFiltersButton, copiedEmojiKeys: () => explorerState.copiedEmojiKeys,
    developerModeToggle: () => developerModeToggle,
    dialog: () => explorerRuntime.get('exampleDialog'),
    drawList: (...args) => drawList(...args), emojiByKey: () => explorerState.emojiByKey,
    emojiFontChoices: () => emojiFontChoices, emojiList: () => emojiList,
    emojiNext: () => explorerRuntime.get('emojiNext'), emojiPrevious: () => explorerRuntime.get('emojiPrevious'),
    favoriteEmojiKeys: () => explorerState.favoriteEmojiKeys, genderCheckboxes: () => genderCheckboxes,
    groupFilterDialog: () => groupFilterDialog, groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector, hairCheckboxes: () => hairCheckboxes,
    helpDialog: () => helpDialog, helpPicker: () => helpPicker,
    hideModifierEmojiAccessibility() {
        document
            .querySelectorAll('.modifier-emoji')
            .forEach(emoji => emoji.setAttribute('aria-hidden', 'true'));
    },
    installApp,
    installAppButton: () => installAppButton, installDialog: () => installDialog,
    languageDialog: () => languageDialog, languageList: () => languageList,
    languagePicker: () => languagePicker, loadData, loadSearchLanguages: () => loadSearchLanguages(),
    loadUiTranslations, matchCount: () => matchCount, navigateEmoji: amount => navigateEmoji(amount),
    onClick, onCompactChoiceKeyDown, onDocumentKeyDown, onEmojiDialogClick, onEmojiDialogClose,
    onEmojiFocus, onEmojiKeyDown, onGenderChange, onOrderModeChange, onPanelClose: onPanelDialogClose,
    onVersionRangeInput,
    openFilterPicker,
    orderButtons: () => orderButtons, panelDialogs,
    populateVersionModeOptions: (...args) => populateVersionModeOptions(...args), positionFavoriteButton,
    preferences: () => explorerState.explorerPreferences,
    renderDeveloperMode, renderInstallAppButton, renderPixelFontToggle, renderSavedEmoji, renderThemeToggle,
    renderVersionModeToggle: () => renderVersionModeToggle(),
    resolveElements: () => explorerRuntime.resolveElements(), resetFilters: () => resetFilters(),
    savePreference: saveExplorerPreference, savedDialog: () => savedDialog, savedPicker: () => savedPicker,
    scheduleSearchDraw, searchText: () => searchText, selectEmojiFont, selectTheme,
    setUrlStateReady: value => (urlStateReady = value),
    showEmoji: (...args) => showEmoji(...args), skinToneCheckboxes: () => skinToneCheckboxes,
    stepVersion, subGroupFilterDialog: () => subGroupFilterDialog,
    subGroupPickerTrigger: () => subGroupPickerTrigger, subGroupSelector: () => subGroupSelector,
    suppressedPanelCloses: () => suppressedPanelCloses, syncUrlState: (...args) => syncUrlState(...args),
    syncVersionRange: (...args) => syncVersionRange(...args),
    themeChoices: () => themeChoices,
    toggleDeveloperMode, toggleVersionMode: (...args) => toggleVersionMode(...args),
    toolbar: () => toolbar,
    updateOnlineStatus, urlStateReady: () => urlStateReady,
    versionModeSelector: () => versionModeSelector, versionModeToggle: () => versionModeToggle,
    versionNext: () => versionNext, versionPrevious: () => versionPrevious,
    versionRange: () => versionRange, versionSelector: () => versionSelector
});
const { finishExplorerLoading, onLoad, removeLegacyDialogElements, revealExplorer } = startupOrchestrator;
const { ensurePixelEditor } = createPixelEditorRuntime({
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => explorerRuntime.get('exampleDialog'),
    emojiByKey: () => explorerState.emojiByKey,
    formatNumber: formatUiNumber,
    formatPercent: formatUiPercent,
    getEditor: () => pixelEditor,
    getPromise: () => pixelEditorPromise,
    setEditor: editor => {
        pixelEditor = editor;
    },
    setPromise: promise => {
        pixelEditorPromise = promise;
    },
    translate
});
const versionModeController = createVersionModeController({
    definitions: versionModeDefinitions,
    drawList: () => drawList(),
    renderCategoryFilters: () => renderCategoryFilters(),
    selector: () => versionModeSelector,
    toggle: () => versionModeToggle,
    translate
});
const { populateOptions: populateVersionModeOptions, render: renderVersionModeToggleController, toggle: toggleVersionMode } = versionModeController;
renderVersionModeToggle = renderVersionModeToggleController;
const searchLanguageLifecycle = createBrowserRuntimeConfig({
    applyDialogUrlState,
    applyPixelArtworkClass,
    applyStandalonePixelArtwork,
    closePanelDialog,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    currentLoadId: () => explorerState.searchLoadId,
    dialog: () => explorerRuntime.get('exampleDialog'),
    languageDialog: () => languageDialog,
    languageFlags,
    languageList: () => languageList,
    languagePicker: () => languagePicker,
    languagePickerFlag: () => languagePickerFlag,
    languagePickerLabel: () => languagePickerLabel,
    loadUiTranslations,
    nextLoadId: () => ++explorerState.searchLoadId,
    onPixelFontRevisionLoaded: () => {
        pixelEditor?.refreshFontBuild();
    },
    refreshLocalizedLabels,
    restoreDeveloperMode: () => {
        explorerState.developerModeFromUrl =
            new URLSearchParams(window.location.search).get('developer') === '1';
        renderDeveloperMode();
    },
    saveExplorerPreference,
    searchLocales: () => explorerState.searchLocales,
    selectedSearchLocale: () => explorerState.selectedSearchLocale,
    setApplyingUrlState: value => (applyingUrlState = value),
    setSearchAnnotations: value => (explorerState.searchAnnotations = value),
    setSearchLabels: value => (explorerState.searchLabels = value),
    setSearchLocales: value => (explorerState.searchLocales = value),
    setSearchSubgroupLabels: value => (explorerState.searchSubgroupLabels = value),
    setSelectedLocale: value => (explorerState.selectedSearchLocale = value),
    suppressedPanelCloses: () => suppressedPanelCloses,
    syncUrlState: (...args) => syncUrlState(...args),
    translate,
    updateModifierArtwork: () => {
        if (skinToneCheckboxes && hairCheckboxes)
            updateModifierPixelArtwork();
    },
    updatePixelArtworkManifest,
    updateWebAppManifest
});
const { load: loadSearchLanguages, render: renderSearchLanguages, select: selectLanguageLink, set: setSearchLanguage } = searchLanguageLifecycle;
const getEmojiGenders = item => getEmojiGendersHelper(item, explorerState.emojiByKey);
const { showEmoji, navigateEmoji: navigateEmojiController, updateDialogNavigation: updateDialogNavigationController, updateCompositionBackButton: updateCompositionBackButtonController } = initializeDialogRuntime({
    applyPixelArtworkClass,
    applyStandalonePixelArtwork,
    byId: () => explorerState.byId,
    copyStatus: () => copyStatus,
    currentDialogParentStack: () => explorerState.currentDialogParentStack,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    dialogNavigationKeys: () => explorerState.dialogNavigationKeys,
    displayedKeys: () => explorerState.displayedKeys,
    displayGroupName,
    displayUnicodeSubGroupName,
    emojiByKey: () => explorerState.emojiByKey,
    emojiNext: () => explorerRuntime.get('emojiNext'),
    emojiParent: () => explorerRuntime.get('emojiParent'),
    emojiPrevious: () => explorerRuntime.get('emojiPrevious'),
    focusInitialAction: focusInitialEmojiDialogAction,
    getIntroducedVersion,
    openEditor: (key, value) => pixelEditor?.open(key, value),
    searchAnnotations: () => explorerState.searchAnnotations,
    sequenceTranslationKeys,
    sequenceTypeLabels,
    setCurrentDialogParentStack: (value) => (explorerState.currentDialogParentStack = value),
    setDialogView: setEmojiDialogView,
    state: () => explorerState,
    statusTranslationKeys,
    syncUrlState,
    translate,
    updateCompositionBackButton: () => updateCompositionBackButton(),
    updateDialogNavigation: () => updateDialogNavigation(),
    updateEmojiComposition,
    updateFavoriteButton,
    updateRenderingDiagnostic
});
updateDialogNavigation = updateDialogNavigationController;
navigateEmoji = navigateEmojiController;
updateCompositionBackButton = updateCompositionBackButtonController;
removeLegacyDialogElements();
createExplorerApp({ window, start: onLoad }).startWhenReady();
