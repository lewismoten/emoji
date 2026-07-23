import emoji from './dist/esm/index.js';

var items = [];
var groups = [];
var subGroups = {};
const UNASSIGNED = '\u0000';
var selectedGroup = '';
var selectedSubGroup = '';
var availableGroups = [];
var availableSubGroups = {};
var availableCategoryKeys = new Set();
var groupRepresentativeEmoji = new Map();
var subGroupRepresentativeEmoji = new Map();
var emojiByKey = { ...emoji };
var allIds = Object.keys(emojiByKey);
var releasedIds = new Set();
var groupedKeys = {};
var byId = {};

var searchText;
var languagePicker;
var languagePickerFlag;
var languagePickerLabel;
var languageDialog;
var languageList;
var emojiList;
var matchCount;
var toolbar;
var groupSelector;
var subGroupSelector;
var compactGroupChoices;
var compactSubGroupChoices;
var compactGroupLabel;
var compactSubGroupLabel;
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
var orderManifest = { unicode: [] };
var orderMode = 'grouped';
var searchAnnotations = {};
var searchLabels = {};
var searchSubgroupLabels = {};
var uiStrings = {};
var searchLocales = [];
var selectedSearchLocale = '';
var searchLoadId = 0;
var currentEmojiCopies = {};
var displayedKeys = [];
var currentEmojiKey = '';
var focusedEmojiKey = '';
var copyStatus;
var urlStateReady = false;
var offlineStatus;
const languageFlags = {
  'ar': '🇸🇦',
  'en': '🇺🇸',
  'en-GB': '🇬🇧',
  'en-US': '🇺🇸',
  'es': '🇪🇸',
  'hi': '🇮🇳',
  'hi-IN': '🇮🇳',
  'zh': '🇨🇳',
  'zh-CN': '🇨🇳'
};
const unicodeGroupLabelKeys = {
  'Activities': 'activities',
  'Animals & Nature': 'animals_nature',
  'Component': 'emoji',
  'Flags': 'flags',
  'Food & Drink': 'food_drink',
  'Objects': 'objects',
  'People & Body': 'person',
  'Smileys & Emotion': 'smileys_people',
  'Symbols': 'symbols',
  'Travel & Places': 'travel_places'
};
const unicodeSubgroupLabelKeys = {
  'animal-amphibian': 'animal', 'animal-bird': 'animal', 'animal-bug': 'animal', 'animal-mammal': 'animal', 'animal-marine': 'animal', 'animal-reptile': 'animal',
  'arrow': 'arrows', 'arts & crafts': 'activities', 'award-medal': 'activities',
  'body-parts': 'body', 'cat-face': 'smiley', 'clothing': 'person',
  'country-flag': 'flags', 'drink': 'food_drink', 'emotion': 'heart',
  'face-affection': 'smiley', 'face-concerned': 'smiley', 'face-costume': 'smiley', 'face-glasses': 'smiley', 'face-hand': 'smiley', 'face-hat': 'smiley', 'face-negative': 'smiley', 'face-neutral-skeptical': 'smiley', 'face-sleepy': 'smiley', 'face-smiling': 'smiley', 'face-tongue': 'smiley', 'face-unwell': 'smiley',
  'flag': 'flags', 'food-asian': 'food_drink', 'food-fruit': 'food_drink', 'food-prepared': 'food_drink', 'food-sweet': 'food_drink', 'food-vegetable': 'food_drink',
  'game': 'sport', 'geometric': 'geometric_shapes', 'hand-fingers-closed': 'body', 'hand-fingers-open': 'body', 'hand-fingers-partial': 'body', 'hand-prop': 'body', 'hand-single-finger': 'body', 'hands': 'body',
  'hair-style': 'person', 'heart': 'heart', 'keycap': 'keycap', 'monkey-face': 'animal', 'music': 'musical_symbols', 'musical-instrument': 'musical_symbols',
  'person': 'person', 'person-activity': 'person', 'person-fantasy': 'person', 'person-gesture': 'person', 'person-resting': 'person', 'person-role': 'person', 'person-sport': 'person',
  'place-building': 'place', 'place-geographic': 'place', 'place-map': 'place', 'place-other': 'place', 'place-religious': 'place', 'plant-flower': 'plant', 'plant-other': 'plant',
  'skin-tone': 'modifier', 'sky & weather': 'weather', 'sport': 'sport', 'subdivision-flag': 'flags',
  'transport-air': 'travel', 'transport-ground': 'travel', 'transport-sign': 'travel', 'transport-water': 'travel'
};
const sequenceTypeLabels = {
  single: 'Single emoji',
  modifier: 'Modifier sequences',
  zwj: 'ZWJ sequences',
  flag: 'Flags',
  keycap: 'Keycap sequences',
  tag: 'Tag sequences'
};
const sequenceTypeOrder = Object.keys(sequenceTypeLabels);
const sequenceTranslationKeys = { single: 'sequenceSingle', modifier: 'sequenceModifier', zwj: 'sequenceZwj', flag: 'sequenceFlag', keycap: 'sequenceKeycap', tag: 'sequenceTag' };
const statusTranslationKeys = { 'fully-qualified': 'fullyQualified', 'minimally-qualified': 'minimallyQualified', unqualified: 'unqualified' };
const explorerLabelKeys = {
  'Africa': 'africa', 'Asia': 'asia', 'Europe': 'europe', 'North America': 'northAmerica', 'South America': 'southAmerica', 'Oceania': 'oceania', 'Other Flags': 'otherFlags',
  'Accessories': 'accessories', 'Clothing': 'clothing', 'Hats & Headwear': 'hatsHeadwear', 'Shoes': 'shoes',
  'Couples with Heart': 'couplesWithHeart', 'Families': 'families', 'Holding Hands': 'holdingHands', 'Kissing Couples': 'kissingCouples', 'Adults': 'adults', 'Children': 'children'
};

const translate = (key, fallback) => uiStrings[key] ?? fallback;
const versionModeDefinitions = [
  { value: 'through', key: 'throughSelectedVersion', fallback: 'All up to selected version' },
  { value: 'selected', key: 'selectedVersionOnly', fallback: 'Selected version only' }
];
const displayExplorerLabel = label => translate(explorerLabelKeys[label], label);
const applyUiTranslations = () => {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = translate(element.dataset.i18n, element.textContent);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    element.placeholder = translate(element.dataset.i18nPlaceholder, element.placeholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    element.setAttribute('aria-label', translate(element.dataset.i18nAriaLabel, element.getAttribute('aria-label')));
  });
  updateOnlineStatus();
};
const updateOnlineStatus = () => {
  if (!offlineStatus) return;
  offlineStatus.textContent = translate('offlineStatus', 'Offline — showing saved data');
  offlineStatus.hidden = navigator.onLine;
};
async function loadUiTranslations(locale, rtl = false) {
  const baseLocale = locale.split('-')[0];
  try {
    const files = locale === baseLocale
      ? [baseLocale]
      : [baseLocale, locale];
    const packs = await Promise.all(files.map(async code => {
      const response = await fetch(`demo-locales/${code}.json`);
      if (!response.ok) throw new Error(`No demo locale for ${code}`);
      return response.json();
    }));
    uiStrings = Object.assign({}, ...packs);
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  } catch {
    uiStrings = {};
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
  }
  applyUiTranslations();
  renderVersionModeToggle();
  renderSearchLanguages();
}

