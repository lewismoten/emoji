// @ts-nocheck -- Transitional entry point; remove as features move into typed modules.
import { explorerLabelKeys, languageFlags, sequenceTranslationKeys, sequenceTypeEmoji, sequenceTypeLabels, sequenceTypeOrder, statusTranslationKeys, unicodeGroupLabelKeys, unicodeSubgroupLabelKeys, versionModeDefinitions } from './explorer/explorer-labels.js';
import { getExplorerSubGroup } from './explorer/category-rules.js';
import { formatUiNumber as formatUiNumberValue, formatUiPercent as formatUiPercentValue, normalizeCodePoints } from './explorer/emoji-format.js';
import { createSavedEmojiController, animateCopyConfirmation as animateEmojiCopyConfirmation, copyToClipboard as copyToClipboardHelper, } from './explorer/saved-emoji.js';
import { ensureImportExamples as ensureImportExampleLines, getCodeExampleText as getCodeExampleTextValue, loadPackageManifest as loadPackageManifestHelper, renderImportExamples as renderImportExamplesHelper } from './explorer/import-examples.js';
import { ensureUtilityControls, positionFavoriteButton } from './explorer/utility-controls.js';
import { closePanelDialog, installApp as installWebApp, installedDisplayQueries, onPanelDialogClose, openPanelDialog, renderInstallAppButton as renderInstallAppButtonHelper, updateWebAppManifest } from './explorer/pwa-panels.js';
import { closeFilterPicker as closeFilterPickerHelper, displayUnicodeSubGroupName as displayUnicodeSubGroupNameHelper, focusCompactChoice as focusCompactChoiceHelper, onCompactChoiceKeyDown as onCompactChoiceKeyDownHelper, openFilterPicker as openFilterPickerHelper } from './explorer/filter-picker.js';
import { getVersionKeys as getVersionKeysHelper, syncVersionRange as syncVersionRangeHelper, updateModifierAvailability as updateModifierAvailabilityHelper, versionSliderLabel as versionSliderLabelHelper } from './explorer/category-version.js';
import { getIntroducedVersion as getIntroducedVersionHelper, updateEmojiComposition as updateEmojiCompositionHelper, updateRenderingDiagnostic as updateRenderingDiagnosticHelper, withoutCompositionParent } from './explorer/dialog-render.js';
import { createEmojiListRenderers } from './explorer/emoji-list-render.js';
import { createEmojiListInteraction } from './explorer/emoji-list-interaction.js';
import { getEmojiGenders as getEmojiGendersHelper } from './explorer/emoji-filter.js';
import { updateActiveFilterSummary as updateActiveFilterSummaryHelper } from './explorer/filter-summary.js';
import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from './explorer/dialog-upgrade.js';
import { createEmojiDialogViewController, loadStylesheet } from './explorer/dialog-view.js';
import { createPixelEditorLoader } from './explorer/pixel-editor-loader.js';
import { createExplorerNavigation } from './explorer/explorer-navigation.js';
import { createCategoryFilterRenderer } from './explorer/category-filter-render.js';
import { loadExplorerCatalog } from './explorer/catalog-loader.js';
import { createPixelArtworkManager } from './explorer/pixel-artwork.js';
import { loadVersionCatalog, populateVersionSelector as populateVersionSelectorHelper } from './explorer/version-data.js';
import { createSearchLanguageLifecycle } from './explorer/search-language-lifecycle.js';
import { getExplorerElements } from './explorer/explorer-dom.js';
import { observeToolbarHeight } from './explorer/toolbar-layout.js';
import { finishExplorerLoading as finishExplorerLoadingHelper, revealExplorer as revealExplorerHelper } from './explorer/loading-state.js';
import { createEmojiDialogClickHandler } from './explorer/emoji-dialog-events.js';
import { createListController } from './explorer/list-controller.js';
import { createDialogNavigationController } from './explorer/dialog-navigation-controller.js';
import { showEmojiSession } from './explorer/emoji-session.js';
import { createFilterControlSetup } from './explorer/filter-controls.js';
import { bindExplorerEvents, createExplorerApp, finalizeExplorerStartup, initializeExplorerControls } from './explorer-app.js';
import { createExplorerState } from './explorer-state.js';
import { buildCategoryRepresentatives as buildCategoryRepresentativesHelper } from './category-representatives.js';
import { createExplorerRuntime } from './explorer-runtime.js';
import { createExplorerUiController, createDeveloperModeController, renderPixelFontToggle as renderPixelFontToggleHelper, selectEmojiFont as selectEmojiFontHelper } from './explorer-ui.js';
import { installPixelFontHotReload, refreshExplorerPixelFont, refreshPixelFontStylesheet } from './pixel-font-hot-reload.js';
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
var exampleDialog;
var emojiParent;
var emojiPrevious;
var emojiNext;
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
var deferredInstallPrompt;
const explorerPreferencesKey = '@lewismoten/emoji:explorer-preferences';
explorerState.explorerPreferences = loadExplorerPreferences();
explorerState.developerModeFromUrl =
    new URLSearchParams(window.location.search).get('developer') === '1';
