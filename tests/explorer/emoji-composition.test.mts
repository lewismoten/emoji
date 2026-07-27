import assert from "node:assert/strict";
import { renderEmojiComposition } from "../../src/explorer/emoji-composition.js";

const makeElement = () => ({
  className: "",
  dataset: {} as Record<string, string | undefined>,
  hidden: false,
  querySelector() {
    return null;
  },
  replaceChildren() {},
  setAttribute() {},
  textContent: "",
  title: "",
  append() {},
});

const section = makeElement();
const equation = makeElement();
const modeButton = makeElement();
const appended: unknown[] = [];
equation.append = (...nodes: unknown[]) => {
  appended.push(...nodes);
};

renderEmojiComposition({
  section,
  equation,
  modeButton,
  item: { key: "wrappedGift", codePoints: "1F381" },
  value: "🎁",
  developerMode: true,
  detailsVisible: true,
  compositionMode: "condensed",
  emojiKeyByCodePoints: new Map(),
  emojiByKey: { wrappedGift: "🎁" },
  searchAnnotations: {},
  byId: {},
  translate: (key, fallback) => `${key}:${fallback}`,
  applyPixelArtworkClass() {},
  applyStandalonePixelArtwork() {},
  dir: "ltr",
  locale: "en",
});

assert.equal(section.dataset.available, "false");
assert.equal(section.hidden, true);
assert.equal(modeButton.hidden, true);
assert.deepEqual(appended, []);
