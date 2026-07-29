import assert from "node:assert/strict";
import { AudioChoiceGroupControl } from "../../../src/controls/toolbar/audio-choice-group.js";

const markup = AudioChoiceGroupControl.toMarkup();

assert.ok(markup.includes('class="setting-choice-group audio-choices"'));
assert.ok(markup.includes('data-i18n-aria-label="audio"'));
assert.ok(markup.includes('class="sr-only" id="audio-group-label" data-i18n="audio">Audio</span>'));
assert.match(
  markup,
  /data-audio-preference="soundEffects"[\s\S]*class="setting-choice audio-choice"|class="setting-choice audio-choice"[\s\S]*data-audio-preference="soundEffects"/,
);
assert.match(
  markup,
  /data-audio-preference="music"[\s\S]*class="setting-choice audio-choice"|class="setting-choice audio-choice"[\s\S]*data-audio-preference="music"/,
);
assert.ok(markup.includes('class="audio-choice-input" type="checkbox" value="soundEffects"'));
assert.ok(markup.includes('class="audio-choice-input" type="checkbox" value="music"'));
