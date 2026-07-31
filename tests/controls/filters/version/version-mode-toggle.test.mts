import assert from "node:assert/strict";

import { VersionModeToggleControl } from "../../../../src/controls/filters/version/version-mode-toggle.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const markup = VersionModeToggleControl.toMarkup({
  emoji: "🎯",
  pressed: true,
});

assert.match(markup, /^<label class="version-mode-toggle"/);
assert.match(markup, /aria-label="Toggle selected version mode"/);
assert.match(markup, /aria-pressed="true"/);
assert.match(markup, /title="Toggle selected version mode"/);
assert.match(
  markup,
  /<input checked="checked" tabindex="-1" type="checkbox" value="selected-version"><\/input>/,
);
assert.match(markup, /aria-hidden="true">🎯<\/span>/);

const restore = installFakeDocument();
const globals = globalThis as typeof globalThis & {
  document: { head: FakeElement };
};
VersionModeToggleControl.create({ emoji: "✨", pressed: false });
assert.equal(globals.document.head.children.length, 1);
assert.equal(
  (globals.document.head.children[0] as FakeElement).id,
  "version-mode-toggle-control-stylesheet",
);
restore();
