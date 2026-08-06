import { describe, expect, it } from "vitest";

import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapShellOptions,
} from "../../../../src/app/bootstrap/explorer-bootstrap-options.js";
import { createBootstrapOptionsFixture } from "./explorer-bootstrap-options-fixture.js";

describe("explorer bootstrap option builders", () => {
  it("builds shell and controller option wrappers", () => {
    const { calls, options } = createBootstrapOptionsFixture();

    const shell = buildExplorerBootstrapShellOptions(options);
    expect(shell.normalizeCodePoints).toBe(options.normalizeCodePoints);
    expect(shell.translate).toBe(options.translate);
    expect(shell.modeChoices()).toBe("modeChoices-value");
    for (const [key, expected] of [
      ["applyingUrlState", "applyingUrlState-value"],
      ["copyStatus", "copyStatus-value"],
      ["developerModeToggle", "developerModeToggle-value"],
      ["dialog", "dialog-value"],
      ["drawList", "drawList-value"],
      ["emojiFontChoices", "emojiFontChoices-value"],
      ["genderCheckboxes", "genderCheckboxes-value"],
      ["getPixelEditor", "getPixelEditor-value"],
      ["hairCheckboxes", "hairCheckboxes-value"],
      ["installAppButton", "installAppButton-value"],
      ["installDialog", "installDialog-value"],
      ["loadVersionData", "loadVersionData-value"],
      ["offlineStatus", "offlineStatus-value"],
      ["orderButtons", "orderButtons-value"],
      ["renderCategoryFilters", "renderCategoryFilters-value"],
      ["renderSearchLanguages", "renderSearchLanguages-value"],
      ["renderVersionModeToggle", "renderVersionModeToggle-value"],
      ["savedDialog", "savedDialog-value"],
      ["skinToneCheckboxes", "skinToneCheckboxes-value"],
      ["suppressDialogCloseSync", "suppressDialogCloseSync-value"],
      ["syncVersionRange", "syncVersionRange-value"],
      ["themeChoices", "themeChoices-value"],
      ["urlStateReady", "urlStateReady-value"],
      ["versionModeSelector", "versionModeSelector-value"],
      ["versionSelector", "versionSelector-value"],
    ] as const) {
      expect(shell[key]()).toBe(expected);
    }
    expect(calls.some((call) => call[0] === "state" && call[1].length === 0)).toBe(
      false,
    );
    shell.setDialogView("code", false);
    shell.showEmoji("wrappedGift", true);
    shell.syncUrlState("replace", { ok: true });
    expect(calls.slice(-3)).toEqual([
      ["setDialogView", ["code", false]],
      ["showEmoji", ["wrappedGift", true]],
      ["syncUrlState", ["replace", { ok: true }]],
    ]);
    expect(shell.translate("group", "Group")).toBe("translate-value");

    const controller = buildExplorerBootstrapControllerOptions(options);
    expect(controller.animateCopy).toBe(options.animateCopy);
    expect(controller.applyPixelArtworkClass).toBe(
      options.applyPixelArtworkClass,
    );
    expect(controller.fullDeveloperModeEnabled()).toBe(
      "fullDeveloperModeEnabled-value",
    );
    expect(controller.sequenceTranslationKeys).toBe(
      options.sequenceTranslationKeys,
    );
    expect(controller.unassigned).toBe("\u0000");
    for (const [key, expected] of [
      ["activeFilterSummary", "activeFilterSummary-value"],
      ["activeFilterText", "activeFilterText-value"],
      ["applyingUrlState", "applyingUrlState-value"],
      ["compactGroupChoices", "compactGroupChoices-value"],
      ["compactGroupLabel", "compactGroupLabel-value"],
      ["compactSequenceChoices", "compactSequenceChoices-value"],
      ["compactSequenceLabel", "compactSequenceLabel-value"],
      ["compactSubGroupChoices", "compactSubGroupChoices-value"],
      ["compactSubGroupLabel", "compactSubGroupLabel-value"],
      ["groupSelector", "groupSelector-value"],
      ["dialog", "dialog-value"],
      ["drawList", "drawList-value"],
      ["emojiList", "emojiList-value"],
      ["emojiParent", "emojiParent-value"],
      ["ensurePixelEditor", "ensurePixelEditor-value"],
      ["focusInitialEmojiDialogAction", "focusInitialEmojiDialogAction-value"],
      ["getPixelEditor", "getPixelEditor-value"],
      ["genderCheckboxes", "genderCheckboxes-value"],
      ["genderFieldset", "genderFieldset-value"],
      ["groupFilterDialog", "groupFilterDialog-value"],
      ["groupPickerTrigger", "groupPickerTrigger-value"],
      ["hairCheckboxes", "hairCheckboxes-value"],
      ["hairFieldset", "hairFieldset-value"],
      ["helpDialog", "helpDialog-value"],
      ["languageList", "languageList-value"],
      ["matchCount", "matchCount-value"],
      ["modifierFilters", "modifierFilters-value"],
      ["nextRenderGeneration", "nextRenderGeneration-value"],
      ["orderButtons", "orderButtons-value"],
      ["panelDialogs", "panelDialogs-value"],
      ["renderCategoryFilters", "renderCategoryFilters-value"],
      ["renderVersionModeToggle", "renderVersionModeToggle-value"],
      ["resetFilters", "resetFilters-value"],
      ["revealExplorer", "revealExplorer-value"],
      ["renderGeneration", "renderGeneration-value"],
      ["searchText", "searchText-value"],
      ["sequenceTypeSelector", "sequenceTypeSelector-value"],
      ["skinToneCheckboxes", "skinToneCheckboxes-value"],
      ["skinToneFieldset", "skinToneFieldset-value"],
      ["subGroupFilterDialog", "subGroupFilterDialog-value"],
      ["subGroupPickerTrigger", "subGroupPickerTrigger-value"],
      ["subGroupSelector", "subGroupSelector-value"],
      ["suppressedPanelCloses", "suppressedPanelCloses-value"],
      ["urlStateReady", "urlStateReady-value"],
      ["versionModeSelector", "versionModeSelector-value"],
      ["versionNext", "versionNext-value"],
      ["versionPrevious", "versionPrevious-value"],
      ["versionRange", "versionRange-value"],
      ["versionRangeValue", "versionRangeValue-value"],
      ["versionSelector", "versionSelector-value"],
    ] as const) {
      expect(controller[key]()).toBe(expected);
    }
    expect(controller.getEmojiGenders("item")).toBe("getEmojiGenders-value");
    expect(controller.getExplorerSubGroup("item")).toBe(
      "getExplorerSubGroup-value",
    );
    expect(controller.getIntroducedVersion("item")).toBe(
      "getIntroducedVersion-value",
    );
    expect(controller.renderVersionModeToggle()).toBe(
      "renderVersionModeToggle-value",
    );
    expect(controller.resetFilters()).toBe("resetFilters-value");
    expect(controller.loadPackageManifest()).toBe("loadPackageManifest-value");
    expect(controller.recordCopiedEmoji()).toBe("recordCopiedEmoji-value");
    expect(controller.rebuildEmojiCodePointLookup()).toBe(
      "rebuildEmojiCodePointLookup-value",
    );
    expect(controller.renderSavedEmoji()).toBe("renderSavedEmoji-value");
    expect(controller.updateEmojiComposition()).toBe(
      "updateEmojiComposition-value",
    );
    expect(controller.updateEmojiImportExamples()).toBe(
      "updateEmojiImportExamples-value",
    );
    expect(controller.updateModifierArtwork()).toBe(
      "updateModifierArtwork-value",
    );
    expect(controller.updatePixelArtworkManifest()).toBe(
      "updatePixelArtworkManifest-value",
    );
    expect(controller.translate("copy", "Copy")).toBe("translate-value");
    expect(controller.animateCopy()).toBe("animateCopy-value");
    expect(controller.copyToClipboardValue()).toBe("copyToClipboardValue-value");
    expect(controller.developerModeEnabled()).toBe("developerModeEnabled-value");
    expect(controller.displayExplorerLabel("x")).toBe(
      "displayExplorerLabel-value",
    );
    expect(controller.formatNumber(12)).toBe("formatNumber-value");
    expect(controller.isViteDevelopment).toBe(true);
    controller.navigateEmoji(2);
    controller.openPanel("favorites");
    controller.setDialogView("details");
    controller.setSuppressDialogCloseSync(true);
    controller.showEmoji("partyPopper", false);
    controller.updateCompositionBackButton("left");
    controller.updateDialogNavigation("previous", "next");
    controller.syncUrlState("push", { next: true });
    expect(calls.slice(-8)).toEqual([
      ["navigateEmoji", [2]],
      ["openPanel", ["favorites"]],
      ["setDialogView", ["details"]],
      ["setSuppressDialogCloseSync", [true]],
      ["showEmoji", ["partyPopper", false]],
      ["updateCompositionBackButton", ["left"]],
      ["updateDialogNavigation", ["previous", "next"]],
      ["syncUrlState", ["push", { next: true }]],
    ]);
  });
});
