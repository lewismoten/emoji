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
  compositionReductionLabel,
  compositionTitle,
  condenseCompositionPoints,
  describeCompositionPoint,
  findCompositionArtworkKey,
  findCompositionEmojiKey,
  isCondensedSequenceControl
} from './explorer/composition-helpers.js';
import {
  displayEmojiKey,
  formatUiNumber as formatUiNumberValue,
  formatUiPercent as formatUiPercentValue,
  normalizeCodePoints,
  normalizeDisplayName
} from './explorer/emoji-format.js';
import {
  copyToClipboard as copyToClipboardHelper,
  nextCopiedEmojiKeys,
  nextFavoriteEmojiKeys,
  renderSavedEmojiList as renderSavedEmojiListHelper,
  updateFavoriteToggleButton
} from './explorer/saved-emoji.js';
import {
  ensureImportExamples as ensureImportExampleLines,
  getCodeExampleText as getCodeExampleTextValue,
  resolveImportExamples
} from './explorer/import-examples.js';
import {
  buildExplorerUrlQuery,
  parseExplorerUrlState
} from './explorer/url-state.js';
import {
  applyBasicUrlStateToControls,
  applyExclusiveCheckboxSelection,
  applyLoadedUrlStateToControls,
  resetFilterControls,
  stepVersionIndex
} from './explorer/filter-controls.js';
import {
  buildDialogCopyValues,
  resolveCompositionParentLabel,
  resolveDialogNavigationState,
  resolveDialogTitle,
  shouldHideEnglishName
} from './explorer/dialog-state.js';
import { resolveRenderingDiagnostic } from './explorer/rendering-diagnostic.js';

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
      currentEmojiKey
    );
    applyPixelArtworkClass(
      exampleDialog?.querySelector(
        '.emoji-composition-result .emoji-composition-glyph'
      ),
      currentEmojiKey
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

var items = [];
var groups = [];
var subGroups = {};
const UNASSIGNED = '\u0000';
var selectedGroup = '';
var selectedSubGroup = '';
var selectedSequenceType = '';
var availableGroups = [];
var availableSubGroups = {};
var availableSequenceTypes = [];
var availableCategoryKeys = new Set();
var groupRepresentativeEmoji = new Map();
var subGroupRepresentativeEmoji = new Map();
var emojiByKey = {};
var allIds = [];
var releasedIds = new Set();
var groupedKeys = {};
var byId = {};
var emojiKeyByCodePoints = new Map();
var paintedPixelEmojiKeys = new Set();
var proposedPixelEmojiKeys = new Set();
var privateUsePixelEmojiByKey = new Map();
var systemEmojiMeasureContext;
var systemEmojiReferenceWidth;

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
var versionManifests = [];
var proposedVersionManifests = [];
var versionKeys = new Map();
var versionDataPromise;
var packageManifest = { packs: [], categories: [] };
var packageManifestPromise;
var orderMode = 'grouped';
var compositionMode = 'condensed';
var searchAnnotations = {};
var searchLabels = {};
var searchSubgroupLabels = {};
var uiStrings = {};
var searchLocales = [];
var selectedSearchLocale = '';
var searchLoadId = 0;
var currentEmojiCopies = {};
var displayedKeys = [];
var dialogNavigationKeys = [];
var currentEmojiKey = '';
var focusedEmojiKey = '';
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
const translate = (key, fallback) => uiStrings[key] ?? fallback;
const displayExplorerLabel = label =>
  translate(explorerLabelKeys[label], label);
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
    const latestReleased = versionManifests.at(-1)?.version;
    if (latestReleased) versionSelector.value = latestReleased;
    renderVersionModeToggle();
    syncVersionRange();
    if (orderMode === 'sequence') {
      orderMode = 'grouped';
      selectedSequenceType = '';
      orderButtons?.forEach(button => {
        const active = button.dataset.order === orderMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    }
    if (items.length > 0) {
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
const installedDisplayQueries = [
  'standalone',
  'fullscreen',
  'minimal-ui',
  'window-controls-overlay'
].map(mode => window.matchMedia(`(display-mode: ${mode})`));
const isInstalledApp = () =>
  installedDisplayQueries.some(query => query.matches) ||
  window.navigator.standalone === true ||
  document.referrer.startsWith('android-app://');
const isIosDevice = () => {
  const navigator = window.navigator;
  const userAgent = navigator.userAgent;
  const clientPlatform = navigator.userAgentData?.platform;
  if (clientPlatform?.toLowerCase() === 'macos') return false;
  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) &&
      /Mobile/.test(userAgent) &&
      navigator.maxTouchPoints > 1)
  );
};
function renderInstallAppButton() {
  if (!installAppButton) return;
  installAppButton.hidden = isInstalledApp();
}
function updateWebAppManifest(locale = '') {
  const manifest = document.querySelector('link[rel="manifest"]');
  if (!manifest) return;
  const href = locale
    ? `./manifest.${locale}.webmanifest`
    : './manifest.webmanifest';
  if (manifest.getAttribute('href') !== href)
    manifest.setAttribute('href', href);
}
async function installApp(event) {
  const trigger = event?.currentTarget;
  const releaseTriggerFocus = event?.detail > 0;
  const promptEvent = deferredInstallPrompt;
  if (!promptEvent) {
    const ios = isIosDevice();
    const iosInstructions = installDialog?.querySelector(
      '.install-instructions-ios'
    );
    const browserInstructions = installDialog?.querySelector(
      '.install-instructions-browser'
    );
    if (iosInstructions) iosInstructions.hidden = !ios;
    if (browserInstructions) browserInstructions.hidden = ios;
    installDialog?.showModal();
    return;
  }
  deferredInstallPrompt = undefined;
  renderInstallAppButton();
  try {
    await promptEvent.prompt();
    await promptEvent.userChoice;
  } catch (error) {
    console.warn('App installation unavailable', error);
  }
  if (releaseTriggerFocus) trigger?.blur?.();
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
    uiStrings = Object.assign({}, ...packs);
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  } catch {
    uiStrings = {};
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

function ensureUtilityControls() {
  const searchControls = document.querySelector('.search-controls');
  const fontComparison = document.querySelector('.pixel-comparison');
  if (fontComparison && !fontComparison.querySelector('.emoji-font-choice')) {
    fontComparison.setAttribute('role', 'group');
    fontComparison.dataset.i18nAriaLabel = 'emojiStyle';
    fontComparison.setAttribute('aria-label', 'Emoji style');
    Array.from(fontComparison.children).forEach((preview, index) => {
      const button = document.createElement('button');
      const font = index === 0 ? 'system' : 'pixel';
      button.className = `emoji-font-choice emoji-font-choice-${font}`;
      button.type = 'button';
      button.dataset.emojiFont = font;
      button.setAttribute('aria-pressed', String(font === 'pixel'));
      button.append(...preview.childNodes);
      preview.replaceWith(button);
    });
  }
  if (searchControls && !searchControls.querySelector('.saved-picker')) {
    searchControls.insertAdjacentHTML(
      'beforeend',
      `
      <button class="saved-picker" type="button" aria-haspopup="dialog" aria-controls="saved-dialog" data-i18n-aria-label="savedEmoji" aria-label="Saved emoji">
        <span aria-hidden="true">⭐</span>
        <span class="saved-picker-label" data-i18n="favorites">Favorites</span>
      </button>
    `
    );
  }
  searchControls?.querySelector('.pixel-font-toggle')?.remove();
  if (searchControls && !searchControls.querySelector('.help-picker')) {
    searchControls.insertAdjacentHTML(
      'beforeend',
      `
      <button class="help-picker" type="button" aria-haspopup="dialog" aria-controls="help-dialog" data-i18n-aria-label="helpAndSettings" aria-label="Help and settings">
        <span aria-hidden="true">?</span>
      </button>
    `
    );
  }

  const dialogTitle = document.querySelector(
    '.example-dialog .dialog-heading > div:first-child'
  );
  let dialogTitleRow = dialogTitle?.querySelector('.dialog-title-row');
  if (dialogTitle && !dialogTitleRow) {
    dialogTitleRow = document.createElement('div');
    dialogTitleRow.className = 'dialog-title-row';
    const title = dialogTitle.querySelector('h2');
    title?.before(dialogTitleRow);
    if (title) dialogTitleRow.append(title);
  }
  let favoriteButton = document.querySelector(
    '.example-dialog .toggle-favorite'
  );
  const dialogControls = document.querySelector(
    '.example-dialog .dialog-controls'
  );
  if (dialogControls && !favoriteButton) {
    favoriteButton = document.createElement('button');
    favoriteButton.className = 'toggle-favorite';
    favoriteButton.type = 'button';
    favoriteButton.setAttribute('aria-pressed', 'false');
    favoriteButton.innerHTML = '<span aria-hidden="true">☆</span>';
    dialogControls.querySelector('form')?.before(favoriteButton);
  }
  if (dialogControls && favoriteButton) {
    favoriteButton.querySelector('.toggle-favorite-label')?.remove();
    favoriteButton.dataset.i18nAriaLabel = 'addFavorite';
    favoriteButton.setAttribute('aria-label', 'Add favorite');
    favoriteButton.title = 'Add favorite';
    positionFavoriteButton();
  }
  const dialogDetails = document.querySelector(
    '.example-dialog .emoji-dialog-details'
  );
  if (
    dialogDetails &&
    !document.querySelector('.example-dialog .emoji-composition')
  ) {
    dialogDetails.insertAdjacentHTML(
      'afterend',
      `
      <section class="emoji-composition" hidden>
        <div class="emoji-composition-heading">
          <h3 data-i18n="builtFrom">Built from</h3>
          <button class="emoji-composition-mode" type="button" aria-pressed="false" hidden>Show full sequence</button>
        </div>
        <div class="emoji-composition-equation" dir="ltr"></div>
      </section>
    `
    );
  }
  const composition = document.querySelector(
    '.example-dialog .emoji-composition'
  );
  if (composition && !composition.querySelector('.emoji-composition-heading')) {
    const heading = document.createElement('div');
    const title = composition.querySelector('h3');
    heading.className = 'emoji-composition-heading';
    title?.before(heading);
    if (title) heading.append(title);
  }
  const compositionHeading = composition?.querySelector(
    '.emoji-composition-heading'
  );
  if (
    compositionHeading &&
    !compositionHeading.querySelector('.emoji-composition-mode')
  ) {
    const mode = document.createElement('button');
    mode.className = 'emoji-composition-mode';
    mode.type = 'button';
    mode.hidden = true;
    mode.setAttribute('aria-pressed', 'false');
    mode.textContent = 'Show full sequence';
    compositionHeading.append(mode);
  }

  const main = document.querySelector('main');
  if (main && !document.querySelector('.saved-dialog')) {
    main.insertAdjacentHTML(
      'beforeend',
      `
      <dialog class="saved-dialog" id="saved-dialog" aria-labelledby="saved-title">
        <div class="dialog-heading">
          <h2 id="saved-title" data-i18n="savedEmoji">Saved emoji</h2>
          <form method="dialog"><button class="dialog-close" data-i18n-aria-label="close" aria-label="Close">×</button></form>
        </div>
        <section class="saved-section" aria-labelledby="favorites-title">
          <h3 id="favorites-title" data-i18n="favorites">Favorites</h3>
          <div class="saved-emoji-list favorites-list"></div>
          <p class="saved-empty favorites-empty" data-i18n="noFavorites">Favorite emoji will appear here.</p>
        </section>
        <section class="saved-section" aria-labelledby="copied-title">
          <h3 id="copied-title" data-i18n="recentlyCopied">Recently Copied</h3>
          <div class="saved-emoji-list copied-list"></div>
          <p class="saved-empty copied-empty" data-i18n="noRecentlyCopied">Copied emoji will appear here.</p>
        </section>
      </dialog>
    `
    );
  }
  if (main && !document.querySelector('.help-dialog')) {
    main.insertAdjacentHTML(
      'beforeend',
      `
      <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title">
        <div class="dialog-heading">
          <h2 id="help-title" data-i18n="helpAndSettings">Help and settings</h2>
          <form method="dialog"><button class="dialog-close" data-i18n-aria-label="close" aria-label="Close">×</button></form>
        </div>
        <section class="help-pixel" aria-labelledby="help-pixel-title">
          <h3 id="help-pixel-title" data-i18n="pixelHelpTitle">Pixel Emoji in the Explorer</h3>
          <p data-i18n="pixelHelpDescription">Pixel font: On uses the original 12×12 font when artwork is available. Turn it off to prefer your system font; Pixel Emoji remains a fallback for unsupported emoji.</p>
          <a href="https://github.com/lewismoten/emoji/tree/main/pixel-font" data-i18n="pixelHelpLink">Learn about and download Pixel Emoji</a>
        </section>
        <section class="help-settings" aria-labelledby="help-settings-title">
          <h3 id="help-settings-title" data-i18n="settings">Settings</h3>
          <div class="setting-row">
            <div>
              <h4 data-i18n="language">Language</h4>
              <p data-i18n="chooseLanguageDescription">Choose a language for emoji search.</p>
            </div>
            <div class="help-language-control"></div>
          </div>
          <div class="setting-row">
            <div>
              <h4 data-i18n="developerMode">Developer mode</h4>
              <p data-i18n="developerModeDescription">Show sequence construction, technical metadata, code tools, rendering diagnostics, and the pixel editor.</p>
            </div>
            <label class="setting-switch">
              <input class="developer-mode-toggle" type="checkbox" role="switch">
              <span data-i18n="developerMode">Developer mode</span>
            </label>
          </div>
        </section>
        <h3 class="shortcut-heading" data-i18n="keyboardShortcuts">Keyboard shortcuts</h3>
        <dl class="shortcut-list">
          <div><dt><kbd>/</kbd></dt><dd data-i18n="shortcutSearch">Focus search</dd></div>
          <div><dt><kbd>←</kbd> <kbd>→</kbd></dt><dd data-i18n="shortcutNavigate">Navigate emoji</dd></div>
          <div><dt><kbd>Enter</kbd></dt><dd data-i18n="shortcutOpen">Open the selected emoji</dd></div>
          <div><dt><kbd>Esc</kbd></dt><dd data-i18n="shortcutClose">Close a dialog or clear search</dd></div>
          <div><dt><kbd>?</kbd></dt><dd data-i18n="shortcutHelp">Open Help and settings</dd></div>
        </dl>
      </dialog>
    `
    );
  }
  const helpLanguageControl = document.querySelector(
    '.help-dialog .help-language-control'
  );
  const languagePicker = document.querySelector('.language-picker');
  if (helpLanguageControl && languagePicker) {
    helpLanguageControl.append(languagePicker);
  }
}

function positionFavoriteButton() {
  const favoriteButton = document.querySelector(
    '.example-dialog .toggle-favorite'
  );
  const dialogTitleRow = document.querySelector(
    '.example-dialog .dialog-title-row'
  );
  const dialogControls = document.querySelector(
    '.example-dialog .dialog-controls'
  );
  if (!favoriteButton || !dialogTitleRow || !dialogControls) return;
  if (window.matchMedia('(max-width: 560px)').matches) {
    dialogControls.querySelector('form')?.before(favoriteButton);
  } else {
    dialogTitleRow.prepend(favoriteButton);
  }
}

function getPanelDialog(panel) {
  return {
    favorites: savedDialog,
    help: helpDialog,
    language: languageDialog
  }[panel];
}

function getOpenPanel() {
  if (savedDialog?.open) return 'favorites';
  if (helpDialog?.open) return 'help';
  if (languageDialog?.open) return 'language';
  return '';
}

function focusPanelDialog(panel, dialog) {
  if (panel === 'favorites') {
    renderSavedEmoji();
    (
      dialog.querySelector('.saved-emoji-list button') ??
      dialog.querySelector('.dialog-close')
    )?.focus();
  } else if (panel === 'language') {
    (
      languageList.querySelector('.is-selected') ??
      dialog.querySelector('.dialog-close')
    )?.focus();
  } else {
    dialog.querySelector('.dialog-close')?.focus();
  }
}

function openPanelDialog(panel, addHistory = true) {
  const dialog = getPanelDialog(panel);
  if (!dialog) return;
  if (!dialog.open) dialog.showModal();
  focusPanelDialog(panel, dialog);
  if (addHistory) {
    syncUrlState('push', { ...window.history.state, panelDialogEntry: true });
  }
}

function closePanelDialog(dialog) {
  if (!dialog?.open) return;
  suppressedPanelCloses.add(dialog);
  dialog.close();
}

function onPanelDialogClose(event) {
  if (
    suppressedPanelCloses.delete(event.currentTarget) ||
    !urlStateReady ||
    applyingUrlState
  )
    return;
  if (window.history.state?.panelDialogEntry) {
    window.history.back();
  } else {
    syncUrlState();
  }
}

async function onLoad() {
  ensureUtilityControls();
  offlineStatus = document.getElementsByClassName('offline-status')[0];
  installAppButton = document.getElementsByClassName('install-app')[0];
  installDialog = document.getElementsByClassName('install-dialog')[0];
  searchText = document.getElementsByClassName('text')[0];
  languagePicker = document.getElementsByClassName('language-picker')[0];
  languagePickerFlag = document.getElementsByClassName(
    'language-picker-flag'
  )[0];
  languagePickerLabel = document.getElementsByClassName(
    'language-picker-label'
  )[0];
  if (languagePickerLabel) {
    languagePickerLabel.id ||= 'language-picker-current-label';
    languagePicker.setAttribute(
      'aria-labelledby',
      `language-picker-accessible-label ${languagePickerLabel.id}`
    );
  }
  emojiFontChoices = Array.from(
    document.getElementsByClassName('emoji-font-choice')
  );
  languageDialog = document.getElementsByClassName('language-dialog')[0];
  languageList = document.getElementsByClassName('language-list')[0];
  savedPicker = document.getElementsByClassName('saved-picker')[0];
  savedDialog = document.getElementsByClassName('saved-dialog')[0];
  helpPicker = document.getElementsByClassName('help-picker')[0];
  helpDialog = document.getElementsByClassName('help-dialog')[0];
  developerModeToggle = document.getElementsByClassName(
    'developer-mode-toggle'
  )[0];
  renderDeveloperMode();
  emojiList = document.getElementsByClassName('list')[0];
  matchCount = document.getElementsByClassName('match-count')[0];
  toolbar = document.getElementsByClassName('toolbar')[0];
  groupSelector = document.getElementsByClassName('select-group')[0];
  subGroupSelector = document.getElementsByClassName('select-subgroup')[0];
  groupPickerTrigger = document.getElementsByClassName(
    'group-picker-trigger'
  )[0];
  subGroupPickerTrigger = document.getElementsByClassName(
    'subgroup-picker-trigger'
  )[0];
  groupFilterDialog = document.getElementsByClassName('group-filter-dialog')[0];
  subGroupFilterDialog = document.getElementsByClassName(
    'subgroup-filter-dialog'
  )[0];
  compactGroupChoices = ensureChoiceContainer(
    groupSelector,
    'compact-group-choices',
    'group-filter-label'
  );
  compactSubGroupChoices = ensureChoiceContainer(
    subGroupSelector,
    'compact-subgroup-choices',
    'subgroup-filter-label'
  );
  sequenceTypeSelector = ensureSequenceTypeFilter();
  compactSequenceChoices = ensureChoiceContainer(
    sequenceTypeSelector,
    'compact-sequence-choices',
    'sequence-filter-label'
  );
  compactGroupChoices.addEventListener('keydown', onCompactChoiceKeyDown);
  compactSubGroupChoices.addEventListener('keydown', onCompactChoiceKeyDown);
  compactSequenceChoices.addEventListener('keydown', onCompactChoiceKeyDown);
  groupPickerTrigger?.addEventListener('click', () =>
    openFilterPicker(groupFilterDialog, compactGroupChoices)
  );
  subGroupPickerTrigger?.addEventListener('click', () =>
    openFilterPicker(subGroupFilterDialog, compactSubGroupChoices)
  );
  compactGroupLabel = ensureSelectionLabel(
    groupSelector,
    'compact-group-label',
    'group-filter-label'
  );
  compactSubGroupLabel = ensureSelectionLabel(
    subGroupSelector,
    'compact-subgroup-label',
    'subgroup-filter-label'
  );
  compactSequenceLabel = ensureSelectionLabel(
    sequenceTypeSelector,
    'compact-sequence-label',
    'sequence-filter-label'
  );
  versionModeSelector = document.getElementsByClassName(
    'select-version-mode'
  )[0];
  versionSelector = document.getElementsByClassName('select-version')[0];
  ({ range: versionRange, output: versionRangeValue } = ensureVersionSlider());
  versionModeToggle = ensureVersionModeToggle();
  versionPrevious = document.getElementsByClassName('version-previous')[0];
  versionNext = document.getElementsByClassName('version-next')[0];
  versionSelector
    .closest('.filter-field')
    ?.classList.toggle(
      'has-version-slider',
      Boolean(versionRange && versionRangeValue)
    );
  advancedFilters = document.getElementsByClassName('advanced-filters')[0];
  ({
    summary: activeFilterSummary,
    text: activeFilterText,
    clear: clearFiltersButton
  } = ensureActiveFilterSummary());
  orderButtons = Array.from(document.getElementsByClassName('order-mode'));
  exampleDialog = document.getElementsByClassName('example-dialog')[0];
  upgradeEmojiDialog();
  emojiParent = document.getElementsByClassName('emoji-parent')[0];
  copyStatus = document.getElementsByClassName('copy-status')[0];
  emojiPrevious = document.getElementsByClassName('emoji-previous')[0];
  emojiNext = document.getElementsByClassName('emoji-next')[0];
  skinToneCheckboxes = Array.from(document.getElementsByClassName('skin-tone'));
  hairCheckboxes = Array.from(document.getElementsByClassName('hair'));
  genderCheckboxes = Array.from(document.getElementsByClassName('gender'));
  modifierFilters = document.getElementsByClassName('modifier-filters')[0];
  skinToneFieldset = skinToneCheckboxes[0]?.closest('fieldset');
  hairFieldset = hairCheckboxes[0]?.closest('fieldset');
  genderFieldset = genderCheckboxes[0]?.closest('fieldset');
  document
    .querySelectorAll('.modifier-emoji')
    .forEach(emoji => emoji.setAttribute('aria-hidden', 'true'));

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  window
    .matchMedia('(max-width: 560px)')
    .addEventListener('change', positionFavoriteButton);
  updateOnlineStatus();
  renderInstallAppButton();

  applyBasicUrlState();
  skinToneCheckboxes.forEach(checkbox =>
    checkbox.addEventListener('change', drawList)
  );
  hairCheckboxes.forEach(checkbox =>
    checkbox.addEventListener('change', drawList)
  );
  genderCheckboxes.forEach(checkbox =>
    checkbox.addEventListener('change', onGenderChange)
  );

  searchText.addEventListener('input', scheduleSearchDraw);
  languagePicker.addEventListener('click', () => {
    if (helpDialog?.open) closePanelDialog(helpDialog);
    openPanelDialog('language');
  });
  emojiFontChoices.forEach(choice =>
    choice.addEventListener('click', selectEmojiFont)
  );
  installAppButton?.addEventListener('click', installApp);
  installedDisplayQueries.forEach(query =>
    query.addEventListener?.('change', renderInstallAppButton)
  );
  installDialog
    ?.querySelector('.install-dialog-close')
    ?.addEventListener('click', () => installDialog.close());
  savedPicker?.addEventListener('click', () => {
    openPanelDialog('favorites');
  });
  helpPicker?.addEventListener('click', () => {
    openPanelDialog('help');
  });
  developerModeToggle?.addEventListener('change', toggleDeveloperMode);
  languageDialog.addEventListener('close', onPanelDialogClose);
  savedDialog?.addEventListener('close', onPanelDialogClose);
  helpDialog?.addEventListener('close', onPanelDialogClose);
  savedDialog?.addEventListener('click', event => {
    const button = event.target.closest('[data-saved-emoji]');
    if (!button) return;
    const navigationKeys =
      button.dataset.savedSource === 'favorites'
        ? favoriteEmojiKeys
        : copiedEmojiKeys;
    closePanelDialog(savedDialog);
    showEmoji(button.dataset.savedEmoji, true, navigationKeys);
  });
  emojiList.addEventListener('click', onClick);
  emojiList.addEventListener('focusin', onEmojiFocus);
  emojiList.addEventListener('keydown', onEmojiKeyDown);
  exampleDialog.addEventListener('click', event => {
    if (event.target.closest('.emoji-composition-mode')) {
      compositionMode = compositionMode === 'full' ? 'condensed' : 'full';
      updateEmojiComposition(
        byId[currentEmojiKey] ?? {},
        emojiByKey[currentEmojiKey] ?? ''
      );
      syncUrlState();
      return;
    }
    const compositionButton = event.target.closest('[data-composition-emoji]');
    if (compositionButton) {
      const parentEmojiKey = currentEmojiKey;
      showEmoji(compositionButton.dataset.compositionEmoji, false);
      syncUrlState('push', {
        ...window.history.state,
        emojiDialogEntry: false,
        compositionParent: parentEmojiKey
      });
      updateCompositionBackButton();
      return;
    }
    if (event.target.closest('.emoji-parent')) {
      window.history.back();
      return;
    }
    const favoriteButton = event.target.closest('.toggle-favorite');
    if (favoriteButton) {
      toggleFavorite(currentEmojiKey);
      return;
    }
    const showCodeButton = event.target.closest('.show-emoji-code');
    if (showCodeButton) {
      setEmojiDialogView('code');
      exampleDialog.querySelector('.dialog-mode-back:not([hidden])')?.focus();
      return;
    }
    const showEditorButton = event.target.closest('.show-pixel-editor');
    if (showEditorButton) {
      setEmojiDialogView('editor');
      exampleDialog.querySelector('.pixel-editor-canvas')?.focus();
      return;
    }
    const backButton = event.target.closest(
      '.dialog-mode-back, .back-to-emoji'
    );
    if (backButton) {
      const returnTarget = exampleDialog.classList.contains('is-editor-view')
        ? '.show-pixel-editor'
        : '.show-emoji-code';
      setEmojiDialogView('details');
      exampleDialog.querySelector(returnTarget)?.focus();
      return;
    }
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const value =
      button.dataset.copy === 'code'
        ? getCodeExampleTextValue(exampleDialog)
        : button.dataset.copy === 'link'
          ? window.location.href
          : currentEmojiCopies[button.dataset.copy];
    const messages = {
      emoji: ['emojiCopied', 'Emoji copied to the clipboard.'],
      key: ['keyCopied', 'Emoji key copied to the clipboard.'],
      escape: ['escapeCopied', 'Escape sequence copied to the clipboard.'],
      codePoints: ['codePointsCopied', 'Code points copied to the clipboard.'],
      code: ['codeCopied', 'Code copied to the clipboard.'],
      link: ['linkCopied', 'Link copied to the clipboard.']
    };
    const [messageKey, fallback] = messages[button.dataset.copy] ?? [
      'copiedToClipboard',
      'Copied to the clipboard.'
    ];
    if (value !== undefined) {
      const copiedEmojiKey = currentEmojiKey;
      copyToClipboardValue(value, translate(messageKey, fallback)).then(
        copied => {
          if (copied) {
            recordCopiedEmoji(copiedEmojiKey);
            if (button.matches('.emoji-preview'))
              animateEmojiCopyConfirmation(button);
          }
        }
      );
    }
  });
  exampleDialog.addEventListener('close', onEmojiDialogClose);
  versionModeToggle?.addEventListener('click', toggleVersionMode);
  versionPrevious?.addEventListener('click', () => stepVersion(-1));
  versionNext?.addEventListener('click', () => stepVersion(1));
  clearFiltersButton?.addEventListener('click', resetFilters);
  emojiPrevious?.addEventListener('click', () => navigateEmoji(-1));
  emojiNext?.addEventListener('click', () => navigateEmoji(1));
  versionSelector.addEventListener('change', () => {
    syncVersionRange();
    drawList();
  });
  versionRange?.addEventListener('input', onVersionRangeInput);
  orderButtons.forEach(button =>
    button.addEventListener('click', onOrderModeChange)
  );
  advancedFilters.addEventListener('toggle', () => {
    saveExplorerPreference('filtersOpen', advancedFilters.open);
  });
  document.addEventListener('keydown', onDocumentKeyDown);
  renderVersionModeToggle();
  renderPixelFontToggle();

  const setToolbarHeight = height => {
    document.documentElement.style.setProperty(
      '--toolbar-height',
      `${height}px`
    );
  };
  if (window.ResizeObserver) {
    new window.ResizeObserver(([entry]) => {
      const borderBox = Array.isArray(entry.borderBoxSize)
        ? entry.borderBoxSize[0]
        : entry.borderBoxSize;
      setToolbarHeight(borderBox?.blockSize ?? entry.contentRect.height);
    }).observe(toolbar);
  } else {
    const measureToolbar = () =>
      window.requestAnimationFrame(() =>
        setToolbarHeight(toolbar.offsetHeight)
      );
    measureToolbar();
    window.addEventListener('resize', measureToolbar);
  }

  if (typeof explorerPreferences.filtersOpen === 'boolean') {
    advancedFilters.open = explorerPreferences.filtersOpen;
  } else if (window.matchMedia('(max-width: 560px)').matches) {
    advancedFilters.open = false;
  }

  const routeLocale = window.location.pathname.match(
    /index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/
  )?.[1];
  const initialUiLocale =
    routeLocale ?? document.documentElement.dataset.locale ?? 'en';
  const initialSearchLocale =
    routeLocale ??
    (Object.hasOwn(explorerPreferences, 'locale')
      ? explorerPreferences.locale
      : initialUiLocale);
  await loadUiTranslations(
    initialUiLocale,
    document.documentElement.dir === 'rtl'
  );
  await loadSearchLanguages(initialSearchLocale);
  await loadData();
  drawList();
  finishExplorerLoading();
  applyDialogUrlState();
  urlStateReady = true;
  syncUrlState();
}

function finishExplorerLoading() {
  if (emojiList.dataset.rendering !== 'true') {
    revealExplorer();
  }
  matchCount.closest('.result-count').hidden = false;
  const comparison = document.querySelector('.pixel-comparison-custom');
  if (comparison) {
    comparison.textContent = emojiByKey.grinningFace ?? '😀';
    applyPixelArtworkClass(comparison, 'grinningFace');
  }
}

function revealExplorer() {
  document.documentElement.classList.remove('app-loading');
  emojiList.classList.remove('is-loading');
  emojiList.setAttribute('aria-busy', 'false');
  matchCount.closest('.result-count').hidden = false;
}

function upgradeEmojiDialog() {
  removeLegacyDialogElements();
  ensureImportExampleLines(exampleDialog);
  ensureCodeDialogView();
  ensureCompactCopyLabels();
  ensureRenderingDiagnostic();
  const dialogControls = exampleDialog.querySelector('.dialog-controls');
  if (dialogControls && !dialogControls.querySelector('.emoji-parent')) {
    const parent = document.createElement('button');
    parent.className = 'dialog-navigate emoji-parent';
    parent.type = 'button';
    parent.hidden = true;
    parent.textContent = '↩';
    parent.setAttribute('aria-label', 'Back to parent emoji');
    dialogControls.prepend(parent);
  }

  const eyebrow = exampleDialog.querySelector('.emoji-dialog-eyebrow');
  if (eyebrow) {
    eyebrow.dataset.i18n = 'emojiDetails';
    eyebrow.textContent = 'Emoji details';
  }

  let preview = exampleDialog.querySelector('.emoji-preview');
  if (preview?.tagName !== 'BUTTON') {
    const button = document.createElement('button');
    button.className = 'emoji-preview';
    button.type = 'button';
    button.textContent = preview?.textContent ?? '🍻';
    preview?.replaceWith(button);
    preview = button;
  }
  if (preview) {
    const previewValue =
      preview.querySelector('.emoji-preview-glyph')?.textContent ??
      preview.textContent.trim() ??
      '🍻';
    let glyph = preview.querySelector('.emoji-preview-glyph');
    let copyLabel = preview.querySelector('.emoji-preview-copy-label');
    if (!glyph || !copyLabel) {
      glyph = document.createElement('span');
      glyph.className = 'emoji-preview-glyph';
      glyph.textContent = previewValue;
      copyLabel = document.createElement('span');
      copyLabel.className = 'emoji-preview-copy-label';
      copyLabel.dataset.i18n = 'copy';
      copyLabel.textContent = 'Copy';
      preview.replaceChildren(glyph, copyLabel);
    }
    preview.removeAttribute('aria-hidden');
    preview.dataset.copy = 'emoji';
    preview.dataset.i18nAriaLabel = 'copyEmoji';
    preview.setAttribute('aria-label', 'Copy emoji');
  }

  if (!exampleDialog.querySelector('.copy-status')) {
    const status = document.createElement('div');
    status.className = 'copy-status sr-only';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    exampleDialog.querySelector('.dialog-heading')?.after(status);
  }
}

function ensureRenderingDiagnostic() {
  const details = exampleDialog.querySelector('.emoji-dialog-details');
  let section = exampleDialog.querySelector('.rendering-diagnostic');
  if (!section && details) {
    section = document.createElement('section');
    section.className = 'rendering-diagnostic developer-only';
    section.hidden = true;
    details.after(section);
  }
  if (
    section &&
    (!section.querySelector('.system-render-glyph') ||
      !section.querySelector('.pixel-render-glyph') ||
      !section.querySelector('.rendering-result'))
  ) {
    section.setAttribute('aria-labelledby', 'rendering-diagnostic-title');
    section.innerHTML = `
      <h3 id="rendering-diagnostic-title" data-i18n="deviceRendering">Rendering on this device</h3>
      <div class="rendering-comparison">
        <div>
          <span data-i18n="systemRendering">System rendering</span>
          <b class="system-render-glyph"></b>
        </div>
        <div>
          <span data-i18n="pixelRendering">Pixel rendering</span>
          <b class="pixel-render-glyph"></b>
        </div>
      </div>
      <p class="rendering-result"></p>
    `;
  }

  let invitation = exampleDialog.querySelector('.pixel-design-invitation');
  if (!invitation && section) {
    invitation = document.createElement('section');
    invitation.className = 'pixel-design-invitation developer-only';
    invitation.hidden = true;
    invitation.innerHTML = `
      <strong data-i18n="pixelDesignMissing">This emoji has no pixel design yet.</strong>
      <button class="show-pixel-editor" type="button" data-i18n="createPixelDesign">Create the 12×12 version</button>
    `;
    section.after(invitation);
  }
}

function ensureCodeDialogView() {
  const actions = exampleDialog.querySelector('.emoji-copy-actions');
  if (actions && !actions.querySelector('.show-emoji-code')) {
    const showCode = document.createElement('button');
    showCode.className = 'show-emoji-code developer-only';
    showCode.type = 'button';
    showCode.dataset.i18n = 'viewCode';
    showCode.textContent = 'View code';
    actions.append(showCode);
  }
  if (actions && !actions.querySelector('.show-pixel-editor')) {
    const showEditor = document.createElement('button');
    showEditor.className = 'show-pixel-editor developer-only';
    showEditor.type = 'button';
    showEditor.dataset.i18n = 'editPixelArt';
    showEditor.textContent = 'Edit pixel art';
    actions.append(showEditor);
  }

  const code = exampleDialog.querySelector('.code');
  if (!code) return;
  let codeView = code.closest('.emoji-code-view');
  if (!codeView) {
    codeView = document.createElement('div');
    codeView.className = 'emoji-code-view';
    codeView.hidden = true;
    code.replaceWith(codeView);
    codeView.append(code);
  }

  let toolbar = codeView.querySelector('.emoji-code-toolbar');
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.className = 'emoji-code-toolbar';
    codeView.prepend(toolbar);
  }
  if (!toolbar.querySelector('[data-copy="code"]')) {
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.dataset.copy = 'code';
    copy.dataset.i18n = 'copyCode';
    copy.textContent = 'Copy code';
    toolbar.append(copy);
  }
  if (!toolbar.querySelector('[data-copy="link"]')) {
    const copyLink = document.createElement('button');
    copyLink.type = 'button';
    copyLink.dataset.copy = 'link';
    copyLink.dataset.i18n = 'copyLink';
    copyLink.textContent = 'Copy link';
    toolbar.append(copyLink);
  }
  const codeCopy = toolbar.querySelector('[data-copy="code"]');
  const codeLink = toolbar.querySelector('[data-copy="link"]');
  if (codeCopy) {
    codeCopy.className = 'emoji-code-copy';
    codeCopy.innerHTML =
      '<span class="copy-action-long" data-i18n="copy">Copy</span><span class="copy-action-short" data-i18n="copy">Copy</span>';
  }
  if (codeLink) {
    codeLink.className = 'emoji-code-link';
    codeLink.innerHTML =
      '<span class="copy-action-long" aria-hidden="true">🔗</span><span class="copy-action-short" aria-hidden="true">🔗</span>';
  }
  if (codeLink && codeCopy) toolbar.append(codeLink, codeCopy);
  code.after(toolbar);
  if (actions && !actions.querySelector('[data-copy="link"]')) {
    const copyLink = document.createElement('button');
    copyLink.type = 'button';
    copyLink.dataset.copy = 'link';
    copyLink.dataset.i18n = 'copyLink';
    copyLink.textContent = 'Copy link';
    actions.querySelector('.show-emoji-code')?.before(copyLink);
  }
  actions
    ?.querySelectorAll(
      '[data-copy="key"], [data-copy="escape"], [data-copy="codePoints"], .show-emoji-code, .show-pixel-editor'
    )
    .forEach(element => element.classList.add('developer-only'));
  exampleDialog
    .querySelectorAll(
      '.rendering-diagnostic, .pixel-design-invitation, .emoji-composition, .emoji-metadata > div:has(.emoji-sequence-type), .emoji-metadata > div:has(.emoji-status)'
    )
    .forEach(element => element.classList.add('developer-only'));
}

function ensureCompactCopyLabels() {
  const definitions = {
    key: ['copyKey', 'Copy key', 'keyShort', 'Key'],
    escape: ['copyEscape', 'Copy escape', 'escapeShort', 'Escape'],
    codePoints: [
      'copyCodePoints',
      'Copy code points',
      'codePoints',
      'Code points'
    ],
    code: ['copyCode', 'Copy code', 'codeShort', 'Code'],
    link: ['copyLink', 'Copy link', 'linkShort', 'Link']
  };
  exampleDialog
    .querySelectorAll('[data-copy]:not(.emoji-preview)')
    .forEach(button => {
      const definition = definitions[button.dataset.copy];
      if (!definition) return;
      const [longKey, longFallback, shortKey, shortFallback] = definition;
      if (!button.querySelector('.copy-action-long')) {
        const longLabel = document.createElement('span');
        const shortLabel = document.createElement('span');
        longLabel.className = 'copy-action-long';
        longLabel.dataset.i18n = longKey;
        longLabel.textContent = longFallback;
        shortLabel.className = 'copy-action-short';
        shortLabel.dataset.i18n = shortKey;
        shortLabel.textContent = shortFallback;
        button.replaceChildren(longLabel, shortLabel);
      }
      button.dataset.i18nAriaLabel = longKey;
      button.setAttribute('aria-label', longFallback);
    });
}

function setEmojiDialogView(requestedMode, updateUrl = true) {
  const normalizedMode =
    requestedMode === true
      ? 'code'
      : requestedMode === false
        ? 'details'
        : ['details', 'code', 'editor'].includes(requestedMode)
          ? requestedMode
          : 'details';
  const mode =
    developerModeEnabled() || normalizedMode === 'details'
      ? normalizedMode
      : 'details';
  const showDetails = mode === 'details';
  exampleDialog.classList.toggle('is-code-view', mode === 'code');
  exampleDialog.classList.toggle('is-editor-view', mode === 'editor');
  exampleDialog.querySelector('.emoji-dialog-details').hidden = !showDetails;
  const composition = exampleDialog.querySelector('.emoji-composition');
  if (composition)
    composition.hidden =
      !showDetails ||
      !developerModeEnabled() ||
      composition.dataset.available !== 'true';
  exampleDialog.querySelector('.emoji-metadata').hidden = !showDetails;
  exampleDialog.querySelector('.emoji-copy-actions').hidden = !showDetails;
  const renderingDiagnostic = exampleDialog.querySelector(
    '.rendering-diagnostic'
  );
  if (renderingDiagnostic)
    renderingDiagnostic.hidden =
      !showDetails ||
      !developerModeEnabled() ||
      renderingDiagnostic.dataset.available !== 'true';
  const pixelInvitation = exampleDialog.querySelector(
    '.pixel-design-invitation'
  );
  if (pixelInvitation)
    pixelInvitation.hidden =
      !showDetails ||
      !developerModeEnabled() ||
      pixelInvitation.dataset.available !== 'true';
  exampleDialog.querySelector('.emoji-code-view').hidden = mode !== 'code';
  if (mode === 'code' && currentEmojiKey) {
    updateEmojiImportExamples(byId[currentEmojiKey] ?? {});
    void loadPackageManifest().then(() => {
      if (currentEmojiKey && exampleDialog.classList.contains('is-code-view')) {
        updateEmojiImportExamples(byId[currentEmojiKey] ?? {});
      }
    });
  }
  const dialogModeBack = exampleDialog.querySelector('.dialog-mode-back');
  if (dialogModeBack) dialogModeBack.hidden = showDetails;
  if (!showDetails && emojiParent) {
    emojiParent.hidden = true;
  } else if (showDetails) {
    updateCompositionBackButton();
  }
  if (pixelEditor) {
    pixelEditor.element.hidden = mode !== 'editor';
    if (mode === 'editor' && currentEmojiKey) {
      pixelEditor.open(currentEmojiKey, emojiByKey[currentEmojiKey]);
    }
  } else if (mode === 'editor') {
    void ensurePixelEditor();
  }
  const eyebrow = exampleDialog.querySelector('.emoji-dialog-eyebrow');
  const [key, fallback] =
    mode === 'code'
      ? ['codeExample', 'Code example']
      : mode === 'editor'
        ? ['pixelEditor', 'Pixel editor']
        : ['emojiDetails', 'Emoji details'];
  eyebrow.dataset.i18n = key;
  eyebrow.textContent = translate(key, fallback);
  if (updateUrl && exampleDialog.open) syncUrlState();
}

async function ensurePixelEditor() {
  if (pixelEditor) return pixelEditor;
  pixelEditorPromise ??= Promise.all([
    loadStylesheet('./explorer/pixel-editor.css', 'pixel-editor-stylesheet'),
    import('./pixel-editor.js')
  ])
    .then(([, { createPixelEditor }]) => {
      pixelEditor = createPixelEditor({
        dialog: exampleDialog,
        translate,
        formatNumber: formatUiNumber,
        formatPercent: formatUiPercent
      });
      pixelEditor.refreshTranslations();
      return pixelEditor;
    })
    .catch(error => {
      pixelEditorPromise = undefined;
      console.warn('Pixel editor unavailable', error);
      return undefined;
    });
  const editor = await pixelEditorPromise;
  if (!editor) return undefined;
  if (exampleDialog.classList.contains('is-editor-view')) {
    editor.element.hidden = false;
    if (currentEmojiKey)
      await editor.open(currentEmojiKey, emojiByKey[currentEmojiKey]);
    editor.element
      .querySelector('.pixel-editor-canvas')
      ?.focus({ preventScroll: true });
  }
  return editor;
}

function loadStylesheet(href, id) {
  const existing = document.getElementById(id);
  if (existing) {
    return existing.sheet
      ? Promise.resolve(existing)
      : new Promise(resolve =>
          existing.addEventListener('load', () => resolve(existing), {
            once: true
          })
        );
  }
  const stylesheet = document.createElement('link');
  stylesheet.id = id;
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
  return new Promise((resolve, reject) => {
    stylesheet.addEventListener('load', () => resolve(stylesheet), {
      once: true
    });
    stylesheet.addEventListener('error', reject, { once: true });
  });
}

function focusInitialEmojiDialogAction() {
  const target = exampleDialog.classList.contains('is-code-view')
    ? exampleDialog.querySelector('[data-copy="code"]')
    : exampleDialog.querySelector('.emoji-preview');
  target?.focus({ preventScroll: true });
}

function updateFavoriteButton() {
  updateFavoriteToggleButton(exampleDialog.querySelector('.toggle-favorite'), {
    favoriteEmojiKeys,
    currentEmojiKey,
    translate
  });
}

function toggleFavorite(key) {
  if (!key) return;
  favoriteEmojiKeys = nextFavoriteEmojiKeys(favoriteEmojiKeys, key);
  saveExplorerPreference('favorites', favoriteEmojiKeys);
  updateFavoriteButton();
  if (savedDialog?.open) renderSavedEmoji();
}

function addFavorite(key) {
  if (!key || favoriteEmojiKeys.includes(key)) return;
  favoriteEmojiKeys = nextFavoriteEmojiKeys(favoriteEmojiKeys, key);
  saveExplorerPreference('favorites', favoriteEmojiKeys);
  updateFavoriteButton();
  if (savedDialog?.open) renderSavedEmoji();
}

function recordCopiedEmoji(key) {
  copiedEmojiKeys = nextCopiedEmojiKeys(copiedEmojiKeys, key);
  saveExplorerPreference('recentCopied', copiedEmojiKeys);
}

function renderSavedEmojiList(container, empty, keys, source) {
  renderSavedEmojiListHelper({
    container,
    empty,
    keys,
    source,
    emojiByKey,
    searchAnnotations,
    byId,
    applyPixelArtworkClass
  });
}

function renderSavedEmoji() {
  if (!savedDialog) return;
  renderSavedEmojiList(
    savedDialog.querySelector('.favorites-list'),
    savedDialog.querySelector('.favorites-empty'),
    favoriteEmojiKeys,
    'favorites'
  );
  renderSavedEmojiList(
    savedDialog.querySelector('.copied-list'),
    savedDialog.querySelector('.copied-empty'),
    copiedEmojiKeys,
    'copied'
  );
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

function ensureActiveFilterSummary() {
  let summary = document.getElementsByClassName('active-filter-summary')[0];
  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'active-filter-summary';
    summary.hidden = true;
    const text = document.createElement('span');
    text.className = 'active-filter-text';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'clear-filters';
    clear.dataset.i18n = 'clearAll';
    clear.textContent = 'Clear all';
    summary.append(text, clear);
    document.getElementsByClassName('filter-options')[0]?.appendChild(summary);
  }
  summary.removeAttribute('role');
  summary.removeAttribute('aria-live');
  return {
    summary,
    text: summary.querySelector('.active-filter-text'),
    clear: summary.querySelector('.clear-filters')
  };
}

function ensureSequenceTypeFilter() {
  const existing = document.getElementsByClassName('select-sequence-type')[0];
  if (existing) return existing;
  const field = document.createElement('div');
  field.className = 'filter-field sequence-filter-field';
  field.hidden = true;
  field.innerHTML = `
    <div class="filter-heading">
      <span id="sequence-filter-label" data-i18n="sequenceType">Sequence type</span>
      <span class="compact-sequence-label"></span>
    </div>
    <select class="select-sequence-type" aria-labelledby="sequence-filter-label"><option>Not loaded</option></select>
    <div class="compact-choices compact-sequence-choices" role="radiogroup" aria-labelledby="sequence-filter-label"></div>
  `;
  document.querySelector('.filter-grid .version-field')?.before(field);
  return field.querySelector('.select-sequence-type');
}

function ensureChoiceContainer(selector, className, labelId) {
  const existing = document.getElementsByClassName(className)[0];
  if (existing) return existing;

  let field = selector.closest('.filter-field');
  if (field?.tagName === 'LABEL') {
    const replacement = document.createElement('div');
    replacement.className = field.className;
    replacement.append(...field.childNodes);
    field.replaceWith(replacement);
    field = replacement;
  }

  const label = field?.querySelector('span');
  if (label && !label.id) label.id = labelId;
  selector.setAttribute('aria-labelledby', label?.id || labelId);
  const choices = document.createElement('div');
  choices.className = `compact-choices ${className}`;
  choices.setAttribute('role', 'radiogroup');
  choices.setAttribute('aria-labelledby', label?.id || labelId);
  field?.appendChild(choices);
  return choices;
}

function ensureSelectionLabel(selector, className, labelId) {
  const existing = document.getElementsByClassName(className)[0];
  if (existing) return existing;

  const field = selector.closest('.filter-field');
  const label =
    document.getElementById(labelId) ?? field?.querySelector('span');
  if (!field || !label) return undefined;
  let heading = label.closest('.filter-heading');
  if (!heading) {
    heading = document.createElement('div');
    heading.className = 'filter-heading';
    label.before(heading);
    heading.appendChild(label);
  }
  const selection = document.createElement('span');
  selection.className = className;
  heading.appendChild(selection);
  return selection;
}

function ensureVersionSlider() {
  const existingRange = document.getElementsByClassName('version-range')[0];
  const existingOutput = document.getElementsByClassName(
    'version-range-value'
  )[0];
  const existingField = existingRange?.closest('.version-field');
  existingField?.classList.add('developer-only');
  if (existingRange && existingOutput)
    return { range: existingRange, output: existingOutput };

  let field = versionSelector.closest('.filter-field');
  field?.classList.add('developer-only');
  if (field?.tagName === 'LABEL') {
    const replacement = document.createElement('div');
    replacement.className = `${field.className} version-field`;
    replacement.append(...field.childNodes);
    field.replaceWith(replacement);
    field = replacement;
  }
  const label = field?.querySelector('span');
  if (label && !label.id) label.id = 'version-filter-label';
  versionSelector.setAttribute(
    'aria-labelledby',
    label?.id || 'version-filter-label'
  );

  const wrapper = document.createElement('div');
  wrapper.className = 'compact-version';
  const range = document.createElement('input');
  range.id = 'version-range';
  range.className = 'version-range';
  range.type = 'range';
  range.min = '0';
  range.max = '0';
  range.step = '1';
  range.value = '0';
  range.disabled = true;
  range.setAttribute('aria-labelledby', label?.id || 'version-filter-label');
  range.setAttribute('aria-describedby', 'version-range-value');
  const output = document.createElement('output');
  output.id = 'version-range-value';
  output.className = 'version-range-value';
  output.setAttribute('for', 'version-range');
  output.setAttribute('aria-live', 'polite');
  output.value = '—';
  wrapper.append(range, output);
  field?.appendChild(wrapper);
  return { range, output };
}

function ensureVersionModeToggle() {
  populateVersionModeOptions();
  const versionField = versionSelector.closest('.filter-field');
  const oldModeField = versionModeSelector.closest('.filter-field');
  if (oldModeField && oldModeField !== versionField) oldModeField.hidden = true;
  versionModeSelector.hidden = true;

  const existing = document.getElementsByClassName('version-mode-toggle')[0];
  if (existing) return existing;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'version-mode-toggle';
  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '🎯';
  button.appendChild(icon);
  versionRange.closest('.compact-version')?.prepend(button);
  return button;
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

function getUrlState() {
  return parseExplorerUrlState({
    search: window.location.search,
    developerMode: developerModeEnabled(),
    preferredOrder: explorerPreferences.order,
    allowedSequenceTypes: sequenceTypeOrder
  });
}

function applyBasicUrlState() {
  const state = getUrlState();
  const nextState = applyBasicUrlStateToControls({
    state,
    searchText,
    orderButtons
  });
  orderMode = nextState.orderMode;
  selectedSequenceType = nextState.selectedSequenceType;
  compositionMode = nextState.compositionMode;
}

function applyLoadedUrlState() {
  const state = getUrlState();
  const selections = applyLoadedUrlStateToControls({
    state,
    versionSelector,
    versionModeSelector,
    groups,
    subGroups,
    skinToneCheckboxes,
    hairCheckboxes,
    genderCheckboxes,
    subGroupSelectionKey
  });
  selectedGroup = selections.selectedGroup;
  selectedSubGroup = selections.selectedSubGroup;
  renderVersionModeToggle();
  syncVersionRange();
}

function applyDialogUrlState() {
  const state = getUrlState();
  compositionMode = state.compositionMode;
  if (state.emoji && emojiByKey[state.emoji] !== undefined) {
    closePanelDialog(savedDialog);
    closePanelDialog(helpDialog);
    closePanelDialog(languageDialog);
    showEmoji(state.emoji, false, displayedKeys);
    setEmojiDialogView(state.emojiMode, false);
    if (!exampleDialog.open) {
      exampleDialog.showModal();
      focusInitialEmojiDialogAction();
    }
    return;
  }
  if (exampleDialog.open) {
    suppressDialogCloseSync = true;
    exampleDialog.close();
    suppressDialogCloseSync = false;
  }
  const desiredPanelDialog = getPanelDialog(state.panel);
  [savedDialog, helpDialog, languageDialog].forEach(dialog => {
    if (dialog !== desiredPanelDialog) closePanelDialog(dialog);
  });
  if (desiredPanelDialog && !desiredPanelDialog.open) {
    openPanelDialog(state.panel, false);
  }
}

function syncUrlState(method = 'replace', historyState = window.history.state) {
  if (!urlStateReady || applyingUrlState) return;
  const skin = skinToneCheckboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const hair = hairCheckboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const gender = genderCheckboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  const query = buildExplorerUrlQuery({
    search: searchText.value,
    developerMode: developerModeEnabled(),
    latestReleasedVersion: versionManifests.at(-1)?.version,
    version: versionSelector.value,
    versionMode: versionModeSelector.value,
    order: orderMode,
    group: selectedGroup,
    subGroup: selectedSubGroup,
    sequenceType: selectedSequenceType,
    skin,
    hair,
    gender,
    compositionMode,
    currentEmojiKey,
    emojiMode: exampleDialog.classList.contains('is-editor-view')
      ? 'editor'
      : exampleDialog.classList.contains('is-code-view')
        ? 'code'
        : 'details',
    panel: getOpenPanel(),
    dialogOpen: exampleDialog.open
  });
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  window.history[`${method}State`](historyState, '', url);
}

function resetFilters() {
  resetFilterControls({
    searchText,
    versionModeSelector,
    versionSelector,
    latestReleasedVersion: versionManifests.at(-1)?.version,
    skinToneCheckboxes,
    hairCheckboxes,
    genderCheckboxes
  });
  selectedGroup = '';
  selectedSubGroup = '';
  selectedSequenceType = '';
  renderVersionModeToggle();
  syncVersionRange();
  renderCategoryFilters();
  drawList();
  searchText.focus();
}

function onGenderChange(event) {
  applyExclusiveCheckboxSelection(genderCheckboxes, event.currentTarget);
  drawList();
}

function stepVersion(amount) {
  const nextIndex = stepVersionIndex(
    Number(versionRange.value),
    versionSelector.options.length,
    amount
  );
  if (nextIndex === Number(versionRange.value)) return;
  versionRange.value = String(nextIndex);
  onVersionRangeInput();
}

function onDocumentKeyDown(event) {
  const activeTag = document.activeElement?.tagName;
  const isTyping =
    activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
  const hasOpenDialog = Boolean(document.querySelector('dialog[open]'));
  if (event.key === '?' && !isTyping && !hasOpenDialog && helpDialog) {
    event.preventDefault();
    openPanelDialog('help');
    return;
  }
  if (event.key === '/' && !isTyping && !hasOpenDialog) {
    event.preventDefault();
    searchText.focus();
    return;
  }
  if (event.key === 'Escape' && !hasOpenDialog && searchText.value) {
    searchText.value = '';
    drawList();
    searchText.focus();
    return;
  }
  if (!exampleDialog.open || isTyping) return;
  const rtl = document.documentElement.dir === 'rtl';
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    navigateEmoji(rtl ? 1 : -1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    navigateEmoji(rtl ? -1 : 1);
  }
}

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
  const pixelFontManifestUrl = isViteDevelopment
    ? `pixel-font/build/explorer-manifest.json?v=${Date.now()}`
    : 'pixel-font/build/explorer-manifest.json';
  const [catalog, pixelFontManifest] = await Promise.all([
    fetch('explorer/catalog.json').then(response => response.json()),
    fetch(
      pixelFontManifestUrl,
      isViteDevelopment ? { cache: 'no-store' } : undefined
    )
      .then(response => (response.ok ? response.json() : { glyphs: [] }))
      .catch(() => ({ glyphs: [] }))
  ]);
  const data = catalog.emoji.map(row =>
    Object.fromEntries(
      catalog.fields.map((field, index) => [field, row[index]])
    )
  );
  updatePixelArtworkManifest(pixelFontManifest);
  emojiByKey = Object.fromEntries(data.map(item => [item.key, item.emoji]));
  allIds = Object.keys(emojiByKey);

  // Keep Unicode's group/subgroup taxonomy, then add a smaller explorer section
  // inside each Unicode subgroup for large collections.
  items = data.map(item => ({
    ...item,
    unicodeSubGroup: item.subGroup,
    subGroup: getExplorerSubGroup(item)
  }));
  const explorerSectionCounts = items.reduce((counts, item) => {
    const key = `${item.group}:${item.unicodeSubGroup}`;
    if (!counts.has(key)) counts.set(key, new Set());
    counts.get(key).add(item.subGroup);
    return counts;
  }, new Map());
  items.forEach(item => {
    item.hasExplorerSections =
      explorerSectionCounts.get(`${item.group}:${item.unicodeSubGroup}`).size >
      1;
  });
  byId = items.reduce((byId, item) => ({ ...byId, [item.key]: item }), {});
  rebuildEmojiCodePointLookup();
  updateModifierPixelArtwork();

  groups = items
    .reduce(
      (all, item) => (all.includes(item.group) ? all : [...all, item.group]),
      []
    )
    .sort();

  subGroups = items.reduce((all, { group, unicodeSubGroup }) => {
    if (!all[group]) all[group] = [];
    if (!all[group].includes(unicodeSubGroup)) {
      all[group].push(unicodeSubGroup);
      all[group].sort();
    }
    return all;
  }, {});
  groups.forEach(group => subGroups[group].sort());
  buildCategoryRepresentatives();

  versionModeSelector.value = 'through';
  groupSelector.addEventListener('change', onGroupSelectorChange);
  subGroupSelector.addEventListener('change', onSubGroupSelectorChange);
  sequenceTypeSelector.addEventListener('change', onSequenceTypeSelectorChange);
  renderCategoryFilters();

  allIds = [];
  // Sort keys by Unicode group and subgroup, then by explorer section.
  groups.forEach(group => {
    groupedKeys[group] = {};
    subGroups[group].forEach(unicodeSubGroup => {
      groupedKeys[group][unicodeSubGroup] = [];
      const subgroupItems = items.filter(
        item => item.group === group && item.unicodeSubGroup === unicodeSubGroup
      );
      const explorerSections = [
        ...new Set(subgroupItems.map(item => item.subGroup))
      ].sort();
      explorerSections.forEach(section => {
        subgroupItems
          .filter(item => item.subGroup === section)
          .forEach(item => {
            allIds.push(item.key);
            groupedKeys[group][unicodeSubGroup].push(item.key);
          });
      });
    });
  });

  // Keep this snapshot before draft candidates are appended in
  // loadVersionData(), so the default version filter stays released-only.
  releasedIds = new Set(allIds);
  onClick({ target: { id: 'clinkingBeerMugs' } }, false);
  applyLoadedUrlState();
  if (developerModeEnabled()) await loadVersionData();
}

async function loadSearchLanguages(initialLocale = '') {
  try {
    const manifest = await fetch('locales/manifest.json').then(response =>
      response.json()
    );
    searchLocales = manifest.locales ?? [];
    renderSearchLanguages();
    if (
      initialLocale &&
      searchLocales.some(locale => locale.locale === initialLocale)
    ) {
      await setSearchLanguage(initialLocale);
    }
  } catch (error) {
    console.warn('Search language packs unavailable', error);
    languagePicker.disabled = true;
  }
}

function renderSearchLanguages() {
  languageList.replaceChildren();
  const navigationParams = new URLSearchParams(window.location.search);
  navigationParams.delete('panel');
  navigationParams.delete('emoji');
  navigationParams.delete('emojiMode');
  const navigationQuery = navigationParams.toString();
  const navigationSearch = navigationQuery ? `?${navigationQuery}` : '';
  const noLanguage = document.createElement('a');
  noLanguage.href = `./${navigationSearch}`;
  noLanguage.className = 'language-option';
  noLanguage.classList.toggle('is-selected', selectedSearchLocale === '');
  noLanguage.setAttribute('aria-pressed', String(selectedSearchLocale === ''));
  noLanguage.innerHTML = `<span class="language-option-flag" aria-hidden="true">🌐</span><span class="language-option-label">${translate('noLanguagePack', 'No language pack')}</span>`;
  noLanguage.addEventListener('click', event =>
    selectLanguageLink(event, '', noLanguage.href)
  );
  languageList.appendChild(noLanguage);

  searchLocales.forEach(locale => {
    const option = document.createElement('a');
    const flag = languageFlags[locale.locale] ?? '🌐';
    option.href = `./index.${locale.locale}.html${navigationSearch}`;
    option.className = 'language-option';
    option.classList.toggle(
      'is-selected',
      locale.locale === selectedSearchLocale
    );
    option.setAttribute(
      'aria-pressed',
      String(locale.locale === selectedSearchLocale)
    );
    const uiLocale = document.documentElement.lang || 'en';
    const localizedLabel =
      new Intl.DisplayNames([uiLocale], { type: 'language' }).of(
        locale.locale
      ) ?? locale.label;
    const label =
      locale.locale === selectedSearchLocale ||
      localizedLabel === locale.nativeLabel
        ? localizedLabel
        : `${localizedLabel} (${locale.nativeLabel})`;
    option.innerHTML = `<span class="language-option-flag" aria-hidden="true">${flag}</span><span class="language-option-label">${label}</span>`;
    option.addEventListener('click', event =>
      selectLanguageLink(event, locale.locale, option.href)
    );
    languageList.appendChild(option);
  });
}

async function selectLanguageLink(event, locale, href) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  event.preventDefault();
  await setSearchLanguage(locale);
  window.history.pushState({ locale }, '', href);
}

