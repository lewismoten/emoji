import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { getPanelDialog } from "../../../src/explorer/pwa/pwa-get-panel-dialog.js";

describe("pwa-get-panel-dialog", () => {
  it("returns the requested dialog when present", () => {
    const help = {} as HTMLDialogElement;
    const dialogs = {
      favorites: undefined,
      filters: undefined,
      help,
      language: undefined,
    };

    assert.equal(getPanelDialog("help", dialogs), help);
    assert.equal(getPanelDialog("", dialogs), undefined);
    assert.equal(getPanelDialog("filters", undefined), undefined);
  });
});
