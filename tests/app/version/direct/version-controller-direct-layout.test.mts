import assert from "node:assert/strict";
import { createVersionControllerFixture } from "./version-controller-direct-fixture.mjs";

const fixture = createVersionControllerFixture();
const selectedKeys = fixture.controller.getVersionKeys();

assert.equal(fixture.controller.versionSliderLabel("16.0"), "Emoji 16.0");
assert.equal(
  fixture.controller.versionSliderLabel("18.0"),
  "✨ Emoji 18.0 beta",
);

fixture.controller.populateVersionSelector();
assert.equal(fixture.selector.appended.length, 3);
assert.equal(
  fixture.selector.appended[0]?.text,
  "Emoji 15.0 (released:released 2022-09-13)",
);
assert.equal(
  fixture.selector.appended[2]?.text,
  "Emoji 18.0 (beta · expected:expected 2026-09)",
);
assert.equal(fixture.selector.value, "16.0");
assert.equal(fixture.versionRange.max, "2");
assert.equal(fixture.versionRange.value, "1");
assert.equal(fixture.versionRangeValue.value, "Emoji 16.0");
assert.equal(fixture.versionRange["aria-valuetextValue"], "Emoji 16.0");
assert.equal(fixture.previousButton.disabled, false);
assert.equal(fixture.nextButton.disabled, false);
assert.equal(fixture.sliderStyles.get("--slider-progress"), "0%");
assert.equal(fixture.sliderStyles.get("background"), "#555555");
assert.deepEqual([...selectedKeys], ["adult", "wave"]);

fixture.versionModeSelector.value = "through";
fixture.selector.value = "18.0";
const throughKeys = fixture.controller.getVersionKeys();
assert.deepEqual([...throughKeys], ["wave", "adult"]);

fixture.controller.updateModifierAvailability();
assert.equal(fixture.hairCheckboxes[0]?.checked, false);
assert.equal(fixture.skinToneCheckboxes[0]?.checked, false);
assert.equal(fixture.modifierFilters.hidden, false);
assert.ok(fixture.modifierClassOperations.includes("toggle:has-single:true"));

fixture.selector.value = "15.0";
fixture.versionRange.value = "2";
fixture.controller.onVersionRangeInput();
assert.equal(fixture.selector.value, "18.0");
assert.equal(fixture.renderCategoryFiltersCalls() >= 1, true);
assert.equal(fixture.drawListCalls() >= 1, true);

fixture.versionRange.value = "99";
fixture.controller.onVersionRangeInput();
assert.equal(fixture.selector.value, "18.0");
