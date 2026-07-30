import assert from "node:assert/strict";
import {
  createSavedEmojiController,
  nextCopiedEmojiKeys,
  nextFavoriteEmojiKeys,
  renderSavedEmojiList,
  savedEmojiLabel,
} from "../../src/explorer/saved-emoji.js";

assert.deepEqual(nextFavoriteEmojiKeys(["wave"], "grinningFace"), [
  "grinningFace",
  "wave",
]);
assert.deepEqual(nextFavoriteEmojiKeys(["wave", "grinningFace"], "wave"), [
  "grinningFace",
]);
assert.deepEqual(nextFavoriteEmojiKeys(["wave"], ""), ["wave"]);

assert.deepEqual(nextCopiedEmojiKeys(["wave", "grinningFace"], "wave"), [
  "wave",
  "grinningFace",
]);
assert.equal(
  nextCopiedEmojiKeys(
    Array.from({ length: 30 }, (_, i) => `${i}`),
    "new",
  ).length,
  24,
);
assert.deepEqual(nextCopiedEmojiKeys(["wave"], ""), ["wave"]);

assert.equal(
  savedEmojiLabel(
    "grinningFace",
    { grinningFace: ["Grinning face"] },
    { grinningFace: { shortName: "should not win" } },
  ),
  "Grinning face",
);
assert.equal(savedEmojiLabel("wrappedGift", {}, {}), "Wrapped gift");
assert.equal(
  savedEmojiLabel("wrappedGift", {}, { wrappedGift: { shortName: "Wrapped gift" } }),
  "Wrapped gift",
);

const createdButtons: Array<Record<string, unknown>> = [];
const globals = globalThis as typeof globalThis & {
  document?: any;
};
const originalDocument = globals.document;
globals.document = {
  createElement() {
    const element = {
      dataset: {} as Record<string, string | undefined>,
      hidden: false,
      style: { setProperty() {} },
      tabIndex: -1,
      textContent: "",
      attributes: new Map<string, string>(),
      setAttribute(name: string, value: string) {
        this.attributes.set(name, value);
      },
    };
    createdButtons.push(element);
    return element;
  },
  documentElement: { dataset: {} as Record<string, string | undefined> },
  querySelector() {
    return null;
  },
};

const container = {
  children: [] as unknown[],
  replaceChildren(...nodes: unknown[]) {
    this.children = nodes;
  },
};
const empty = { hidden: false };
renderSavedEmojiList({
  container: container as never,
  empty: empty as never,
  keys: ["wave", "missing"],
  source: "favorites",
  emojiByKey: { wave: "👋" },
  searchAnnotations: {},
  byId: {},
  applyPixelArtworkClass() {},
});
assert.equal(container.children.length, 1);
assert.equal((container.children[0] as any).dataset.savedEmoji, "wave");
assert.equal(empty.hidden, true);
assert.equal((container.children[0] as any).dataset.savedSource, "favorites");
assert.equal((container.children[0] as any).tabIndex, 0);

const emptyContainer = {
  children: [] as unknown[],
  replaceChildren(...nodes: unknown[]) {
    this.children = nodes;
  },
};
const emptyPlaceholder = { hidden: true };
renderSavedEmojiList({
  container: emptyContainer as never,
  empty: emptyPlaceholder as never,
  keys: ["missing"],
  source: "copied",
  emojiByKey: { wave: "👋" },
  searchAnnotations: {},
  byId: {},
  applyPixelArtworkClass() {},
});
assert.deepEqual(emptyContainer.children, []);
assert.equal(emptyPlaceholder.hidden, false);

