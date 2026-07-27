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
