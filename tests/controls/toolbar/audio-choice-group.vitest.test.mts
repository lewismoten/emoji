import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { AudioChoiceGroupControl } from "../../../src/controls/toolbar/audio-choice-group.js";

describe("audio-choice-group", () => {
  it("renders the audio choice group markup", () => {
    const markup = AudioChoiceGroupControl.toMarkup();

    assert.ok(markup.includes('class="setting-choice-group audio-choices"'));
    assert.ok(markup.includes('data-i18n-aria-label="audio"'));
    assert.ok(
      markup.includes(
        'class="sr-only" id="audio-group-label" data-i18n="audio">Audio</span>',
      ),
    );
    assert.match(
      markup,
      /data-audio-preference="soundEffects"[\s\S]*class="setting-choice audio-choice"|class="setting-choice audio-choice"[\s\S]*data-audio-preference="soundEffects"/,
    );
    assert.match(
      markup,
      /data-audio-preference="music"[\s\S]*class="setting-choice audio-choice"|class="setting-choice audio-choice"[\s\S]*data-audio-preference="music"/,
    );
    assert.ok(
      markup.includes(
        'class="audio-choice-input" tabindex="-1" type="checkbox" value="soundEffects"',
      ),
    );
    assert.ok(
      markup.includes(
        'class="audio-choice-input" tabindex="-1" type="checkbox" value="music"',
      ),
    );
  });
});
