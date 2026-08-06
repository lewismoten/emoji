import { describe, expect, it } from "vitest";

import { unique } from "../../src/utils/lists.js";

describe("utils/lists", () => {
  it("removes duplicates while ignoring undefined values", () => {
    expect(unique("dialog", undefined, "dialog", "musical")).toEqual([
      "dialog",
      "musical",
    ]);
    expect(unique<number>(1, 2, 1, undefined, 3)).toEqual([1, 2, 3]);
  });
});