window.addEventListener('popstate', async () => {
  applyingUrlState = true;
  try {
    developerModeFromUrl =
      new URLSearchParams(window.location.search).get('developer') === '1';
    renderDeveloperMode();
    const locale =
      window.location.pathname.match(
        /index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/
      )?.[1] ?? '';
    if (!locale || searchLocales.some(entry => entry.locale === locale))
      await setSearchLanguage(locale);
    applyDialogUrlState();
  } finally {
    applyingUrlState = false;
    syncUrlState();
  }
});

async function setSearchLanguage(requestedLocale) {
  const loadId = ++searchLoadId;
  if (!requestedLocale) {
    updateWebAppManifest();
    selectedSearchLocale = '';
    searchAnnotations = {};
    searchLabels = {};
    searchSubgroupLabels = {};
    languagePickerFlag.textContent = '🌐';
    languagePickerLabel.textContent = translate(
      'languageNotLoaded',
      'Language not loaded'
    );
    closePanelDialog(languageDialog);
    await loadUiTranslations('en');
    saveExplorerPreference('locale', '');
    refreshLocalizedLabels();
    return;
  }

  const locale = searchLocales.find(entry => entry.locale === requestedLocale);
  if (!locale) return;
  updateWebAppManifest(locale.locale);
  languagePicker.disabled = true;
  languagePickerLabel.textContent = translate(
    'loadingLanguage',
    'Loading language…'
  );
  try {
    const packs = await Promise.all([
      ...(locale.baseLocale
        ? [
            fetch(`locales/${locale.baseLocale}.json`).then(response =>
              response.json()
            )
          ]
        : []),
      fetch(`locales/${locale.file}`).then(response => response.json())
    ]);
    if (loadId !== searchLoadId) return;
    searchAnnotations = Object.assign(
      {},
      ...packs.map(pack => pack.annotations ?? {})
    );
    searchLabels = Object.assign({}, ...packs.map(pack => pack.labels ?? {}));
    searchSubgroupLabels = Object.assign(
      {},
      ...packs.map(pack => pack.subgroups ?? {})
    );
    selectedSearchLocale = locale.locale;
    await loadUiTranslations(locale.locale, locale.rtl);
    languagePickerFlag.textContent = languageFlags[locale.locale] ?? '🌐';
    languagePickerLabel.textContent = locale.nativeLabel;
    closePanelDialog(languageDialog);
    saveExplorerPreference('locale', locale.locale);
    refreshLocalizedLabels();
  } catch (error) {
    if (loadId === searchLoadId) {
      console.warn(`Search language ${requestedLocale} unavailable`, error);
      selectedSearchLocale = '';
      searchAnnotations = {};
      searchLabels = {};
      searchSubgroupLabels = {};
      languagePickerFlag.textContent = '🌐';
      languagePickerLabel.textContent = translate(
        'languageNotLoaded',
        'Language not loaded'
      );
      refreshLocalizedLabels();
    }
  } finally {
    if (loadId === searchLoadId) languagePicker.disabled = false;
  }
}

