import { displayEmojiKey } from "./emoji/emoji-format.js";
import {
  animateCopyConfirmation,
  announceStatus,
  copyToClipboard,
} from "./utility/copy-feedback.js";
import {
  updateFavoriteGlyph,
  updateFavoriteToggleButton,
} from "./utility/favorite-button.js";
import * as preferences from "../preferences.js";
import * as state from "../state.js";

export { animateCopyConfirmation, announceStatus, copyToClipboard };

type MinimalElement = {
  addEventListener?(type: string, listener: (...args: any[]) => void): void;
  classList?: { toggle(name: string, force?: boolean): void };
  dataset: Record<string, string | undefined>;
  focus?(): void;
  hidden: boolean;
  open?: boolean;
  querySelector(selector: string): MinimalElement | null;
  replaceChildren(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  style: { setProperty(name: string, value: string): void };
  tabIndex?: number;
  textContent: string | null;
  title: string;
  type?: string;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
  documentElement: { dataset: Record<string, string | undefined> };
  querySelector(selector: string): MinimalElement | null;
};
function createButton() {
  const button = document.createElement("button");
  button.type = "button";
  return button;
}

export function nextFavoriteEmojiKeys(
  favoriteEmojiKeys: string[],
  key: string,
) {
  if (!key) return favoriteEmojiKeys;
  return favoriteEmojiKeys.includes(key)
    ? favoriteEmojiKeys.filter((candidate) => candidate !== key)
    : [key, ...favoriteEmojiKeys];
}

export function nextCopiedEmojiKeys(copiedEmojiKeys: string[], key: string) {
  if (!key) return copiedEmojiKeys;
  return [
    key,
    ...copiedEmojiKeys.filter((candidate) => candidate !== key),
  ].slice(0, 24);
}

const savedEmojiLabel = (key: string) =>
  state.searchAnnotations.get(key)?.[0] ?? 
  state.byId.get(key)?.shortName ?? 
  displayEmojiKey(key);

export function renderSavedEmojiList(options: {
  container: MinimalElement;
  empty: MinimalElement;
  keys: string[];
  source: string;
  applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
}) {
  const available = options.keys.filter(
    (key) => state.emojiByKey.get(key) !== undefined,
  );
  options.container.replaceChildren(
    ...available.map((key, index) => {
      const button = createButton();
      button.dataset.savedEmoji = key;
      button.dataset.savedSource = options.source;
      button.tabIndex = index === 0 ? 0 : -1;
      button.style.setProperty("--saved-index", String(Math.min(index, 12)));
      button.textContent = state.emojiByKey.get(key);
      options.applyPixelArtworkClass(button, key);
      button.setAttribute(
        "aria-label",
        savedEmojiLabel(key),
      );
      return button;
    }),
  );
  options.empty.hidden = available.length > 0;
}

export function createSavedEmojiController(options: {
  applyPixelArtworkClass: () => (
    element: MinimalElement,
    emojiKey: string,
  ) => void;
  copiedEmojiKeys: () => string[];
  currentEmojiKey: () => string;
  favoriteEmojiKeys: () => string[];
  savedDialog: () => MinimalElement | undefined;
  setCopiedEmojiKeys: (keys: string[]) => void;
  setFavoriteEmojiKeys: (keys: string[]) => void;
  translate: (key: string, fallback: string) => string;
}) {
  function updateFavoriteButton() {
    updateFavoriteGlyph(
      document.querySelector(".saved-picker .favorite-glyph"),
      options.applyPixelArtworkClass(),
      true,
    );
    updateFavoriteToggleButton(
      document.querySelector(".example-dialog .toggle-favorite"),
      {
        applyPixelArtworkClass: options.applyPixelArtworkClass(),
        favoriteEmojiKeys: options.favoriteEmojiKeys(),
        currentEmojiKey: options.currentEmojiKey(),
        translate: options.translate,
      },
    );
  }

  function renderList(
    container: MinimalElement | null,
    empty: MinimalElement | null,
    keys: string[],
    source: string,
  ) {
    if (!container || !empty) return;
    renderSavedEmojiList({
      container,
      empty,
      keys,
      source,
      applyPixelArtworkClass: options.applyPixelArtworkClass(),
    });
  }

  function renderSavedEmoji() {
    const dialog = options.savedDialog();
    if (!dialog) return;
    renderList(
      dialog.querySelector(".favorites-list"),
      dialog.querySelector(".favorites-empty"),
      options.favoriteEmojiKeys(),
      "favorites",
    );
    renderList(
      dialog.querySelector(".copied-list"),
      dialog.querySelector(".copied-empty"),
      options.copiedEmojiKeys(),
      "copied",
    );
  }

  function toggleFavorite(key: string) {
    if (!key) return;
    const keys = nextFavoriteEmojiKeys(options.favoriteEmojiKeys(), key);
    options.setFavoriteEmojiKeys(keys);
    preferences.setStringArray("favorites", keys);
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
    preferences.setStringArray("recentCopied", keys);
  }

  return {
    addFavorite,
    recordCopiedEmoji,
    renderList,
    renderSavedEmoji,
    toggleFavorite,
    updateFavoriteButton,
  };
}
