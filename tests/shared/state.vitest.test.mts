import { afterEach, describe, expect, it, vi } from "vitest";

import * as state from "../../src/state.js";

describe("state", () => {
  afterEach(() => {
    state.availableCategoryKeys.replace(new Set<string>());
    state.explorerModeFromUrl.set(undefined);
    state.developerModeUrlDismissed.set(false);
    vi.restoreAllMocks();
  });

  it("clears and replaces shared set state", () => {
    state.availableCategoryKeys.replace(new Set(["people", "nature"]));
    expect([...state.availableCategoryKeys.get()]).toEqual([
      "people",
      "nature",
    ]);
    expect(state.availableCategoryKeys.first()).toBe("people");

    state.availableCategoryKeys.clear();
    expect([...state.availableCategoryKeys.get()]).toEqual([]);
  });

  it("prefers dataset explorer mode, then url mode, then preferences, then standard", async () => {
    const documentUtils = await import("../../src/utils/document.js");
    const preferences = await import("../../src/preferences.js");

    const getData = vi.spyOn(documentUtils, "getData");
    const getString = vi.spyOn(preferences, "getString");

    getData.mockReturnValue("developer");
    expect(state.getExplorerMode()).toBe("developer");

    getData.mockReturnValue("not-a-mode");
    state.explorerModeFromUrl.set("advanced");
    state.developerModeUrlDismissed.set(false);
    expect(state.getExplorerMode()).toBe("advanced");

    state.developerModeUrlDismissed.set(true);
    getString.mockReturnValue("developer");
    expect(state.getExplorerMode()).toBe("developer");

    getString.mockReturnValue("unknown");
    expect(state.getExplorerMode()).toBe("standard");
  });

  it("normalizes unsupported order modes", () => {
    state.orderMode.set("popular" as never);
    expect(state.orderMode.get()).toBe("grouped");

    state.orderMode.set("sequence");
    expect(state.orderMode.get()).toBe("sequence");
  });
});
