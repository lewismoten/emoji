import assert from "node:assert/strict";

import {
  applyLanguagePanelParent,
  getLanguagePanelParent,
} from "../../../src/explorer/navigation/panel-parent.js";

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
