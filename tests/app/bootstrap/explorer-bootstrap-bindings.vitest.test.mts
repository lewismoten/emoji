import { describe, expect, it } from "vitest";

import {
  assignExplorerBootstrapControls,
  assignExplorerBootstrapElements,
  assignExplorerBootstrapFieldsets,
  createExplorerBootstrapBindings,
} from "../../../src/app/bootstrap/explorer-bootstrap-bindings.js";

describe("explorer bootstrap bindings", () => {
  it("creates default bindings and assigns control/element/fieldset values", () => {
    const bindings = createExplorerBootstrapBindings();

    expect(bindings.searchText).toBeUndefined();
    expect(bindings.languageDialog).toBeUndefined();
    expect(bindings.emojiFontChoices).toEqual([]);
    expect(bindings.themeChoices).toEqual([]);
    expect(bindings.listRenderGeneration).toBe(0);
    expect(bindings.urlStateReady).toBe(false);
    expect(bindings.applyingUrlState).toBe(false);
    expect(bindings.suppressDialogCloseSync).toBe(false);
    expect(bindings.suppressedPanelCloses).toBeInstanceOf(WeakSet);

    for (const key of [
      "drawList",
      "loadVersionData",
      "loadSearchLanguages",
      "renderSearchLanguages",
      "renderCategoryFilters",
      "renderVersionModeToggle",
      "setEmojiDialogView",
      "syncUrlState",
      "syncVersionRange",
      "showEmoji",
      "navigateEmoji",
      "updateDialogNavigation",
      "updateCompositionBackButton",
      "focusInitialEmojiDialogAction",
      "populateVersionModeOptions",
      "toggleVersionMode",
      "revealExplorer",
      "resetFilters",
    ] as const) {
      expect(bindings[key]).toBeTypeOf("function");
      expect(() => bindings[key]()).not.toThrow();
    }

    const controlValues = {
      searchText: { id: "search" },
      drawList: () => "drawn",
    };
    assignExplorerBootstrapControls(bindings, controlValues);
    expect(bindings.searchText).toBe(controlValues.searchText);
    expect(bindings.drawList()).toBe("drawn");

    const elementValues = {
      helpDialog: { id: "help" },
      savedDialog: { id: "saved" },
    };
    assignExplorerBootstrapElements(bindings, elementValues);
    expect(bindings.helpDialog).toBe(elementValues.helpDialog);
    expect(bindings.savedDialog).toBe(elementValues.savedDialog);

    const fieldsetValues = {
      skinToneFieldset: { id: "skin" },
      hairFieldset: { id: "hair" },
      genderFieldset: { id: "gender" },
    };
    assignExplorerBootstrapFieldsets(bindings, fieldsetValues);
    expect(bindings.skinToneFieldset).toBe(fieldsetValues.skinToneFieldset);
    expect(bindings.hairFieldset).toBe(fieldsetValues.hairFieldset);
    expect(bindings.genderFieldset).toBe(fieldsetValues.genderFieldset);
  });
});
