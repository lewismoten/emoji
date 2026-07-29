import assert from "node:assert/strict";
import {
  emojiCompositionMarkup,
  savedDialogMarkup,
} from "../../src/explorer/utility-control-markup.js";
import { DialogCloseButtonControl } from "../../src/controls/dialog/dialog-close-button.js";

assert.match(emojiCompositionMarkup, /emoji-composition/);
assert.match(emojiCompositionMarkup, /data-i18n="builtFrom"/);
assert.match(emojiCompositionMarkup, /emoji-composition-mode/);

assert.match(savedDialogMarkup, /saved-dialog/);
assert.match(savedDialogMarkup, /favorites-list/);
assert.match(savedDialogMarkup, /copied-list/);
assert.match(savedDialogMarkup, /data-i18n="recentlyCopied"/);
assert.match(
  savedDialogMarkup,
  new RegExp(DialogCloseButtonControl.toMarkup().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
);
