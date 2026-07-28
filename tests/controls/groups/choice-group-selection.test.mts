import assert from "node:assert/strict";

import {
  isChoiceGroupItemDisabled,
  toggleChoiceGroupSelection,
} from "../../../src/controls/groups/choice-group-selection.js";

const requiredSelection = [
  { selected: true, value: "light" },
  { selected: false, value: "dark" },
];

assert.equal(
  isChoiceGroupItemDisabled(requiredSelection[0], requiredSelection, {
    maxSelectable: 1,
    minSelectable: 1,
  }),
  true,
);

assert.equal(
  isChoiceGroupItemDisabled(requiredSelection[1], requiredSelection, {
    maxSelectable: 1,
    minSelectable: 1,
  }),
  false,
);

const optionalSelection = [
  { ariaLabel: "Male", selected: false, value: "male" },
  { ariaLabel: "Female", selected: true, value: "female" },
  { ariaLabel: "Neutral", selected: false, value: "neutral" },
];

assert.deepEqual(
  toggleChoiceGroupSelection(optionalSelection, "female", {
    maxSelectable: 1,
    minSelectable: 0,
  }).map((item) => item.selected),
  [false, false, false],
);

assert.deepEqual(
  toggleChoiceGroupSelection(optionalSelection, "male", {
    maxSelectable: 1,
    minSelectable: 0,
  }).map((item) => item.selected),
  [true, false, false],
);

assert.equal(
  isChoiceGroupItemDisabled(
    { selected: false },
    optionalSelection,
    {
      maxSelectable: 1,
      minSelectable: 0,
    },
  ),
  false,
);

assert.equal(
  isChoiceGroupItemDisabled(
    { selected: false },
    [
      { selected: true },
      { selected: true },
      { selected: false },
    ],
    {
      maxSelectable: 2,
      minSelectable: 0,
    },
  ),
  true,
);

assert.equal(
  toggleChoiceGroupSelection(optionalSelection, "missing", {
    maxSelectable: 1,
    minSelectable: 0,
  }),
  optionalSelection,
);

assert.deepEqual(
  toggleChoiceGroupSelection(
    [
      { ariaLabel: "One", selected: true, value: "one" },
      { ariaLabel: "Two", selected: false, value: "two" },
      { ariaLabel: "Three", selected: false, value: "three" },
    ],
    "three",
    {
      maxSelectable: 3,
      minSelectable: 0,
    },
  ).map((item) => item.selected),
  [true, false, true],
);

assert.equal(
  isChoiceGroupItemDisabled(
    { selected: true },
    [
      { selected: true },
      { selected: false },
      { selected: false },
    ],
    {
      maxSelectable: 3,
      minSelectable: 0,
    },
  ),
  false,
);

assert.deepEqual(
  toggleChoiceGroupSelection(
    [
      { ariaLabel: "One", selected: true, value: "one" },
      { ariaLabel: "Two", selected: false, value: "two" },
    ],
    "one",
    {
      maxSelectable: 1,
      minSelectable: 1,
    },
  ).map((item) => item.selected),
  [true, false],
);

assert.equal(
  isChoiceGroupItemDisabled(
    { selected: false },
    [{ selected: true }, { selected: false }],
    {},
  ),
  false,
);
