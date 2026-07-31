import assert from "node:assert/strict";
import {
  getExplorerSubGroup,
  titleCase,
} from "../../src/explorer/category/category-rules.js";

const item = (subGroup: string, shortName: string, emoji = "") => ({
  emoji,
  shortName,
  subGroup,
});

assert.equal(titleCase("face-with-symbols"), "Face With Symbols");
assert.equal(titleCase(""), "");
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
assert.equal(getExplorerSubGroup(item("food-prepared", "sandwich")), "Prepared");
assert.equal(getExplorerSubGroup(item("animal-bug", "lady beetle")), "Bugs");
assert.equal(getExplorerSubGroup(item("animal-bird", "eagle")), "Birds");
assert.equal(getExplorerSubGroup(item("animal-mammal", "dog face")), "Mammals");
assert.equal(
  getExplorerSubGroup(item("animal-marine", "dolphin")),
  "Marine Animals",
);
assert.equal(getExplorerSubGroup(item("animal-reptile", "turtle")), "Reptiles");
assert.equal(getExplorerSubGroup(item("animal-amphibian", "frog")), "Amphibians");
assert.equal(getExplorerSubGroup(item("plant-flower", "rose")), "Flowers");
assert.equal(getExplorerSubGroup(item("plant-other", "herb")), "Other Plants");
assert.equal(getExplorerSubGroup(item("book-paper", "notebook")), "Books & Paper");
assert.equal(getExplorerSubGroup(item("clothing", "running shoe")), "Shoes");
assert.equal(
  getExplorerSubGroup(item("clothing", "billed cap")),
  "Hats & Headwear",
);
assert.equal(
  getExplorerSubGroup(item("clothing", "handbag")),
  "Accessories",
);
assert.equal(getExplorerSubGroup(item("clothing", "lab coat")), "Clothing");
assert.equal(getExplorerSubGroup(item("geometric", "large orange circle")), "Circles");
assert.equal(getExplorerSubGroup(item("geometric", "red triangle pointed up")), "Triangles");
assert.equal(getExplorerSubGroup(item("geometric", "small blue diamond")), "Diamonds");
assert.equal(getExplorerSubGroup(item("geometric", "black square button")), "Squares");
assert.equal(getExplorerSubGroup(item("geometric", "white parallelogram")), "Other Shapes");
assert.equal(getExplorerSubGroup(item("family", "family: man, woman, girl")), "Families");
assert.equal(getExplorerSubGroup(item("family", "kiss: woman, man")), "Kissing Couples");
assert.equal(getExplorerSubGroup(item("family", "women holding hands")), "Holding Hands");
assert.equal(getExplorerSubGroup(item("person", "baby")), "Children");
assert.equal(getExplorerSubGroup(item("person", "man")), "Adults");
assert.equal(
  getExplorerSubGroup(item("person-role", "woman astronaut")),
  "Travel & Space",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "man health worker")),
  "Care & Health",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "artist")),
  "Creative & Technical",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "teacher")),
  "Education & Office",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "judge")),
  "Safety & Justice",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "farmer")),
  "Trades & Service",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "prince")),
  "Royalty",
);
assert.equal(
  getExplorerSubGroup(item("person-role", "person wearing turban")),
  "Cultural & Formal Wear",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person swimming")),
  "Water Sports",
);
assert.equal(
  getExplorerSubGroup(item("person-activity", "person in manual wheelchair")),
  "Accessibility & Mobility",
);
assert.equal(
  getExplorerSubGroup(item("person-activity", "person getting haircut")),
  "Personal Care & Rest",
);
assert.equal(
  getExplorerSubGroup(item("person-activity", "man dancing")),
  "Dance",
);
assert.equal(
  getExplorerSubGroup(item("person-activity", "person standing")),
  "Poses",
);
assert.equal(
  getExplorerSubGroup(item("person-activity", "person walking")),
  "Movement",
);
assert.equal(
  getExplorerSubGroup(item("person-fantasy", "Mrs. Claus")),
  "Holiday & Angels",
);
assert.equal(
  getExplorerSubGroup(item("person-fantasy", "mage")),
  "Magic",
);
assert.equal(
  getExplorerSubGroup(item("person-fantasy", "superhero")),
  "Heroes & Villains",
);
assert.equal(
  getExplorerSubGroup(item("person-fantasy", "merperson")),
  "Merpeople",
);
assert.equal(
  getExplorerSubGroup(item("person-fantasy", "zombie")),
  "Monsters & Undead",
);
assert.equal(
  getExplorerSubGroup(item("person-gesture", "deaf woman")),
  "Accessibility",
);
assert.equal(
  getExplorerSubGroup(item("person-gesture", "person shrugging")),
  "Reactions",
);
assert.equal(
  getExplorerSubGroup(item("person-gesture", "person tipping hand")),
  "Signals & Greetings",
);
assert.equal(
  getExplorerSubGroup(item("person-gesture", "person bowing")),
  "Respect & Apology",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person mountain biking")),
  "Cycling",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person golfing")),
  "Ball Sports",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person lifting weights")),
  "Fitness & Skills",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person snowboarding")),
  "Winter Sports",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "people wrestling")),
  "Competition",
);
assert.equal(
  getExplorerSubGroup(item("person-sport", "person running")),
  "Running & Movement",
);
assert.equal(
  getExplorerSubGroup(item("family", "couple with heart")),
  "Couples with Heart",
);
assert.equal(
  getExplorerSubGroup(item("mystery-group", "unknown thing")),
  "Mystery Group",
);
