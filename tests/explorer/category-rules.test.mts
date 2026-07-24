import assert from "node:assert/strict";
import {
  getExplorerSubGroup,
  titleCase,
} from "../../src/explorer/category-rules.js";

const item = (subGroup: string, shortName: string, emoji = "") => ({
  emoji,
  shortName,
  subGroup,
});

assert.equal(titleCase("face-with-symbols"), "Face With Symbols");
assert.equal(
  getExplorerSubGroup(item("country-flag", "flag: United States", "🇺🇸")),
  "North America",
);
assert.equal(
  getExplorerSubGroup(item("country-flag", "flag: unknown", "🏳️")),
  "Other Flags",
);
assert.equal(getExplorerSubGroup(item("food-asian", "sushi")), "Asian");
assert.equal(getExplorerSubGroup(item("food-fruit", "red apple")), "Fruit");
assert.equal(
  getExplorerSubGroup(item("animal-marine", "dolphin")),
  "Marine Animals",
);
assert.equal(getExplorerSubGroup(item("plant-flower", "rose")), "Flowers");
assert.equal(getExplorerSubGroup(item("clothing", "running shoe")), "Shoes");
assert.equal(
  getExplorerSubGroup(item("clothing", "billed cap")),
  "Hats & Headwear",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "woman astronaut")),
  "Travel & Space",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person swimming")),
  "Water Sports",
);
assert.equal(
  getExplorerSubGroup(item("family", "couple with heart")),
  "Couples with Heart",
);