const countryContinents = {
  Africa: new Set('DZ AO BJ BW BF BI CV CM CF TD KM CD CG CI DJ EG GQ ER SZ ET GA GM GH GN GW KE LS LR LY MG MW ML MR MU MA MZ NA NE NG RW ST SN SC SL SO ZA SS SD TZ TG TN UG ZM ZW'.split(' ')),
  Asia: new Set('AF AM AZ BH BD BT BN KH CN CY GE IN ID IR IQ IL JP JO KZ KW KG LA LB MY MV MN MM NP KP OM PK PH QA SA SG KR LK SY TW TJ TH TL TR TM AE UZ VN YE'.split(' ')),
  Europe: new Set('AL AD AT BY BE BA BG HR CZ DK EE FI FR DE GR HU IS IE IT XK LV LI LT LU MT MD MC ME NL MK NO PL PT RO RU SM RS SK SI ES SE CH UA GB VA'.split(' ')),
  'North America': new Set('AG BS BB BZ CA CR CU DM DO SV GD GT HT HN JM MX NI PA KN LC VC TT US'.split(' ')),
  'South America': new Set('AR BO BR CL CO EC GY PY PE SR UY VE'.split(' ')),
  Oceania: new Set('AU FJ KI MH FM NR NZ PW PG WS SB TO TV VU'.split(' '))
};

function getExplorerSubGroup(item) {
  const name = item.shortName.toLowerCase();
  const raw = item.subGroup;

  if (raw === 'country-flag') return getFlagContinent(item) ?? 'Other Flags';
  if (raw === 'animal-bug') return 'Bugs';
  if (raw === 'animal-bird') return 'Birds';
  if (raw === 'animal-mammal') return 'Mammals';
  if (raw === 'animal-marine') return 'Marine Animals';
  if (raw === 'animal-reptile') return 'Reptiles';
  if (raw === 'animal-amphibian') return 'Amphibians';
  if (raw === 'plant-flower') return 'Flowers';
  if (raw === 'plant-other') return 'Other Plants';
  if (raw === 'book-paper') return 'Books & Paper';
  if (raw === 'food-asian') return 'Asian';
  if (raw.startsWith('food-')) return titleCase(raw.slice(5));
  if (raw === 'clothing') return getClothingType(name);
  if (raw === 'geometric') return getGeometricShape(name);
  if (raw === 'family') return getFamilyType(name);
  if (raw === 'person') return /baby|boy|girl|child/.test(name) ? 'Children' : 'Adults';
  if (raw === 'person-role') return getPersonRoleType(name);
  if (raw === 'person-activity') return getActivityType(name);
  if (raw === 'person-fantasy') return getFantasyType(name);
  if (raw === 'person-gesture') return getGestureType(name);
  if (raw === 'person-sport') return getSportType(name);

  return titleCase(raw);
}

