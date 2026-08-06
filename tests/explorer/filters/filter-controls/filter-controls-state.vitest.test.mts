import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  applyBasicUrlStateToControls,
  applyLoadedUrlStateToControls,
  resetFilterControls,
} from "../../../../src/explorer/filters/filter-controls.js";

describe("filter-controls-state", () => {
  it("applies URL state and resets filter control state", () => {
    const orderButtons = [
      {
        dataset: { order: "unicode" } as Record<string, string | undefined>,
        active: false,
        classList: {
          toggle(_name: string, force?: boolean) {
            orderButtons[0].active = Boolean(force);
          },
        },
        setAttribute(name: string, value: string) {
          this.dataset[`attr:${name}`] = value;
        },
      },
      {
        dataset: { order: "sequence" } as Record<string, string | undefined>,
        active: false,
        classList: {
          toggle(_name: string, force?: boolean) {
            orderButtons[1].active = Boolean(force);
          },
        },
        setAttribute(name: string, value: string) {
          this.dataset[`attr:${name}`] = value;
        },
      },
    ];
    const searchText = { value: "" };
    const basicStateResult = applyBasicUrlStateToControls({
      state: {
        compositionMode: "condensed",
        order: "sequence",
        search: "gift",
        sequenceType: "zwj",
      } as any,
      searchText,
      orderButtons: orderButtons as any,
    });
    assert.equal(searchText.value, "gift");
    assert.equal(orderButtons[0].active, false);
    assert.equal(orderButtons[1].active, true);
    assert.equal(orderButtons[1].dataset["attr:aria-pressed"], "true");
    assert.deepEqual(basicStateResult, {
      compositionMode: "condensed",
      orderMode: "sequence",
      selectedSequenceType: "zwj",
    });

    const versionSelector = {
      value: "",
      options: [{ value: "16.0" }, { value: "17.0" }],
    };
    const versionModeSelector = { value: "" };
    const skinBoxes = [
      { checked: false, value: "1F3FB" },
      { checked: false, value: "1F3FE" },
    ];
    const hairBoxes = [
      { checked: false, value: "1F9B0" },
      { checked: false, value: "1F9B2" },
    ];
    const genderBoxes = [
      { checked: false, value: "male" },
      { checked: false, value: "female" },
      { checked: false, value: "neutral" },
    ];
    const loadedStateResult = applyLoadedUrlStateToControls({
      state: {
        version: "17.0",
        versionMode: "selected",
        group: "Objects",
        subGroup: "mail",
        skin: ["1F3FE"],
        hair: ["1F9B0"],
        gender: ["neutral", "female"],
      } as any,
      versionSelector: versionSelector as any,
      versionModeSelector: versionModeSelector as any,
      groups: ["Objects", "Flags"],
      subGroups: { Objects: ["mail", "computer"] },
      skinToneCheckboxes: skinBoxes as any,
      hairCheckboxes: hairBoxes as any,
      genderCheckboxes: genderBoxes as any,
      subGroupSelectionKey: (group: string, subGroup: string) =>
        `${group}:${subGroup}`,
    });
    assert.equal(versionSelector.value, "17.0");
    assert.equal(versionModeSelector.value, "selected");
    assert.deepEqual(skinBoxes.map((box) => box.checked), [false, true]);
    assert.deepEqual(hairBoxes.map((box) => box.checked), [true, false]);
    assert.deepEqual(genderBoxes.map((box) => box.checked), [false, false, true]);
    assert.deepEqual(loadedStateResult, {
      selectedGroup: "Objects",
      selectedSubGroup: "Objects:mail",
    });

    const missingVersionState = applyLoadedUrlStateToControls({
      state: {
        version: "99.0",
        versionMode: "through",
        group: "Missing",
        subGroup: "none",
        skin: [],
        hair: [],
        gender: [],
      } as any,
      versionSelector: versionSelector as any,
      versionModeSelector: versionModeSelector as any,
      groups: ["Objects", "Flags"],
      subGroups: { Objects: ["mail", "computer"] },
      skinToneCheckboxes: skinBoxes as any,
      hairCheckboxes: hairBoxes as any,
      genderCheckboxes: genderBoxes as any,
      subGroupSelectionKey: (group: string, subGroup: string) =>
        `${group}:${subGroup}`,
    });
    assert.equal(versionSelector.value, "17.0");
    assert.equal(versionModeSelector.value, "through");
    assert.deepEqual(genderBoxes.map((box) => box.checked), [false, false, false]);
    assert.deepEqual(missingVersionState, {
      selectedGroup: "",
      selectedSubGroup: "",
    });

    resetFilterControls({
      searchText,
      versionModeSelector: versionModeSelector as any,
      versionSelector: versionSelector as any,
      latestReleasedVersion: "16.0",
      skinToneCheckboxes: skinBoxes as any,
      hairCheckboxes: hairBoxes as any,
      genderCheckboxes: genderBoxes as any,
    });
    assert.equal(searchText.value, "");
    assert.equal(versionModeSelector.value, "through");
    assert.equal(versionSelector.value, "16.0");
    assert.equal(skinBoxes.every((box) => !box.checked), true);
    assert.equal(hairBoxes.every((box) => !box.checked), true);
    assert.equal(genderBoxes.every((box) => !box.checked), true);

    searchText.value = "keep";
    versionSelector.value = "15.1";
    resetFilterControls({
      searchText,
      versionModeSelector: versionModeSelector as any,
      versionSelector: versionSelector as any,
      skinToneCheckboxes: skinBoxes as any,
      hairCheckboxes: hairBoxes as any,
      genderCheckboxes: genderBoxes as any,
    });
    assert.equal(searchText.value, "");
    assert.equal(versionSelector.value, "15.1");
  });
});