function onOrderModeChange(event) {
  if (
    event.currentTarget.dataset.order === 'sequence' &&
    !developerModeEnabled()
  )
    return;
  orderMode = event.currentTarget.dataset.order;
  saveExplorerPreference('order', orderMode);
  orderButtons.forEach(button => {
    const active = button.dataset.order === orderMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderCategoryFilters();
  drawList();
}

async function loadVersionData() {
  if (versionDataPromise) return versionDataPromise;
  versionDataPromise = (async () => {
    try {
      const manifest = await fetch('versions/manifest.json').then(response =>
        response.json()
      );
      const manifests = manifest.versions
        .filter(version => version.released)
        .sort((a, b) => a.released.localeCompare(b.released));
      const keys = await Promise.all(
        manifests.map(async version => [
          version.version,
          new Set(
            await fetch(`versions/${version.file}`).then(response =>
              response.json()
            )
          )
        ])
      );
      const proposed = (manifest.proposed ?? []).sort((a, b) =>
        a.version.localeCompare(b.version, undefined, { numeric: true })
      );
      const proposedKeys = await Promise.all(
        proposed.map(async version => {
          const proposal = await fetch(version.file).then(response =>
            response.json()
          );
          const proposalItems = proposal.emoji ?? [];
          proposalItems.forEach(item => {
            if (emojiByKey[item.key]) return;
            const explorerItem = {
              ...item,
              unicodeSubGroup: item.subGroup,
              subGroup: getExplorerSubGroup(item)
            };
            items.push(explorerItem);
            byId[item.key] = explorerItem;
            emojiByKey[item.key] = item.emoji;
            allIds.push(item.key);
          });
          return [
            version.version,
            new Set(proposalItems.map(item => item.key))
          ];
        })
      );

      versionManifests = manifests;
      proposedVersionManifests = proposed;
      versionKeys = new Map([...keys, ...proposedKeys]);
      rebuildEmojiCodePointLookup();
      updateModifierPixelArtwork();
      buildCategoryRepresentatives();
      populateVersionSelector();
      applyLoadedUrlState();
      renderCategoryFilters();
      drawList();
      if (currentEmojiKey) {
        document.getElementsByClassName('emoji-version')[0].innerText =
          getIntroducedVersion(currentEmojiKey);
      }
    } catch (error) {
      console.warn('Version filters unavailable', error);
      versionModeSelector.disabled = true;
      versionSelector.disabled = true;
    }
  })();
  return versionDataPromise;
}

function populateVersionSelector() {
  const previousValue = versionSelector.value;
  versionSelector.replaceChildren();
  const manifests = [...versionManifests, ...proposedVersionManifests];
  manifests.forEach(version => {
    const option = document.createElement('option');
    option.value = version.version;
    if (!version.released) {
      const stage = version.stage ?? version.status ?? 'draft';
      const timing = version.expectedRelease
        ? `${translate('expected', 'expected')} ${version.expectedRelease}`
        : `${translate('updated', 'updated')} ${new Date(version.retrieved).toLocaleDateString(selectedSearchLocale || undefined)}`;
      option.text = `Emoji ${version.version} (${stage} · ${timing})`;
    } else {
      option.text = `Emoji ${version.version} (${translate('released', 'released')} ${version.released})`;
    }
    versionSelector.appendChild(option);
  });
  const defaultVersion =
    versionManifests.at(-1)?.version ?? manifests.at(-1)?.version ?? '';
  versionSelector.value = manifests.some(
    version => version.version === previousValue
  )
    ? previousValue
    : defaultVersion;
  versionSelector.disabled = manifests.length === 0;
  syncVersionRange();
}

function versionSliderLabel(version) {
  const proposed = proposedVersionManifests.find(
    item => item.version === version
  );
  if (!proposed) return `Emoji ${version}`;
  return `✨ Emoji ${version} ${proposed.stage ?? proposed.status ?? 'draft'}`;
}

function syncVersionRange() {
  if (!versionRange || !versionRangeValue) return;
  versionSelector.closest('.filter-field')?.classList.add('has-version-slider');
  const options = Array.from(versionSelector.options);
  const selectedIndex = Math.max(
    0,
    options.findIndex(option => option.value === versionSelector.value)
  );
  versionRange.max = String(Math.max(0, options.length - 1));
  versionRange.value = String(selectedIndex);
  versionRange.disabled = versionSelector.disabled || options.length === 0;
  const selectedVersion = options[selectedIndex]?.value ?? '';
  versionRangeValue.value = selectedVersion
    ? versionSliderLabel(selectedVersion)
    : '—';
  versionRangeValue.classList.toggle(
    'is-future',
    proposedVersionManifests.some(
      version => version.version === selectedVersion
    )
  );
  versionRange.setAttribute(
    'aria-valuetext',
    options[selectedIndex]?.text ?? '—'
  );
  if (versionPrevious)
    versionPrevious.disabled = versionRange.disabled || selectedIndex === 0;
  if (versionNext)
    versionNext.disabled =
      versionRange.disabled || selectedIndex === options.length - 1;
  updateModifierAvailability();
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
  if (versionKeys.size === 0) {
    if (skinToneFieldset) skinToneFieldset.hidden = false;
    if (hairFieldset) hairFieldset.hidden = false;
    if (genderFieldset) genderFieldset.hidden = false;
    if (modifierFilters) {
      modifierFilters.hidden = false;
      modifierFilters.classList.remove('has-single');
    }
    return;
  }
  const manifests = [...versionManifests, ...proposedVersionManifests];
  const selectedIndex = manifests.findIndex(
    version => version.version === versionSelector.value
  );
  const skinToneIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(key =>
      key.endsWith('SkinTone')
    )
  );
  const hairKeys = new Set(['redHair', 'curlyHair', 'bald', 'whiteHair']);
  const hairIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(key => hairKeys.has(key))
  );
  const genderIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(
      key => getEmojiGenders(byId[key] ?? {}).size > 0
    )
  );
  const skinToneAvailable =
    selectedIndex >= skinToneIndex && skinToneIndex !== -1;
  const hairAvailable = selectedIndex >= hairIndex && hairIndex !== -1;
  const genderAvailable = selectedIndex >= genderIndex && genderIndex !== -1;

  if (skinToneFieldset) skinToneFieldset.hidden = !skinToneAvailable;
  if (hairFieldset) hairFieldset.hidden = !hairAvailable;
  if (genderFieldset) genderFieldset.hidden = !genderAvailable;
  if (!skinToneAvailable)
    skinToneCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  if (!hairAvailable)
    hairCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  if (!genderAvailable)
    genderCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  if (modifierFilters) {
    const availableCount = [
      skinToneAvailable,
      hairAvailable,
      genderAvailable
    ].filter(Boolean).length;
    modifierFilters.hidden = availableCount === 0;
    modifierFilters.classList.toggle('has-single', availableCount === 1);
  }
}