function titleCase(value) {
  return value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function getFlagContinent(item) {
  const code = [...item.emoji]
    .filter(character => {
      const point = character.codePointAt(0);
      return point >= 0x1F1E6 && point <= 0x1F1FF;
    })
    .map(character => String.fromCharCode(65 + character.codePointAt(0) - 0x1F1E6))
    .join('');

  return Object.entries(countryContinents).find(([, countries]) => countries.has(code))?.[0];
}

function getClothingType(name) {
  if (/shoe|boot|sandal|slipper/.test(name)) return 'Shoes';
  if (/cap|crown|helmet|hat|headscarf|hair pick/.test(name)) return 'Hats & Headwear';
  if (/bag|purse|glasses|goggles|gloves|necktie|lipstick|fan|beads|gem/.test(name)) return 'Accessories';
  return 'Clothing';
}

function getGeometricShape(name) {
  if (name.includes('circle')) return 'Circles';
  if (name.includes('square')) return 'Squares';
  if (name.includes('diamond')) return 'Diamonds';
  if (name.includes('triangle')) return 'Triangles';
  return 'Other Shapes';
}

function getFamilyType(name) {
  if (name.startsWith('family')) return 'Families';
  if (name.startsWith('kiss')) return 'Kissing Couples';
  if (name.startsWith('couple with heart')) return 'Couples with Heart';
  return 'Holding Hands';
}

function getPersonRoleType(name) {
  if (/health worker|feeding baby|pregnant|breast-feeding/.test(name)) return 'Care & Health';
  if (/artist|singer|scientist|technologist/.test(name)) return 'Creative & Technical';
  if (/student|teacher|office worker/.test(name)) return 'Education & Office';
  if (/detective|firefighter|guard|judge|police officer|ninja/.test(name)) return 'Safety & Justice';
  if (/construction|cook|factory|farmer|mechanic/.test(name)) return 'Trades & Service';
  if (/astronaut|pilot/.test(name)) return 'Travel & Space';
  if (/prince|princess|crown/.test(name)) return 'Royalty';
  return 'Cultural & Formal Wear';
}

function getActivityType(name) {
  if (/wheelchair|white cane/.test(name)) return 'Accessibility & Mobility';
  if (/haircut|massage|steamy room/.test(name)) return 'Personal Care & Rest';
  if (/dancing|bunny ears|ballet/.test(name)) return 'Dance';
  if (/kneeling|standing|levitating/.test(name)) return 'Poses';
  return 'Movement';
}

function getFantasyType(name) {
  if (/santa|claus|angel/.test(name)) return 'Holiday & Angels';
  if (/elf|fairy|genie|mage/.test(name)) return 'Magic';
  if (/superhero|supervillain/.test(name)) return 'Heroes & Villains';
  if (/mermaid|merman|merperson/.test(name)) return 'Merpeople';
  return 'Monsters & Undead';
}

function getGestureType(name) {
  if (name.startsWith('deaf')) return 'Accessibility';
  if (/raising hand|gesturing|tipping hand/.test(name)) return 'Signals & Greetings';
  if (/facepalming|frowning|pouting|shrugging/.test(name)) return 'Reactions';
  return 'Respect & Apology';
}

function getSportType(name) {
  if (/swimming|surfing|rowing|water polo/.test(name)) return 'Water Sports';
  if (/biking|mountain biking/.test(name)) return 'Cycling';
  if (/bouncing ball|handball|golfing/.test(name)) return 'Ball Sports';
  if (/lifting weights|cartwheeling|juggling/.test(name)) return 'Fitness & Skills';
  if (/ski|snowboard/.test(name)) return 'Winter Sports';
  if (/wrestling|fencing|horse racing/.test(name)) return 'Competition';
  return 'Running & Movement';
}

async function onLoad() {
  offlineStatus = document.getElementsByClassName('offline-status')[0];
  searchText = document.getElementsByClassName("text")[0];
  languagePicker = document.getElementsByClassName('language-picker')[0];
  languagePickerFlag = document.getElementsByClassName('language-picker-flag')[0];
  languagePickerLabel = document.getElementsByClassName('language-picker-label')[0];
  languageDialog = document.getElementsByClassName('language-dialog')[0];
  languageList = document.getElementsByClassName('language-list')[0];
  emojiList = document.getElementsByClassName("list")[0];
  matchCount = document.getElementsByClassName('match-count')[0];
  toolbar = document.getElementsByClassName('toolbar')[0];
  groupSelector = document.getElementsByClassName('select-group')[0];
  subGroupSelector = document.getElementsByClassName('select-subgroup')[0];
  compactGroupChoices = ensureChoiceContainer(groupSelector, 'compact-group-choices', 'group-filter-label');
  compactSubGroupChoices = ensureChoiceContainer(subGroupSelector, 'compact-subgroup-choices', 'subgroup-filter-label');
  compactGroupChoices.addEventListener('keydown', onCompactChoiceKeyDown);
  compactSubGroupChoices.addEventListener('keydown', onCompactChoiceKeyDown);
  compactGroupLabel = ensureSelectionLabel(groupSelector, 'compact-group-label', 'group-filter-label');
  compactSubGroupLabel = ensureSelectionLabel(subGroupSelector, 'compact-subgroup-label', 'subgroup-filter-label');
  versionModeSelector = document.getElementsByClassName('select-version-mode')[0];
  versionSelector = document.getElementsByClassName('select-version')[0];
  ({ range: versionRange, output: versionRangeValue } = ensureVersionSlider());
  versionModeToggle = ensureVersionModeToggle();
  versionPrevious = document.getElementsByClassName('version-previous')[0];
  versionNext = document.getElementsByClassName('version-next')[0];
  versionSelector.closest('.filter-field')?.classList.toggle('has-version-slider', Boolean(versionRange && versionRangeValue));
  advancedFilters = document.getElementsByClassName('advanced-filters')[0];
  ({ summary: activeFilterSummary, text: activeFilterText, clear: clearFiltersButton } = ensureActiveFilterSummary());
  orderButtons = Array.from(document.getElementsByClassName('order-mode'));
  exampleDialog = document.getElementsByClassName('example-dialog')[0];
  upgradeEmojiDialog();
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
  document.querySelectorAll('.modifier-emoji').forEach(emoji => emoji.setAttribute('aria-hidden', 'true'));

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  applyBasicUrlState();
  skinToneCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));
  hairCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));
  genderCheckboxes.forEach(checkbox => checkbox.addEventListener('change', drawList));

  searchText.addEventListener("input", drawList);
  languagePicker.addEventListener('click', () => {
    languageDialog.showModal();
    languageList.querySelector('.is-selected')?.focus();
  });
  emojiList.addEventListener("click", onClick);
  emojiList.addEventListener('focusin', onEmojiFocus);
  emojiList.addEventListener('keydown', onEmojiKeyDown);
  exampleDialog.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const value = currentEmojiCopies[button.dataset.copy];
    const messages = {
      emoji: ['emojiCopied', 'Emoji copied to the clipboard.'],
      key: ['keyCopied', 'Emoji key copied to the clipboard.'],
      escape: ['escapeCopied', 'Escape sequence copied to the clipboard.'],
      codePoints: ['codePointsCopied', 'Code points copied to the clipboard.']
    };
    const [messageKey, fallback] = messages[button.dataset.copy] ?? ['copiedToClipboard', 'Copied to the clipboard.'];
    if (value !== undefined) copyToClipboard(value, translate(messageKey, fallback));
  });
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
  orderButtons.forEach(button => button.addEventListener('click', onOrderModeChange));
  document.addEventListener('keydown', onDocumentKeyDown);
  renderVersionModeToggle();

  const setToolbarHeight = () => {
    document.documentElement.style.setProperty('--toolbar-height', `${toolbar.offsetHeight}px`);
  };
  setToolbarHeight();
  if (window.ResizeObserver) {
    new window.ResizeObserver(setToolbarHeight).observe(toolbar);
  } else {
    window.addEventListener('resize', setToolbarHeight);
  }

  if (window.matchMedia('(max-width: 560px)').matches) {
    advancedFilters.open = false;
  }

  const initialUiLocale = document.documentElement.dataset.locale
    ?? window.location.pathname.match(/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/)?.[1]
    ?? 'en';
  await loadUiTranslations(initialUiLocale, document.documentElement.dir === 'rtl');
  await loadSearchLanguages(initialUiLocale);
  await loadData();
  urlStateReady = true;
  drawList();
}

