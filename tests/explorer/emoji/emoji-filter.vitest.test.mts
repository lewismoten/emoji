import { afterEach, describe, expect, it } from "vitest";

import { filterEmojiKeys, getEmojiGenders } from "../../../src/explorer/emoji/emoji-filter.js";
import * as state from "../../../src/state.js";

describe("emoji-filter", () => {
  afterEach(() => {
    state.byId.replace({});
    state.searchAnnotations.replace({});
    state.emojiByKey.replace({});
  });

  it("filters emoji keys by keywords, categories, modifiers, and genders", () => {
    const emojiByKey = {
      manRunner: "🏃‍♂️",
      personRunning: "🏃",
      womanRunner: "🏃‍♀️",
      manMage: "🧙‍♂️",
      womanMage: "🧙‍♀️",
    };
    const byId = {
      manRunner: {
        codePoints: "1F3C3 200D 2642 FE0F",
        group: "People & Body",
        key: "manRunner",
        sequenceType: "zwj",
        shortName: "man running",
        unicodeSubGroup: "person-activity",
      },
      personRunning: {
        codePoints: "1F3C3",
        group: "People & Body",
        key: "personRunning",
        sequenceType: "single",
        shortName: "person running",
        unicodeSubGroup: "person-activity",
      },
      womanRunner: {
        codePoints: "1F3C3 200D 2640 FE0F",
        group: "People & Body",
        key: "womanRunner",
        sequenceType: "zwj",
        shortName: "woman running",
        unicodeSubGroup: "person-activity",
      },
      lightWomanRunner: {
        codePoints: "1F3C3 1F3FB 200D 2640 FE0F",
        group: "People & Body",
        key: "lightWomanRunner",
        sequenceType: "zwj",
        shortName: "woman running: light skin tone",
        unicodeSubGroup: "person-activity",
      },
      redHairedPerson: {
        codePoints: "1F9D1 200D 1F9B0",
        group: "People & Body",
        key: "redHairedPerson",
        sequenceType: "zwj",
        shortName: "person: red hair",
        unicodeSubGroup: "person",
      },
      personMage: {
        codePoints: "1F9D9",
        group: "People & Body",
        key: "personMage",
        sequenceType: "single",
        shortName: "mage",
        unicodeSubGroup: "person-fantasy",
      },
    } as any;
    state.byId.replace(byId);
    state.emojiByKey.replace(emojiByKey);
    state.searchAnnotations.replace({});
    const options = {
      allIds: Object.keys(byId),
      hairModifiers: [],
      includedVersionKeys: undefined,
      items: Object.values(byId),
      orderMode: "grouped",
      popularKeys: ["personRunning", "womanRunner"],
      searchText: "running",
      selectedGenders: [],
      selectedGroup: "",
      selectedSequenceType: "",
      selectedSubGroup: "",
      skinToneModifiers: [],
      subGroupSelectionKey: (group = "", subGroup = "") => `${group}::${subGroup}`,
    };

    expect(filterEmojiKeys(options as any)).toEqual([
      "manRunner",
      "personRunning",
      "womanRunner",
      "lightWomanRunner",
    ]);
    expect([...getEmojiGenders(byId.personRunning, emojiByKey)]).toEqual([
      "neutral",
    ]);
  });
});
