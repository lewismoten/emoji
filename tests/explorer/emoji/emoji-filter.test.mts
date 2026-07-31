import assert from "node:assert/strict";
import {
  filterEmojiKeys,
  getEmojiGenders,
} from "../../../src/explorer/emoji/emoji-filter.js";

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
};
const options = {
  allIds: Object.keys(byId),
  byId,
  emojiByKey,
  hairModifiers: [],
  includedVersionKeys: undefined,
  items: Object.values(byId),
  orderMode: "grouped",
  popularKeys: ["personRunning", "womanRunner"],
  searchAnnotations: {},
  searchText: "running",
  selectedGenders: [],
  selectedGroup: "",
  selectedSequenceType: "",
  selectedSubGroup: "",
  skinToneModifiers: [],
  subGroupSelectionKey: (group = "", subGroup = "") => `${group}::${subGroup}`,
};

assert.deepEqual(filterEmojiKeys(options), [
  "manRunner",
  "personRunning",
  "womanRunner",
  "lightWomanRunner",
]);
assert.deepEqual(filterEmojiKeys({ ...options, selectedGenders: ["female"] }), [
  "womanRunner",
  "lightWomanRunner",
]);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    selectedSequenceType: "zwj",
    orderMode: "sequence",
  }),
  ["manRunner", "womanRunner", "lightWomanRunner"],
);
assert.deepEqual(
  [...getEmojiGenders(byId.personRunning, emojiByKey)],
  ["neutral"],
);
assert.deepEqual([...getEmojiGenders(byId.manRunner, emojiByKey)], ["male"]);
assert.deepEqual([...getEmojiGenders(byId.womanRunner, emojiByKey)], ["female"]);
assert.deepEqual([...getEmojiGenders(byId.personMage, emojiByKey)], []);

assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "light skin",
  }),
  ["lightWomanRunner"],
);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "",
    includedVersionKeys: new Set(["personRunning", "womanRunner"]),
  }),
  ["personRunning", "womanRunner"],
);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "",
    orderMode: "popular",
  }),
  ["personRunning", "womanRunner"],
);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "",
    selectedGroup: "People & Body",
    selectedSubGroup: "People & Body::person-activity",
  }),
  ["manRunner", "personRunning", "womanRunner", "lightWomanRunner"],
);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "",
    skinToneModifiers: ["1F3FB"],
  }),
  ["lightWomanRunner"],
);
assert.deepEqual(
  filterEmojiKeys({
    ...options,
    searchText: "",
    hairModifiers: ["1F9B0"],
  }),
  ["redHairedPerson"],
);
