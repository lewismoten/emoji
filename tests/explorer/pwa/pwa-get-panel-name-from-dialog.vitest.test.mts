import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { getPanelNameFromDialog } from "../../../src/explorer/pwa/pwa-get-panel-name-from-dialog.js";

describe("pwa-get-panel-name-from-dialog", () => {
  it("maps known dialog class names to panel names", () => {
    const dialog = (className: string) =>
      ({
        classList: {
          contains(token: string) {
            return className.split(" ").includes(token);
          },
        },
      }) as HTMLDialogElement;

    assert.equal(getPanelNameFromDialog(dialog("saved-dialog")), "favorites");
    assert.equal(getPanelNameFromDialog(dialog("help-dialog")), "help");
    assert.equal(getPanelNameFromDialog(dialog("language-dialog")), "language");
    assert.equal(
      getPanelNameFromDialog(dialog("advanced-filters-dialog")),
      "filters",
    );
    assert.equal(getPanelNameFromDialog(dialog("other")), "");
    assert.equal(getPanelNameFromDialog(null), "");
  });
});