explorerState.favoriteEmojiKeys = Array.isArray(explorerState.explorerPreferences.favorites)
    ? explorerState.explorerPreferences.favorites
    : [];
explorerState.copiedEmojiKeys = Array.isArray(explorerState.explorerPreferences.recentCopied)
    ? explorerState.explorerPreferences.recentCopied
    : [];
const translate = (key, fallback) => explorerState.uiStrings[key] ?? fallback;
const displayExplorerLabel = label => translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
    favorites: savedDialog,
    help: helpDialog,
    language: languageDialog
});
function loadExplorerPreferences() {
    try {
        return JSON.parse(window.localStorage.getItem(explorerPreferencesKey) ?? '{}');
    }
    catch {
        return {};
    }
}
function saveExplorerPreference(key, value) {
    explorerState.explorerPreferences[key] = value;
    try {
        window.localStorage.setItem(explorerPreferencesKey, JSON.stringify(explorerState.explorerPreferences));
    }
    catch {
        // Preferences are optional when storage is unavailable or blocked.
    }
}
const { addFavorite, recordCopiedEmoji, renderList: renderSavedEmojiList, renderSavedEmoji, toggleFavorite, updateFavoriteButton } = createSavedEmojiController({
    applyPixelArtworkClass: () => applyPixelArtworkClass,
    byId: () => explorerState.byId,
    copiedEmojiKeys: () => explorerState.copiedEmojiKeys,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    emojiByKey: () => explorerState.emojiByKey,
    favoriteEmojiKeys: () => explorerState.favoriteEmojiKeys,
    savePreference: saveExplorerPreference,
    savedDialog: () => savedDialog,
    searchAnnotations: () => explorerState.searchAnnotations,
    setCopiedEmojiKeys: keys => (explorerState.copiedEmojiKeys = keys),
    setFavoriteEmojiKeys: keys => (explorerState.favoriteEmojiKeys = keys),
    translate
});
function renderPixelFontToggle() {
    renderPixelFontToggleHelper({
        choices: () => emojiFontChoices,
        refreshRenderedPixelEmoji,
        state: () => explorerState
    });
}
function selectEmojiFont(event) {
    selectEmojiFontHelper({ renderPixelFontToggle, savePreference: saveExplorerPreference }, event);
}
const developerMode = createDeveloperModeController({
    dialog: () => exampleDialog,
    disableDeveloperFeatures() {
        versionModeSelector.value = 'through';
        const latest = explorerState.versionManifests.at(-1)?.version;
        if (latest)
            versionSelector.value = latest;
        renderVersionModeToggle();
        syncVersionRange();
        if (explorerState.orderMode === 'sequence') {
            explorerState.orderMode = 'grouped';
            explorerState.selectedSequenceType = '';
            orderButtons?.forEach(button => {
                const active = button.dataset.order === explorerState.orderMode;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
            });
        }
        if (explorerState.items.length > 0) {
            renderCategoryFilters();
            drawList();
        }
    },
    loadVersionData, savePreference: saveExplorerPreference,
    setDialogView: (...args) => setEmojiDialogView(...args),
    state: () => explorerState, syncUrlState: () => syncUrlState(),
    toggle: () => developerModeToggle
});
const { change: toggleDeveloperMode, enabled: developerModeEnabled, render: renderDeveloperMode } = developerMode;
window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    renderInstallAppButton();
});
window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = undefined;
    if (installAppButton)
        installAppButton.hidden = true;
});
const explorerUi = createExplorerUiController({
    deferredInstallPrompt: () => deferredInstallPrompt,
    installAppButton: () => installAppButton,
    installDialog: () => installDialog,
    installWebApp,
    offlineStatus: () => offlineStatus,
    pixelEditor: () => pixelEditor,
    renderDeveloperMode,
    renderInstallAppButton: renderInstallAppButtonHelper,
    renderPixelFontToggle,
    renderSearchLanguages: () => renderSearchLanguages(),
    renderVersionModeToggle,
    setDeferredInstallPrompt: value => (deferredInstallPrompt = value),
    state: () => explorerState
});
const { applyTranslations: applyUiTranslations, installApp, loadUiTranslations, renderInstallAppButton, updateOnlineStatus } = explorerUi;
const onEmojiDialogClick = createEmojiDialogClickHandler({
    animateCopy: animateEmojiCopyConfirmation,
    copy: copyToClipboardValue,
    copyValue: kind => kind === 'code'
        ? getCodeExampleTextValue(exampleDialog)
        : kind === 'link'
            ? window.location.href
            : explorerState.currentEmojiCopies[kind],
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => exampleDialog,
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
        emojiNext,
        emojiParent,
        emojiPrevious,
        exampleDialog,
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
        developerModeToggle, drawList, emojiFontChoices, emojiList, emojiNext, emojiPrevious,
        exampleDialog, favoriteEmojiKeys: () => explorerState.favoriteEmojiKeys, genderCheckboxes,
        hairCheckboxes, helpDialog, helpPicker, installApp, installAppButton, installDialog,
        installedDisplayQueries, languageDialog, languageList, languagePicker, navigateEmoji,
        onClick, onDocumentKeyDown, onEmojiDialogClick, onEmojiDialogClose, onEmojiFocus,
        onEmojiKeyDown, onGenderChange, onOrderModeChange, onPanelClose: onPanelDialogClose,
        onVersionRangeInput, openPanel: openPanelDialog, orderButtons, panelDialogs,
        positionFavoriteButton, renderInstallAppButton, renderSavedEmoji, resetFilters,
        savePreference: saveExplorerPreference, savedDialog, savedPicker, scheduleSearchDraw,
        searchText, selectEmojiFont, showEmoji, skinToneCheckboxes, stepVersion,
        suppressedPanelCloses, syncUrlState, syncVersionRange, toggleDeveloperMode,
        toggleVersionMode, updateOnlineStatus, urlStateReady: () => urlStateReady,
        versionModeToggle, versionNext, versionPrevious, versionRange, versionSelector
    });
    await finalizeExplorerStartup({
        advancedFilters, applyDialogUrlState, drawList,
        filters: advancedFilters, finishExplorerLoading, loadData, loadSearchLanguages,
        loadUiTranslations, observeToolbarHeight, preferences: explorerState.explorerPreferences,
        renderPixelFontToggle, renderVersionModeToggle, setUrlStateReady: value => (urlStateReady = value),
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
        exampleDialog
    });
}
const loadPixelEditor = createPixelEditorLoader({
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialog: () => exampleDialog,
    emojiByKey: () => explorerState.emojiByKey,
    formatNumber: formatUiNumber,
    formatPercent: formatUiPercent,
    getEditor: () => pixelEditor,
    getPromise: () => pixelEditorPromise,
    loadEditor: () => import('./pixel-editor.js'),
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
const { focusInitialAction: focusInitialEmojiDialogAction, setView: setEmojiDialogView } = createEmojiDialogViewController({
    byId: () => explorerState.byId,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    developerModeEnabled,
    dialog: () => exampleDialog,
    emojiByKey: () => explorerState.emojiByKey,
    emojiParent: () => emojiParent,
    ensurePixelEditor,
    getPixelEditor: () => pixelEditor,
    loadPackageManifest,
    syncUrlState,
    translate,
    updateCompositionBackButton,
    updateImportExamples: updateEmojiImportExamples
});
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
function populateVersionModeOptions() {
    const previousValue = versionModeDefinitions.some(mode => mode.value === versionModeSelector.value)
        ? versionModeSelector.value
        : 'through';
    versionModeSelector.replaceChildren(...versionModeDefinitions.map(mode => {
        const option = document.createElement('option');
        option.value = mode.value;
        option.textContent = translate(mode.key, mode.fallback);
        return option;
    }));
    versionModeSelector.value = previousValue;
}
function renderVersionModeToggle() {
    if (!versionModeToggle)
        return;
    populateVersionModeOptions();
    const label = translate('selectedVersionOnly', 'Selected version only');
    versionModeToggle.setAttribute('aria-pressed', String(versionModeSelector.value === 'selected'));
    versionModeToggle.setAttribute('aria-label', label);
    versionModeToggle.title = label;
}
function toggleVersionMode(event) {
    versionModeSelector.value =
        versionModeSelector.value === 'selected' ? 'through' : 'selected';
    renderVersionModeToggle();
    renderCategoryFilters();
    drawList();
    if (event?.detail > 0)
        event.currentTarget.blur();
}
const explorerNavigation = createExplorerNavigation({
    allowedSequenceTypes: sequenceTypeOrder,
    applyingUrlState: () => applyingUrlState,
    closeEmojiDialog: () => {
        suppressDialogCloseSync = true;
        exampleDialog.close();
        suppressDialogCloseSync = false;
    },
    compositionMode: () => explorerState.compositionMode,
    developerModeEnabled,
    dialog: () => exampleDialog,
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
    openEmoji: key => showEmoji(key, false, explorerState.displayedKeys),
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
        exampleDialog.showModal();
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
const { applyBasicUrlState, applyDialogUrlState, applyLoadedUrlState, onDocumentKeyDown, onGenderChange, resetFilters, stepVersion, syncUrlState } = explorerNavigation;
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
async function loadData() {
    const catalog = await loadExplorerCatalog({
        getExplorerSubGroup,
        isViteDevelopment,
        updatePixelArtworkManifest
    });
    Object.assign(explorerState, catalog);
    rebuildEmojiCodePointLookup();
    updateModifierPixelArtwork();
    buildCategoryRepresentatives();
    versionModeSelector.value = 'through';
    groupSelector.addEventListener('change', onGroupSelectorChange);
    subGroupSelector.addEventListener('change', onSubGroupSelectorChange);
    sequenceTypeSelector.addEventListener('change', onSequenceTypeSelectorChange);
    renderCategoryFilters();
    onClick({ target: { id: 'clinkingBeerMugs' } }, false);
    applyLoadedUrlState();
    if (developerModeEnabled())
        await loadVersionData();
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
function onOrderModeChange(event) {
    if (event.currentTarget.dataset.order === 'sequence' &&
        !developerModeEnabled())
        return;
    explorerState.orderMode = event.currentTarget.dataset.order;
    saveExplorerPreference('order', explorerState.orderMode);
    orderButtons.forEach(button => {
        const active = button.dataset.order === explorerState.orderMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    renderCategoryFilters();
    drawList();
}
async function loadVersionData() {
    if (explorerState.versionDataPromise)
        return explorerState.versionDataPromise;
    explorerState.versionDataPromise = (async () => {
        try {
            const versions = await loadVersionCatalog({
                allIds: () => explorerState.allIds,
                byId: () => explorerState.byId,
                emojiByKey: () => explorerState.emojiByKey,
                getExplorerSubGroup,
                items: () => explorerState.items
            });
            explorerState.versionManifests = versions.released;
            explorerState.proposedVersionManifests = versions.proposed;
            explorerState.versionKeys = versions.versionKeys;
            rebuildEmojiCodePointLookup();
            updateModifierPixelArtwork();
            buildCategoryRepresentatives();
            populateVersionSelector();
            applyLoadedUrlState();
            renderCategoryFilters();
            drawList();
            if (explorerState.currentEmojiKey) {
                document.getElementsByClassName('emoji-version')[0].innerText =
                    getIntroducedVersion(explorerState.currentEmojiKey);
            }
        }
        catch (error) {
            console.warn('Version filters unavailable', error);
            versionModeSelector.disabled = true;
            versionSelector.disabled = true;
        }
    })();
    return explorerState.versionDataPromise;
}
function populateVersionSelector() {
    populateVersionSelectorHelper({
        proposed: explorerState.proposedVersionManifests,
        released: explorerState.versionManifests,
        selectedLocale: explorerState.selectedSearchLocale,
        selector: versionSelector,
        syncRange: syncVersionRange,
        translate
    });
}
function versionSliderLabel(version) {
    return versionSliderLabelHelper(version, explorerState.proposedVersionManifests);
}
function syncVersionRange() {
    syncVersionRangeHelper({
        proposedVersionManifests: explorerState.proposedVersionManifests,
        updateModifierAvailability,
        versionNext,
        versionPrevious,
        versionRange,
        versionRangeValue,
        versionSelector
    });
}
function onVersionRangeInput() {
    const option = versionSelector.options[Number(versionRange.value)];
    if (!option)
        return;
    versionSelector.value = option.value;
    syncVersionRange();
    renderCategoryFilters();
    drawList();
}
function updateModifierAvailability() {
    updateModifierAvailabilityHelper({
        byId: explorerState.byId,
        genderCheckboxes,
        genderFieldset,
        getEmojiGenders,
        hairCheckboxes,
        hairFieldset,
        modifierFilters,
        proposedVersionManifests: explorerState.proposedVersionManifests,
        skinToneCheckboxes,
        skinToneFieldset,
        versionKeys: explorerState.versionKeys,
        versionManifests: explorerState.versionManifests,
        versionValue: versionSelector.value
    });
}
function getVersionKeys() {
    return getVersionKeysHelper({
        proposedVersionManifests: explorerState.proposedVersionManifests,
        releasedIds: explorerState.releasedIds,
        versionKeys: explorerState.versionKeys,
        versionManifests: explorerState.versionManifests,
        versionMode: versionModeSelector.value,
        versionValue: versionSelector.value
    });
}
function onGroupSelectorChange() {
    explorerState.selectedGroup = groupSelector.value;
    explorerState.selectedSubGroup = '';
    renderCategoryFilters();
    drawList();
}
function onSubGroupSelectorChange() {
    explorerState.selectedSubGroup = subGroupSelector.value;
    renderCategoryFilters();
    drawList();
}
function onSequenceTypeSelectorChange() {
    explorerState.selectedSequenceType = sequenceTypeSelector.value;
    renderCategoryFilters();
    drawList();
}
function subGroupSelectionKey(group, subGroup) {
    return `${group}::${subGroup}`;
}
const categoryFilterRenderer = createCategoryFilterRenderer({
    availableGroups: () => explorerState.availableGroups,
    availableSequenceTypes: () => explorerState.availableSequenceTypes,
    availableSubGroups: () => explorerState.availableSubGroups,
    compactGroupChoices: () => compactGroupChoices,
    compactGroupLabel: () => compactGroupLabel,
    compactSequenceChoices: () => compactSequenceChoices,
    compactSequenceLabel: () => compactSequenceLabel,
    compactSubGroupChoices: () => compactSubGroupChoices,
    compactSubGroupLabel: () => compactSubGroupLabel,
    displayGroupName,
    displayUnicodeSubGroupName,
    drawList,
    getGroupRepresentativeEmoji,
    getSubGroupRepresentativeEmoji,
    getOrderMode: () => explorerState.orderMode,
    getVersionKeys,
    groupFilterDialog: () => groupFilterDialog,
    groupPickerTrigger: () => groupPickerTrigger,
    groupSelector: () => groupSelector,
    groups: () => explorerState.groups,
    items: () => explorerState.items,
    selectedGroup: () => explorerState.selectedGroup,
    selectedSequenceType: () => explorerState.selectedSequenceType,
    selectedSubGroup: () => explorerState.selectedSubGroup,
    sequenceTranslationKeys,
    sequenceTypeEmoji,
    sequenceTypeLabels,
    sequenceTypeOrder,
    sequenceTypeSelector: () => sequenceTypeSelector,
    setAvailableCategoryKeys: value => (explorerState.availableCategoryKeys = value),
    setAvailableGroups: value => (explorerState.availableGroups = value),
    setAvailableSequenceTypes: value => (explorerState.availableSequenceTypes = value),
    setAvailableSubGroups: value => (explorerState.availableSubGroups = value),
    setSelectedGroup: value => (explorerState.selectedGroup = value),
    setSelectedSequenceType: value => (explorerState.selectedSequenceType = value),
    setSelectedSubGroup: value => (explorerState.selectedSubGroup = value),
    subGroupFilterDialog: () => subGroupFilterDialog,
    subGroupPickerTrigger: () => subGroupPickerTrigger,
    subGroupSelectionKey,
    subGroupSelector: () => subGroupSelector,
    subGroups: () => explorerState.subGroups,
    translate,
    versionKeys: () => explorerState.versionKeys
});
const { renderCategoryFilters, updateAvailableCategories } = categoryFilterRenderer;
function openFilterPicker(dialog, choices) {
    return openFilterPickerHelper(dialog, choices);
}
function closeFilterPicker(dialog, trigger) {
    return closeFilterPickerHelper(dialog, trigger);
}
function focusCompactChoice(container, value) {
    return focusCompactChoiceHelper(container, value);
}
function onCompactChoiceKeyDown(event) {
    return onCompactChoiceKeyDownHelper(event);
}
function refreshLocalizedLabels() {
    if (explorerState.groups.length === 0)
        return;
    renderCategoryFilters();
    syncVersionRange();
    drawList();
}
function displayGroupName(name) {
    return explorerState.searchLabels[unicodeGroupLabelKeys[name]] ?? name;
}
function buildCategoryRepresentatives() {
    const representatives = buildCategoryRepresentativesHelper({
        groups: explorerState.groups,
        items: explorerState.items,
        proposedVersions: explorerState.proposedVersionManifests,
        releasedVersions: explorerState.versionManifests,
        subGroupKey: subGroupSelectionKey,
        subGroups: explorerState.subGroups,
        versionKeys: explorerState.versionKeys
    });
    explorerState.groupRepresentativeEmoji = representatives.groups;
    explorerState.subGroupRepresentativeEmoji = representatives.subGroups;
}
function getGroupRepresentativeEmoji(group) {
    return explorerState.groupRepresentativeEmoji.get(group) ?? '';
}
function getSubGroupRepresentativeEmoji(group, subGroup) {
    return (explorerState.subGroupRepresentativeEmoji.get(subGroupSelectionKey(group, subGroup)) ?? '');
}
function displayUnicodeSubGroupName(name) {
    return displayUnicodeSubGroupNameHelper(name, {
        searchSubgroupLabels: explorerState.searchSubgroupLabels,
        searchLabels: explorerState.searchLabels,
        unicodeSubgroupLabelKeys
    });
}
const { asEmojiCell, asItem, asSequenceItem, flushEmojiCellFragment, orderedKeys } = createEmojiListRenderers({
    applyPixelArtworkClass,
    byId: () => explorerState.byId,
    displayExplorerLabel,
    displayGroupName,
    displayUnicodeSubGroupName,
    emojiByKey: () => explorerState.emojiByKey,
    focusedEmojiKey: () => explorerState.focusedEmojiKey,
    getIntroducedVersion,
    groups: () => explorerState.groups,
    orderMode: () => explorerState.orderMode,
    searchAnnotations: () => explorerState.searchAnnotations,
    sequenceTranslationKeys,
    sequenceTypeLabels,
    sequenceTypeOrder,
    subGroups: () => explorerState.subGroups,
    translate,
    unassigned: UNASSIGNED
});
const getEmojiGenders = item => getEmojiGendersHelper(item, explorerState.emojiByKey);
const listController = createListController({
    allIds: () => explorerState.allIds,
    byId: () => explorerState.byId,
    emojiByKey: () => explorerState.emojiByKey,
    focusedEmojiKey: () => explorerState.focusedEmojiKey,
    formatNumber: formatUiNumber,
    genderCheckboxes: () => genderCheckboxes,
    getVersionKeys,
    hairCheckboxes: () => hairCheckboxes,
    items: () => explorerState.items,
    matchCount: () => matchCount,
    nextRenderGeneration: () => ++listRenderGeneration,
    orderMode: () => explorerState.orderMode,
    orderedKeys,
    renderEmojiList: (...args) => renderEmojiList(...args),
    searchAnnotations: () => explorerState.searchAnnotations,
    searchText: () => searchText,
    selectedGroup: () => explorerState.selectedGroup,
    selectedSearchLocale: () => explorerState.selectedSearchLocale,
    selectedSequenceType: () => explorerState.selectedSequenceType,
    selectedSubGroup: () => explorerState.selectedSubGroup,
    setDisplayedKeys: keys => (explorerState.displayedKeys = keys),
    setFocusedEmojiKey: key => (explorerState.focusedEmojiKey = key),
    skinToneCheckboxes: () => skinToneCheckboxes,
    subGroupSelectionKey,
    syncUrlState,
    updateDialogNavigation,
    updateFilterSummary: updateActiveFilterSummary
});
const { draw: drawList, schedule: scheduleSearchDraw } = listController;
const { onEmojiFocus, onEmojiKeyDown, renderEmojiList } = createEmojiListInteraction({
    asItem,
    asSequenceItem,
    drawList,
    emojiList: () => emojiList,
    flushEmojiCellFragment,
    focusedEmojiKey: () => explorerState.focusedEmojiKey,
    getDisplayedKeys: () => explorerState.displayedKeys,
    nextRenderGeneration: () => ++listRenderGeneration,
    onClick,
    orderMode: () => explorerState.orderMode,
    renderGeneration: () => listRenderGeneration,
    resetFilters,
    revealExplorer,
    searchText: () => searchText,
    setFocusedEmojiKey: key => {
        explorerState.focusedEmojiKey = key;
    },
    translate,
    unassigned: UNASSIGNED
});
function updateActiveFilterSummary() {
    updateActiveFilterSummaryHelper({
        activeFilterSummary,
        activeFilterText,
        displayGroupName,
        displayUnicodeSubGroupName,
        genderCheckboxes,
        hairCheckboxes,
        latestReleased: explorerState.versionManifests.at(-1)?.version,
        orderMode: explorerState.orderMode,
        searchText: searchText.value,
        selectedGroup: explorerState.selectedGroup,
        selectedSequenceType: explorerState.selectedSequenceType,
        selectedSubGroup: explorerState.selectedSubGroup,
        sequenceTranslationKeys,
        sequenceTypeLabels,
        skinToneCheckboxes,
        translate,
        versionMode: versionModeSelector.value,
        versionSliderLabel,
        versionValue: versionSelector.value
    });
}
function updateEmojiImportExamples(item) {
    renderImportExamplesHelper(explorerState.packageManifest, item);
}
async function loadPackageManifest() {
    return loadPackageManifestHelper({
        getManifest: () => explorerState.packageManifest,
        getPromise: () => explorerState.packageManifestPromise,
        setManifest: manifest => (explorerState.packageManifest = manifest),
        setPromise: promise => (explorerState.packageManifestPromise = promise)
    });
}
async function copyToClipboardValue(value, successMessage) {
    return copyToClipboardHelper({
        value,
        successMessage,
        copyStatus,
        translate
    });
}
function getIntroducedVersion(key) {
    return getIntroducedVersionHelper({
        key,
        versionKeys: explorerState.versionKeys,
        versionManifests: explorerState.versionManifests,
        proposedVersionManifests: explorerState.proposedVersionManifests
    });
}
function onClick(e, openDialog = true) {
    const cell = e.target.closest?.('[data-emoji-key]');
    var id = cell?.id ?? e.target.id;
    var value = explorerState.emojiByKey[id];
    if (value === undefined)
        return;
    cell?.focus();
    showEmoji(id, openDialog);
}
function onEmojiDialogClose() {
    setEmojiDialogView('details', false);
    if (suppressDialogCloseSync || !urlStateReady || applyingUrlState)
        return;
    if (window.history.state?.emojiDialogEntry) {
        window.history.back();
    }
    else {
        syncUrlState('replace', withoutCompositionParent());
    }
}
function updateEmojiComposition(item, value) {
    updateEmojiCompositionHelper({
        applyPixelArtworkClass,
        applyStandalonePixelArtwork,
        byId: explorerState.byId,
        compositionMode: explorerState.compositionMode,
        developerMode: developerModeEnabled(),
        detailsVisible: !exampleDialog.classList.contains('is-code-view') &&
            !exampleDialog.classList.contains('is-editor-view'),
        dir: document.documentElement.dir,
        emojiByKey: explorerState.emojiByKey,
        emojiKeyByCodePoints: explorerState.emojiKeyByCodePoints,
        exampleDialog,
        item,
        locale: document.documentElement.lang || explorerState.selectedSearchLocale || undefined,
        numberingSystem: document.documentElement.lang?.startsWith('ar')
            ? 'arab'
            : undefined,
        searchAnnotations: explorerState.searchAnnotations,
        translate,
        value
    });
}
function rebuildEmojiCodePointLookup() {
    explorerState.emojiKeyByCodePoints = explorerState.items.reduce((lookup, item) => {
        const codePoints = normalizeCodePoints(item.codePoints);
        if (codePoints &&
            (!lookup.has(codePoints) || item.status === 'fully-qualified')) {
            lookup.set(codePoints, item.key);
        }
        return lookup;
    }, new Map());
}
function formatUiNumber(value) {
    const locale = document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
    return formatUiNumberValue(value, locale, locale?.startsWith('ar') ? 'arab' : undefined);
}
function formatUiPercent(value) {
    const locale = document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
    return formatUiPercentValue(value, locale, locale?.startsWith('ar') ? 'arab' : undefined);
}
const pixelArtwork = createPixelArtworkManager({
    byId: () => explorerState.byId,
    emojiByKey: () => explorerState.emojiByKey,
    emojiKeyByCodePoints: () => explorerState.emojiKeyByCodePoints,
    hairCheckboxes: () => hairCheckboxes,
    normalizeCodePoints,
    pixelFontPreferred: () => explorerState.explorerPreferences.pixelFont !== false,
    refreshEditor: () => {
        if (exampleDialog?.classList.contains('is-editor-view'))
            pixelEditor?.refreshFontBuild();
    },
    skinToneCheckboxes: () => skinToneCheckboxes,
    updateRenderingDiagnostic: values => updateRenderingDiagnosticHelper({
        ...values,
        byId: explorerState.byId,
        developerMode: developerModeEnabled(),
        detailsVisible: !exampleDialog.classList.contains('is-code-view') &&
            !exampleDialog.classList.contains('is-editor-view'),
        exampleDialog,
        translate
    })
});
const { applyPixelArtworkClass, refreshRenderedPixelEmoji, renderedPixelEmoji, systemEmojiAppearsSplit, updateModifierPixelArtwork, updatePixelArtworkManifest, updateRenderingDiagnostic } = pixelArtwork;
const applyStandalonePixelArtwork = applyPixelArtworkClass;
installPixelFontHotReload({
    refreshStylesheet: revision => refreshPixelFontStylesheet({
        onStylesheetLoaded: loadedRevision => {
            pixelEditor?.refreshFontBuild();
            void refreshExplorerPixelFont({
                applyArtwork: applyPixelArtworkClass,
                applyStandaloneArtwork: applyStandalonePixelArtwork,
                currentEmojiKey: () => explorerState.currentEmojiKey,
                dialog: () => exampleDialog,
                updateManifest: updatePixelArtworkManifest,
                updateModifierArtwork: () => {
                    if (skinToneCheckboxes && hairCheckboxes)
                        updateModifierPixelArtwork();
                }
            }, loadedRevision);
        }
    }, revision)
});
function showEmoji(id, openDialog = true, navigationKeys) {
    return showEmojiSession({
        applyPixelArtworkClass,
        applyStandalonePixelArtwork,
        byId: explorerState.byId,
        compositionMode: explorerState.compositionMode,
        currentEmojiCopies: { get value() { return explorerState.currentEmojiCopies; }, set value(value) { explorerState.currentEmojiCopies = value; } },
        currentEmojiKey: { get value() { return explorerState.currentEmojiKey; }, set value(value) { explorerState.currentEmojiKey = value; } },
        developerMode: developerModeEnabled(),
        dialog: exampleDialog,
        dialogNavigationKeys: { get value() { return explorerState.dialogNavigationKeys; }, set value(value) { explorerState.dialogNavigationKeys = value; } },
        displayGroupName,
        displayUnicodeSubGroupName,
        displayedKeys: { value: explorerState.displayedKeys },
        emojiByKey: explorerState.emojiByKey,
        getIntroducedVersion,
        id,
        items: explorerState.items,
        navigationKeys,
        openDialog,
        openDialogAction() {
            if (copyStatus)
                copyStatus.textContent = '';
            setEmojiDialogView('details', false);
            exampleDialog.showModal();
            focusInitialEmojiDialogAction();
            syncUrlState('push', { ...withoutCompositionParent(), emojiDialogEntry: true });
        },
        openEditor: (key, value) => pixelEditor?.open(key, value),
        searchAnnotations: explorerState.searchAnnotations,
        selectedSearchLocale: explorerState.selectedSearchLocale,
        sequenceTranslationKeys,
        sequenceTypeLabels,
        statusTranslationKeys,
        translate,
        updateDialogNavigation,
        updateEmojiComposition,
        updateFavoriteButton,
        updateRenderingDiagnostic
    });
}
const dialogNavigation = createDialogNavigationController({
    byId: () => explorerState.byId,
    currentEmojiKey: () => explorerState.currentEmojiKey,
    dialogNavigationKeys: () => explorerState.dialogNavigationKeys,
    displayedKeys: () => explorerState.displayedKeys,
    emojiByKey: () => explorerState.emojiByKey,
    emojiNext: () => emojiNext,
    emojiParent: () => emojiParent,
    emojiPrevious: () => emojiPrevious,
    resolveNavigation: resolveDialogNavigationState,
    searchAnnotations: () => explorerState.searchAnnotations,
    showEmoji,
    syncUrlState,
    translate
});
const { navigate: navigateEmoji, update: updateDialogNavigation, updateBack: updateCompositionBackButton } = dialogNavigation;
removeLegacyDialogElements();
createExplorerApp({ window, start: onLoad }).startWhenReady();
