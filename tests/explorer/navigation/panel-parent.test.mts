import assert from "node:assert/strict";

import {
  applyLanguagePanelParent,
} from "../../../src/explorer/navigation/panel-parent.js";

const dialogs = {
  language: {
    dataset: {} as Record<string, string | undefined>,
  },
};

applyLanguagePanelParent(dialogs, "language", "help");
assert.equal(dialogs.language.dataset.returnPanel, "help");

applyLanguagePanelParent(dialogs, "help", "help");
assert.equal(dialogs.language.dataset.returnPanel, undefined);
assert.doesNotThrow(() => applyLanguagePanelParent({}, "language", "help"));
