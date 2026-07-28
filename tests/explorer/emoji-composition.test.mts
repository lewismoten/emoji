import assert from "node:assert/strict";
import { renderEmojiComposition } from "../../src/explorer/emoji-composition.js";

const makeElement = () => ({
  attributes: {} as Record<string, string>,
  className: "",
  dataset: {} as Record<string, string | undefined>,
  hidden: false,
  querySelector() {
    return null;
  },
  replaceChildren(..._nodes: unknown[]) {},
  setAttribute(name?: string, value?: string) {
    if (name && value !== undefined) this.attributes[name] = value;
  },
  textContent: "",
  title: "",
  append(..._nodes: unknown[]) {},
});

const originalDocument = (globalThis as typeof globalThis & { document?: any })
  .document;
(globalThis as typeof globalThis & { document: any }).document = {
  createElement(tagName: string) {
    const element: any = {
      ...makeElement(),
      tagName,
      attributes: {} as Record<string, string>,
      children: [] as unknown[],
      append(...nodes: unknown[]) {
        this.children.push(...nodes);
      },
      replaceChildren(...nodes: unknown[]) {
        this.children = [...nodes];
      },
      setAttribute(name: string, value: string) {
        this.attributes[name] = value;
      },
    };
    return element;
  },
};

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

const multiSection = makeElement();
const multiEquation = makeElement();
const multiModeButton = makeElement();
const multiAppended: unknown[] = [];
multiEquation.append = (...nodes: unknown[]) => {
  multiAppended.push(...nodes);
};
const standaloneArtworkKeys: Array<string | undefined> = [];
const pixelArtworkKeys: string[] = [];

renderEmojiComposition({
  section: multiSection,
  equation: multiEquation,
  modeButton: multiModeButton,
  item: { key: "rainbowFlag", shortName: "rainbow flag", codePoints: "1F3F3 FE0F 200D 1F308" },
  value: "🏳️‍🌈",
  developerMode: true,
  detailsVisible: true,
  compositionMode: "condensed",
  emojiKeyByCodePoints: new Map([
    ["1F3F3 FE0F", "whiteFlag"],
    ["1F308", "rainbow"],
  ]),
  emojiByKey: { whiteFlag: "🏳️", rainbow: "🌈", rainbowFlag: "🏳️‍🌈" },
  searchAnnotations: { whiteFlag: ["white flag"], rainbow: ["rainbow"] },
  byId: {
    whiteFlag: { shortName: "white flag" },
    rainbow: { shortName: "rainbow" },
    rainbowFlag: { shortName: "rainbow flag" },
  },
  translate: (key, fallback) => `${key}:${fallback}`,
  applyPixelArtworkClass(_element, emojiKey) {
    pixelArtworkKeys.push(emojiKey);
  },
  applyStandalonePixelArtwork(_element, emojiKey) {
    standaloneArtworkKeys.push(emojiKey);
  },
  dir: "ltr",
  locale: "en",
});

assert.equal(multiSection.hidden, false);
assert.equal(multiSection.dataset.available, "true");
assert.equal(multiModeButton.hidden, false);
assert.equal(multiModeButton.textContent, "showFullSequence:Show full sequence");
assert.equal(multiModeButton.title, "showFullSequence:Show full sequence");
assert.deepEqual((multiModeButton as any).attributes, {
  "aria-label": "showFullSequence:Show full sequence",
  "aria-pressed": "false",
});
assert.equal(multiAppended.length > 0, true);
assert.equal(pixelArtworkKeys.includes("rainbowFlag"), true);
assert.equal(standaloneArtworkKeys.length > 0, true);

if (originalDocument === undefined) {
  delete (globalThis as typeof globalThis & { document?: any }).document;
} else {
  (globalThis as typeof globalThis & { document: any }).document =
    originalDocument;
}
