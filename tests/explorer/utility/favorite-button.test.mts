import assert from "node:assert/strict";

import {
  applyRetroFavoriteButtonState,
  updateFavoriteGlyph,
  updateFavoriteToggleButton,
} from "../../../src/explorer/utility/favorite-button.js";

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

try {
  const appliedEmoji: string[] = [];
  const recordAppliedEmoji = (_element: unknown, emojiKey: string) => {
    appliedEmoji.push(emojiKey);
  };
  updateFavoriteGlyph(null, recordAppliedEmoji, true);
  assert.deepEqual(appliedEmoji, []);

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
  updateFavoriteGlyph(glyph, recordAppliedEmoji, true);
  assert.equal(glyph.textContent, "⭐");
  updateFavoriteGlyph(glyph, recordAppliedEmoji, false);
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

  applyRetroFavoriteButtonState(button as any, true);
  assert.equal(styles.get("background"), "#ffff55");
  assert.equal(styles.get("border-right-color"), "#aa5500");

  applyRetroFavoriteButtonState(button as any, false);
  assert.equal(styles.get("background"), "#aaaaaa");
  assert.equal(styles.get("border-right-color"), "#555555");

  updateFavoriteToggleButton(button as any, {
    applyPixelArtworkClass: recordAppliedEmoji,
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
  updateFavoriteToggleButton(button as any, {
    applyPixelArtworkClass: recordAppliedEmoji,
    favoriteEmojiKeys: [],
    currentEmojiKey: "partyPopper",
    translate: (key, fallback) =>
      key === "addFavorite" ? "Save emoji" : fallback,
  });
  assert.equal(button.dataset.favoriteState, "off");
  assert.equal(button.dataset["attr:aria-pressed"], "false");
  assert.equal(button.dataset["attr:aria-label"], "Save emoji");
  assert.equal(styles.get("background"), "");

  const fallbackGlyph = {
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
  const noClassListButton = {
    dataset: {} as Record<string, string | undefined>,
    querySelector(selector: string) {
      return selector === ".favorite-glyph"
        ? null
        : selector === '[aria-hidden="true"]'
          ? fallbackGlyph
          : null;
    },
    setAttribute(name: string, value: string) {
      this.dataset[`attr:${name}`] = value;
    },
    style: {
      setProperty(name: string, value: string) {
        styles.set(`fallback:${name}`, value);
      },
    },
    textContent: null,
    title: "",
  };

  updateFavoriteToggleButton(noClassListButton as any, {
    applyPixelArtworkClass: recordAppliedEmoji,
    favoriteEmojiKeys: [],
    currentEmojiKey: "abacus",
    translate: (_key, fallback) => fallback,
  });
  assert.equal(noClassListButton.dataset.favoriteState, "off");
  assert.equal(noClassListButton.dataset["attr:aria-pressed"], "false");
  assert.equal(fallbackGlyph.textContent, "☆");

  updateFavoriteToggleButton(null, {
    applyPixelArtworkClass: recordAppliedEmoji,
    favoriteEmojiKeys: [],
    currentEmojiKey: "abacus",
    translate: (_key, fallback) => fallback,
  });
} finally {
  if (originalDocument === undefined) {
    delete globals.document;
  } else {
    Object.defineProperty(globals, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
}