function getVersionKeys() {
  if (versionKeys.size === 0) return releasedIds;
  if (versionModeSelector.value === 'selected') {
    return versionKeys.get(versionSelector.value) ?? new Set();
  }

  const manifests = [...versionManifests, ...proposedVersionManifests];
  const selectedIndex = manifests.findIndex(
    version => version.version === versionSelector.value
  );
  return new Set(
    manifests
      .slice(0, selectedIndex + 1)
      .flatMap(version => [...(versionKeys.get(version.version) ?? [])])
  );
}
function onGroupSelectorChange() {
  selectedGroup = groupSelector.value;
  selectedSubGroup = '';
  renderCategoryFilters();
  drawList();
}

function onSubGroupSelectorChange() {
  selectedSubGroup = subGroupSelector.value;
  renderCategoryFilters();
  drawList();
}

function onSequenceTypeSelectorChange() {
  selectedSequenceType = sequenceTypeSelector.value;
  renderCategoryFilters();
  drawList();
}

function subGroupSelectionKey(group, subGroup) {
  return `${group}::${subGroup}`;
}

function renderCategoryFilters() {
  const activeChoice = document.activeElement?.closest?.('[role="radio"]');
  const focusedChoices = activeChoice?.closest('.compact-group-choices')
    ? 'group'
    : activeChoice?.closest('.compact-subgroup-choices')
      ? 'subgroup'
      : activeChoice?.closest('.compact-sequence-choices')
        ? 'sequence'
        : '';
  const focusedValue = activeChoice?.dataset.value;
  updateAvailableCategories();
  const sequenceMode = orderMode === 'sequence';
  const groupField = groupSelector.closest('.filter-field');
  const subGroupField = subGroupSelector.closest('.filter-field');
  const sequenceField = sequenceTypeSelector.closest('.filter-field');
  groupField?.classList.toggle(
    'has-choice-buttons',
    Boolean(compactGroupChoices)
  );
  subGroupField?.classList.toggle(
    'has-choice-buttons',
    Boolean(compactSubGroupChoices)
  );
  sequenceField?.classList.toggle(
    'has-choice-buttons',
    Boolean(compactSequenceChoices)
  );
  if (groupField) groupField.hidden = sequenceMode;
  if (subGroupField) subGroupField.hidden = sequenceMode || !selectedGroup;
  if (sequenceField) sequenceField.hidden = !sequenceMode;
  populateGroupFilter();
  populateSubGroupFilter();
  populateSequenceTypeFilter();
  renderCompactGroupChoices();
  renderCompactSubGroupChoices();
  renderCompactSequenceChoices();
  if (focusedChoices === 'group') {
    focusCompactChoice(compactGroupChoices, focusedValue);
  } else if (focusedChoices === 'subgroup') {
    focusCompactChoice(compactSubGroupChoices, focusedValue);
  } else if (focusedChoices === 'sequence') {
    focusCompactChoice(compactSequenceChoices, focusedValue);
  }
}