function upgradeEmojiDialog() {
  removeLegacyDialogElements();

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

function removeLegacyDialogElements() {
  const dialog = document.querySelector('.example-dialog');
  dialog?.querySelector('[data-i18n="copiedDescription"]')?.remove();
  dialog?.querySelector('.example-link')?.remove();
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
  const label = document.getElementById(labelId) ?? field?.querySelector('span');
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
  const existingOutput = document.getElementsByClassName('version-range-value')[0];
  if (existingRange && existingOutput) return { range: existingRange, output: existingOutput };

  let field = versionSelector.closest('.filter-field');
  if (field?.tagName === 'LABEL') {
    const replacement = document.createElement('div');
    replacement.className = `${field.className} version-field`;
    replacement.append(...field.childNodes);
    field.replaceWith(replacement);
    field = replacement;
  }
  const label = field?.querySelector('span');
  if (label && !label.id) label.id = 'version-filter-label';
  versionSelector.setAttribute('aria-labelledby', label?.id || 'version-filter-label');

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
  if (!versionModeToggle) return;
  populateVersionModeOptions();
  const label = translate('selectedVersionOnly', 'Selected version only');
  versionModeToggle.setAttribute('aria-pressed', String(versionModeSelector.value === 'selected'));
  versionModeToggle.setAttribute('aria-label', label);
  versionModeToggle.title = label;
}

function toggleVersionMode() {
  versionModeSelector.value = versionModeSelector.value === 'selected' ? 'through' : 'selected';
  renderVersionModeToggle();
  renderCategoryFilters();
  drawList();
}

function getUrlState() {
  const params = new URLSearchParams(window.location.search);
  return {
    search: params.get('q') ?? '',
    version: params.get('version') ?? '',
    versionMode: params.get('mode') === 'selected' ? 'selected' : 'through',
    group: params.get('group') ?? '',
    subGroup: params.get('subgroup') ?? '',
    skin: (params.get('skin') ?? '').split(',').filter(Boolean),
    hair: (params.get('hair') ?? '').split(',').filter(Boolean),
    gender: (params.get('gender') ?? '').split(',').filter(Boolean),
    order: ['grouped', 'unicode', 'sequence'].includes(params.get('order')) ? params.get('order') : 'grouped'
  };
}

function applyBasicUrlState() {
  const state = getUrlState();
  searchText.value = state.search;
  orderMode = state.order;
  orderButtons.forEach(button => {
    const active = button.dataset.order === orderMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function applyLoadedUrlState() {
  const state = getUrlState();
  if (state.version && Array.from(versionSelector.options).some(option => option.value === state.version)) {
    versionSelector.value = state.version;
  }
  versionModeSelector.value = state.versionMode;
  selectedGroup = groups.includes(state.group) ? state.group : '';
  selectedSubGroup = selectedGroup && subGroups[selectedGroup]?.includes(state.subGroup)
    ? subGroupSelectionKey(selectedGroup, state.subGroup)
    : '';
  skinToneCheckboxes.forEach(checkbox => { checkbox.checked = state.skin.includes(checkbox.value); });
  hairCheckboxes.forEach(checkbox => { checkbox.checked = state.hair.includes(checkbox.value); });
  genderCheckboxes.forEach(checkbox => { checkbox.checked = state.gender.includes(checkbox.value); });
  renderVersionModeToggle();
  syncVersionRange();
}

function syncUrlState() {
  if (!urlStateReady) return;
  const params = new URLSearchParams();
  const search = searchText.value.trim();
  if (search) params.set('q', search);
  const latestReleased = versionManifests.at(-1)?.version;
  if (versionSelector.value && (versionSelector.value !== latestReleased || versionModeSelector.value === 'selected')) {
    params.set('version', versionSelector.value);
  }
  if (versionModeSelector.value === 'selected') params.set('mode', 'selected');
  if (selectedGroup) params.set('group', selectedGroup);
  if (selectedSubGroup) params.set('subgroup', selectedSubGroup.split('::').slice(1).join('::'));
  const skin = skinToneCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  const hair = hairCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  const gender = genderCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
  if (skin.length) params.set('skin', skin.join(','));
  if (hair.length) params.set('hair', hair.join(','));
  if (gender.length) params.set('gender', gender.join(','));
  if (orderMode !== 'grouped') params.set('order', orderMode);
  const query = params.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`);
}

function resetFilters() {
  searchText.value = '';
  selectedGroup = '';
  selectedSubGroup = '';
  versionModeSelector.value = 'through';
  const latestReleased = versionManifests.at(-1)?.version;
  if (latestReleased) versionSelector.value = latestReleased;
  skinToneCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  hairCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  genderCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  renderVersionModeToggle();
  syncVersionRange();
  renderCategoryFilters();
  drawList();
  searchText.focus();
}

function stepVersion(amount) {
  const nextIndex = Math.max(0, Math.min(versionSelector.options.length - 1, Number(versionRange.value) + amount));
  if (nextIndex === Number(versionRange.value)) return;
  versionRange.value = String(nextIndex);
  onVersionRangeInput();
}

function onDocumentKeyDown(event) {
  const activeTag = document.activeElement?.tagName;
  const isTyping = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';
  if (event.key === '/' && !isTyping && !exampleDialog.open && !languageDialog.open) {
    event.preventDefault();
    searchText.focus();
    return;
  }
  if (event.key === 'Escape' && !exampleDialog.open && !languageDialog.open && searchText.value) {
    searchText.value = '';
    drawList();
    searchText.focus();
    return;
  }
  if (!exampleDialog.open || isTyping) return;
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    navigateEmoji(-1);
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    navigateEmoji(1);
  }
}

const isViteDevelopment = typeof import.meta.env !== 'undefined' && import.meta.env.DEV === true;
if ('serviceWorker' in navigator && window.isSecureContext && isViteDevelopment) {
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
  const data = await fetch('emoji.json').then(response => response.json());

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
    item.hasExplorerSections = explorerSectionCounts
      .get(`${item.group}:${item.unicodeSubGroup}`)
      .size > 1;
  });
      byId = items.reduce((byId, item) => ({ ...byId, [item.key]: item }), {});

      groups = items
        .reduce((all, item) => all.includes(item.group) ? all : [...all, item.group], [])
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
      renderCategoryFilters();

      allIds = [];
      // Sort keys by Unicode group and subgroup, then by explorer section.
      groups.forEach(group => {
        groupedKeys[group] = {};
        subGroups[group].forEach(unicodeSubGroup => {
          groupedKeys[group][unicodeSubGroup] = [];
          const subgroupItems = items.filter(item =>
            item.group === group && item.unicodeSubGroup === unicodeSubGroup
          );
          const explorerSections = [...new Set(subgroupItems.map(item => item.subGroup))].sort();
          explorerSections.forEach(section => {
            subgroupItems.filter(item => item.subGroup === section).forEach(item => {
              allIds.push(item.key);
              groupedKeys[group][unicodeSubGroup].push(item.key);
            });
          });
        })
      })

      // Keep this snapshot before draft candidates are appended in
      // loadVersionData(), so the default version filter stays released-only.
      releasedIds = new Set(allIds);
      onClick({ target: { id: 'clinkingBeerMugs' } }, false)
      await loadVersionData();
      await loadOrderData();
}

async function loadSearchLanguages(initialLocale = '') {
  try {
    const manifest = await fetch('locales/manifest.json').then(response => response.json());
    searchLocales = manifest.locales ?? [];
    renderSearchLanguages();
    if (initialLocale && searchLocales.some(locale => locale.locale === initialLocale)) {
      await setSearchLanguage(initialLocale);
    }
  } catch (error) {
    console.warn('Search language packs unavailable', error);
    languagePicker.disabled = true;
  }
}

function renderSearchLanguages() {
  languageList.replaceChildren();
  const noLanguage = document.createElement('a');
  noLanguage.href = `./${window.location.search}`;
  noLanguage.className = 'language-option';
  noLanguage.classList.toggle('is-selected', selectedSearchLocale === '');
  noLanguage.setAttribute('aria-pressed', String(selectedSearchLocale === ''));
  noLanguage.innerHTML = `<span class="language-option-flag" aria-hidden="true">🌐</span><span class="language-option-label">${translate('noLanguagePack', 'No language pack')}</span>`;
  noLanguage.addEventListener('click', event => selectLanguageLink(event, '', noLanguage.href));
  languageList.appendChild(noLanguage);

  searchLocales.forEach(locale => {
    const option = document.createElement('a');
    const flag = languageFlags[locale.locale] ?? '🌐';
    option.href = `./index.${locale.locale}.html${window.location.search}`;
    option.className = 'language-option';
    option.classList.toggle('is-selected', locale.locale === selectedSearchLocale);
    option.setAttribute('aria-pressed', String(locale.locale === selectedSearchLocale));
    const uiLocale = document.documentElement.lang || 'en';
    const localizedLabel = new Intl.DisplayNames([uiLocale], { type: 'language' }).of(locale.locale) ?? locale.label;
    const label = locale.locale === selectedSearchLocale || localizedLabel === locale.nativeLabel
      ? localizedLabel
      : `${localizedLabel} (${locale.nativeLabel})`;
    option.innerHTML = `<span class="language-option-flag" aria-hidden="true">${flag}</span><span class="language-option-label">${label}</span>`;
    option.addEventListener('click', event => selectLanguageLink(event, locale.locale, option.href));
    languageList.appendChild(option);
  });
}

async function selectLanguageLink(event, locale, href) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  await setSearchLanguage(locale);
  window.history.pushState({ locale }, '', href);
}

window.addEventListener('popstate', () => {
  const locale = window.location.pathname.match(/index\.([a-z]{2,3}(?:-[A-Z]{2})?)\.html$/)?.[1] ?? '';
  if (!locale || searchLocales.some(entry => entry.locale === locale)) setSearchLanguage(locale);
});

async function setSearchLanguage(requestedLocale) {
  const loadId = ++searchLoadId;
  if (!requestedLocale) {
    selectedSearchLocale = '';
    searchAnnotations = {};
    searchLabels = {};
    searchSubgroupLabels = {};
    languagePickerFlag.textContent = '🌐';
    languagePickerLabel.textContent = translate('languageNotLoaded', 'Language not loaded');
    languageDialog.close();
    await loadUiTranslations('en');
    refreshLocalizedLabels();
    return;
  }

  const locale = searchLocales.find(entry => entry.locale === requestedLocale);
  if (!locale) return;
  languagePicker.disabled = true;
  languagePickerLabel.textContent = translate('loadingLanguage', 'Loading language…');
  try {
    const packs = await Promise.all([
      ...(locale.baseLocale ? [fetch(`locales/${locale.baseLocale}.json`).then(response => response.json())] : []),
      fetch(`locales/${locale.file}`).then(response => response.json())
    ]);
    if (loadId !== searchLoadId) return;
    searchAnnotations = Object.assign({}, ...packs.map(pack => pack.annotations ?? {}));
    searchLabels = Object.assign({}, ...packs.map(pack => pack.labels ?? {}));
    searchSubgroupLabels = Object.assign({}, ...packs.map(pack => pack.subgroups ?? {}));
    selectedSearchLocale = locale.locale;
    await loadUiTranslations(locale.locale, locale.rtl);
    languagePickerFlag.textContent = languageFlags[locale.locale] ?? '🌐';
    languagePickerLabel.textContent = locale.nativeLabel;
    languageDialog.close();
    refreshLocalizedLabels();
  } catch (error) {
    if (loadId === searchLoadId) {
      console.warn(`Search language ${requestedLocale} unavailable`, error);
      selectedSearchLocale = '';
      searchAnnotations = {};
      searchLabels = {};
      searchSubgroupLabels = {};
      languagePickerFlag.textContent = '🌐';
      languagePickerLabel.textContent = translate('languageNotLoaded', 'Language not loaded');
      refreshLocalizedLabels();
    }
  } finally {
    if (loadId === searchLoadId) languagePicker.disabled = false;
  }
}

async function loadOrderData() {
  try {
    orderManifest = await fetch('orders/manifest.json').then(response => response.json());
    drawList();
  } catch (error) {
    console.warn('Unicode order data unavailable', error);
  }
}

function onOrderModeChange(event) {
  orderMode = event.currentTarget.dataset.order;
  orderButtons.forEach(button => {
    const active = button.dataset.order === orderMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  drawList();
}

async function loadVersionData() {
  try {
    const manifest = await fetch('versions/manifest.json').then(response => response.json());
    const manifests = manifest.versions
      .filter(version => version.released)
      .sort((a, b) => a.released.localeCompare(b.released));
    const keys = await Promise.all(manifests.map(async version => [
      version.version,
      new Set(await fetch(`versions/${version.file}`).then(response => response.json()))
    ]));
    const proposed = (manifest.proposed ?? []).sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
    const proposedKeys = await Promise.all(proposed.map(async version => {
      const proposal = await fetch(version.file).then(response => response.json());
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
      return [version.version, new Set(proposalItems.map(item => item.key))];
    }));

    versionManifests = manifests;
    proposedVersionManifests = proposed;
    versionKeys = new Map([...keys, ...proposedKeys]);
    buildCategoryRepresentatives();
    populateVersionSelector();
    applyLoadedUrlState();
    renderCategoryFilters();
    drawList();
  } catch (error) {
    console.warn('Version filters unavailable', error);
    versionModeSelector.disabled = true;
    versionSelector.disabled = true;
  }
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
  const defaultVersion = versionManifests.at(-1)?.version ?? manifests.at(-1)?.version ?? '';
  versionSelector.value = manifests.some(version => version.version === previousValue)
    ? previousValue
    : defaultVersion;
  versionSelector.disabled = manifests.length === 0;
  syncVersionRange();
}

function versionSliderLabel(version) {
  const proposed = proposedVersionManifests.find(item => item.version === version);
  if (!proposed) return `Emoji ${version}`;
  return `✨ Emoji ${version} ${proposed.stage ?? proposed.status ?? 'draft'}`;
}

function syncVersionRange() {
  if (!versionRange || !versionRangeValue) return;
  versionSelector.closest('.filter-field')?.classList.add('has-version-slider');
  const options = Array.from(versionSelector.options);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === versionSelector.value));
  versionRange.max = String(Math.max(0, options.length - 1));
  versionRange.value = String(selectedIndex);
  versionRange.disabled = versionSelector.disabled || options.length === 0;
  const selectedVersion = options[selectedIndex]?.value ?? '';
  versionRangeValue.value = selectedVersion ? versionSliderLabel(selectedVersion) : '—';
  versionRangeValue.classList.toggle('is-future', proposedVersionManifests.some(version => version.version === selectedVersion));
  versionRange.setAttribute('aria-valuetext', options[selectedIndex]?.text ?? '—');
  if (versionPrevious) versionPrevious.disabled = versionRange.disabled || selectedIndex === 0;
  if (versionNext) versionNext.disabled = versionRange.disabled || selectedIndex === options.length - 1;
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
  const manifests = [...versionManifests, ...proposedVersionManifests];
  const selectedIndex = manifests.findIndex(version => version.version === versionSelector.value);
  const skinToneIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(key => key.endsWith('SkinTone'))
  );
  const hairKeys = new Set(['redHair', 'curlyHair', 'bald', 'whiteHair']);
  const hairIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(key => hairKeys.has(key))
  );
  const genderIndex = manifests.findIndex(version =>
    [...(versionKeys.get(version.version) ?? [])].some(key => getEmojiGenders(byId[key] ?? {}).size > 0)
  );
  const skinToneAvailable = selectedIndex >= skinToneIndex && skinToneIndex !== -1;
  const hairAvailable = selectedIndex >= hairIndex && hairIndex !== -1;
  const genderAvailable = selectedIndex >= genderIndex && genderIndex !== -1;

  if (skinToneFieldset) skinToneFieldset.hidden = !skinToneAvailable;
  if (hairFieldset) hairFieldset.hidden = !hairAvailable;
  if (genderFieldset) genderFieldset.hidden = !genderAvailable;
  if (!skinToneAvailable) skinToneCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  if (!hairAvailable) hairCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  if (!genderAvailable) genderCheckboxes.forEach(checkbox => { checkbox.checked = false; });
  if (modifierFilters) {
    const availableCount = [skinToneAvailable, hairAvailable, genderAvailable].filter(Boolean).length;
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
  const selectedIndex = manifests.findIndex(version => version.version === versionSelector.value);
  return new Set(manifests
    .slice(0, selectedIndex + 1)
    .flatMap(version => [...(versionKeys.get(version.version) ?? [])]));
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

function subGroupSelectionKey(group, subGroup) {
  return `${group}::${subGroup}`;
}

function renderCategoryFilters() {
  const activeChoice = document.activeElement?.closest?.('[role="radio"]');
  const focusedChoices = activeChoice?.closest('.compact-group-choices')
    ? 'group'
    : activeChoice?.closest('.compact-subgroup-choices')
      ? 'subgroup'
      : '';
  const focusedValue = activeChoice?.dataset.value;
  updateAvailableCategories();
  groupSelector.closest('.filter-field')?.classList.toggle('has-choice-buttons', Boolean(compactGroupChoices));
  const subGroupField = subGroupSelector.closest('.filter-field');
  subGroupField?.classList.toggle('has-choice-buttons', Boolean(compactSubGroupChoices));
  if (subGroupField) subGroupField.hidden = !selectedGroup;
  populateGroupFilter();
  populateSubGroupFilter();
  renderCompactGroupChoices();
  renderCompactSubGroupChoices();
  if (focusedChoices === 'group') {
    focusCompactChoice(compactGroupChoices, focusedValue);
  } else if (focusedChoices === 'subgroup') {
    focusCompactChoice(compactSubGroupChoices, focusedValue);
  }
}

function updateAvailableCategories() {
  const includedVersionKeys = getVersionKeys();
  availableCategoryKeys = includedVersionKeys.size === 0 && versionKeys.size === 0
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
  availableSubGroups = Object.fromEntries(availableGroups.map(group => [
    group,
    subGroups[group].filter(subGroup => subgroupNames[group]?.has(subGroup))
  ]));

  if (selectedGroup && !availableGroups.includes(selectedGroup)) {
    selectedGroup = '';
    selectedSubGroup = '';
  } else if (selectedSubGroup) {
    const separatorIndex = selectedSubGroup.indexOf('::');
    const group = separatorIndex === -1 ? '' : selectedSubGroup.slice(0, separatorIndex);
    const subGroup = separatorIndex === -1 ? '' : selectedSubGroup.slice(separatorIndex + 2);
    if (group !== selectedGroup || !availableSubGroups[group]?.includes(subGroup)) {
      selectedSubGroup = '';
    }
  }
}

function populateGroupFilter() {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${translate('all', 'All')}`;
  groupSelector.replaceChildren(all, ...availableGroups.map(name => {
    const option = document.createElement('option');
    option.value = name;
    option.text = `${getGroupRepresentativeEmoji(name)} ${displayGroupName(name)}`;
    return option;
  }));
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

function availableSubGroupParents() {
  return selectedGroup && availableGroups.includes(selectedGroup) ? [selectedGroup] : [];
}

function renderCompactGroupChoices() {
  if (!compactGroupChoices) return;
  if (compactGroupLabel) {
    compactGroupLabel.textContent = selectedGroup
      ? displayGroupName(selectedGroup)
      : translate('all', 'All');
  }
  const choices = [{ name: '', emoji: '🌐', label: translate('all', 'All') }, ...availableGroups.map(name => ({
    name,
    emoji: getGroupRepresentativeEmoji(name),
    label: displayGroupName(name)
  }))];
  compactGroupChoices.replaceChildren(...choices.map(({ name, emoji, label }) => makeCompactChoice({
    value: name,
    emoji,
    label,
    selected: selectedGroup === name,
    onSelect() {
      selectedGroup = name;
      selectedSubGroup = '';
      renderCategoryFilters();
      drawList();
      focusCompactChoice(compactGroupChoices, name);
    }
  })));
}

function renderCompactSubGroupChoices() {
  if (!compactSubGroupChoices) return;
  if (compactSubGroupLabel) {
    const separatorIndex = selectedSubGroup.indexOf('::');
    const name = separatorIndex === -1 ? '' : selectedSubGroup.slice(separatorIndex + 2);
    compactSubGroupLabel.textContent = name
      ? displayUnicodeSubGroupName(name)
      : translate('all', 'All');
  }
  const choices = availableSubGroupParents()
    .flatMap(group => availableSubGroups[group].map(name => ({ group, name })));
  const allChoice = makeCompactChoice({
    value: '',
    emoji: '🌐',
    label: translate('all', 'All'),
    selected: selectedSubGroup === '',
    onSelect() {
      selectedSubGroup = '';
      renderCategoryFilters();
      drawList();
      focusCompactChoice(compactSubGroupChoices, '');
    }
  });
  compactSubGroupChoices.replaceChildren(allChoice, ...choices.map(({ group, name }) => makeCompactChoice({
    value: subGroupSelectionKey(group, name),
    emoji: getSubGroupRepresentativeEmoji(group, name),
    label: `${displayGroupName(group)}: ${displayUnicodeSubGroupName(name)}`,
    selected: selectedSubGroup === subGroupSelectionKey(group, name),
    onSelect() {
      selectedSubGroup = subGroupSelectionKey(group, name);
      renderCategoryFilters();
      drawList();
      focusCompactChoice(compactSubGroupChoices, selectedSubGroup);
    }
  })));
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

function focusCompactChoice(container, value) {
  const choices = Array.from(container.querySelectorAll('[role="radio"]'));
  const choice = choices.find(button => button.dataset.value === value)
    ?? choices.find(button => button.getAttribute('aria-checked') === 'true');
  choice?.focus();
}

function onCompactChoiceKeyDown(event) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const choices = Array.from(event.currentTarget.querySelectorAll('[role="radio"]'));
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
    const backwards = event.key === 'ArrowUp'
      || event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    nextIndex = (currentIndex + (backwards ? -1 : 1) + choices.length) % choices.length;
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
  const itemOrder = new Map(items.map((item, index) => [item.key, item.order ?? index]));
  const byIntroduction = (left, right) =>
    (versionOrder.get(left.key) ?? Infinity) - (versionOrder.get(right.key) ?? Infinity)
    || itemOrder.get(left.key) - itemOrder.get(right.key)
    || left.key.localeCompare(right.key);

  groupRepresentativeEmoji = new Map();
  subGroupRepresentativeEmoji = new Map();
  groups.forEach(group => {
    const subgroupRepresentatives = new Set();
    subGroups[group].forEach(subGroup => {
      const representative = items
        .filter(item => item.group === group && item.unicodeSubGroup === subGroup)
        .sort(byIntroduction)[0];
      if (!representative) return;
      subGroupRepresentativeEmoji.set(subGroupSelectionKey(group, subGroup), representative.emoji);
      subgroupRepresentatives.add(representative.key);
    });

    const candidates = items.filter(item => item.group === group).sort(byIntroduction);
    const representative = candidates.find(item => !subgroupRepresentatives.has(item.key))
      ?? (subGroups[group].length === 1 && candidates.length === 1 ? candidates[0] : undefined);
    if (representative) groupRepresentativeEmoji.set(group, representative.emoji);
  });
}

function getGroupRepresentativeEmoji(group) {
  return groupRepresentativeEmoji.get(group) ?? '';
}

function getSubGroupRepresentativeEmoji(group, subGroup) {
  return subGroupRepresentativeEmoji.get(subGroupSelectionKey(group, subGroup)) ?? '';
}

function displayUnicodeSubGroupName(name) {
  if (searchSubgroupLabels[name]) return searchSubgroupLabels[name];
  if (searchLabels[unicodeSubgroupLabelKeys[name]]) return searchLabels[unicodeSubgroupLabelKeys[name]];
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

const asGroup = (name) => {
  var div = document.createElement("div");
  div.className = 'group';
  var divName = document.createElement('h3');
  divName.innerText = displayGroupName(name);
  divName.className = 'name';
  div.appendChild(divName);

  return div;
}
const asUnicodeSubGroup = name => {
  var div = document.createElement("div");
  div.className = 'unicode-subgroup';
  var divName = document.createElement('h4');
  divName.innerText = displayUnicodeSubGroupName(name);
  divName.className = 'name';
  div.appendChild(divName);
  var divSections = document.createElement('div');
  divSections.className = 'subgroup-list';
  div.appendChild(divSections);
  return div;
}
const asSubGroup = (name, direct) => {
  var div = document.createElement("div");
  div.className = direct ? 'subgroup is-direct' : 'subgroup';
  var divName = document.createElement(direct ? 'span' : 'h5');
  divName.innerText = displayExplorerLabel(name);
  divName.className = 'name';
  div.appendChild(divName);
  var divEmoji = document.createElement('div');
  divEmoji.className = 'emoji';
  div.appendChild(divEmoji);
  return div;
}
function asItem(state, key) {
  var meta = byId[key] ?? { group: UNASSIGNED, subGroups: UNASSIGNED }
  const displaySubGroup = orderMode === 'unicode' ? meta.unicodeSubGroup : meta.subGroup;
  const directSubGroup = orderMode === 'unicode' || !meta.hasExplorerSections;
  var groupId = 0;
  var subGroupId = 0;
  const hasGroups = meta && groups.length !== 0;

  if (hasGroups) {

    if (state.group !== meta.group) {
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
      state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
      state.groupElement.appendChild(state.unicodeSubGroupElement);
      state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.unicodeSubGroup = meta.unicodeSubGroup;
      state.subGroup = displaySubGroup;
    } else if (state.subGroup !== displaySubGroup) {
      state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
      state.unicodeSubGroupElement.lastChild.appendChild(state.subGroupElement);
      state.subGroup = displaySubGroup;
    }

    groupId = groups.indexOf(meta.group);
    subGroupId = subGroups[meta.group]?.indexOf(meta.unicodeSubGroup) ?? 0;
  }


  var div = asEmojiCell(key, groupId, subGroupId);

  if (hasGroups) {
    state.subGroupElement.lastChild.appendChild(div);
  } else {
    state.items.push(div);
  }

  return state;
}

function asEmojiCell(key, groupId = 0, subGroupId = 0) {
  const div = document.createElement('div');
  div.id = key;
  div.dataset.emojiKey = key;
  const accessibleName = searchAnnotations[key]?.[0] ?? byId[key]?.shortName ?? displayEmojiKey(key);
  div.title = accessibleName;
  div.tabIndex = key === focusedEmojiKey ? 0 : -1;
  div.setAttribute('role', 'button');
  div.setAttribute('aria-label', accessibleName);
  div.classList.add(`group-${groupId}`);
  div.classList.add(`sub-group-${subGroupId}`);
  const emojiDiv = document.createElement('span');
  emojiDiv.innerText = emojiByKey[key];
  div.appendChild(emojiDiv);
  return div;
}

function asSequenceItem(state, key) {
  const type = byId[key]?.sequenceType ?? 'single';
  if (state.type !== type) {
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
  state.emoji.appendChild(asEmojiCell(key));
  return state;
}

function orderedKeys(keys) {
  if (orderMode === 'grouped') return keys;
  const preferred = orderMode === 'unicode'
    ? orderManifest.unicode
    : sequenceTypeOrder.flatMap(type => orderManifest.unicode.filter(key => byId[key]?.sequenceType === type));
  const included = new Set(keys);
  const ordered = preferred.filter(key => included.delete(key));
  return [...ordered, ...included].sort((left, right) => {
    if (orderMode === 'sequence') {
      const typeDifference = sequenceTypeOrder.indexOf(byId[left]?.sequenceType ?? 'single') - sequenceTypeOrder.indexOf(byId[right]?.sequenceType ?? 'single');
      if (typeDifference !== 0) return typeDifference;
    }
    return (byId[left]?.order ?? Infinity) - (byId[right]?.order ?? Infinity);
  });
}

function getEmojiGenders(item) {
  const genders = new Set();
  const name = item.shortName?.toLocaleLowerCase() ?? '';
  const points = ` ${item.codePoints ?? ''} `;
  if (points.includes(' 2642 ') || /\b(man|men|boy|boys|father|prince|king|groom|male)\b/.test(name)) {
    genders.add('male');
  }
  if (points.includes(' 2640 ') || /\b(woman|women|girl|girls|mother|princess|queen|bride|female)\b/.test(name)) {
    genders.add('female');
  }
  if (/\b(person|people|adult|adults|child|children)\b/.test(name)) {
    genders.add('neutral');
  }
  if (genders.size === 0) {
    const key = item.key ?? '';
    const capitalizedKey = key.charAt(0).toLocaleUpperCase() + key.slice(1);
    if (emojiByKey[`man${capitalizedKey}`] && emojiByKey[`woman${capitalizedKey}`]) {
      genders.add('neutral');
    }
  }
  return genders;
}

function drawList() {
  const focusedCell = document.activeElement?.closest?.('[data-emoji-key]');
  const shouldRestoreEmojiFocus = Boolean(focusedCell);
  var keywords = searchText.value
    .toLocaleLowerCase(selectedSearchLocale || undefined)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  function hasKeyword(emojiKey) {
    const searchableFields = [emojiKey, byId[emojiKey]?.shortName, ...(searchAnnotations[emojiKey] ?? [])]
      .filter(Boolean)
      .map(field => field.toLocaleLowerCase(selectedSearchLocale || undefined));
    return keywords.every(keyword => searchableFields.some(field => field.includes(keyword)));
  }

  var keys = allIds.filter(hasKeyword);
  const includedVersionKeys = getVersionKeys();
  if (includedVersionKeys) {
    keys = keys.filter(key => includedVersionKeys.has(key));
  }
  if (selectedGroup && items.length !== 0) {
    keys = keys.filter(key => byId[key]?.group === selectedGroup);
  }
  if (selectedSubGroup && items.length !== 0) {
    keys = keys.filter(key => subGroupSelectionKey(byId[key]?.group, byId[key]?.unicodeSubGroup) === selectedSubGroup);
  }
  skinToneCheckboxes.filter(check => {
    return check.checked
  }).forEach(check => {
    keys = keys.filter(key => items.find(
      item => item.key === key
    )?.codePoints.includes(check.value))
  });

  hairCheckboxes.filter(check => {
    return check.checked
  }).forEach(check => {
    keys = keys.filter(key => items.find(
      item => item.key === key
    )?.codePoints.includes(check.value))
  });
  const selectedGenders = genderCheckboxes.filter(check => check.checked).map(check => check.value);
  if (selectedGenders.length > 0) {
    keys = keys.filter(key => selectedGenders.some(gender => getEmojiGenders(byId[key] ?? {}).has(gender)));
  }

  keys = orderedKeys(keys);
  displayedKeys = keys;
  if (!focusedEmojiKey || !keys.includes(focusedEmojiKey)) {
    focusedEmojiKey = keys[0] ?? '';
  }
  const renderer = orderMode === 'sequence' ? asSequenceItem : asItem;
  const initialState = orderMode === 'sequence'
    ? { items: [], type: '', emoji: null }
    : {
    items: [],
    group: UNASSIGNED,
    unicodeSubGroup: UNASSIGNED,
    subGroup: UNASSIGNED,
    groupElement: null,
    unicodeSubGroupElement: null,
      subGroupElement: null
    };
  if (keys.length === 0) {
    emojiList.replaceChildren(createEmptyResults());
  } else {
    emojiList.replaceChildren(...keys.reduce(renderer, initialState).items);
  }
  if (shouldRestoreEmojiFocus) {
    document.getElementById(focusedEmojiKey)?.focus();
  }
  const numberLocale = selectedSearchLocale || undefined;
  const numberOptions = selectedSearchLocale.startsWith('ar') ? { numberingSystem: 'arab' } : {};
  matchCount.innerText = new Intl.NumberFormat(numberLocale, numberOptions).format(keys.length);
  updateActiveFilterSummary();
  updateDialogNavigation();
  syncUrlState();
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
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const cells = displayedKeys.map(key => document.getElementById(key)).filter(Boolean);
  if (cells.length === 0) return;
  let target;
  if (event.key === 'Home') {
    target = cells[0];
  } else if (event.key === 'End') {
    target = cells.at(-1);
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    target = closestVerticalEmoji(cell, cells, event.key === 'ArrowDown' ? 1 : -1);
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
        score: Math.abs(centerY - currentY) * 1000 + Math.abs(centerX - currentX)
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
  description.textContent = translate('noResultsDescription', 'Try removing a search term or filter.');
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
  if (selectedGroup) parts.push(displayGroupName(selectedGroup));
  if (selectedSubGroup) parts.push(displayUnicodeSubGroupName(selectedSubGroup.split('::').slice(1).join('::')));
  const latestReleased = versionManifests.at(-1)?.version;
  if (versionSelector.value && (versionSelector.value !== latestReleased || versionModeSelector.value === 'selected')) {
    const mode = versionModeSelector.value === 'selected'
      ? translate('onlyVersion', 'Only')
      : translate('throughVersion', 'Through');
    parts.push(`${mode} ${versionSliderLabel(versionSelector.value)}`);
  }
  skinToneCheckboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
    parts.push(checkbox.closest('label')?.querySelector('.modifier-emoji')?.textContent ?? checkbox.value);
  });
  hairCheckboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
    parts.push(checkbox.closest('label')?.querySelector('.modifier-emoji')?.textContent ?? checkbox.value);
  });
  genderCheckboxes.filter(checkbox => checkbox.checked).forEach(checkbox => {
    parts.push(checkbox.closest('label')?.querySelector('.modifier-emoji')?.textContent ?? checkbox.value);
  });
  activeFilterSummary.hidden = parts.length === 0;
  activeFilterText.textContent = parts.join(' · ');
}

function displayEmojiKey(key) {
  const words = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLocaleLowerCase();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
}

function announceStatus(message) {
  if (!copyStatus) return;
  copyStatus.textContent = '';
  window.setTimeout(() => {
    copyStatus.textContent = message;
  }, 0);
}

async function copyToClipboard(value, successMessage) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(value);
    announceStatus(successMessage);
    return true;
  } catch {
    announceStatus(translate('copyFailed', 'Could not copy to the clipboard.'));
    return false;
  }
}

function getIntroducedVersion(key) {
  return [...versionManifests, ...proposedVersionManifests]
    .find(version => versionKeys.get(version.version)?.has(key))?.version ?? '—';
}

function onClick(e, openDialog = true) {
  const cell = e.target.closest?.('[data-emoji-key]');
  var id = cell?.id ?? e.target.id;
  var value = emojiByKey[id];
  if (value === undefined) return;
  cell?.focus();
  showEmoji(id, openDialog);
}

function showEmoji(id, openDialog = true) {
  var value = emojiByKey[id];
  if (value === undefined) return;
  currentEmojiKey = id;
  var bits = [];
  var i;
  for (i = 0; i < value.length; i++) {
    const hex = value.codePointAt(i).toString(16);
    if (hex.length <= 4) {
      bits.push("\\u" + hex);
    } else {
      bits.push("\\u{" + hex + "}");
      i++; // skip next code as this one overlaps into it
    }
  }
  var group = items.find(item => item.key === id)?.group ?? '(none)';
  document.getElementsByClassName('emoji-group')[0].innerText = displayGroupName(group);

  var subGroup = items.find(item => item.key === id)?.unicodeSubGroup ?? '(none)';
  document.getElementsByClassName('emoji-subgroup')[0].innerText = displayUnicodeSubGroupName(subGroup);

  document.getElementsByClassName("emoji-key")[0].innerText = id;
  document.getElementsByClassName("emoji-value")[0].innerText = value;
  document.getElementsByClassName("emoji-encoded")[0].innerText = bits.join("");
  document.getElementsByClassName('emoji-preview')[0].innerText = value;
  const item = byId[id] ?? {};
  const codePoints = (item.codePoints ?? '').split(/\s+/).filter(Boolean).map(point => `U+${point}`).join(' ');
  document.getElementsByClassName('emoji-english-name')[0].innerText = item.shortName ?? displayEmojiKey(id);
  document.getElementsByClassName('emoji-version')[0].innerText = getIntroducedVersion(id);
  document.getElementsByClassName('emoji-code-points')[0].innerText = codePoints;
  const sequenceLabel = sequenceTypeLabels[item.sequenceType] ?? item.sequenceType ?? '—';
  document.getElementsByClassName('emoji-sequence-type')[0].innerText = translate(sequenceTranslationKeys[item.sequenceType], sequenceLabel);
  document.getElementsByClassName('emoji-status')[0].innerText = translate(statusTranslationKeys[item.status], item.status ?? '—');
  currentEmojiCopies = { emoji: value, key: id, escape: bits.join(''), codePoints };

  const localizedDetails = document.getElementsByClassName('localized-emoji-details')[0];
  const annotations = searchAnnotations[id] ?? [];
  if (selectedSearchLocale && annotations.length > 0) {
    document.getElementById('example-title').innerText = annotations[0];
    document.getElementsByClassName('localized-language')[0].innerText = translate('keywords', 'keywords');
    document.getElementsByClassName('localized-keywords')[0].innerText = annotations.slice(1).join(' · ');
    localizedDetails.hidden = false;
  } else {
    document.getElementById('example-title').innerText = displayEmojiKey(id);
    localizedDetails.hidden = true;
  }
  if (openDialog) {
    if (copyStatus) copyStatus.textContent = '';
    exampleDialog.showModal();
  }
  updateDialogNavigation();
}

function navigateEmoji(amount) {
  const index = displayedKeys.indexOf(currentEmojiKey);
  if (index === -1) return;
  const nextKey = displayedKeys[index + amount];
  if (nextKey) showEmoji(nextKey, false);
}

function updateDialogNavigation() {
  const index = displayedKeys.indexOf(currentEmojiKey);
  if (emojiPrevious) emojiPrevious.disabled = index <= 0;
  if (emojiNext) emojiNext.disabled = index === -1 || index >= displayedKeys.length - 1;
}
removeLegacyDialogElements();
window.addEventListener("load", onLoad);
