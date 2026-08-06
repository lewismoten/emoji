import assert from "node:assert/strict";
import { describe, it } from "vitest";

import * as categoryVersion from "../../../../src/explorer/category/category-version.js";
import { FakeField } from "./category-version-fixture.mjs";

describe("category-version-modifiers", () => {
  it("shows and hides modifier groups based on version availability", () => {
    const byId = {
      womanRunning: { key: "womanRunning" },
      redHair: { key: "redHair" },
    };
    const genderCheckboxes = [{ checked: true }, { checked: false }];
    const hairCheckboxes = [{ checked: true }];
    const skinToneCheckboxes = [{ checked: true }];
    const genderFieldset = new FakeField();
    const hairFieldset = new FakeField();
    const skinToneFieldset = new FakeField();
    const modifierFilters = new FakeField();

    categoryVersion.updateModifierAvailability({
      byId: {},
      genderCheckboxes: [],
      genderFieldset,
      getEmojiGenders: () => new Set(),
      hairCheckboxes: [],
      hairFieldset,
      modifierFilters,
      proposedVersionManifests: [],
      skinToneCheckboxes: [],
      skinToneFieldset,
      versionKeys: new Map(),
      versionManifests: [],
      versionValue: "15.0",
    });
    assert.equal(genderFieldset.hidden, false);
    assert.equal(hairFieldset.hidden, false);
    assert.equal(skinToneFieldset.hidden, false);
    assert.equal(modifierFilters.hidden, false);
    assert.equal(modifierFilters.classList.has("has-single"), false);

    const availabilityVersionKeys = new Map<string, Set<string>>([
      ["1.0", new Set(["womanRunning"])],
      ["2.0", new Set(["waveSkinTone"])],
      ["3.0", new Set(["redHair"])],
    ]);
    categoryVersion.updateModifierAvailability({
      byId,
      genderCheckboxes,
      genderFieldset,
      getEmojiGenders: (item: any) =>
        item?.key === "womanRunning" ? new Set(["female"]) : new Set(),
      hairCheckboxes,
      hairFieldset,
      modifierFilters,
      proposedVersionManifests: [],
      skinToneCheckboxes,
      skinToneFieldset,
      versionKeys: availabilityVersionKeys,
      versionManifests: [{ version: "1.0" }, { version: "2.0" }, { version: "3.0" }],
      versionValue: "1.0",
    });
    assert.equal(genderFieldset.hidden, false);
    assert.equal(skinToneFieldset.hidden, true);
    assert.equal(hairFieldset.hidden, true);
    assert.equal(skinToneCheckboxes[0].checked, false);
    assert.equal(hairCheckboxes[0].checked, false);
    assert.equal(modifierFilters.hidden, false);
    assert.equal(modifierFilters.classList.has("has-single"), true);

    skinToneCheckboxes[0].checked = true;
    hairCheckboxes[0].checked = true;
    genderCheckboxes[0].checked = true;
    categoryVersion.updateModifierAvailability({
      byId,
      genderCheckboxes,
      genderFieldset,
      getEmojiGenders: (item: any) =>
        item?.key === "womanRunning" ? new Set(["female"]) : new Set(),
      hairCheckboxes,
      hairFieldset,
      modifierFilters,
      proposedVersionManifests: [{ version: "4.0" }],
      skinToneCheckboxes,
      skinToneFieldset,
      versionKeys: availabilityVersionKeys,
      versionManifests: [{ version: "1.0" }, { version: "2.0" }, { version: "3.0" }],
      versionValue: "4.0",
    });
    assert.equal(genderFieldset.hidden, false);
    assert.equal(skinToneFieldset.hidden, false);
    assert.equal(hairFieldset.hidden, false);
    assert.equal(modifierFilters.hidden, false);
    assert.equal(modifierFilters.classList.has("has-single"), false);

    const noModifiersField = new FakeField();
    const noGenderCheckboxes = [{ checked: true }];
    categoryVersion.updateModifierAvailability({
      byId: {},
      genderCheckboxes: noGenderCheckboxes,
      genderFieldset: new FakeField(),
      getEmojiGenders: () => new Set(),
      hairCheckboxes: [{ checked: true }],
      hairFieldset: new FakeField(),
      modifierFilters: noModifiersField,
      proposedVersionManifests: [],
      skinToneCheckboxes: [{ checked: true }],
      skinToneFieldset: new FakeField(),
      versionKeys: new Map([["1.0", new Set(["plain"])]]),
      versionManifests: [{ version: "1.0" }],
      versionValue: "1.0",
    });
    assert.equal(noModifiersField.hidden, true);
  });
});
