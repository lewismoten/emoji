import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  applyExclusiveCheckboxSelection,
  stepVersionIndex,
} from "../../../../src/explorer/filters/filter-controls.js";

describe("filter-controls-basic", () => {
  it("handles exclusive checkbox selection and version stepping", () => {
    const checkboxes = [
      { checked: false, value: "male" },
      { checked: true, value: "female" },
      { checked: false, value: "neutral" },
    ];

    applyExclusiveCheckboxSelection(checkboxes, checkboxes[1]);
    assert.deepEqual(
      checkboxes.map((checkbox) => checkbox.checked),
      [false, true, false],
    );

    checkboxes[2].checked = true;
    applyExclusiveCheckboxSelection(checkboxes, checkboxes[2]);
    assert.deepEqual(
      checkboxes.map((checkbox) => checkbox.checked),
      [false, false, true],
    );

    checkboxes[2].checked = false;
    applyExclusiveCheckboxSelection(checkboxes, checkboxes[2]);
    assert.deepEqual(
      checkboxes.map((checkbox) => checkbox.checked),
      [false, false, false],
    );

    assert.equal(stepVersionIndex(3, 10, 2), 5);
    assert.equal(stepVersionIndex(3, 10, -5), 0);
    assert.equal(stepVersionIndex(8, 10, 4), 9);
  });
});
