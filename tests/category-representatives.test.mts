import assert from "node:assert/strict";
import { buildCategoryRepresentatives } from "../src/category-representatives.js";

const result = buildCategoryRepresentatives({
  groups: ["Smileys & Emotion", "Animals & Nature", "Flags"],
  items: [
    {
      key: "smile",
      emoji: "😀",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      order: 5,
    },
    {
      key: "grin",
      emoji: "😁",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      order: 2,
    },
    {
      key: "heartEyes",
      emoji: "😍",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-affection",
      order: 3,
    },
    {
      key: "meltingFace",
      emoji: "🫠",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
      order: 1,
    },
    {
      key: "bear",
      emoji: "🐻",
      group: "Animals & Nature",
      unicodeSubGroup: "animal-mammal",
      order: 10,
    },
    {
      key: "rabbit",
      emoji: "🐰",
      group: "Animals & Nature",
      unicodeSubGroup: "animal-mammal",
      order: 0,
    },
    {
      key: "sunflower",
      emoji: "🌻",
      group: "Animals & Nature",
      unicodeSubGroup: "plant-flower",
      order: 7,
    },
    {
      key: "blackFlag",
      emoji: "🏴",
      group: "Flags",
      unicodeSubGroup: "flag",
      order: 4,
    },
  ],
  proposedVersions: [{ version: "18.0" }],
  releasedVersions: [{ version: "1.0" }, { version: "15.0" }],
  subGroupKey: (group: string, subGroup: string) => `${group}::${subGroup}`,
  subGroups: {
    "Smileys & Emotion": ["face-smiling", "face-affection"],
    "Animals & Nature": ["animal-mammal", "plant-flower"],
    Flags: ["flag"],
  },
  versionKeys: new Map<string, Set<string>>([
    ["1.0", new Set(["grin", "heartEyes", "bear", "blackFlag"])],
    ["15.0", new Set(["rabbit", "sunflower"])],
    ["18.0", new Set(["meltingFace"])],
  ]),
});

assert.equal(
  result.subGroups.get("Smileys & Emotion::face-smiling"),
  "😁",
);
assert.equal(
  result.subGroups.get("Smileys & Emotion::face-affection"),
  "😍",
);
assert.equal(
  result.subGroups.get("Animals & Nature::animal-mammal"),
  "🐻",
);
assert.equal(
  result.subGroups.get("Animals & Nature::plant-flower"),
  "🌻",
);
assert.equal(result.subGroups.get("Flags::flag"), "🏴");

assert.equal(result.groups.get("Smileys & Emotion"), "🫠");
assert.equal(result.groups.get("Animals & Nature"), "🐰");
assert.equal(result.groups.get("Flags"), "🏴");

const withUngroupedCandidate = buildCategoryRepresentatives({
  groups: ["Objects"],
  items: [
    {
      key: "mailbox",
      emoji: "📫",
      group: "Objects",
      unicodeSubGroup: "mail",
    },
    {
      key: "computerDisk",
      emoji: "💽",
      group: "Objects",
      unicodeSubGroup: "computer",
    },
    {
      key: "memo",
      emoji: "📝",
      group: "Objects",
      unicodeSubGroup: "mail",
    },
  ],
  proposedVersions: [],
  releasedVersions: [{ version: "1.0" }],
  subGroupKey: (group: string, subGroup: string) => `${group}::${subGroup}`,
  subGroups: {
    Objects: ["mail"],
  },
  versionKeys: new Map<string, Set<string>>([
    ["1.0", new Set(["memo", "computerDisk", "mailbox"])],
  ]),
});

assert.equal(withUngroupedCandidate.subGroups.get("Objects::mail"), "📫");
assert.equal(withUngroupedCandidate.groups.get("Objects"), "💽");

const withOrderFallback = buildCategoryRepresentatives({
  groups: ["Travel & Places"],
  items: [
    {
      key: "rocket",
      emoji: "🚀",
      group: "Travel & Places",
      unicodeSubGroup: "transport-air",
      order: 8,
    },
    {
      key: "airplane",
      emoji: "✈️",
      group: "Travel & Places",
      unicodeSubGroup: "transport-air",
      order: 1,
    },
  ],
  proposedVersions: [],
  releasedVersions: [],
  subGroupKey: (group: string, subGroup: string) => `${group}::${subGroup}`,
  subGroups: {
    "Travel & Places": ["transport-air"],
  },
  versionKeys: new Map(),
});

assert.equal(
  withOrderFallback.subGroups.get("Travel & Places::transport-air"),
  "✈️",
);
assert.equal(withOrderFallback.groups.get("Travel & Places"), "🚀");
