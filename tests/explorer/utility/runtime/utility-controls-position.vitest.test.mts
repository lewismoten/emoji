import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  installUtilityDom,
  loadUtilityControlsModule,
} from "./utility-controls-fixture.mjs";

describe("utility-controls-position", () => {
  it("delegates favorite button layout through the title controls helper", async () => {
    const dom = installUtilityDom();

    try {
      const { module, titleStub } = await loadUtilityControlsModule();

      module.positionFavoriteButton();
      assert.deepEqual(titleStub.calls[0], [
        "positionFavoriteButton",
        {
          compact: true,
          dialogControls: dom.dialogControls,
          dialogTitleRow: { kind: "dialog-title-row-element" },
          favoriteButton: { kind: "favorite-button-element" },
        },
      ]);
    } finally {
      dom.restore();
    }
  });
});
