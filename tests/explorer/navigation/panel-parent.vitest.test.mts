import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  applyLanguagePanelParent,
  getLanguagePanelParent,
} from "../../../src/explorer/navigation/panel-parent.js";

describe("panel-parent", () => {
  it("tracks the help parent for the language panel", () => {
    const dialogs = {
      language: {
        dataset: {} as Record<string, string | undefined>,
      },
    };

    applyLanguagePanelParent(dialogs, "language", "help");
    assert.equal(dialogs.language.dataset.returnPanel, "help");
    assert.equal(getLanguagePanelParent(dialogs, "language"), "help");

    applyLanguagePanelParent(dialogs, "help", "help");
    assert.equal(dialogs.language.dataset.returnPanel, undefined);
    assert.equal(getLanguagePanelParent(dialogs, "language"), "");
    assert.equal(getLanguagePanelParent(dialogs, "help"), "");
    assert.equal(getLanguagePanelParent({}, "language"), "");
    assert.doesNotThrow(() => applyLanguagePanelParent({}, "language", "help"));

    const noDatasetDialogs = {
      language: {},
    };

    assert.doesNotThrow(() =>
      applyLanguagePanelParent(noDatasetDialogs, "language", "help"),
    );
  });
});