const favoriteGlyph = { dataset: {}, textContent: "", querySelector: () => null, setAttribute() {}, style: { setProperty() {} }, title: "" };
const toggleButton = {
  classList: { toggle() {} },
  dataset: {} as Record<string, string | undefined>,
  querySelector(selector: string) {
    return selector.includes("favorite-glyph") ? (favoriteGlyph as never) : null;
  },
  setAttribute(name: string, value: string) {
    this.dataset[`attr:${name}`] = value;
  },
  style: { setProperty() {} },
  textContent: "",
  title: "",
};
const favoritesList = {
  rendered: [] as unknown[],
  replaceChildren(...nodes: unknown[]) {
    this.rendered = nodes;
  },
  querySelector() {
    return null;
  },
};
const copiedList = {
  rendered: [] as unknown[],
  replaceChildren(...nodes: unknown[]) {
    this.rendered = nodes;
  },
  querySelector() {
    return null;
  },
};
const favoritesEmpty = { hidden: false };
const copiedEmpty = { hidden: false };
const dialog = {
  open: true,
  querySelector(selector: string) {
    return (
      {
        ".favorites-list": favoritesList,
        ".favorites-empty": favoritesEmpty,
        ".copied-list": copiedList,
        ".copied-empty": copiedEmpty,
      } as Record<string, unknown>
    )[selector] as any;
  },
};
globals.document.querySelector = (selector: string) => {
  if (selector === ".saved-picker .favorite-glyph") return favoriteGlyph;
  if (selector === ".example-dialog .toggle-favorite") return toggleButton;
  return null;
};
let favoriteEmojiKeys = ["wave"];
let copiedEmojiKeys = ["grinningFace"];
const savedPreferences: Array<[string, string[]]> = [];
const controller = createSavedEmojiController({
  applyPixelArtworkClass: () => () => {},
  byId: () => ({ wave: { shortName: "Wave" }, grinningFace: { shortName: "Grinning face" } }),
  copiedEmojiKeys: () => copiedEmojiKeys,
  currentEmojiKey: () => "wave",
  favoriteEmojiKeys: () => favoriteEmojiKeys,
  savePreference: (key, value) => savedPreferences.push([key, value]),
  savedDialog: () => dialog as never,
  searchAnnotations: () => ({}),
  setCopiedEmojiKeys: (keys) => {
    copiedEmojiKeys = keys;
  },
  setFavoriteEmojiKeys: (keys) => {
    favoriteEmojiKeys = keys;
  },
  translate: (_key, fallback) => fallback,
  emojiByKey: () => ({ wave: "👋", grinningFace: "😀" }),
});

controller.recordCopiedEmoji("wave");
assert.deepEqual(copiedEmojiKeys, ["wave", "grinningFace"]);
controller.addFavorite("grinningFace");
assert.deepEqual(favoriteEmojiKeys, ["grinningFace", "wave"]);
controller.addFavorite("grinningFace");
assert.deepEqual(favoriteEmojiKeys, ["grinningFace", "wave"]);
controller.toggleFavorite("wave");
assert.deepEqual(favoriteEmojiKeys, ["grinningFace"]);
controller.toggleFavorite("");
assert.deepEqual(favoriteEmojiKeys, ["grinningFace"]);
controller.renderSavedEmoji();
controller.updateFavoriteButton();
assert.equal(savedPreferences.length >= 2, true);
assert.equal(favoritesEmpty.hidden, true);
assert.equal(copiedEmpty.hidden, true);

const closedDialogController = createSavedEmojiController({
  applyPixelArtworkClass: () => () => {},
  byId: () => ({}),
  copiedEmojiKeys: () => [],
  currentEmojiKey: () => "",
  favoriteEmojiKeys: () => [],
  savePreference: () => {},
  savedDialog: () => ({ open: false, querySelector: () => null } as never),
  searchAnnotations: () => ({}),
  setCopiedEmojiKeys: () => {},
  setFavoriteEmojiKeys: () => {},
  translate: (_key, fallback) => fallback,
  emojiByKey: () => ({}),
});
assert.doesNotThrow(() => closedDialogController.renderSavedEmoji());
assert.doesNotThrow(() =>
  (closedDialogController as any).renderList(null, null, [], "favorites"),
);
assert.doesNotThrow(() => closedDialogController.toggleFavorite(""));

if (originalDocument === undefined) {
  delete globals.document;
} else {
  globals.document = originalDocument;
}
