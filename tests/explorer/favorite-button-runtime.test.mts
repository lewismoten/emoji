import assert from "node:assert/strict";

import {
  applyRetroFavoriteButtonState,
  updateFavoriteGlyph,
  updateFavoriteToggleButton,
} from "../../src/explorer/favorite-button.js";

const globals = globalThis as typeof globalThis & {
  document?: any;
};

const originalDocument = globals.document;
Object.defineProperty(globals, "document", {
  configurable: true,
  value: {
    documentElement: { dataset: { theme: "retro" } },
  },
});

const appliedEmoji: string[] = [];
const glyph = {
  classList: { toggle() {} },
  dataset: {} as Record<string, string | undefined>,
  querySelector() {
    return null;
  },
  setAttribute() {},
  style: { setProperty() {} },
  textContent: "",
  title: "",
};
updateFavoriteGlyph(
  glyph,
  (_element, emojiKey) => appliedEmoji.push(emojiKey),
  true,
);
assert.equal(glyph.textContent, "⭐");
updateFavoriteGlyph(
  glyph,
  (_element, emojiKey) => appliedEmoji.push(emojiKey),
  false,
);
assert.equal(glyph.textContent, "☆");
assert.deepEqual(appliedEmoji, ["glowingStar", ""]);

const styles = new Map<string, string>();
const button = {
  classList: {
    values: new Set<string>(),
    toggle(name: string, force?: boolean) {
      if (force) this.values.add(name);
      else this.values.delete(name);
    },
  },
  dataset: {} as Record<string, string | undefined>,
  querySelector(selector: string) {
    return selector.includes("favorite-glyph") ? glyph : null;
  },
  setAttribute(name: string, value: string) {
    this.dataset[`attr:${name}`] = value;
  },
  style: {
    setProperty(name: string, value: string) {
      styles.set(name, value);
    },
  },
  textContent: null,
  title: "",
};

applyRetroFavoriteButtonState(button, true);
assert.equal(styles.get("background"), "#ffff55");
assert.equal(styles.get("border-right-color"), "#aa5500");

updateFavoriteToggleButton(button, {
  applyPixelArtworkClass: (_element, emojiKey) => appliedEmoji.push(emojiKey),
  favoriteEmojiKeys: ["partyPopper"],
  currentEmojiKey: "partyPopper",
  translate: (key, fallback) =>
    key === "removeFavorite" ? "Remove saved emoji" : fallback,
});
assert.equal(button.dataset.favoriteState, "on");
assert.equal(button.dataset["attr:aria-pressed"], "true");
assert.equal(button.dataset.i18nAriaLabel, "removeFavorite");
assert.equal(button.dataset["attr:aria-label"], "Remove saved emoji");
assert.equal(button.title, "Remove saved emoji");

globals.document.documentElement.dataset.theme = "light";
updateFavoriteToggleButton(button, {
  applyPixelArtworkClass: (_element, emojiKey) => appliedEmoji.push(emojiKey),
  favoriteEmojiKeys: [],
  currentEmojiKey: "partyPopper",
  translate: (key, fallback) =>
    key === "addFavorite" ? "Save emoji" : fallback,
});
assert.equal(button.dataset.favoriteState, "off");
assert.equal(button.dataset["attr:aria-pressed"], "false");
assert.equal(button.dataset["attr:aria-label"], "Save emoji");
assert.equal(styles.get("background"), "");

if (originalDocument === undefined) {
  delete globals.document;
} else {
  Object.defineProperty(globals, "document", {
    configurable: true,
    value: originalDocument,
  });
}
