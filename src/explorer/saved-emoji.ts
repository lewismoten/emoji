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

export const savedEmojiLabel = (
  key: string,
  searchAnnotations: Record<string, string[]> = state.searchAnnotations.get(),
  byId: Record<string, { shortName?: string }> = state.byId.get(),
) =>
  searchAnnotations[key]?.[0] ?? byId[key]?.shortName ?? displayEmojiKey(key);

export function renderSavedEmojiList(options: {
  container: MinimalElement;
  empty: MinimalElement;
  keys: string[];
  source: string;
  byId?: Record<string, { shortName?: string }>;
  emojiByKey?: Record<string, string>;
  searchAnnotations?: Record<string, string[]>;
  applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
}) {
  const available = options.keys.filter(
    (key) => (options.emojiByKey ?? state.emojiByKey.get())[key] !== undefined,
  );
  options.container.replaceChildren(
    ...available.map((key, index) => {
      const button = createButton();
      button.dataset.savedEmoji = key;
      button.dataset.savedSource = options.source;
      button.tabIndex = index === 0 ? 0 : -1;
      button.style.setProperty("--saved-index", String(Math.min(index, 12)));
      button.textContent =
        options.emojiByKey?.[key] ?? state.emojiByKey.get(key) ?? "";
      options.applyPixelArtworkClass(button, key);
      button.setAttribute(
        "aria-label",
        savedEmojiLabel(
          key,
          options.searchAnnotations ?? state.searchAnnotations.get(),
          options.byId ?? state.byId.get(),
        ),
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
  byId?: () => Record<string, { shortName?: string }>;
  emojiByKey?: () => Record<string, string>;
  savedDialog: () => MinimalElement | undefined;
  searchAnnotations?: () => Record<string, string[]>;
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
        favoriteEmojiKeys: state.favoriteEmojiKeys.get(),
        currentEmojiKey: state.currentEmojiKey.get(),
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
      byId: options.byId?.(),
      emojiByKey: options.emojiByKey?.(),
      searchAnnotations: options.searchAnnotations?.(),
    });
  }

  function renderSavedEmoji() {
    const dialog = options.savedDialog();
    if (!dialog) return;
    renderList(
      dialog.querySelector(".favorites-list"),
      dialog.querySelector(".favorites-empty"),
      state.favoriteEmojiKeys.get(),
      "favorites",
    );
    renderList(
      dialog.querySelector(".copied-list"),
      dialog.querySelector(".copied-empty"),
      state.copiedEmojiKeys.get(),
      "copied",
    );
  }

  function toggleFavorite(key: string) {
    if (!key) return;
    const keys = nextFavoriteEmojiKeys(state.favoriteEmojiKeys.get(), key);
    state.favoriteEmojiKeys.replace(keys);
    preferences.setStringArray("favorites", keys);
    updateFavoriteButton();
    if (options.savedDialog()?.open) renderSavedEmoji();
  }

  function addFavorite(key: string) {
    if (!key || state.favoriteEmojiKeys.get().includes(key)) return;
    toggleFavorite(key);
  }

  function recordCopiedEmoji(key: string) {
    const keys = nextCopiedEmojiKeys(state.copiedEmojiKeys.get(), key);
    state.copiedEmojiKeys.replace(keys);
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
