import { afterEach, describe, expect, it } from "vitest";

import * as state from "../src/state.js";
import {
  clearIncludedVersionKeyCache,
  getIncludedVersionKeys,
  getSelectedVersion,
  getSelectedVersionMode,
  getVersionKeysFor,
  setSelectedVersion,
  setSelectedVersionMode,
  setVersionCatalog,
} from "../src/version-keys.js";

describe("version-keys", () => {
  afterEach(() => {
    state.proposedVersionManifests.replace([]);
    state.releasedIds.replace(new Set());
    state.selectedVersion.set("");
    state.selectedVersionMode.set("through");
    state.versionKeys.replace(new Map());
    state.versionManifests.replace([]);
    clearIncludedVersionKeyCache();
  });

  it("stores version catalogs and resolves selected and cumulative keys", () => {
    setVersionCatalog({
      proposed: [{ version: "18.0" }],
      released: [{ version: "15.0" }, { version: "16.0" }],
      versionKeys: new Map<string, Set<string>>([
        ["15.0", new Set(["wave"])],
        ["16.0", new Set(["shakingFace"])],
        ["18.0", new Set(["draftFace"])],
      ]),
    });
    state.releasedIds.replace(new Set(["wave", "shakingFace"]));

    expect([...getVersionKeysFor("15.0")]).toEqual(["wave"]);
    expect([...getVersionKeysFor("16.0")]).toEqual(["shakingFace"]);
    expect([...getVersionKeysFor("18.0")]).toEqual(["draftFace"]);
    expect(getSelectedVersion()).toBe("16.0");
    expect(getSelectedVersionMode()).toBe("through");

    setSelectedVersionMode("selected");
    expect([...getIncludedVersionKeys()]).toEqual(["shakingFace"]);

    setSelectedVersionMode("through");
    setSelectedVersion("18.0");
    expect([...getIncludedVersionKeys()]).toEqual([
      "wave",
      "shakingFace",
      "draftFace",
    ]);
  });

  it("falls back to released ids when raw version keys are unavailable", () => {
    state.releasedIds.replace(new Set(["wave"]));

    expect([...getIncludedVersionKeys()]).toEqual(["wave"]);
  });
});
