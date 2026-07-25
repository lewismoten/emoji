import { displayEmojiKey } from './emoji-format.js';

type MinimalElement = {
  dataset: Record<string, string | undefined>;
  hidden: boolean;
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
  setTimeout(callback: () => void, delay?: number): number;
};
declare const navigator: {
  clipboard?: {
    writeText?(value: string): Promise<void>;
  };
};

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
      const button = document.createElement('button');
      button.type = 'button';
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
