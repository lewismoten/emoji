import { displayEmojiKey } from './emoji-format.js';

type MinimalElement = {
  dataset: Record<string, string | undefined>;
  hidden: boolean;
  open?: boolean;
  querySelector(selector: string): MinimalElement | null;
  replaceChildren(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  style: { setProperty(name: string, value: string): void };
  textContent: string | null;
  title: string;
  type?: string;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
};
declare const window: {
  matchMedia(query: string): { matches: boolean };
  setTimeout(callback: () => void, delay?: number): number;
};
declare const navigator: {
  clipboard?: {
    writeText?(value: string): Promise<void>;
  };
};

function createButton() {
  const button = document.createElement('button');
  button.type = 'button';
  return button;
}

export function nextFavoriteEmojiKeys(
  favoriteEmojiKeys: string[],
  key: string
) {
  if (!key) return favoriteEmojiKeys;
  return favoriteEmojiKeys.includes(key)
    ? favoriteEmojiKeys.filter(candidate => candidate !== key)
    : [key, ...favoriteEmojiKeys];
}

export function nextCopiedEmojiKeys(copiedEmojiKeys: string[], key: string) {
  if (!key) return copiedEmojiKeys;
  return [key, ...copiedEmojiKeys.filter(candidate => candidate !== key)].slice(
    0,
    24
  );
}

export function savedEmojiLabel(
  key: string,
  searchAnnotations: Record<string, string[]>,
  byId: Record<string, { shortName?: string }>
) {
  return (
    searchAnnotations[key]?.[0] ?? byId[key]?.shortName ?? displayEmojiKey(key)
  );
}

export function updateFavoriteToggleButton(
  button: MinimalElement | null,
  options: {
    favoriteEmojiKeys: string[];
    currentEmojiKey: string;
    translate: (key: string, fallback: string) => string;
  }
) {
  if (!button) return;
  const favorite = options.favoriteEmojiKeys.includes(options.currentEmojiKey);
  button.setAttribute('aria-pressed', String(favorite));
  button.querySelector('[aria-hidden="true"]')!.textContent = favorite
    ? '★'
    : '☆';
  const key = favorite ? 'removeFavorite' : 'addFavorite';
  const fallback = favorite ? 'Remove favorite' : 'Add favorite';
  const label = options.translate(key, fallback);
  button.dataset.i18nAriaLabel = key;
  button.setAttribute('aria-label', label);
  button.title = label;
}

export function renderSavedEmojiList(options: {
  container: MinimalElement;
  empty: MinimalElement;
  keys: string[];
  source: string;
  emojiByKey: Record<string, string>;
  searchAnnotations: Record<string, string[]>;
  byId: Record<string, { shortName?: string }>;
  applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
}) {
  const available = options.keys.filter(
    key => options.emojiByKey[key] !== undefined
  );
  options.container.replaceChildren(
    ...available.map((key, index) => {
      const button = createButton();
      button.dataset.savedEmoji = key;
      button.dataset.savedSource = options.source;
      button.style.setProperty('--saved-index', String(Math.min(index, 12)));
      button.textContent = options.emojiByKey[key];
      options.applyPixelArtworkClass(button, key);
      button.setAttribute(
        'aria-label',
        savedEmojiLabel(key, options.searchAnnotations, options.byId)
      );
      return button;
    })
  );
  options.empty.hidden = available.length > 0;
}

export function announceStatus(
  copyStatus: MinimalElement | undefined,
  message: string
) {
  if (!copyStatus) return;
  copyStatus.textContent = '';
  window.setTimeout(() => {
    copyStatus.textContent = message;
  }, 0);
}

export async function copyToClipboard(options: {
  value: string;
  successMessage: string;
  copyStatus: MinimalElement | undefined;
  translate: (key: string, fallback: string) => string;
}) {
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(options.value);
    announceStatus(options.copyStatus, options.successMessage);
    return true;
  } catch {
    announceStatus(
      options.copyStatus,
      options.translate('copyFailed', 'Could not copy to the clipboard.')
    );
    return false;
  }
}

export function animateCopyConfirmation(button: any) {
  if (
    !button?.animate ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
    return;
  button
    .getAnimations()
    .find((animation: any) => animation.id === 'emoji-copy-confirmation')
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
    { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
  );
  animation.id = 'emoji-copy-confirmation';
}

export function createSavedEmojiController(options: {
  applyPixelArtworkClass: () => (element: MinimalElement, emojiKey: string) => void;
  byId: () => Record<string, { shortName?: string }>;
  copiedEmojiKeys: () => string[];
  currentEmojiKey: () => string;
  favoriteEmojiKeys: () => string[];
  savePreference: (key: string, value: string[]) => void;
  savedDialog: () => MinimalElement | undefined;
  searchAnnotations: () => Record<string, string[]>;
  setCopiedEmojiKeys: (keys: string[]) => void;
  setFavoriteEmojiKeys: (keys: string[]) => void;
  translate: (key: string, fallback: string) => string;
  emojiByKey: () => Record<string, string>;
}) {
  function updateFavoriteButton() {
    updateFavoriteToggleButton(
      options.savedDialog()?.querySelector('.toggle-favorite') ?? null,
      {
        favoriteEmojiKeys: options.favoriteEmojiKeys(),
        currentEmojiKey: options.currentEmojiKey(),
        translate: options.translate
      }
    );
  }

  function renderList(
    container: MinimalElement | null,
    empty: MinimalElement | null,
    keys: string[],
    source: string
  ) {
    if (!container || !empty) return;
    renderSavedEmojiList({
      container,
      empty,
      keys,
      source,
      emojiByKey: options.emojiByKey(),
      searchAnnotations: options.searchAnnotations(),
      byId: options.byId(),
      applyPixelArtworkClass: options.applyPixelArtworkClass()
    });
  }

  function renderSavedEmoji() {
    const dialog = options.savedDialog();
    if (!dialog) return;
    renderList(
      dialog.querySelector('.favorites-list'),
      dialog.querySelector('.favorites-empty'),
      options.favoriteEmojiKeys(),
      'favorites'
    );
    renderList(
      dialog.querySelector('.copied-list'),
      dialog.querySelector('.copied-empty'),
      options.copiedEmojiKeys(),
      'copied'
    );
  }

  function toggleFavorite(key: string) {
    if (!key) return;
    const keys = nextFavoriteEmojiKeys(options.favoriteEmojiKeys(), key);
    options.setFavoriteEmojiKeys(keys);
    options.savePreference('favorites', keys);
    updateFavoriteButton();
    if (options.savedDialog()?.open) renderSavedEmoji();
  }

  function addFavorite(key: string) {
    if (!key || options.favoriteEmojiKeys().includes(key)) return;
    toggleFavorite(key);
  }

  function recordCopiedEmoji(key: string) {
    const keys = nextCopiedEmojiKeys(options.copiedEmojiKeys(), key);
    options.setCopiedEmojiKeys(keys);
    options.savePreference('recentCopied', keys);
  }

  return {
    addFavorite,
    recordCopiedEmoji,
    renderList,
    renderSavedEmoji,
    toggleFavorite,
    updateFavoriteButton
  };
}
