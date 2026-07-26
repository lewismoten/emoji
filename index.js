// @ts-nocheck -- Transitional entry point; remove as features move into typed modules.
import { explorerLabelKeys, languageFlags, sequenceTranslationKeys, sequenceTypeEmoji, sequenceTypeLabels, sequenceTypeOrder, statusTranslationKeys, unicodeGroupLabelKeys, unicodeSubgroupLabelKeys, versionModeDefinitions } from './explorer/explorer-labels.js';
import { getExplorerSubGroup } from './explorer/category-rules.js';
import { formatUiNumber as formatUiNumberValue, formatUiPercent as formatUiPercentValue, normalizeCodePoints } from './explorer/emoji-format.js';
import { animateCopyConfirmation as animateEmojiCopyConfirmation } from './explorer/saved-emoji.js';
import { ensureImportExamples as ensureImportExampleLines, getCodeExampleText as getCodeExampleTextValue } from './explorer/import-examples.js';
import { ensureUtilityControls, positionFavoriteButton } from './explorer/utility-controls.js';
import { closePanelDialog, installedDisplayQueries, onPanelDialogClose, openPanelDialog, updateWebAppManifest } from './explorer/pwa-panels.js';
import { updateRenderingDiagnostic as updateRenderingDiagnosticHelper, withoutDialogParentPanel, withoutCompositionParent } from './explorer/dialog-render.js';
import { getEmojiGenders as getEmojiGendersHelper } from './explorer/emoji-filter.js';
import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from './explorer/dialog-upgrade.js';
import { createEmojiDialogViewController, loadStylesheet } from './explorer/dialog-view.js';
import { createPixelEditorLoader } from './explorer/pixel-editor-loader.js';
import { createExplorerNavigation } from './explorer/explorer-navigation.js';
import { loadExplorerCatalog } from './explorer/catalog-loader.js';
import { createPixelArtworkManager } from './explorer/pixel-artwork.js';
import { loadVersionCatalog } from './explorer/version-data.js';
import { createSearchLanguageLifecycle } from './explorer/search-language-lifecycle.js';
import { getExplorerElements } from './explorer/explorer-dom.js';
import { observeToolbarHeight } from './explorer/toolbar-layout.js';
import { finishExplorerLoading as finishExplorerLoadingHelper, revealExplorer as revealExplorerHelper } from './explorer/loading-state.js';
import { createEmojiDialogClickHandler } from './explorer/emoji-dialog-events.js';
import { createListOrchestration } from './app/list-orchestration.js';
import { createDialogNavigationController } from './explorer/dialog-navigation-controller.js';
import { createEmojiSessionController } from './app/emoji-session-controller.js';
import { initializeExplorerPreferences } from './app/explorer-preferences.js';
import { createFilterControlSetup } from './explorer/filter-controls.js';
import { bindExplorerEvents, createExplorerApp, finalizeExplorerStartup, initializeExplorerControls } from './explorer-app.js';
import { createExplorerState } from './explorer-state.js';
import { createCategoryController } from './app/category-controller.js';
import { createExplorerRuntime } from './explorer-runtime.js';
import { createEmojiActions } from './app/emoji-actions.js';
import { createVersionController } from './app/version-controller.js';
import { createVersionModeController } from './app/version-mode-controller.js';
import { createExplorerShell } from './app/explorer-shell.js';
import { installPixelFontHotReload, refreshExplorerPixelFont, refreshPixelFontStylesheet } from './pixel-font-hot-reload.js';
import { resolveDialogNavigationState, } from './explorer/dialog-state.js';
const UNASSIGNED = '\u0000';
const explorerState = createExplorerState();
var searchText;
var languagePicker;
var languagePickerFlag;
var languagePickerLabel;
var emojiFontChoices = [];
var languageDialog;
var languageList;
var savedPicker;
var savedDialog;
var helpPicker;
var helpDialog;
var themeChoices = [];
var developerModeToggle;
var emojiList;
var matchCount;
var toolbar;
var groupSelector;
var subGroupSelector;
var groupPickerTrigger;
var subGroupPickerTrigger;
var groupFilterDialog;
var subGroupFilterDialog;
var compactGroupChoices;
var compactSubGroupChoices;
var sequenceTypeSelector;
var compactSequenceChoices;
var compactGroupLabel;
var compactSubGroupLabel;
var compactSequenceLabel;
var versionModeSelector;
var versionSelector;
var versionModeToggle;
var versionRange;
var versionRangeValue;
var versionPrevious;
var versionNext;
var advancedFilters;
var activeFilterSummary;
var activeFilterText;
var clearFiltersButton;
var orderButtons;
var skinToneCheckboxes;
var hairCheckboxes;
var genderCheckboxes;
var modifierFilters;
var skinToneFieldset;
var hairFieldset;
var genderFieldset;
var searchDrawTimer;
var listRenderGeneration = 0;
var copyStatus;
var pixelEditor;
var pixelEditorPromise;
var urlStateReady = false;
var applyingUrlState = false;
var suppressDialogCloseSync = false;
var suppressedPanelCloses = new WeakSet();
var offlineStatus;
var installAppButton;
var installDialog;
const { save: saveExplorerPreference } = initializeExplorerPreferences(explorerState);
const translate = (key, fallback) => explorerState.uiStrings[key] ?? fallback;
const displayExplorerLabel = label => translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
    favorites: savedDialog,
    help: helpDialog,
    language: languageDialog
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
let versionController = createVersionController({
    applyLoadedUrlState: () => applyLoadedUrlState(),
    buildRepresentatives: buildCategoryRepresentatives,
    developerModeEnabled,
    drawList: () => drawList(),
    getEmojiGenders: item => getEmojiGenders(item),
    getIntroducedVersion,
    groupSelector: () => groupSelector,
    genderCheckboxes: () => genderCheckboxes,
    genderFieldset: () => genderFieldset,
    hairCheckboxes: () => hairCheckboxes,
    hairFieldset: () => hairFieldset,
    loadCatalog: () => loadExplorerCatalog({ getExplorerSubGroup, isViteDevelopment, updatePixelArtworkManifest }),
    loadVersionCatalog: () => loadVersionCatalog({ allIds: () => explorerState.allIds, byId: () => explorerState.byId, emojiByKey: () => explorerState.emojiByKey, getExplorerSubGroup, items: () => explorerState.items }),
    modifierFilters: () => modifierFilters,
    onGroupChange: onGroupSelectorChange,
    onSequenceTypeChange: onSequenceTypeSelectorChange,
    onSubGroupChange: onSubGroupSelectorChange,
    openEmoji: (key, open, _navigationKeys, initialMode) => {
        onClick({ target: { id: key } }, open);
        if (open !== false && initialMode && initialMode !== 'details') {
            setEmojiDialogView(initialMode, false);
        }
    },
    rebuildCodePointLookup: rebuildEmojiCodePointLookup,
    renderCategoryFilters: () => renderCategoryFilters(),
    setIntroducedVersion: value => { const node = document.getElementsByClassName('emoji-version')[0]; if (node)
        node.innerText = value; },
    sequenceTypeSelector: () => sequenceTypeSelector,
    skinToneCheckboxes: () => skinToneCheckboxes,
    skinToneFieldset: () => skinToneFieldset,
    state: () => explorerState,
    subGroupSelector: () => subGroupSelector,
    translate,
    updateModifierArtwork: () => updateModifierPixelArtwork(),
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
    revealExplorer,
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
const { applyBasicUrlState, applyDialogUrlState, applyLoadedUrlState, onDocumentKeyDown, onGenderChange, resetFilters: resetFiltersController, stepVersion, syncUrlState: syncUrlStateController } = createExplorerNavigation({
    allowedSequenceTypes: sequenceTypeOrder,
    applyingUrlState: () => applyingUrlState,
    closeEmojiDialog: () => {
        suppressDialogCloseSync = true;
        explorerRuntime.get('exampleDialog').close();
        suppressDialogCloseSync = false;
    },
    compositionMode: () => explorerState.compositionMode,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    currentEmojiKey: () => explorerState.currentEmojiKey,
    drawList,
    emojiByKey: () => explorerState.emojiByKey,
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
    navigateEmoji,
    openEmoji: (key, openDialog, navigationKeys, initialMode) => showEmoji(key, openDialog ?? false, navigationKeys ?? explorerState.displayedKeys, initialMode),
    orderButtons: () => orderButtons,
    panelDialogs,
    preferredOrder: () => explorerState.explorerPreferences.order,
    renderCategoryFilters,
    renderSavedEmoji,
    renderVersionModeToggle,
    searchText: () => searchText,
    setCompositionMode: value => (explorerState.compositionMode = value),
    setDialogView: setEmojiDialogView,
    setOrderMode: value => (explorerState.orderMode = value),
    setSelectedGroup: value => (explorerState.selectedGroup = value),
    setSelectedSequenceType: value => (explorerState.selectedSequenceType = value),
    setSelectedSubGroup: value => (explorerState.selectedSubGroup = value),
    showEmojiDialog: () => {
        explorerRuntime.get('exampleDialog').showModal();
        focusInitialEmojiDialogAction();
    },
    skinToneCheckboxes: () => skinToneCheckboxes,
    subGroupSelectionKey,
    subGroups: () => explorerState.subGroups,
    suppressedPanelCloses: () => suppressedPanelCloses,
    syncVersionRange,
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
    ensurePixelEditor,
    getPixelEditor: () => pixelEditor,
    loadPackageManifest,
    syncUrlState,
    translate,
    updateCompositionBackButton,
    updateImportExamples: updateEmojiImportExamples
});
setEmojiDialogView = setEmojiDialogViewController;
const onEmojiDialogClick = createEmojiDialogClickHandler({
    animateCopy: animateEmojiCopyConfirmation,
    copy: copyToClipboardValue,
    copyValue: kind => kind === 'code'
        ? getCodeExampleTextValue(explorerRuntime.get('exampleDialog'))
        : kind === 'link'
            ? window.location.href
            : explorerState.currentEmojiCopies[kind],
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => explorerRuntime.get('exampleDialog'),
    openParentPanel: panel => {
        suppressDialogCloseSync = true;
        const exampleDialog = explorerRuntime.get('exampleDialog');
        exampleDialog.dataset.dialogParentPanel = '';
        explorerState.currentDialogParentStack = [];
        exampleDialog.close();
        suppressDialogCloseSync = false;
        openPanelDialog({
            panel,
            addHistory: false,
            dialogs: panelDialogs(),
            languageList: languageList,
            renderSavedEmoji,
            syncUrlState
        });
        syncUrlState('replace', withoutDialogParentPanel(withoutCompositionParent(window.history.state)));
    },
    openComposition: key => {
        const parentEmojiKey = explorerState.currentEmojiKey;
        showEmoji(key, false);
        syncUrlState('push', {
            ...window.history.state,
            emojiDialogEntry: false,
            compositionParent: parentEmojiKey
        });
        updateCompositionBackButton();
    },
    recordCopiedEmoji,
    refreshComposition: () => updateEmojiComposition(explorerState.byId[explorerState.currentEmojiKey] ?? {}, explorerState.emojiByKey[explorerState.currentEmojiKey] ?? ''),
    setView: setEmojiDialogView,
    syncUrlState: () => syncUrlState(),
    toggleComposition: () => (explorerState.compositionMode =
        explorerState.compositionMode === 'full' ? 'condensed' : 'full'),
    toggleFavorite: () => toggleFavorite(explorerState.currentEmojiKey),
    translate
});
const explorerRuntime = createExplorerRuntime({
    ensureUtilityControls,
    getElements: getExplorerElements
});
async function onLoad() {
    const elements = explorerRuntime.resolveElements();
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
    } = elements);
    ({
        activeFilterSummary, activeFilterText, clearFiltersButton,
        compactGroupChoices, compactGroupLabel, compactSequenceChoices,
        compactSequenceLabel, compactSubGroupChoices, compactSubGroupLabel,
        sequenceTypeSelector, versionModeToggle, versionRange, versionRangeValue
    } = initializeExplorerControls({
        createFilterControlSetup, groupFilterDialog, groupPickerTrigger,
        groupSelector, onCompactChoiceKeyDown, openFilterPicker, populateVersionModeOptions,
        renderDeveloperMode, subGroupFilterDialog, subGroupPickerTrigger, subGroupSelector,
        versionModeSelector, versionRange: () => versionRange, versionSelector
    }));
    upgradeEmojiDialog();
    skinToneFieldset = skinToneCheckboxes[0]?.closest('fieldset');
    hairFieldset = hairCheckboxes[0]?.closest('fieldset');
    genderFieldset = genderCheckboxes[0]?.closest('fieldset');
    document
        .querySelectorAll('.modifier-emoji')
        .forEach(emoji => emoji.setAttribute('aria-hidden', 'true'));
    bindExplorerEvents({
        advancedFilters, applyingUrlState: () => applyingUrlState, applyBasicUrlState,
        clearFiltersButton, closePanel: closePanelDialog, copiedEmojiKeys: () => explorerState.copiedEmojiKeys,
        developerModeToggle, drawList, emojiFontChoices, emojiList,
        favoriteEmojiKeys: () => explorerState.favoriteEmojiKeys, genderCheckboxes,
        hairCheckboxes, helpDialog, helpPicker, installApp, installAppButton, installDialog,
        installedDisplayQueries, languageDialog, languageList, languagePicker, navigateEmoji,
        onClick, onDocumentKeyDown, onEmojiDialogClick, onEmojiDialogClose, onEmojiFocus,
        onEmojiKeyDown, onGenderChange, onOrderModeChange, onPanelClose: onPanelDialogClose,
        onVersionRangeInput, openPanel: openPanelDialog, orderButtons, panelDialogs,
        positionFavoriteButton, renderInstallAppButton, renderSavedEmoji, resetFilters,
        savePreference: saveExplorerPreference, savedDialog, savedPicker, scheduleSearchDraw,
        searchText, selectEmojiFont, selectTheme, showEmoji, skinToneCheckboxes, stepVersion,
        suppressedPanelCloses, syncUrlState, syncVersionRange, toggleDeveloperMode,
        toggleVersionMode, themeChoices, updateOnlineStatus, urlStateReady: () => urlStateReady,
        versionModeToggle, versionNext, versionPrevious, versionRange, versionSelector,
        emojiNext: explorerRuntime.get('emojiNext'),
        emojiPrevious: explorerRuntime.get('emojiPrevious'),
        exampleDialog: explorerRuntime.get('exampleDialog')
    });
    await finalizeExplorerStartup({
        advancedFilters, applyDialogUrlState, drawList,
        filters: advancedFilters, finishExplorerLoading, loadData, loadSearchLanguages,
        loadUiTranslations, observeToolbarHeight, preferences: explorerState.explorerPreferences,
        renderPixelFontToggle, renderThemeToggle, renderVersionModeToggle, setUrlStateReady: value => (urlStateReady = value),
        syncUrlState, toolbar
    });
}
function finishExplorerLoading() {
    finishExplorerLoadingHelper({
        applyPixelArtworkClass,
        emojiByKey: explorerState.emojiByKey,
        emojiList,
        matchCount,
        revealExplorer
    });
}
function revealExplorer() {
    revealExplorerHelper(emojiList, matchCount);
}
function upgradeEmojiDialog() {
    upgradeEmojiDialogHelper({
        ensureImportExamples: ensureImportExampleLines,
        exampleDialog: explorerRuntime.get('exampleDialog')
    });
}
const loadPixelEditor = createPixelEditorLoader({
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => explorerRuntime.get('exampleDialog'),
    emojiByKey: () => explorerState.emojiByKey,
    formatNumber: formatUiNumber,
    formatPercent: formatUiPercent,
    getEditor: () => pixelEditor,
    getPromise: () => pixelEditorPromise,
    loadEditor: () => import('../pixel-editor.js'),
    loadStylesheet: () => loadStylesheet('./explorer/pixel-editor.css', 'pixel-editor-stylesheet'),
    setEditor: editor => {
        pixelEditor = editor;
    },
    setPromise: promise => {
        pixelEditorPromise = promise;
    },
    translate
});
function ensurePixelEditor() {
    return loadPixelEditor();
}
function removeLegacyDialogElements() {
    const dialog = document.querySelector('.example-dialog');
    dialog?.querySelector('[data-i18n="copiedDescription"]')?.remove();
    dialog?.querySelector('.example-link')?.remove();
    dialog?.querySelector('.emoji-copy-actions [data-copy="emoji"]')?.remove();
    dialog?.querySelector('.emoji-code-points')?.closest('div')?.remove();
    dialog
        ?.querySelector('.emoji-metadata [data-i18n="codePoints"]')
        ?.closest('div')
        ?.remove();
}
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
const isViteDevelopment = typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true;
if ('serviceWorker' in navigator &&
    window.isSecureContext &&
    isViteDevelopment) {
    window.addEventListener('load', async () => {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations
                .filter(registration => registration.scope.startsWith(window.location.origin))
                .map(registration => registration.unregister()));
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames
                .filter(name => name.startsWith('emoji-explorer-'))
                .map(name => caches.delete(name)));
        }
        catch (error) {
            console.warn('Could not clear local offline cache', error);
        }
    });
}
else if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(error => {
            console.warn('Offline support unavailable', error);
        });
    });
}
const searchLanguageLifecycle = createSearchLanguageLifecycle({
    applyDialogUrlState,
    closeLanguageDialog: () => closePanelDialog(languageDialog, suppressedPanelCloses),
    currentLoadId: () => explorerState.searchLoadId,
    languageFlags,
    languageList: () => languageList,
    languagePicker: () => languagePicker,
    languagePickerFlag: () => languagePickerFlag,
    languagePickerLabel: () => languagePickerLabel,
    loadUiTranslations,
    nextLoadId: () => ++explorerState.searchLoadId,
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
    syncUrlState,
    translate,
    updateWebAppManifest
});
const { load: loadSearchLanguages, onPopState, render: renderSearchLanguages, select: selectLanguageLink, set: setSearchLanguage } = searchLanguageLifecycle;
window.addEventListener('popstate', onPopState);
const getEmojiGenders = item => getEmojiGendersHelper(item, explorerState.emojiByKey);
const applyStandalonePixelArtwork = applyPixelArtworkClass;
function formatUiNumber(value) {
    const locale = document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
    return formatUiNumberValue(value, locale, locale?.startsWith('ar') ? 'arab' : undefined);
}
function formatUiPercent(value) {
    const locale = document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
    return formatUiPercentValue(value, locale, locale?.startsWith('ar') ? 'arab' : undefined);
}
installPixelFontHotReload({
    refreshStylesheet: revision => refreshPixelFontStylesheet({
        onStylesheetLoaded: loadedRevision => {
            pixelEditor?.refreshFontBuild();
            void refreshExplorerPixelFont({
                applyArtwork: applyPixelArtworkClass,
                applyStandaloneArtwork: applyStandalonePixelArtwork,
                currentEmojiKey: () => explorerState.currentEmojiKey,
                dialog: () => explorerRuntime.get('exampleDialog'),
                updateManifest: updatePixelArtworkManifest,
                updateModifierArtwork: () => {
                    if (skinToneCheckboxes && hairCheckboxes)
                        updateModifierPixelArtwork();
                }
            }, loadedRevision);
        }
    }, revision)
});
const { showEmoji } = createEmojiSessionController({
    applyPixelArtworkClass,
    applyStandalonePixelArtwork,
    developerModeEnabled,
    dialog: () => explorerRuntime.get('exampleDialog'),
    displayGroupName,
    displayUnicodeSubGroupName,
    getIntroducedVersion,
    openDialogAction(mode = 'details', parentPanel = '') {
        if (copyStatus)
            copyStatus.textContent = '';
        explorerRuntime.get('exampleDialog').dataset.dialogParentPanel = parentPanel;
        explorerState.currentDialogParentStack = parentPanel ? [parentPanel] : [];
        setEmojiDialogView(mode, false);
        explorerRuntime.get('exampleDialog').showModal();
        focusInitialEmojiDialogAction();
        syncUrlState('push', {
            ...withoutCompositionParent(window.history.state),
            emojiDialogEntry: true,
            dialogParentPanel: parentPanel
        });
        updateCompositionBackButton();
    },
    openEditor: (key, value) => pixelEditor?.open(key, value),
    sequenceTranslationKeys,
    sequenceTypeLabels,
    state: () => explorerState,
    statusTranslationKeys,
    translate,
    updateDialogNavigation,
    updateEmojiComposition,
    updateFavoriteButton,
    updateRenderingDiagnostic
});
const dialogNavigation = createDialogNavigationController({
    byId: () => explorerState.byId,
    currentDialogParentStack: () => explorerState.currentDialogParentStack,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => explorerRuntime.get('exampleDialog'),
    dialogNavigationKeys: () => explorerState.dialogNavigationKeys,
    displayedKeys: () => explorerState.displayedKeys,
    emojiByKey: () => explorerState.emojiByKey,
    emojiNext: () => explorerRuntime.get('emojiNext'),
    emojiParent: () => explorerRuntime.get('emojiParent'),
    emojiPrevious: () => explorerRuntime.get('emojiPrevious'),
    resolveNavigation: resolveDialogNavigationState,
    searchAnnotations: () => explorerState.searchAnnotations,
    showEmoji,
    syncUrlState,
    translate
});
const { navigate: navigateEmojiController, update: updateDialogNavigationController, updateBack: updateCompositionBackButtonController } = dialogNavigation;
updateDialogNavigation = updateDialogNavigationController;
navigateEmoji = navigateEmojiController;
updateCompositionBackButton = updateCompositionBackButtonController;
removeLegacyDialogElements();
createExplorerApp({ window, start: onLoad }).startWhenReady();
