// @ts-nocheck -- Transitional entry point; remove as features move into typed modules.
import {
  explorerLabelKeys,
  languageFlags,
  sequenceTranslationKeys,
  sequenceTypeEmoji,
  sequenceTypeLabels,
  sequenceTypeOrder,
  statusTranslationKeys,
  unicodeGroupLabelKeys,
  unicodeSubgroupLabelKeys,
  versionModeDefinitions
} from './explorer/explorer-labels.js';
import { getExplorerSubGroup, titleCase } from './explorer/category-rules.js';
import {
  formatUiNumber as formatUiNumberValue,
  formatUiPercent as formatUiPercentValue,
  normalizeCodePoints,
  normalizeDisplayName
} from './explorer/emoji-format.js';
import {
  createSavedEmojiController,
  copyToClipboard as copyToClipboardHelper,
} from './explorer/saved-emoji.js';
import {
  ensureImportExamples as ensureImportExampleLines,
  getCodeExampleText as getCodeExampleTextValue,
  renderImportExamples as renderImportExamplesHelper
} from './explorer/import-examples.js';
import {
  ensureUtilityControls,
  positionFavoriteButton
} from './explorer/utility-controls.js';
import {
  closePanelDialog,
  getOpenPanel,
  getPanelDialog,
  installApp as installWebApp,
  installedDisplayQueries,
  onPanelDialogClose,
  openPanelDialog,
  renderInstallAppButton as renderInstallAppButtonHelper,
  updateWebAppManifest
} from './explorer/pwa-panels.js';
import {
  closeFilterPicker as closeFilterPickerHelper,
  displayUnicodeSubGroupName as displayUnicodeSubGroupNameHelper,
  focusCompactChoice as focusCompactChoiceHelper,
  onCompactChoiceKeyDown as onCompactChoiceKeyDownHelper,
  openFilterPicker as openFilterPickerHelper
} from './explorer/filter-picker.js';
import {
  getVersionKeys as getVersionKeysHelper,
  syncVersionRange as syncVersionRangeHelper,
  updateModifierAvailability as updateModifierAvailabilityHelper,
  versionSliderLabel as versionSliderLabelHelper
} from './explorer/category-version.js';
import {
  getIntroducedVersion as getIntroducedVersionHelper,
  renderEmojiDialog,
  updateCompositionBackButton as updateCompositionBackButtonHelper,
  updateDialogNavigation as updateDialogNavigationHelper,
  updateEmojiComposition as updateEmojiCompositionHelper,
  updateRenderingDiagnostic as updateRenderingDiagnosticHelper,
  withoutCompositionParent
} from './explorer/dialog-render.js';
import { createEmojiListRenderers } from './explorer/emoji-list-render.js';
import { createEmojiListInteraction } from './explorer/emoji-list-interaction.js';
import {
  filterEmojiKeys,
  getEmojiGenders as getEmojiGendersHelper
} from './explorer/emoji-filter.js';
import { updateActiveFilterSummary as updateActiveFilterSummaryHelper } from './explorer/filter-summary.js';
import { upgradeEmojiDialog as upgradeEmojiDialogHelper } from './explorer/dialog-upgrade.js';
import {
  createEmojiDialogViewController,
  loadStylesheet
} from './explorer/dialog-view.js';
import { createPixelEditorLoader } from './explorer/pixel-editor-loader.js';
import { createExplorerNavigation } from './explorer/explorer-navigation.js';
import { createCategoryFilterRenderer } from './explorer/category-filter-render.js';
import { loadExplorerCatalog } from './explorer/catalog-loader.js';
import { createPixelArtworkManager } from './explorer/pixel-artwork.js';
import {
  loadVersionCatalog,
  populateVersionSelector as populateVersionSelectorHelper
} from './explorer/version-data.js';
import { createSearchLanguageLifecycle } from './explorer/search-language-lifecycle.js';
import { getExplorerElements } from './explorer/explorer-dom.js';
import { observeToolbarHeight } from './explorer/toolbar-layout.js';
import {
  finishExplorerLoading as finishExplorerLoadingHelper,
  revealExplorer as revealExplorerHelper
} from './explorer/loading-state.js';
import { createEmojiDialogClickHandler } from './explorer/emoji-dialog-events.js';
import { createListController } from './explorer/list-controller.js';
import { createDialogNavigationController } from './explorer/dialog-navigation-controller.js';
import { showEmojiSession } from './explorer/emoji-session.js';
import { createFilterControlSetup } from './explorer/filter-controls.js';
import {
  bindExplorerEvents,
  createExplorerApp,
  finalizeExplorerStartup,
  initializeExplorerControls
} from './explorer-app.js';
import { createExplorerState } from './explorer-state.js';
if (import.meta.hot) {
  let pixelFontRevision;
  const checkPixelFontRevision = async (refreshInitial = false) => {
    try {
      const response = await fetch(
        `./pixel-font/font-build.revision?cache=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!response.ok) return;
      const revision = (await response.text()).trim();
      if (!revision || revision === pixelFontRevision) return;
      const initial = pixelFontRevision === undefined;
      pixelFontRevision = revision;
      if (!initial || refreshInitial) refreshPixelFontStylesheet(revision);
    } catch {
      // The revision file exists only while developing the pixel font.
    }
  };
  import.meta.hot.on('pixel-font:updated', () => {
    void checkPixelFontRevision(true);
  });
  void checkPixelFontRevision(true);
  window.setInterval(checkPixelFontRevision, 1500);
}

function refreshPixelFontStylesheet(revision) {
  const stylesheet = document.querySelector('#pixel-font-stylesheet');
  if (!stylesheet || stylesheet.dataset.revision === revision) return;
  const replacement = stylesheet.cloneNode();
  const url = new URL(stylesheet.href);
  url.searchParams.set('v', revision);
  replacement.href = url.href;
  replacement.dataset.revision = revision;
  stylesheet.removeAttribute('id');
  stylesheet.after(replacement);
  replacement.addEventListener(
    'load',
    () => {
      stylesheet.remove();
      pixelEditor?.refreshFontBuild();
      void refreshExplorerPixelFont(revision);
    },
    { once: true }
  );
}

async function refreshExplorerPixelFont(revision) {
  try {
    const response = await fetch(
      `./pixel-font/build/manifest.json?v=${revision}`,
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error('Pixel font manifest is unavailable');
    const manifest = await response.json();
    updatePixelArtworkManifest(manifest, revision);
    document.querySelectorAll('[data-emoji-key]').forEach(cell => {
      applyPixelArtworkClass(
        cell.querySelector('.emoji-glyph'),
        cell.dataset.emojiKey
      );
    });
    applyPixelArtworkClass(
      exampleDialog?.querySelector('.emoji-preview-glyph'),
      explorerState.currentEmojiKey
    );
    applyPixelArtworkClass(
      exampleDialog?.querySelector(
        '.emoji-composition-result .emoji-composition-glyph'
      ),
      explorerState.currentEmojiKey
    );
    exampleDialog
      ?.querySelectorAll('[data-composition-emoji]')
      .forEach(part => {
        applyPixelArtworkClass(
          part.querySelector('.emoji-composition-glyph'),
          part.dataset.compositionEmoji
        );
      });
    exampleDialog
      ?.querySelectorAll('[data-composition-artwork]')
      .forEach(part => {
        applyStandalonePixelArtwork(
          part.querySelector('.emoji-composition-glyph'),
          part.dataset.compositionArtwork,
          Number(part.dataset.compositionPoint)
        );
      });
    if (skinToneCheckboxes && hairCheckboxes) updateModifierPixelArtwork();
  } catch (error) {
    console.warn('Pixel font result refresh unavailable', error);
  }
}

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
var packageManifest = { packs: [], categories: [] };
var packageManifestPromise;
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
var explorerPreferences = loadExplorerPreferences();
var developerModeFromUrl =
  new URLSearchParams(window.location.search).get('developer') === '1';
var developerModeUrlDismissed = false;
var favoriteEmojiKeys = Array.isArray(explorerPreferences.favorites)
  ? explorerPreferences.favorites
  : [];
var copiedEmojiKeys = Array.isArray(explorerPreferences.recentCopied)
  ? explorerPreferences.recentCopied
  : [];
const translate = (key, fallback) => explorerState.uiStrings[key] ?? fallback;
const displayExplorerLabel = label =>
  translate(explorerLabelKeys[label], label);
const panelDialogs = () => ({
  favorites: savedDialog,
  help: helpDialog,
  language: languageDialog
});
function loadExplorerPreferences() {
  try {
    return JSON.parse(
      window.localStorage.getItem(explorerPreferencesKey) ?? '{}'
    );
  } catch {
    return {};
  }
}
function saveExplorerPreference(key, value) {
  explorerPreferences[key] = value;
  try {
    window.localStorage.setItem(
      explorerPreferencesKey,
      JSON.stringify(explorerPreferences)
    );
  } catch {
    // Preferences are optional when storage is unavailable or blocked.
  }
}
const {
  addFavorite,
  recordCopiedEmoji,
  renderList: renderSavedEmojiList,
  renderSavedEmoji,
  toggleFavorite,
  updateFavoriteButton
} = createSavedEmojiController({
  applyPixelArtworkClass: () => applyPixelArtworkClass,
  byId: () => explorerState.byId,
  copiedEmojiKeys: () => copiedEmojiKeys,
  currentEmojiKey: () => explorerState.currentEmojiKey,
  emojiByKey: () => explorerState.emojiByKey,
  favoriteEmojiKeys: () => favoriteEmojiKeys,
  savePreference: saveExplorerPreference,
  savedDialog: () => savedDialog,
  searchAnnotations: () => explorerState.searchAnnotations,
  setCopiedEmojiKeys: keys => (copiedEmojiKeys = keys),
  setFavoriteEmojiKeys: keys => (favoriteEmojiKeys = keys),
  translate
});
function renderPixelFontToggle() {
  const enabled = explorerPreferences.pixelFont !== false;
  document.documentElement.toggleAttribute('data-pixel-font', enabled);
  if (enabled) {
    delete document.documentElement.dataset.emojiFont;
  } else {
    document.documentElement.dataset.emojiFont = 'system';
  }
  emojiFontChoices.forEach(choice => {
    const selected =
      choice.dataset.emojiFont === (enabled ? 'pixel' : 'system');
    choice.setAttribute('aria-pressed', String(selected));
  });
  refreshRenderedPixelEmoji();
}
function selectEmojiFont(event) {
  const usePixelFont = event.currentTarget.dataset.emojiFont === 'pixel';
  saveExplorerPreference('pixelFont', usePixelFont);
  renderPixelFontToggle();
  if (event?.detail > 0) event.currentTarget.blur();
}
function developerModeEnabled() {
  return (
    (developerModeFromUrl && !developerModeUrlDismissed) ||
    explorerPreferences.developerMode === true
  );
}
function renderDeveloperMode() {
  const enabled = developerModeEnabled();
  document.documentElement.toggleAttribute('data-developer-mode', enabled);
  if (developerModeToggle) {
    developerModeToggle.checked = enabled;
    developerModeToggle.setAttribute('aria-checked', String(enabled));
  }
}
function toggleDeveloperMode(event) {
  const enabled = event.currentTarget.checked;
  developerModeUrlDismissed = !enabled;
  developerModeFromUrl = false;
  saveExplorerPreference('developerMode', enabled);
  renderDeveloperMode();
  if (enabled) void loadVersionData();
  if (!enabled && exampleDialog?.open) {
    setEmojiDialogView('details');
  }
  if (!enabled) {
    versionModeSelector.value = 'through';
    const latestReleased = explorerState.versionManifests.at(-1)?.version;
    if (latestReleased) versionSelector.value = latestReleased;
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
  }
  syncUrlState();
}
const applyUiTranslations = () => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = translate(element.dataset.i18n, element.textContent);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = translate(
      element.dataset.i18nPlaceholder,
      element.placeholder
    );
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute(
      'aria-label',
      translate(
        element.dataset.i18nAriaLabel,
        element.getAttribute('aria-label')
      )
    );
  });
  updateOnlineStatus();
  renderPixelFontToggle();
  renderDeveloperMode();
  pixelEditor?.refreshTranslations();
};
const updateOnlineStatus = () => {
  if (!offlineStatus) return;
  offlineStatus.textContent = translate(
    'offlineStatus',
    'Offline — showing saved data'
  );
  offlineStatus.hidden = navigator.onLine;
};
function renderInstallAppButton() {
  renderInstallAppButtonHelper(installAppButton);
}
async function installApp(event) {
  const next = await installWebApp({
    deferredInstallPrompt,
    event,
    installDialog,
    renderInstallAppButton
  });
  deferredInstallPrompt = next.deferredInstallPrompt;
}
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  renderInstallAppButton();
});
window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = undefined;
  if (installAppButton) installAppButton.hidden = true;
});
async function loadUiTranslations(locale, rtl = false) {
  const baseLocale = locale.split('-')[0];
  try {
    const files = locale === baseLocale ? [baseLocale] : [baseLocale, locale];
    const packs = await Promise.all(
      files.map(async code => {
        const response = await fetch(`demo-locales/${code}.json`);
        if (!response.ok) throw new Error(`No demo locale for ${code}`);
        return response.json();
      })
    );
    explorerState.uiStrings = Object.assign({}, ...packs);
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  } catch {
    explorerState.uiStrings = {};
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }
  const applicationName = translate('title', 'Emoji Explorer');
  document.title = `${applicationName} – Unicode Emoji`;
  for (const name of ['application-name', 'apple-mobile-web-app-title']) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) meta.content = applicationName;
  }
  applyUiTranslations();
  renderVersionModeToggle();
  renderSearchLanguages();
}

const onEmojiDialogClick = createEmojiDialogClickHandler({
  animateCopy: animateEmojiCopyConfirmation,
  copy: copyToClipboardValue,
  copyValue: kind =>
    kind === 'code'
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
  refreshComposition: () =>
    updateEmojiComposition(
      explorerState.byId[explorerState.currentEmojiKey] ?? {},
      explorerState.emojiByKey[explorerState.currentEmojiKey] ?? ''
    ),
  setView: setEmojiDialogView,
  syncUrlState: () => syncUrlState(),
  toggleComposition: () =>
    (explorerState.compositionMode =
      explorerState.compositionMode === 'full' ? 'condensed' : 'full'),
  toggleFavorite: () => toggleFavorite(explorerState.currentEmojiKey),
  translate
});

async function onLoad() {
  ensureUtilityControls();
  const elements = getExplorerElements();
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
  if (languagePickerLabel) {
    languagePickerLabel.id ||= 'language-picker-current-label';
    languagePicker.setAttribute(
      'aria-labelledby',
      `language-picker-accessible-label ${languagePickerLabel.id}`
    );
  }
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
    clearFiltersButton, closePanel: closePanelDialog, copiedEmojiKeys: () => copiedEmojiKeys,
    developerModeToggle, drawList, emojiFontChoices, emojiList, emojiNext, emojiPrevious,
    exampleDialog, favoriteEmojiKeys: () => favoriteEmojiKeys, genderCheckboxes,
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
    advancedFilters, applyDialogUrlState, drawList, explorerPreferences,
    filters: advancedFilters, finishExplorerLoading, loadData, loadSearchLanguages,
    loadUiTranslations, observeToolbarHeight, preferences: explorerPreferences,
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
  loadStylesheet: () =>
    loadStylesheet('./explorer/pixel-editor.css', 'pixel-editor-stylesheet'),
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

const {
  focusInitialAction: focusInitialEmojiDialogAction,
  setView: setEmojiDialogView
} = createEmojiDialogViewController({
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
  const previousValue = versionModeDefinitions.some(
    mode => mode.value === versionModeSelector.value
  )
    ? versionModeSelector.value
    : 'through';
  versionModeSelector.replaceChildren(
    ...versionModeDefinitions.map(mode => {
      const option = document.createElement('option');
      option.value = mode.value;
      option.textContent = translate(mode.key, mode.fallback);
      return option;
    })
  );
  versionModeSelector.value = previousValue;
}

function renderVersionModeToggle() {
  if (!versionModeToggle) return;
  populateVersionModeOptions();
  const label = translate('selectedVersionOnly', 'Selected version only');
  versionModeToggle.setAttribute(
    'aria-pressed',
    String(versionModeSelector.value === 'selected')
  );
  versionModeToggle.setAttribute('aria-label', label);
  versionModeToggle.title = label;
}

function toggleVersionMode(event) {
  versionModeSelector.value =
    versionModeSelector.value === 'selected' ? 'through' : 'selected';
  renderVersionModeToggle();
  renderCategoryFilters();
  drawList();
  if (event?.detail > 0) event.currentTarget.blur();
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
  preferredOrder: () => explorerPreferences.order,
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
const {
  applyBasicUrlState,
  applyDialogUrlState,
  applyLoadedUrlState,
  onDocumentKeyDown,
  onGenderChange,
  resetFilters,
  stepVersion,
  syncUrlState
} = explorerNavigation;

const isViteDevelopment =
  typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true;
if (
  'serviceWorker' in navigator &&
  window.isSecureContext &&
  isViteDevelopment
) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter(registration =>
            registration.scope.startsWith(window.location.origin)
          )
          .map(registration => registration.unregister())
      );
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('emoji-explorer-'))
          .map(name => caches.delete(name))
      );
    } catch (error) {
      console.warn('Could not clear local offline cache', error);
    }
  });
} else if ('serviceWorker' in navigator && window.isSecureContext) {
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
  if (developerModeEnabled()) await loadVersionData();
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
    developerModeFromUrl =
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
const {
  load: loadSearchLanguages,
  onPopState,
  render: renderSearchLanguages,
  select: selectLanguageLink,
  set: setSearchLanguage
} = searchLanguageLifecycle;
window.addEventListener('popstate', onPopState);

function onOrderModeChange(event) {
  if (
    event.currentTarget.dataset.order === 'sequence' &&
    !developerModeEnabled()
  )
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
  if (explorerState.versionDataPromise) return explorerState.versionDataPromise;
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
    } catch (error) {
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
  if (!option) return;
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
  if (explorerState.groups.length === 0) return;
  renderCategoryFilters();
  syncVersionRange();
  drawList();
}

function displayGroupName(name) {
  return explorerState.searchLabels[unicodeGroupLabelKeys[name]] ?? name;
}

function buildCategoryRepresentatives() {
  const manifests = [...explorerState.versionManifests, ...explorerState.proposedVersionManifests];
  const versionOrder = new Map();
  manifests.forEach((version, index) => {
    for (const key of explorerState.versionKeys.get(version.version) ?? []) {
      if (!versionOrder.has(key)) versionOrder.set(key, index);
    }
  });
  const itemOrder = new Map(
    explorerState.items.map((item, index) => [item.key, item.order ?? index])
  );
  const byIntroduction = (left, right) =>
    (versionOrder.get(left.key) ?? Infinity) -
      (versionOrder.get(right.key) ?? Infinity) ||
    itemOrder.get(left.key) - itemOrder.get(right.key) ||
    left.key.localeCompare(right.key);

  explorerState.groupRepresentativeEmoji = new Map();
  explorerState.subGroupRepresentativeEmoji = new Map();
  explorerState.groups.forEach(group => {
    const subgroupRepresentatives = new Set();
    explorerState.subGroups[group].forEach(subGroup => {
      const representative = explorerState.items
        .filter(
          item => item.group === group && item.unicodeSubGroup === subGroup
        )
        .sort(byIntroduction)[0];
      if (!representative) return;
      explorerState.subGroupRepresentativeEmoji.set(
        subGroupSelectionKey(group, subGroup),
        representative.emoji
      );
      subgroupRepresentatives.add(representative.key);
    });

    const candidates = explorerState.items
      .filter(item => item.group === group)
      .sort(byIntroduction);
    const representative =
      candidates.find(item => !subgroupRepresentatives.has(item.key)) ??
      (explorerState.subGroups[group].length === 1 && candidates.length === 1
        ? candidates[0]
        : undefined);
    if (representative)
      explorerState.groupRepresentativeEmoji.set(group, representative.emoji);
  });
}

function getGroupRepresentativeEmoji(group) {
  return explorerState.groupRepresentativeEmoji.get(group) ?? '';
}

function getSubGroupRepresentativeEmoji(group, subGroup) {
  return (
    explorerState.subGroupRepresentativeEmoji.get(subGroupSelectionKey(group, subGroup)) ?? ''
  );
}

function displayUnicodeSubGroupName(name) {
  return displayUnicodeSubGroupNameHelper(name, {
    searchSubgroupLabels: explorerState.searchSubgroupLabels,
    searchLabels: explorerState.searchLabels,
    unicodeSubgroupLabelKeys
  });
}
const {
  asEmojiCell,
  asItem,
  asSequenceItem,
  flushEmojiCellFragment,
  orderedKeys
} = createEmojiListRenderers({
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

const getEmojiGenders = item =>
  getEmojiGendersHelper(item, explorerState.emojiByKey);

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

const { onEmojiFocus, onEmojiKeyDown, renderEmojiList } =
  createEmojiListInteraction({
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
  renderImportExamplesHelper(packageManifest, item);
}

async function loadPackageManifest() {
  if (packageManifestPromise) return packageManifestPromise;
  packageManifestPromise = fetch('manifest.json')
    .then(response => {
      if (!response.ok) throw new Error('Package manifest is unavailable');
      return response.json();
    })
    .then(manifest => {
      packageManifest = manifest;
      return manifest;
    })
    .catch(error => {
      console.warn('Package import options unavailable', error);
      return packageManifest;
    });
  return packageManifestPromise;
}

async function copyToClipboardValue(value, successMessage) {
  return copyToClipboardHelper({
    value,
    successMessage,
    copyStatus,
    translate
  });
}

function animateEmojiCopyConfirmation(button) {
  if (
    !button?.animate ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;
  button
    .getAnimations()
    .find(animation => animation.id === 'emoji-copy-confirmation')
    ?.cancel();
  const animation = button.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.9)', offset: 0.2 },
      {
        transform: 'scale(1.05)',
        backgroundColor: '#15384d',
        boxShadow: '0 0 0 0.2rem rgb(127 216 255 / 35%)',
        offset: 0.62
      },
      { transform: 'scale(1)', boxShadow: 'none' }
    ],
    {
      duration: 240,
      easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
    }
  );
  animation.id = 'emoji-copy-confirmation';
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
  if (value === undefined) return;
  cell?.focus();
  showEmoji(id, openDialog);
}

function onEmojiDialogClose() {
  setEmojiDialogView('details', false);
  if (suppressDialogCloseSync || !urlStateReady || applyingUrlState) return;
  if (window.history.state?.emojiDialogEntry) {
    window.history.back();
  } else {
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
    detailsVisible:
      !exampleDialog.classList.contains('is-code-view') &&
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
    if (
      codePoints &&
      (!lookup.has(codePoints) || item.status === 'fully-qualified')
    ) {
      lookup.set(codePoints, item.key);
    }
    return lookup;
  }, new Map());
}

function formatUiNumber(value) {
  const locale =
    document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
  return formatUiNumberValue(
    value,
    locale,
    locale?.startsWith('ar') ? 'arab' : undefined
  );
}

function formatUiPercent(value) {
  const locale =
    document.documentElement.lang || explorerState.selectedSearchLocale || undefined;
  return formatUiPercentValue(
    value,
    locale,
    locale?.startsWith('ar') ? 'arab' : undefined
  );
}

const pixelArtwork = createPixelArtworkManager({
  byId: () => explorerState.byId,
  emojiByKey: () => explorerState.emojiByKey,
  emojiKeyByCodePoints: () => explorerState.emojiKeyByCodePoints,
  hairCheckboxes: () => hairCheckboxes,
  normalizeCodePoints,
  pixelFontPreferred: () => explorerPreferences.pixelFont !== false,
  refreshEditor: () => {
    if (exampleDialog?.classList.contains('is-editor-view'))
      pixelEditor?.refreshFontBuild();
  },
  skinToneCheckboxes: () => skinToneCheckboxes,
  updateRenderingDiagnostic: values =>
    updateRenderingDiagnosticHelper({
      ...values,
      byId: explorerState.byId,
      developerMode: developerModeEnabled(),
      detailsVisible:
        !exampleDialog.classList.contains('is-code-view') &&
        !exampleDialog.classList.contains('is-editor-view'),
      exampleDialog,
      translate
    })
});
const {
  applyPixelArtworkClass,
  refreshRenderedPixelEmoji,
  renderedPixelEmoji,
  systemEmojiAppearsSplit,
  updateModifierPixelArtwork,
  updatePixelArtworkManifest,
  updateRenderingDiagnostic
} = pixelArtwork;
const applyStandalonePixelArtwork = applyPixelArtworkClass;

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
      if (copyStatus) copyStatus.textContent = '';
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
const {
  navigate: navigateEmoji,
  update: updateDialogNavigation,
  updateBack: updateCompositionBackButton
} = dialogNavigation;
removeLegacyDialogElements();
createExplorerApp({ window, start: onLoad }).startWhenReady();
