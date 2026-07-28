import assert from "node:assert/strict";

import { ThemeChoiceGroupControl } from "../../../src/controls/toolbar/theme-choice-group.js";
import { FakeElement, installFakeDocument } from "../fake-dom.mjs";

const markup = ThemeChoiceGroupControl.toMarkup();

assert.ok(markup.includes('class="setting-choice-group theme-choices"'));
assert.ok(markup.includes('data-theme="light"'));
assert.ok(markup.includes('data-theme="dark"'));
assert.ok(markup.includes('data-theme="retro"'));
assert.ok(markup.includes('data-max-selectable="1"'));
assert.ok(markup.includes('data-min-selectable="1"'));
assert.ok(markup.includes('data-theme="base"'));

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & { document: { head: FakeElement } };
ThemeChoiceGroupControl.create({
  themes: [{ theme: "custom", emoji: "C", key: "custom", text: "Custom" }],
});
assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "theme-choice-group-control-stylesheet",
);
restore();
