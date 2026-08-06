import { describe, expect, it } from "vitest";

import {
  buildExplorerBootstrapControllerOptions,
  buildExplorerBootstrapRuntimeSourceOptions,
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
    expect(
      calls.some((call) => call[0] === "state" && call[1].length === 0),
    ).toBe(false);
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
    expect(controller.copyToClipboardValue()).toBe(
      "copyToClipboardValue-value",
    );
    expect(controller.developerModeEnabled()).toBe(
      "developerModeEnabled-value",
    );
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

  it("builds runtime source option wrappers", () => {
    const { calls, options } = createBootstrapOptionsFixture();

    const runtime = buildExplorerBootstrapRuntimeSourceOptions(options);
    expect(runtime.applyBasicUrlState).toBe(options.applyBasicUrlState);
    expect(runtime.applyDialogUrlState).toBe(options.applyDialogUrlState);
    expect(runtime.bindAudioInteractions).toBe(options.bindAudioInteractions);
    expect(runtime.applyPixelArtworkClass).toBe(options.applyPixelArtworkClass);
    expect(runtime.applyStandalonePixelArtwork).toBe(
      options.applyStandalonePixelArtwork,
    );
    expect(runtime.fullDeveloperModeEnabled).toBe(
      options.fullDeveloperModeEnabled,
    );
    expect(runtime.installApp).toBe(options.installApp);
    expect(runtime.loadPackageManifest).toBe(options.loadPackageManifest);
    expect(runtime.loadData).toBe(options.loadData);
    expect(runtime.loadUiTranslations).toBe(options.loadUiTranslations);
    expect(runtime.modeChoices()).toBe("modeChoices-value");
    expect(runtime.panelDialogs).toBe(options.panelDialogs);
    expect(runtime.translate).toBe(options.translate);

    for (const [key, expected] of [
      ["advancedFilters", "advancedFilters-value"],
      ["advancedFiltersButton", "advancedFiltersButton-value"],
      ["applyingUrlState", "applyingUrlState-value"],
      ["clearFiltersButton", "clearFiltersButton-value"],
      ["copyStatus", "copyStatus-value"],
      ["developerModeToggle", "developerModeToggle-value"],
      ["drawList", "drawList-value"],
      ["emojiFontChoices", "emojiFontChoices-value"],
      ["emojiList", "emojiList-value"],
      ["genderCheckboxes", "genderCheckboxes-value"],
      ["getPixelEditor", "getPixelEditor-value"],
      ["getPixelEditorPromise", "getPixelEditorPromise-value"],
      ["groupFilterDialog", "groupFilterDialog-value"],
      ["groupPickerTrigger", "groupPickerTrigger-value"],
      ["groupSelector", "groupSelector-value"],
      ["hairCheckboxes", "hairCheckboxes-value"],
      ["helpDialog", "helpDialog-value"],
      ["helpPicker", "helpPicker-value"],
      ["installAppButton", "installAppButton-value"],
      ["installDialog", "installDialog-value"],
      ["languageDialog", "languageDialog-value"],
      ["languageList", "languageList-value"],
      ["languagePicker", "languagePicker-value"],
      ["languagePickerFlag", "languagePickerFlag-value"],
      ["languagePickerLabel", "languagePickerLabel-value"],
      ["loadSearchLanguages", "loadSearchLanguages-value"],
      ["matchCount", "matchCount-value"],
      ["navigateEmoji", "navigateEmoji-value"],
      ["orderButtons", "orderButtons-value"],
      ["resetFilters", "resetFilters-value"],
      ["savedDialog", "savedDialog-value"],
      ["savedPicker", "savedPicker-value"],
      ["searchText", "searchText-value"],
      ["skinToneCheckboxes", "skinToneCheckboxes-value"],
      ["subGroupFilterDialog", "subGroupFilterDialog-value"],
      ["subGroupPickerTrigger", "subGroupPickerTrigger-value"],
      ["subGroupSelector", "subGroupSelector-value"],
      ["suppressedPanelCloses", "suppressedPanelCloses-value"],
      ["toolbar", "toolbar-value"],
      ["themeChoices", "themeChoices-value"],
      ["urlStateReady", "urlStateReady-value"],
      ["versionModeSelector", "versionModeSelector-value"],
      ["versionModeToggle", "versionModeToggle-value"],
      ["versionNext", "versionNext-value"],
      ["versionPrevious", "versionPrevious-value"],
      ["versionRange", "versionRange-value"],
      ["versionSelector", "versionSelector-value"],
    ] as const) {
      const value =
        key === "drawList"
          ? runtime[key]("warm")
          : key === "navigateEmoji"
            ? runtime[key](3)
            : runtime[key]();
      expect(value).toBe(expected);
    }

    runtime.populateVersionModeOptions("b");
    runtime.renderCategoryFilters("c");
    expect(runtime.focusInitialEmojiDialogAction()).toBe(
      "focusInitialEmojiDialogAction-value",
    );
    expect(runtime.refreshLocalizedLabels()).toBe(
      "refreshLocalizedLabels-value",
    );
    expect(runtime.renderDeveloperMode()).toBe("renderDeveloperMode-value");
    expect(runtime.renderInstallAppButton()).toBe(
      "renderInstallAppButton-value",
    );
    expect(runtime.renderPixelFontToggle()).toBe(
      "renderPixelFontToggle-value",
    );
    expect(runtime.renderSavedEmoji()).toBe("renderSavedEmoji-value");
    expect(runtime.renderSearchLanguages()).toBe(
      "renderSearchLanguages-value",
    );
    expect(runtime.renderVersionModeToggle()).toBe(
      "renderVersionModeToggle-value",
    );
    expect(runtime.restoreDeveloperMode()).toBe("restoreDeveloperMode-value");
    expect(runtime.scheduleSearchDraw()).toBe("scheduleSearchDraw-value");
    expect(runtime.selectEmojiFont()).toBe("selectEmojiFont-value");
    expect(runtime.nextSearchLoadId()).toBe("nextSearchLoadId-value");
    expect(runtime.setApplyingUrlState()).toBe("setApplyingUrlState-value");
    expect(runtime.setControls()).toBe("setControls-value");
    expect(runtime.setElements()).toBe("setElements-value");
    expect(runtime.setFieldsets()).toBe("setFieldsets-value");
    expect(runtime.setPixelEditor()).toBe("setPixelEditor-value");
    expect(runtime.setPixelEditorPromise()).toBe(
      "setPixelEditorPromise-value",
    );
    expect(runtime.setSearchLanguage()).toBe("setSearchLanguage-value");
    expect(runtime.setSuppressDialogCloseSync()).toBe(
      "setSuppressDialogCloseSync-value",
    );
    expect(runtime.setUrlStateReady()).toBe("setUrlStateReady-value");
    expect(runtime.stepVersion()).toBe("stepVersion-value");
    expect(runtime.translate("theme", "Theme")).toBe("translate-value");
    expect(runtime.developerModeEnabled()).toBe("developerModeEnabled-value");
    expect(runtime.fullDeveloperModeEnabled()).toBe(
      "fullDeveloperModeEnabled-value",
    );
    expect(runtime.displayGroupName("Objects")).toBe("displayGroupName-value");
    expect(runtime.displayUnicodeSubGroupName("mail")).toBe(
      "displayUnicodeSubGroupName-value",
    );
    expect(runtime.getIntroducedVersion("gift")).toBe(
      "getIntroducedVersion-value",
    );
    expect(runtime.openFilterPicker()).toBe("openFilterPicker-value");
    expect(runtime.onCompactChoiceKeyDown()).toBe(
      "onCompactChoiceKeyDown-value",
    );
    expect(runtime.onDocumentKeyDown()).toBe("onDocumentKeyDown-value");
    expect(runtime.onEmojiDialogClick()).toBe("onEmojiDialogClick-value");
    expect(runtime.onEmojiDialogClose()).toBe("onEmojiDialogClose-value");
    expect(runtime.onEmojiFocus()).toBe("onEmojiFocus-value");
    expect(runtime.onEmojiKeyDown()).toBe("onEmojiKeyDown-value");
    expect(runtime.onHairChange()).toBe("onHairChange-value");
    expect(runtime.onGenderChange()).toBe("onGenderChange-value");
    expect(runtime.onSkinToneChange()).toBe("onSkinToneChange-value");
    expect(runtime.onOrderModeChange()).toBe("onOrderModeChange-value");
    expect(runtime.onVersionRangeInput()).toBe("onVersionRangeInput-value");

    runtime.setDialogView("editor");
    runtime.showEmoji("wrappedGift", true);
    runtime.syncUrlState("replace", { hello: "world" });
    runtime.syncVersionRange("x");
    expect(runtime.toggleDeveloperMode()).toBe("toggleDeveloperMode-value");
    runtime.toggleVersionMode("selected");
    expect(runtime.updateFavoriteButton()).toBe("updateFavoriteButton-value");
    expect(runtime.updateModifierArtwork()).toBe(
      "updateModifierArtwork-value",
    );
    expect(runtime.updateOnlineStatus()).toBe("updateOnlineStatus-value");
    expect(runtime.updatePixelArtworkManifest()).toBe(
      "updatePixelArtworkManifest-value",
    );
    expect(runtime.updateRenderingDiagnostic()).toBe(
      "updateRenderingDiagnostic-value",
    );

    expect(
      calls.some(
        (call) =>
          call[0] === "populateVersionModeOptions" &&
          JSON.stringify(call[1]) === '["b"]',
      ),
    ).toBe(true);

    for (const expected of [
      ["renderCategoryFilters", ["c"]],
      ["setDialogView", ["editor"]],
      ["showEmoji", ["wrappedGift", true]],
      ["syncUrlState", ["replace", { hello: "world" }]],
      ["syncVersionRange", ["x"]],
      ["toggleDeveloperMode", []],
      ["toggleVersionMode", ["selected"]],
      ["updateFavoriteButton", []],
      ["updateModifierArtwork", []],
      ["updateOnlineStatus", []],
      ["updatePixelArtworkManifest", []],
      ["updateRenderingDiagnostic", []],
    ] as const) {
      expect(
        calls.some(
          (call) =>
            call[0] === expected[0] &&
            JSON.stringify(call[1]) === JSON.stringify(expected[1]),
        ),
      ).toBe(true);
    }
  });
});