function updateAvailableCategories() {
  const includedVersionKeys = getVersionKeys();
  availableCategoryKeys =
    includedVersionKeys.size === 0 && versionKeys.size === 0
      ? new Set(items.map(item => item.key))
      : includedVersionKeys;
  const groupNames = new Set();
  const subgroupNames = {};
  items.forEach(item => {
    if (!availableCategoryKeys.has(item.key)) return;
    groupNames.add(item.group);
    if (!subgroupNames[item.group]) subgroupNames[item.group] = new Set();
    subgroupNames[item.group].add(item.unicodeSubGroup);
  });
  availableGroups = groups.filter(group => groupNames.has(group));
  availableSubGroups = Object.fromEntries(
    availableGroups.map(group => [
      group,
      subGroups[group].filter(subGroup => subgroupNames[group]?.has(subGroup))
    ])
  );
  availableSequenceTypes = sequenceTypeOrder.filter(type =>
    items.some(
      item => availableCategoryKeys.has(item.key) && item.sequenceType === type
    )
  );
  if (
    selectedSequenceType &&
    !availableSequenceTypes.includes(selectedSequenceType)
  ) {
    selectedSequenceType = '';
  }

  if (selectedGroup && !availableGroups.includes(selectedGroup)) {
    selectedGroup = '';
    selectedSubGroup = '';
  } else if (selectedSubGroup) {
    const separatorIndex = selectedSubGroup.indexOf('::');
    const group =
      separatorIndex === -1 ? '' : selectedSubGroup.slice(0, separatorIndex);
    const subGroup =
      separatorIndex === -1 ? '' : selectedSubGroup.slice(separatorIndex + 2);
    if (
      group !== selectedGroup ||
      !availableSubGroups[group]?.includes(subGroup)
    ) {
      selectedSubGroup = '';
    }
  }
}

function populateGroupFilter() {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${translate('all', 'All')}`;
  groupSelector.replaceChildren(
    all,
    ...availableGroups.map(name => {
      const option = document.createElement('option');
      option.value = name;
      option.text = `${getGroupRepresentativeEmoji(name)} ${displayGroupName(name)}`;
      return option;
    })
  );
  groupSelector.value = selectedGroup;
}

function populateSubGroupFilter() {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${translate('all', 'All')}`;
  const children = [all];
  availableSubGroupParents().forEach(group => {
    const optionGroup = document.createElement('optgroup');
    optionGroup.label = displayGroupName(group);
    availableSubGroups[group].forEach(name => {
      const option = document.createElement('option');
      option.value = subGroupSelectionKey(group, name);
      option.dataset.group = group;
      option.dataset.subgroup = name;
      option.text = `${getSubGroupRepresentativeEmoji(group, name)} ${displayUnicodeSubGroupName(name)}`;
      optionGroup.appendChild(option);
    });
    children.push(optionGroup);
  });
  subGroupSelector.replaceChildren(...children);
  subGroupSelector.value = selectedSubGroup;
  subGroupSelector.disabled = false;
}

