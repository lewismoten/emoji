import { describe, expect, it } from "vitest";

import * as state from "../../src/state.js";
import {
  canAccessAdvanced,
  canAccessDeveloper,
  isAdvanced,
  isDeveloper,
  isStandard,
} from "../../src/auth.js";

describe("auth", () => {
  it("derives access flags from the explorer mode", () => {
    state.explorerModeFromUrl.set("standard");
    state.developerModeUrlDismissed.set(false);
    expect(isStandard()).toBe(true);
    expect(isAdvanced()).toBe(false);
    expect(isDeveloper()).toBe(false);
    expect(canAccessAdvanced()).toBe(false);
    expect(canAccessDeveloper()).toBe(false);

    state.explorerModeFromUrl.set("advanced");
    expect(isStandard()).toBe(false);
    expect(isAdvanced()).toBe(true);
    expect(isDeveloper()).toBe(false);
    expect(canAccessAdvanced()).toBe(true);
    expect(canAccessDeveloper()).toBe(false);

    state.explorerModeFromUrl.set("developer");
    expect(isDeveloper()).toBe(true);
    expect(canAccessDeveloper()).toBe(true);
  });
});
