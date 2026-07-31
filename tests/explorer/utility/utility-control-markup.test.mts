import assert from "node:assert/strict";
import {
  emojiCompositionMarkup,
  savedDialogMarkup,
} from "../../../src/explorer/utility/utility-control-markup.js";
import { SavedDialogControl } from "../../../src/controls/dialog/content/saved-dialog.js";

assert.match(emojiCompositionMarkup, /emoji-composition/);
assert.match(emojiCompositionMarkup, /data-i18n="builtFrom"/);
assert.match(emojiCompositionMarkup, /emoji-composition-mode/);

assert.match(savedDialogMarkup, /saved-dialog/);
assert.match(savedDialogMarkup, /favorites-list/);
assert.match(savedDialogMarkup, /copied-list/);
assert.match(savedDialogMarkup, /data-i18n="recentlyCopied"/);
assert.equal(savedDialogMarkup, SavedDialogControl.toMarkup({}));