function populateSequenceTypeFilter() {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${translate('all', 'All')}`;
  sequenceTypeSelector.replaceChildren(
    all,
    ...availableSequenceTypes.map(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = `${sequenceTypeEmoji[type]} ${translate(sequenceTranslationKeys[type], sequenceTypeLabels[type])}`;
      return option;
    })
  );
  sequenceTypeSelector.value = selectedSequenceType;
}

function availableSubGroupParents() {
  return selectedGroup && availableGroups.includes(selectedGroup)
    ? [selectedGroup]
    : [];
}

function renderCompactGroupChoices() {
  if (!compactGroupChoices) return;
  if (compactGroupLabel) {
    compactGroupLabel.textContent = selectedGroup
      ? displayGroupName(selectedGroup)
      : translate('all', 'All');
  }
  const choices = [
    { name: '', emoji: '🌐', label: translate('all', 'All') },
    ...availableGroups.map(name => ({
      name,
      emoji: getGroupRepresentativeEmoji(name),
      label: displayGroupName(name)
    }))
  ];
  const selectedGroupLabel = selectedGroup
    ? displayGroupName(selectedGroup)
    : translate('all', 'All');
  renderFilterPickerTrigger(
    groupPickerTrigger,
    translate('group', 'Group'),
    selectedGroup ? getGroupRepresentativeEmoji(selectedGroup) : '🌐',
    selectedGroupLabel
  );
  compactGroupChoices.replaceChildren(
    ...choices.map(({ name, emoji, label }) =>
      makeCompactChoice({
        value: name,
        emoji,
        label,
        selected: selectedGroup === name,
        onSelect() {
          selectedGroup = name;
          selectedSubGroup = '';
          renderCategoryFilters();
          drawList();
          closeFilterPicker(groupFilterDialog, groupPickerTrigger);
        }
      })
    )
  );
}

function renderCompactSubGroupChoices() {
  if (!compactSubGroupChoices) return;
  if (compactSubGroupLabel) {
    const separatorIndex = selectedSubGroup.indexOf('::');
    const name =
      separatorIndex === -1 ? '' : selectedSubGroup.slice(separatorIndex + 2);
    compactSubGroupLabel.textContent = name
      ? displayUnicodeSubGroupName(name)
      : translate('all', 'All');
  }
  const choices = availableSubGroupParents().flatMap(group =>
    availableSubGroups[group].map(name => ({ group, name }))
  );
  const selectedSubGroupName = selectedSubGroup.split('::').slice(1).join('::');
  const selectedSubGroupLabel = selectedSubGroupName
    ? displayUnicodeSubGroupName(selectedSubGroupName)
    : translate('all', 'All');
  renderFilterPickerTrigger(
    subGroupPickerTrigger,
    translate('subgroup', 'Sub-group'),
    selectedSubGroupName
      ? getSubGroupRepresentativeEmoji(selectedGroup, selectedSubGroupName)
      : '🌐',
    selectedSubGroupLabel
  );
  const allChoice = makeCompactChoice({
    value: '',
    emoji: '🌐',
    label: translate('all', 'All'),
    selected: selectedSubGroup === '',
    onSelect() {
      selectedSubGroup = '';
      renderCategoryFilters();
      drawList();
      closeFilterPicker(subGroupFilterDialog, subGroupPickerTrigger);
    }
  });
  compactSubGroupChoices.replaceChildren(
    allChoice,
    ...choices.map(({ group, name }) =>
      makeCompactChoice({
        value: subGroupSelectionKey(group, name),
        emoji: getSubGroupRepresentativeEmoji(group, name),
        label: displayUnicodeSubGroupName(name),
        selected: selectedSubGroup === subGroupSelectionKey(group, name),
        onSelect() {
          selectedSubGroup = subGroupSelectionKey(group, name);
          renderCategoryFilters();
          drawList();
          closeFilterPicker(subGroupFilterDialog, subGroupPickerTrigger);
        }
      })
    )
  );
}

function renderCompactSequenceChoices() {
  if (!compactSequenceChoices) return;
  const selectedLabel = selectedSequenceType
    ? translate(
        sequenceTranslationKeys[selectedSequenceType],
        sequenceTypeLabels[selectedSequenceType]
      )
    : translate('all', 'All');
  if (compactSequenceLabel) compactSequenceLabel.textContent = selectedLabel;
  const choices = [
    { type: '', emoji: '🌐', label: translate('all', 'All') },
    ...availableSequenceTypes.map(type => ({
      type,
      emoji: sequenceTypeEmoji[type],
      label: translate(sequenceTranslationKeys[type], sequenceTypeLabels[type])
    }))
  ];
  compactSequenceChoices.replaceChildren(
    ...choices.map(({ type, emoji, label }) =>
      makeCompactChoice({
        value: type,
        emoji,
        label,
        selected: selectedSequenceType === type,
        onSelect() {
          selectedSequenceType = type;
          renderCategoryFilters();
          drawList();
          focusCompactChoice(compactSequenceChoices, type);
        }
      })
    )
  );
}

function makeCompactChoice({ value, emoji, label, selected, onSelect }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'compact-choice';
  button.dataset.value = value;
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', String(selected));
  button.tabIndex = selected ? 0 : -1;
  button.setAttribute('aria-label', label);
  button.title = label;
  const icon = document.createElement('span');
  icon.className = 'compact-choice-emoji';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = emoji;
  const text = document.createElement('span');
  text.className = 'compact-choice-label';
  text.textContent = label;
  button.replaceChildren(icon, text);
  button.addEventListener('click', onSelect);
  return button;
}

function renderFilterPickerTrigger(trigger, kind, emoji, value) {
  if (!trigger) return;
  trigger.querySelector('.filter-picker-emoji').textContent = emoji || '•';
  trigger.querySelector('.filter-picker-value').textContent = value;
  const label = `${kind}: ${value}`;
  trigger.setAttribute('aria-label', label);
  trigger.title = label;
}

function openFilterPicker(dialog, choices) {
  if (!dialog || !choices) return;
  dialog.showModal();
  window.requestAnimationFrame(() => {
    const selected = choices.querySelector('[aria-checked="true"]');
    (selected ?? choices.querySelector('[role="radio"]'))?.focus();
  });
}

function closeFilterPicker(dialog, trigger) {
  if (dialog?.open) dialog.close();
  trigger?.focus();
}

function focusCompactChoice(container, value) {
  const choices = Array.from(container.querySelectorAll('[role="radio"]'));
  const choice =
    choices.find(button => button.dataset.value === value) ??
    choices.find(button => button.getAttribute('aria-checked') === 'true');
  choice?.focus();
}

function onCompactChoiceKeyDown(event) {
  if (
    ![
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ].includes(event.key)
  )
    return;
  const choices = Array.from(
    event.currentTarget.querySelectorAll('[role="radio"]')
  );
  const currentIndex = choices.indexOf(event.target.closest('[role="radio"]'));
  if (currentIndex === -1 || choices.length === 0) return;
  event.preventDefault();
  let nextIndex;
  if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = choices.length - 1;
  } else {
    const rtl = document.documentElement.dir === 'rtl';
    const backwards =
      event.key === 'ArrowUp' ||
      event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    nextIndex =
      (currentIndex + (backwards ? -1 : 1) + choices.length) % choices.length;
  }
  choices[nextIndex].click();
}

function refreshLocalizedLabels() {
  if (groups.length === 0) return;
  renderCategoryFilters();
  syncVersionRange();
  drawList();
}

function displayGroupName(name) {
  return searchLabels[unicodeGroupLabelKeys[name]] ?? name;
}

function buildCategoryRepresentatives() {
  const manifests = [...versionManifests, ...proposedVersionManifests];
  const versionOrder = new Map();
  manifests.forEach((version, index) => {
    for (const key of versionKeys.get(version.version) ?? []) {
      if (!versionOrder.has(key)) versionOrder.set(key, index);
    }
  });
  const itemOrder = new Map(
    items.map((item, index) => [item.key, item.order ?? index])
  );
  const byIntroduction = (left, right) =>
    (versionOrder.get(left.key) ?? Infinity) -
      (versionOrder.get(right.key) ?? Infinity) ||
    itemOrder.get(left.key) - itemOrder.get(right.key) ||
    left.key.localeCompare(right.key);

  groupRepresentativeEmoji = new Map();
  subGroupRepresentativeEmoji = new Map();
  groups.forEach(group => {
    const subgroupRepresentatives = new Set();
    subGroups[group].forEach(subGroup => {
      const representative = items
        .filter(
          item => item.group === group && item.unicodeSubGroup === subGroup
        )
        .sort(byIntroduction)[0];
      if (!representative) return;
      subGroupRepresentativeEmoji.set(
        subGroupSelectionKey(group, subGroup),
        representative.emoji
      );
      subgroupRepresentatives.add(representative.key);
    });

    const candidates = items
      .filter(item => item.group === group)
      .sort(byIntroduction);
    const representative =
      candidates.find(item => !subgroupRepresentatives.has(item.key)) ??
      (subGroups[group].length === 1 && candidates.length === 1
        ? candidates[0]
        : undefined);
    if (representative)
      groupRepresentativeEmoji.set(group, representative.emoji);
  });
}

function getGroupRepresentativeEmoji(group) {
  return groupRepresentativeEmoji.get(group) ?? '';
}

function getSubGroupRepresentativeEmoji(group, subGroup) {
  return (
    subGroupRepresentativeEmoji.get(subGroupSelectionKey(group, subGroup)) ?? ''
  );
}

function displayUnicodeSubGroupName(name) {
  if (searchSubgroupLabels[name]) return searchSubgroupLabels[name];
  if (searchLabels[unicodeSubgroupLabelKeys[name]])
    return searchLabels[unicodeSubgroupLabelKeys[name]];
  const conciseNames = {
    'animal-amphibian': 'Amphibians',
    'animal-bird': 'Birds',
    'animal-bug': 'Bugs',
    'animal-mammal': 'Mammals',
    'animal-marine': 'Marine Animals',
    'animal-reptile': 'Reptiles',
    'plant-flower': 'Flowers',
    'plant-other': 'Other Plants',
    'book-paper': 'Books & Paper'
  };
  if (name.startsWith('food-')) return titleCase(name.slice(5));
  if (conciseNames[name]) return conciseNames[name];
  return titleCase(name);
}

const asGroup = name => {
  var div = document.createElement('div');
  div.className = 'group';
  var divName = document.createElement('h3');
  divName.innerText = displayGroupName(name);
  divName.className = 'name';
  div.appendChild(divName);

  return div;
};
const asUnicodeSubGroup = name => {
  var div = document.createElement('div');
  div.className = 'unicode-subgroup';
  var divName = document.createElement('h4');
  divName.innerText = displayUnicodeSubGroupName(name);
  divName.className = 'name';
  div.appendChild(divName);
  var divSections = document.createElement('div');
  divSections.className = 'subgroup-list';
  div.appendChild(divSections);
  return div;
};
const asSubGroup = (name, direct) => {
  var div = document.createElement('div');
  div.className = direct ? 'subgroup is-direct' : 'subgroup';
  var divName = document.createElement(direct ? 'span' : 'h5');
  divName.innerText = displayExplorerLabel(name);
  divName.className = 'name';
  div.appendChild(divName);
  var divEmoji = document.createElement('div');
  divEmoji.className = 'emoji';
  div.appendChild(divEmoji);
  return div;
};
function flushEmojiCellFragment(state) {
  if (!state.cellFragment?.hasChildNodes()) return;
  const target = state.emoji ?? state.subGroupElement?.lastElementChild;
  target?.appendChild(state.cellFragment);
  state.cellFragment = document.createDocumentFragment();
}
function asItem(state, key) {
  var meta = byId[key] ?? { group: UNASSIGNED, subGroups: UNASSIGNED };
  const displaySubGroup =
    orderMode === 'unicode' ? meta.unicodeSubGroup : meta.subGroup;
  const directSubGroup = orderMode === 'unicode' || !meta.hasExplorerSections;
  var groupId = 0;
  var subGroupId = 0;
  const hasGroups = meta && groups.length !== 0;

  if (hasGroups) {
    if (state.group !== meta.group) {
      flushEmojiCellFragment(state);
      state.groupElement = asGroup(meta.group);
      state.items.push(state.groupElement);
      state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
      state.groupElement.appendChild(state.unicodeSubGroupElement);
      state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.group = meta.group;
      state.unicodeSubGroup = meta.unicodeSubGroup;
      state.subGroup = displaySubGroup;
    } else if (state.unicodeSubGroup !== meta.unicodeSubGroup) {
      flushEmojiCellFragment(state);
      state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
      state.groupElement.appendChild(state.unicodeSubGroupElement);
      state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.unicodeSubGroup = meta.unicodeSubGroup;
      state.subGroup = displaySubGroup;
    } else if (state.subGroup !== displaySubGroup) {
      flushEmojiCellFragment(state);
      state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.subGroup = displaySubGroup;
    }

    groupId = groups.indexOf(meta.group);
    subGroupId = subGroups[meta.group]?.indexOf(meta.unicodeSubGroup) ?? 0;
  }

  var div = asEmojiCell(key, groupId, subGroupId);

  if (hasGroups) {
    state.cellFragment.appendChild(div);
  } else {
    state.items.push(div);
  }

  return state;
}

function asEmojiCell(key, groupId = 0, subGroupId = 0) {
  const div = document.createElement('div');
  div.id = key;
  div.dataset.emojiKey = key;
  const accessibleName =
    searchAnnotations[key]?.[0] ?? byId[key]?.shortName ?? displayEmojiKey(key);
  div.title = accessibleName;
  div.tabIndex = key === focusedEmojiKey ? 0 : -1;
  div.setAttribute('role', 'button');
  const introduced = getIntroducedVersion(key);
  const versionDescription =
    introduced === '—'
      ? ''
      : `, ${translate('emojiVersion', 'Emoji version')} ${introduced}`;
  div.setAttribute('aria-label', `${accessibleName}${versionDescription}`);
  div.classList.add(`group-${groupId}`);
  div.classList.add(`sub-group-${subGroupId}`);
  const emojiDiv = document.createElement('span');
  emojiDiv.className = 'emoji-glyph';
  emojiDiv.innerText = emojiByKey[key];
  applyPixelArtworkClass(emojiDiv, key);
  div.appendChild(emojiDiv);
  return div;
}

function asSequenceItem(state, key) {
  const type = byId[key]?.sequenceType ?? 'single';
  if (state.type !== type) {
    flushEmojiCellFragment(state);
    const section = document.createElement('div');
    section.className = 'sequence-type';
    const name = document.createElement('h3');
    name.className = 'name';
    const fallback = sequenceTypeLabels[type] ?? type;
    name.innerText = translate(sequenceTranslationKeys[type], fallback);
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    section.append(name, emoji);
    state.items.push(section);
    state.emoji = emoji;
    state.type = type;
  }
  state.cellFragment.appendChild(asEmojiCell(key));
  return state;
}

function orderedKeys(keys) {
  if (orderMode === 'grouped') return keys;
  return [...keys].sort((left, right) => {
    if (orderMode === 'sequence') {
      const typeDifference =
        sequenceTypeOrder.indexOf(byId[left]?.sequenceType ?? 'single') -
        sequenceTypeOrder.indexOf(byId[right]?.sequenceType ?? 'single');
      if (typeDifference !== 0) return typeDifference;
    }
    return (byId[left]?.order ?? Infinity) - (byId[right]?.order ?? Infinity);
  });
}

function getEmojiGenders(item) {
  const genders = new Set();
  const name = item.shortName?.toLocaleLowerCase() ?? '';
  const points = ` ${item.codePoints ?? ''} `;
  if (
    points.includes(' 2642 ') ||
    /\b(man|men|boy|boys|father|prince|king|groom|male)\b/.test(name)
  ) {
    genders.add('male');
  }
  if (
    points.includes(' 2640 ') ||
    /\b(woman|women|girl|girls|mother|princess|queen|bride|female)\b/.test(name)
  ) {
    genders.add('female');
  }
  if (/\b(person|people|adult|adults|child|children)\b/.test(name)) {
    genders.add('neutral');
  }
  if (genders.size === 0) {
    const key = item.key ?? '';
    const capitalizedKey = key.charAt(0).toLocaleUpperCase() + key.slice(1);
    if (
      emojiByKey[`man${capitalizedKey}`] &&
      emojiByKey[`woman${capitalizedKey}`]
    ) {
      genders.add('neutral');
    }
  }
  return genders;
}

function scheduleSearchDraw() {
  listRenderGeneration++;
  if (searchDrawTimer !== undefined) window.clearTimeout(searchDrawTimer);
  searchDrawTimer = window.setTimeout(() => {
    searchDrawTimer = undefined;
    drawList();
  }, 200);
}

function drawList() {
  if (searchDrawTimer !== undefined) {
    window.clearTimeout(searchDrawTimer);
    searchDrawTimer = undefined;
  }
  const focusedCell = document.activeElement?.closest?.('[data-emoji-key]');
  const shouldRestoreEmojiFocus = Boolean(focusedCell);
  var keywords = searchText.value
    .toLocaleLowerCase(selectedSearchLocale || undefined)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  function hasKeyword(emojiKey) {
    const searchableFields = [
      emojiKey,
      byId[emojiKey]?.shortName,
      ...(searchAnnotations[emojiKey] ?? [])
    ]
      .filter(Boolean)
      .map(field => field.toLocaleLowerCase(selectedSearchLocale || undefined));
    return keywords.every(keyword =>
      searchableFields.some(field => field.includes(keyword))
    );
  }

  var keys = allIds.filter(hasKeyword);
  const includedVersionKeys = getVersionKeys();
  if (includedVersionKeys) {
    keys = keys.filter(key => includedVersionKeys.has(key));
  }
  if (orderMode !== 'sequence' && selectedGroup && items.length !== 0) {
    keys = keys.filter(key => byId[key]?.group === selectedGroup);
  }
  if (orderMode !== 'sequence' && selectedSubGroup && items.length !== 0) {
    keys = keys.filter(
      key =>
        subGroupSelectionKey(byId[key]?.group, byId[key]?.unicodeSubGroup) ===
        selectedSubGroup
    );
  }
  if (orderMode === 'sequence' && selectedSequenceType) {
    keys = keys.filter(key => byId[key]?.sequenceType === selectedSequenceType);
  }
  skinToneCheckboxes
    .filter(check => {
      return check.checked;
    })
    .forEach(check => {
      keys = keys.filter(key =>
        items.find(item => item.key === key)?.codePoints.includes(check.value)
      );
    });

  hairCheckboxes
    .filter(check => {
      return check.checked;
    })
    .forEach(check => {
      keys = keys.filter(key =>
        items.find(item => item.key === key)?.codePoints.includes(check.value)
      );
    });
  const selectedGenders = genderCheckboxes
    .filter(check => check.checked)
    .map(check => check.value);
  if (selectedGenders.length > 0) {
    keys = keys.filter(key =>
      selectedGenders.some(gender =>
        getEmojiGenders(byId[key] ?? {}).has(gender)
      )
    );
  }

  keys = orderedKeys(keys);
  displayedKeys = keys;
  if (!focusedEmojiKey || !keys.includes(focusedEmojiKey)) {
    focusedEmojiKey = keys[0] ?? '';
  }
  renderEmojiList(keys, shouldRestoreEmojiFocus);
  matchCount.innerText = formatUiNumber(keys.length);
  updateActiveFilterSummary();
  updateDialogNavigation();
  syncUrlState();
}

function renderEmojiList(keys, shouldRestoreEmojiFocus) {
  const generation = ++listRenderGeneration;
  const renderRoot = document.createDocumentFragment();
  emojiList.dataset.rendering = 'true';
  emojiList.setAttribute('aria-busy', 'true');
  if (keys.length === 0) {
    renderRoot.appendChild(createEmptyResults());
    finishEmojiListRender(generation, shouldRestoreEmojiFocus, renderRoot);
    return;
  }

  const renderer = orderMode === 'sequence' ? asSequenceItem : asItem;
  const state =
    orderMode === 'sequence'
      ? {
          items: [],
          type: '',
          emoji: null,
          cellFragment: document.createDocumentFragment()
        }
      : {
          items: [],
          group: UNASSIGNED,
          unicodeSubGroup: UNASSIGNED,
          subGroup: UNASSIGNED,
          groupElement: null,
          unicodeSubGroupElement: null,
          subGroupElement: null,
          cellFragment: document.createDocumentFragment()
        };
  let keyIndex = 0;
  let appendedItemCount = 0;
  const renderChunk = () => {
    if (generation !== listRenderGeneration) return;
    const deadline = performance.now() + 6;
    const chunkEnd = Math.min(keyIndex + 120, keys.length);
    do {
      renderer(state, keys[keyIndex++]);
    } while (
      keyIndex < chunkEnd &&
      keyIndex < keys.length &&
      performance.now() < deadline
    );
    flushEmojiCellFragment(state);

    if (appendedItemCount < state.items.length) {
      const fragment = document.createDocumentFragment();
      while (appendedItemCount < state.items.length) {
        fragment.appendChild(state.items[appendedItemCount++]);
      }
      renderRoot.appendChild(fragment);
    }

    if (keyIndex < keys.length) {
      yieldForListRender().then(renderChunk);
    } else {
      finishEmojiListRender(generation, shouldRestoreEmojiFocus, renderRoot);
    }
  };
  renderChunk();
}

function yieldForListRender() {
  if (window.scheduler?.yield) return window.scheduler.yield();
  return new Promise(resolve => window.setTimeout(resolve, 0));
}

function finishEmojiListRender(
  generation,
  shouldRestoreEmojiFocus,
  renderRoot
) {
  if (generation !== listRenderGeneration) return;
  emojiList.replaceChildren(renderRoot);
  delete emojiList.dataset.rendering;
  revealExplorer();
  if (shouldRestoreEmojiFocus) {
    document.getElementById(focusedEmojiKey)?.focus();
  }
}

function onEmojiFocus(event) {
  const cell = event.target.closest('[data-emoji-key]');
  if (!cell) return;
  focusedEmojiKey = cell.dataset.emojiKey;
  emojiList.querySelectorAll('[data-emoji-key]').forEach(item => {
    item.tabIndex = item === cell ? 0 : -1;
  });
}

function onEmojiKeyDown(event) {
  const cell = event.target.closest('[data-emoji-key]');
  if (!cell) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick(event);
    return;
  }
  if (
    ![
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ].includes(event.key)
  )
    return;
  event.preventDefault();
  const cells = displayedKeys
    .map(key => document.getElementById(key))
    .filter(Boolean);
  if (cells.length === 0) return;
  let target;
  if (event.key === 'Home') {
    target = cells[0];
  } else if (event.key === 'End') {
    target = cells.at(-1);
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    target = closestVerticalEmoji(
      cell,
      cells,
      event.key === 'ArrowDown' ? 1 : -1
    );
  } else {
    const rtl = document.documentElement.dir === 'rtl';
    const direction = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight') ? 1 : -1;
    const currentIndex = cells.indexOf(cell);
    target = cells[currentIndex + direction];
  }
  target?.focus();
}

function closestVerticalEmoji(current, cells, direction) {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  return cells
    .filter(cell => {
      if (cell === current) return false;
      const rect = cell.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      return direction > 0 ? centerY > currentY + 1 : centerY < currentY - 1;
    })
    .map(cell => {
      const rect = cell.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return {
        cell,
        score:
          Math.abs(centerY - currentY) * 1000 + Math.abs(centerX - currentX)
      };
    })
    .sort((left, right) => left.score - right.score)[0]?.cell;
}

function createEmptyResults() {
  const section = document.createElement('section');
  section.className = 'empty-results';
  const title = document.createElement('h3');
  title.textContent = translate('noResults', 'No emoji found');
  const description = document.createElement('p');
  description.textContent = translate(
    'noResultsDescription',
    'Try removing a search term or filter.'
  );
  const actions = document.createElement('div');
  actions.className = 'empty-actions';
  if (searchText.value.trim()) {
    const clearSearch = document.createElement('button');
    clearSearch.type = 'button';
    clearSearch.textContent = translate('clearSearch', 'Clear search');
    clearSearch.addEventListener('click', () => {
      searchText.value = '';
      drawList();
      searchText.focus();
    });
    actions.appendChild(clearSearch);
  }
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.textContent = translate('resetFilters', 'Reset filters');
  reset.addEventListener('click', resetFilters);
  actions.appendChild(reset);
  section.append(title, description, actions);
  return section;
}

function updateActiveFilterSummary() {
  if (!activeFilterSummary || !activeFilterText) return;
  const parts = [];
  if (searchText.value.trim()) parts.push(`“${searchText.value.trim()}”`);
  if (orderMode === 'sequence' && selectedSequenceType) {
    parts.push(
      translate(
        sequenceTranslationKeys[selectedSequenceType],
        sequenceTypeLabels[selectedSequenceType]
      )
    );
  } else {
    if (selectedGroup) parts.push(displayGroupName(selectedGroup));
    if (selectedSubGroup)
      parts.push(
        displayUnicodeSubGroupName(
          selectedSubGroup.split('::').slice(1).join('::')
        )
      );
  }
  const latestReleased = versionManifests.at(-1)?.version;
  if (
    versionSelector.value &&
    (versionSelector.value !== latestReleased ||
      versionModeSelector.value === 'selected')
  ) {
    const mode =
      versionModeSelector.value === 'selected'
        ? translate('onlyVersion', 'Only')
        : translate('throughVersion', 'Through');
    parts.push(`${mode} ${versionSliderLabel(versionSelector.value)}`);
  }
  skinToneCheckboxes
    .filter(checkbox => checkbox.checked)
    .forEach(checkbox => {
      parts.push(
        checkbox.closest('label')?.querySelector('.modifier-emoji')
          ?.textContent ?? checkbox.value
      );
    });
  hairCheckboxes
    .filter(checkbox => checkbox.checked)
    .forEach(checkbox => {
      parts.push(
        checkbox.closest('label')?.querySelector('.modifier-emoji')
          ?.textContent ?? checkbox.value
      );
    });
  genderCheckboxes
    .filter(checkbox => checkbox.checked)
    .forEach(checkbox => {
      parts.push(
        checkbox.closest('label')?.querySelector('.modifier-emoji')
          ?.textContent ?? checkbox.value
      );
    });
  activeFilterSummary.hidden = parts.length === 0;
  activeFilterText.textContent = parts.join(' · ');
}

function updateEmojiImportExamples(item) {
  const examples = resolveImportExamples(packageManifest, item);
  document.querySelector('.emoji-import-path').textContent = examples.allPath;

  const popularLine = document.querySelector('.emoji-popular-import');
  const popularPath = document.querySelector('.emoji-popular-import-path');
  if (popularLine && popularPath) {
    popularLine.hidden = !examples.showPopular;
    popularPath.textContent = examples.popularPath;
  }

  const categoryLine = document.querySelector('.emoji-category-import');
  const categoryPath = document.querySelector('.emoji-category-import-path');
  if (categoryLine && categoryPath) {
    categoryLine.hidden = !examples.showCategory;
    categoryPath.textContent = examples.categoryPath;
  }

  const subgroupLine = document.querySelector('.emoji-subgroup-import');
  const subgroupPath = document.querySelector('.emoji-subgroup-import-path');
  if (subgroupLine && subgroupPath) {
    subgroupLine.hidden = !examples.showSubgroup;
    subgroupPath.textContent = examples.subgroupPath;
  }
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
  return (
    [...versionManifests, ...proposedVersionManifests].find(version =>
      versionKeys.get(version.version)?.has(key)
    )?.version ?? '—'
  );
}

function onClick(e, openDialog = true) {
  const cell = e.target.closest?.('[data-emoji-key]');
  var id = cell?.id ?? e.target.id;
  var value = emojiByKey[id];
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

function withoutCompositionParent(state = window.history.state) {
  const nextState = { ...(state ?? {}) };
  delete nextState.compositionParent;
  return nextState;
}

function updateEmojiComposition(item, value) {
  const section = exampleDialog.querySelector('.emoji-composition');
  const equation = section?.querySelector('.emoji-composition-equation');
  const modeButton = section?.querySelector('.emoji-composition-mode');
  if (!section || !equation || !modeButton) return;
  const points = (item.codePoints ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(hex => ({ hex: hex.toUpperCase(), point: Number.parseInt(hex, 16) }))
    .filter(component => Number.isFinite(component.point));

  equation.replaceChildren();
  section.dataset.available = String(points.length > 1);
  const detailsVisible =
    !exampleDialog.classList.contains('is-code-view') &&
    !exampleDialog.classList.contains('is-editor-view');
  section.hidden =
    !developerModeEnabled() || points.length <= 1 || !detailsVisible;
  if (points.length <= 1) {
    modeButton.hidden = true;
    return;
  }

  const condensedParts = condenseCompositionPoints(
    points,
    item.key,
    emojiKeyByCodePoints
  );
  const hasHiddenSequenceControl = points.some(component =>
    isCondensedSequenceControl(component.point)
  );
  const canCondense =
    hasHiddenSequenceControl || condensedParts.some(part => part.emojiKey);
  const displayedParts =
    compositionMode === 'full' || !canCondense
      ? points.map(component => ({ component }))
      : condensedParts.filter(
          part =>
            !part.component || !isCondensedSequenceControl(part.component.point)
        );
  const modeLabel =
    compositionMode === 'full'
      ? translate('showCondensedSequence', 'Show condensed sequence')
      : translate('showFullSequence', 'Show full sequence');
  modeButton.hidden = !canCondense;
  modeButton.textContent = modeLabel;
  modeButton.title = modeLabel;
  modeButton.setAttribute('aria-label', modeLabel);
  modeButton.setAttribute('aria-pressed', String(compositionMode === 'full'));

  displayedParts.forEach((displayedPart, index) => {
    const part = displayedPart.emojiKey
      ? createCondensedCompositionPart(displayedPart)
      : createCompositionPart(displayedPart.component, item.key);
    equation.append(index === 0 ? part : createCompositionTerm('+', part));
  });
  equation.append(
    createCompositionTerm(
      '=',
      createCompositionResult(value, item.shortName, item.key)
    )
  );
}

function condenseCompositionPoints(points, currentEmojiKey) {
  const condensed = [];
  for (let start = 0; start < points.length;) {
    let match;
    for (let end = points.length; end >= start + 2; end--) {
      if (start === 0 && end === points.length) continue;
      const codePoints = points
        .slice(start, end)
        .map(component => component.hex)
        .join(' ');
      const emojiKey = emojiKeyByCodePoints.get(codePoints);
      if (emojiKey && emojiKey !== currentEmojiKey) {
        match = { emojiKey, components: points.slice(start, end) };
        break;
      }
    }
    if (match) {
      condensed.push(match);
      start += match.components.length;
    } else {
      condensed.push({ component: points[start] });
      start++;
    }
  }
  return condensed;
}

function createCondensedCompositionPart({ emojiKey, components }) {
  const part = document.createElement('button');
  const glyph = document.createElement('span');
  const code = document.createElement('span');
  const linkedName = compositionTitle(emojiKey, searchAnnotations, byId);
  const viewLabel = translate('viewEmoji', 'View emoji');
  const codePoints = components
    .map(component => `U+${component.hex}`)
    .join(' ');
  part.className = 'emoji-composition-part';
  part.type = 'button';
  part.dataset.compositionEmoji = emojiKey;
  part.title = `${viewLabel}: ${linkedName} — ${codePoints}`;
  part.setAttribute('aria-label', `${viewLabel}: ${linkedName}. ${codePoints}`);
  glyph.className = 'emoji-composition-glyph';
  glyph.textContent = emojiByKey[emojiKey];
  applyPixelArtworkClass(glyph, emojiKey);
  code.className = 'emoji-composition-code emoji-composition-code-condensed';
  code.textContent = compositionReductionLabel(components.length, 1, {
    dir: document.documentElement.dir,
    locale: document.documentElement.lang || selectedSearchLocale || undefined,
    numberingSystem: document.documentElement.lang?.startsWith('ar')
      ? 'arab'
      : undefined
  });
  part.append(glyph, code);
  return part;
}

function createCompositionPart({ hex, point }, currentEmojiKey) {
  const linkedEmojiKey = findCompositionEmojiKey(
    hex,
    currentEmojiKey,
    emojiKeyByCodePoints
  );
  const artworkEmojiKey = findCompositionArtworkKey(hex, emojiKeyByCodePoints);
  const part = document.createElement(linkedEmojiKey ? 'button' : 'span');
  const glyph = document.createElement('span');
  const code = document.createElement('span');
  const details = describeCompositionPoint(point, translate);
  part.className = 'emoji-composition-part';
  if (linkedEmojiKey) {
    const linkedName = compositionTitle(
      linkedEmojiKey,
      searchAnnotations,
      byId
    );
    const viewLabel = translate('viewEmoji', 'View emoji');
    part.type = 'button';
    part.dataset.compositionEmoji = linkedEmojiKey;
    part.title = `${details.label} — ${viewLabel}: ${linkedName}`;
    part.setAttribute(
      'aria-label',
      `${details.label}, U+${hex}. ${viewLabel}: ${linkedName}`
    );
  } else {
    part.setAttribute('role', 'img');
    part.title = details.label;
    part.setAttribute('aria-label', `${details.label}, U+${hex}`);
  }
  if (artworkEmojiKey) {
    part.dataset.compositionArtwork = artworkEmojiKey;
    part.dataset.compositionPoint = String(point);
  }
  glyph.className = `emoji-composition-glyph${details.symbolic ? ' is-symbolic' : ''}`;
  glyph.textContent = details.glyph;
  applyStandalonePixelArtwork(glyph, artworkEmojiKey, point);
  code.className = 'emoji-composition-code emoji-composition-code-point';
  code.textContent = `U+${hex}`;
  part.append(glyph, code);
  return part;
}

function rebuildEmojiCodePointLookup() {
  emojiKeyByCodePoints = items.reduce((lookup, item) => {
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
    document.documentElement.lang || selectedSearchLocale || undefined;
  return formatUiNumberValue(
    value,
    locale,
    locale?.startsWith('ar') ? 'arab' : undefined
  );
}

function formatUiPercent(value) {
  const locale =
    document.documentElement.lang || selectedSearchLocale || undefined;
  return formatUiPercentValue(
    value,
    locale,
    locale?.startsWith('ar') ? 'arab' : undefined
  );
}

function createCompositionOperator(operator) {
  const element = document.createElement('span');
  element.className = 'emoji-composition-operator';
  element.setAttribute('aria-hidden', 'true');
  element.textContent = operator;
  return element;
}

function createCompositionTerm(operator, part) {
  const term = document.createElement('span');
  term.className = 'emoji-composition-term';
  term.append(createCompositionOperator(operator), part);
  return term;
}

function createCompositionResult(value, name, emojiKey) {
  const result = document.createElement('span');
  const glyph = document.createElement('span');
  const label = document.createElement('span');
  const resultLabel = translate('result', 'Result');
  result.className = 'emoji-composition-part emoji-composition-result';
  result.setAttribute('role', 'img');
  result.setAttribute('aria-label', `${resultLabel}: ${name ?? value}`);
  glyph.className = 'emoji-composition-glyph';
  glyph.textContent = value;
  applyPixelArtworkClass(glyph, emojiKey);
  label.className = 'emoji-composition-code';
  label.textContent = resultLabel;
  result.append(glyph, label);
  return result;
}

function applyPixelArtworkClass(element, emojiKey) {
  if (!element) return;
  element?.classList.toggle(
    'has-pixel-art',
    Boolean(emojiKey && paintedPixelEmojiKeys.has(emojiKey))
  );
  element?.classList.toggle(
    'has-proposed-pixel-art',
    Boolean(emojiKey && proposedPixelEmojiKeys.has(emojiKey))
  );
  if (emojiKey && paintedPixelEmojiKeys.has(emojiKey)) {
    element.dataset.pixelEmojiKey = emojiKey;
    element.textContent = renderedPixelEmoji(emojiKey);
  } else {
    delete element.dataset.pixelEmojiKey;
  }
}

function updatePixelArtworkManifest(manifest, revision) {
  const glyphs = manifest.fields
    ? (manifest.glyphs ?? []).map(row =>
        Object.fromEntries(
          manifest.fields.map((field, index) => [field, row[index]])
        )
      )
    : (manifest.glyphs ?? []);
  paintedPixelEmojiKeys = new Set(glyphs.map(glyph => glyph.key));
  privateUsePixelEmojiByKey = new Map(
    glyphs
      .filter(glyph => glyph.privateUseCodePoint)
      .map(glyph => [glyph.key, Number.parseInt(glyph.privateUseCodePoint, 16)])
  );
  proposedPixelEmojiKeys = new Set(
    glyphs
      .filter(glyph => glyph.releaseStatus === 'proposed')
      .map(glyph => glyph.key)
  );
  const comparison = document.querySelector('.pixel-comparison-custom');
  if (comparison) applyPixelArtworkClass(comparison, 'grinningFace');
}

function renderedPixelEmoji(emojiKey) {
  const value = emojiByKey[emojiKey] ?? byId[emojiKey]?.emoji ?? '';
  const privateUsePoint = privateUsePixelEmojiByKey.get(emojiKey);
  if (!value || !privateUsePoint) return value;
  const sequenceLength = (byId[emojiKey]?.codePoints ?? '')
    .split(/\s+/)
    .filter(
      point => point && !['FE0E', 'FE0F'].includes(point.toUpperCase())
    ).length;
  if (sequenceLength <= 1) return value;
  const pixelFontPreferred = explorerPreferences.pixelFont !== false;
  if (
    pixelFontPreferred ||
    proposedPixelEmojiKeys.has(emojiKey) ||
    systemEmojiAppearsSplit(value)
  ) {
    return String.fromCodePoint(privateUsePoint);
  }
  return value;
}

function systemEmojiAppearsSplit(value) {
  systemEmojiMeasureContext ??= document
    .createElement('canvas')
    .getContext('2d');
  if (!systemEmojiMeasureContext) return false;
  systemEmojiMeasureContext.font =
    '32px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  systemEmojiReferenceWidth ??=
    systemEmojiMeasureContext.measureText('😀').width;
  return (
    systemEmojiReferenceWidth > 0 &&
    systemEmojiMeasureContext.measureText(value).width >
      systemEmojiReferenceWidth * 1.45
  );
}

function updateRenderingDiagnostic(emojiKey, value) {
  const section = exampleDialog.querySelector('.rendering-diagnostic');
  const invitation = exampleDialog.querySelector('.pixel-design-invitation');
  const regularEditorButton = exampleDialog.querySelector(
    '.emoji-copy-actions .show-pixel-editor'
  );
  const painted = paintedPixelEmojiKeys.has(emojiKey);
  const privateUsePoint = privateUsePixelEmojiByKey.get(emojiKey);
  if (!section || !invitation) return;
  const diagnostic = resolveRenderingDiagnostic({
    codePoints: byId[emojiKey]?.codePoints,
    emojiValue: value,
    painted,
    privateUsePoint,
    developerMode: developerModeEnabled(),
    detailsVisible:
      !exampleDialog.classList.contains('is-code-view') &&
      !exampleDialog.classList.contains('is-editor-view'),
    systemEmojiAppearsSplit,
    translate
  });
  section.dataset.available = String(diagnostic.sectionAvailable);
  invitation.dataset.available = String(diagnostic.invitationAvailable);
  section.hidden = diagnostic.sectionHidden;
  invitation.hidden = diagnostic.invitationHidden;
  if (regularEditorButton)
    regularEditorButton.hidden = diagnostic.regularEditorHidden;
  if (!painted || !privateUsePoint) return;

  const systemGlyph = section.querySelector('.system-render-glyph');
  const pixelGlyph = section.querySelector('.pixel-render-glyph');
  const result = section.querySelector('.rendering-result');
  if (!systemGlyph || !pixelGlyph || !result) return;
  systemGlyph.textContent = value;
  pixelGlyph.textContent = String.fromCodePoint(privateUsePoint);
  section.dataset.pixelEmojiKey = emojiKey;
  result.classList.toggle('is-warning', diagnostic.split);
  result.textContent = diagnostic.resultText;
}

function refreshRenderedPixelEmoji() {
  document.querySelectorAll('[data-pixel-emoji-key]').forEach(element => {
    applyPixelArtworkClass(element, element.dataset.pixelEmojiKey);
  });
  if (exampleDialog?.classList.contains('is-editor-view'))
    pixelEditor?.refreshFontBuild();
}

function applyStandalonePixelArtwork(element, emojiKey) {
  applyPixelArtworkClass(element, emojiKey);
}

function updateModifierPixelArtwork() {
  [...skinToneCheckboxes, ...hairCheckboxes].forEach(checkbox => {
    const point = Number.parseInt(normalizeCodePoints(checkbox.value), 16);
    const emojiKey = emojiKeyByCodePoints.get(
      normalizeCodePoints(checkbox.value)
    );
    applyStandalonePixelArtwork(
      checkbox.closest('label')?.querySelector('.modifier-emoji'),
      emojiKey,
      point
    );
  });
}

function showEmoji(id, openDialog = true, navigationKeys) {
  var value = emojiByKey[id];
  if (value === undefined) return;
  if (navigationKeys || openDialog) {
    dialogNavigationKeys = [...(navigationKeys ?? displayedKeys)].filter(
      key => emojiByKey[key] !== undefined
    );
  }
  currentEmojiKey = id;
  var group = items.find(item => item.key === id)?.group ?? '(none)';
  document.getElementsByClassName('emoji-group')[0].innerText =
    displayGroupName(group);

  var subGroup =
    items.find(item => item.key === id)?.unicodeSubGroup ?? '(none)';
  document.getElementsByClassName('emoji-subgroup')[0].innerText =
    displayUnicodeSubGroupName(subGroup);

  document.getElementsByClassName('emoji-key')[0].innerText = id;
  document.getElementsByClassName('emoji-value')[0].innerText = value;
  document.getElementsByClassName('emoji-encoded')[0].innerText = bits.join('');
  const previewGlyph = document.getElementsByClassName(
    'emoji-preview-glyph'
  )[0];
  previewGlyph.innerText = value;
  applyPixelArtworkClass(previewGlyph, id);
  const item = byId[id] ?? {};
  updateRenderingDiagnostic(id, value);
  updateEmojiComposition(item, value);
  const codePoints = (item.codePoints ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(point => `U+${point}`)
    .join(' ');
  const englishName = item.shortName ?? displayEmojiKey(id);
  const englishNameElement =
    document.getElementsByClassName('emoji-english-name')[0];
  englishNameElement.innerText = englishName;
  document.getElementsByClassName('emoji-version')[0].innerText =
    getIntroducedVersion(id);
  const sequenceLabel =
    sequenceTypeLabels[item.sequenceType] ?? item.sequenceType ?? '—';
  document.getElementsByClassName('emoji-sequence-type')[0].innerText =
    translate(sequenceTranslationKeys[item.sequenceType], sequenceLabel);
  document.getElementsByClassName('emoji-status')[0].innerText = translate(
    statusTranslationKeys[item.status],
    item.status ?? '—'
  );
  currentEmojiCopies = buildDialogCopyValues({
    emoji: value,
    key: id,
    codePoints
  });

  const localizedDetails = document.getElementsByClassName(
    'localized-emoji-details'
  )[0];
  const annotations = searchAnnotations[id] ?? [];
  const dialogTitle = resolveDialogTitle({
    emojiKey: id,
    selectedSearchLocale,
    annotations
  });
  if (dialogTitle.showLocalized) {
    document.getElementById('example-title').innerText = dialogTitle.title;
    document.getElementsByClassName('localized-language')[0].innerText =
      translate('keywords', 'keywords');
    document.getElementsByClassName('localized-keywords')[0].innerText =
      dialogTitle.localizedKeywords;
    localizedDetails.hidden = false;
  } else {
    document.getElementById('example-title').innerText = dialogTitle.title;
    localizedDetails.hidden = true;
  }
  const dialogTitleElement = document.getElementById('example-title');
  dialogTitleElement.title = dialogTitle.title;
  englishNameElement.closest('.emoji-english-name-row, div').hidden =
    shouldHideEnglishName(dialogTitle.title, englishName);
  updateFavoriteButton();
  if (openDialog) {
    if (copyStatus) copyStatus.textContent = '';
    setEmojiDialogView('details', false);
    exampleDialog.showModal();
    focusInitialEmojiDialogAction();
    syncUrlState('push', {
      ...withoutCompositionParent(),
      emojiDialogEntry: true
    });
  }
  updateDialogNavigation();
  if (exampleDialog.classList.contains('is-editor-view')) {
    pixelEditor?.open(id, value);
  }
}

function navigateEmoji(amount) {
  const keys =
    dialogNavigationKeys.length > 0 ? dialogNavigationKeys : displayedKeys;
  const navigation = resolveDialogNavigationState(keys, currentEmojiKey);
  const nextKey = amount < 0 ? navigation.previousKey : navigation.nextKey;
  if (nextKey) {
    showEmoji(nextKey, false);
    syncUrlState();
  }
}

function updateDialogNavigation() {
  const keys =
    dialogNavigationKeys.length > 0 ? dialogNavigationKeys : displayedKeys;
  const navigation = resolveDialogNavigationState(keys, currentEmojiKey);
  if (emojiPrevious) emojiPrevious.disabled = navigation.previousDisabled;
  if (emojiNext) emojiNext.disabled = navigation.nextDisabled;
  updateCompositionBackButton();
}

function updateCompositionBackButton() {
  if (!emojiParent) return;
  const parentKey = window.history.state?.compositionParent;
  const available = Boolean(parentKey && emojiByKey[parentKey]);
  emojiParent.hidden = !available;
  if (!available) return;
  const label = resolveCompositionParentLabel({
    parentKey,
    searchAnnotations,
    byId,
    translate
  });
  emojiParent.title = label;
  emojiParent.setAttribute('aria-label', label);
}
removeLegacyDialogElements();
window.addEventListener('load', onLoad);
