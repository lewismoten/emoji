import assert from "node:assert/strict";

import { VersionModeToggleControl } from "../../../../src/controls/filters/version/version-mode-toggle.js";

const markup = VersionModeToggleControl.toMarkup({
  emoji: "🎯",
  pressed: true,
});

assert.match(markup, /^<label class="version-mode-toggle"/);
assert.match(markup, /aria-label="Toggle selected version mode"/);
assert.match(markup, /aria-pressed="true"/);
assert.match(markup, /title="Toggle selected version mode"/);
assert.match(markup, /<input checked="checked" type="checkbox" value="selected-version"><\/input>/);
assert.match(markup, /aria-hidden="true">🎯<\/span>/);
