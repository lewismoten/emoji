import assert from "node:assert/strict";

import { EmojiCompositionSectionControl } from "../../../../src/controls/dialog/content/emoji-composition-section.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const section =
  EmojiCompositionSectionControl.create() as unknown as FakeElement;
const stylesheets = documentRef.head.children.filter(
  (child) => child instanceof FakeElement && child.tagName === "LINK",
) as FakeElement[];

assert.equal(stylesheets.length, 1);
assert.equal(
  stylesheets[0]?.id,
  "emoji-composition-section-control-stylesheet",
);
assert.equal(
  stylesheets[0]?.href,
  "./explorer/controls/dialog/content/emoji-composition-section.css",
);
assert.equal(section.tagName, "SECTION");
assert.equal(section.className, "emoji-composition developer-only");
assert.equal(section.getAttribute("hidden"), "");

const [heading, equation] = section.children as FakeElement[];
assert.equal(heading.className, "emoji-composition-heading");
assert.equal(equation.className, "emoji-composition-equation");
assert.equal(equation.getAttribute("dir"), "ltr");

const markup = EmojiCompositionSectionControl.toMarkup();
assert.match(markup, /class="emoji-composition developer-only"/);
assert.match(markup, /class="emoji-composition-mode"/);
assert.match(markup, /data-i18n="builtFrom"/);
assert.match(markup, /data-i18n="showFullSequence"/);

restore();
