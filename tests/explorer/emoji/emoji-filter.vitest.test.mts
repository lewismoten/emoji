import { afterEach, describe, expect, it } from "vitest";

import {
  filterEmojiKeys,
  getEmojiGenders,
} from "../../../src/explorer/emoji/emoji-filter.js";
import * as state from "../../../src/state.js";

const emojiByKey = {
  childArtist: "🧒",
  lightWomanRunner: "🏃🏻‍♀️",
  manCook: "👨‍🍳",
  manRunner: "🏃‍♂️",
  personCook: "🧑‍🍳",
  personRunning: "🏃",
  princess: "👸",
  redHairedPerson: "🧑‍🦰",
  womanCook: "👩‍🍳",
  womanRunner: "🏃‍♀️",
};

const byId = {
  childArtist: {
    codePoints: "1F9D2",
    group: "People & Body",
    key: "childArtist",
    sequenceType: "single",
    shortName: "child artist",
    unicodeSubGroup: "person",
  },
  lightWomanRunner: {
    codePoints: "1F3C3 1F3FB 200D 2640 FE0F",
    group: "People & Body",
    key: "lightWomanRunner",
    sequenceType: "zwj",
    shortName: "woman running: light skin tone",
    unicodeSubGroup: "person-activity",
  },
  manCook: {
    codePoints: "1F468 200D 1F373",
    group: "People & Body",
    key: "manCook",
    sequenceType: "zwj",
    shortName: "man cook",
    unicodeSubGroup: "person-role",
  },
  manRunner: {
    codePoints: "1F3C3 200D 2642 FE0F",
    group: "People & Body",
    key: "manRunner",
    sequenceType: "zwj",
    shortName: "man running",
    unicodeSubGroup: "person-activity",
  },
  personCook: {
    codePoints: "1F9D1 200D 1F373",
    group: "People & Body",
    key: "personCook",
    sequenceType: "zwj",
    shortName: "cook",
    unicodeSubGroup: "person-role",
  },
  personRunning: {
    codePoints: "1F3C3",
    group: "People & Body",
    key: "personRunning",
    sequenceType: "single",
    shortName: "person running",
    unicodeSubGroup: "person-activity",
  },
  princess: {
    codePoints: "1F478",
    group: "People & Body",
    key: "princess",
    sequenceType: "single",
    shortName: "princess",
    unicodeSubGroup: "person-role",
  },
  redHairedPerson: {
    codePoints: "1F9D1 200D 1F9B0",
    group: "People & Body",
    key: "redHairedPerson",
    sequenceType: "zwj",
    shortName: "person: red hair",
    unicodeSubGroup: "person",
  },
  womanCook: {
    codePoints: "1F469 200D 1F373",
    group: "People & Body",
    key: "womanCook",
    sequenceType: "zwj",
    shortName: "woman cook",
    unicodeSubGroup: "person-role",
  },
  womanRunner: {
    codePoints: "1F3C3 200D 2640 FE0F",
    group: "People & Body",
    key: "womanRunner",
    sequenceType: "zwj",
    shortName: "woman running",
    unicodeSubGroup: "person-activity",
  },
} as const;

function applyEmojiState() {
  state.byId.replace(byId as Record<string, any>);
  state.emojiByKey.replace(emojiByKey);
  state.searchAnnotations.replace({
    childArtist: ["creative kid"],
    personCook: ["kitchen wizard"],
    redHairedPerson: ["ginger hair"],
  });
}

function createOptions(overrides: Partial<any> = {}) {
  return {
    allIds: Object.keys(byId),
    hairModifiers: [],
    includedVersionKeys: undefined,
    items: Object.values(byId),
    locale: "en-US",
    orderMode: "grouped",
    popularKeys: ["personRunning", "womanRunner", "personCook"],
    searchText: "",
    selectedGenders: [],
    selectedGroup: "",
    selectedSequenceType: "",
    selectedSubGroup: "",
    skinToneModifiers: [],
    subGroupSelectionKey: (group = "", subGroup = "") => `${group}::${subGroup}`,
    ...overrides,
  };
}

describe("emoji-filter", () => {
  afterEach(() => {
    state.byId.clear();
    state.searchAnnotations.clear();
    state.emojiByKey.clear();
  });

  it("derives male, female, and neutral genders from names and code points", () => {
    expect([...getEmojiGenders(byId.manRunner, emojiByKey)]).toEqual(["male"]);
    expect([...getEmojiGenders(byId.princess, emojiByKey)]).toEqual(["female"]);
    expect([...getEmojiGenders(byId.childArtist, emojiByKey)]).toEqual([
      "neutral",
    ]);
  });

  it("falls back to neutral when matching man and woman variants exist", () => {
    expect([...getEmojiGenders({ key: "cook" }, emojiByKey)]).toEqual([
      "neutral",
    ]);
  });

  it("filters emoji keys by keywords, versions, popularity, group, subgroup, modifiers, and genders", () => {
    applyEmojiState();

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "running",
        }),
      ),
    ).toEqual([
      "lightWomanRunner",
      "manRunner",
      "personRunning",
      "womanRunner",
    ]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "kitchen wizard",
        }),
      ),
    ).toEqual(["personCook"]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "running",
          includedVersionKeys: new Set(["personRunning", "womanRunner"]),
        }),
      ),
    ).toEqual(["personRunning", "womanRunner"]);

    expect(
      filterEmojiKeys(
        createOptions({
          orderMode: "popular",
        }),
      ),
    ).toEqual(["personCook", "personRunning", "womanRunner"]);

    expect(
      filterEmojiKeys(
        createOptions({
          selectedGroup: "People & Body",
          searchText: "cook",
        }),
      ),
    ).toEqual(["manCook", "personCook", "womanCook"]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "running",
          selectedSubGroup: "People & Body::person-activity",
        }),
      ),
    ).toEqual([
      "lightWomanRunner",
      "manRunner",
      "personRunning",
      "womanRunner",
    ]);

    expect(
      filterEmojiKeys(
        createOptions({
          orderMode: "sequence",
          searchText: "cook",
          selectedSequenceType: "zwj",
        }),
      ),
    ).toEqual(["manCook", "personCook", "womanCook"]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "running",
          skinToneModifiers: ["1F3FB"],
        }),
      ),
    ).toEqual(["lightWomanRunner"]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "ginger hair",
          hairModifiers: ["1F9B0"],
        }),
      ),
    ).toEqual(["redHairedPerson"]);

    expect(
      filterEmojiKeys(
        createOptions({
          searchText: "running",
          selectedGenders: ["female"],
        }),
      ),
    ).toEqual(["lightWomanRunner", "womanRunner"]);
  });
});
