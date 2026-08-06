import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initializeBrowserRuntime = vi.fn((options: any) => ({
  initialized: true,
  options,
}));

vi.mock("../../../src/app/browser/browser-runtime.js", () => ({
  initializeBrowserRuntime,
}));

describe("createBrowserRuntimeConfig", () => {
  it("forwards config options into initializeBrowserRuntime", async () => {
    const { createBrowserRuntimeConfig } = await import(
      "../../../src/app/browser/browser-runtime-config.js"
    );

    let dialogValue = { id: "dialog" };
    let languageDialogValue = { id: "language-dialog" };
    let languageListValue = [{ code: "en", name: "English" }];
    let languagePickerValue = { id: "picker" };
    let languagePickerFlagValue = { id: "flag" };
    let languagePickerLabelValue = { id: "label" };
    let nextLoadId = 2;
    let suppressedPanelClosesValue = 0;
    const syncUrlStateCalls: unknown[][] = [];

    const options = {
      applyDialogUrlState: Symbol("applyDialogUrlState"),
      applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
      applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
      closePanelDialog: Symbol("closePanelDialog"),
      dialog: () => dialogValue,
      languageDialog: () => languageDialogValue,
      languageFlags: Symbol("languageFlags"),
      languageList: () => languageListValue,
      languagePicker: () => languagePickerValue,
      languagePickerFlag: () => languagePickerFlagValue,
      languagePickerLabel: () => languagePickerLabelValue,
      loadUiTranslations: Symbol("loadUiTranslations"),
      nextLoadId: () => nextLoadId,
      onPixelFontRevisionLoaded: Symbol("onPixelFontRevisionLoaded"),
      refreshLocalizedLabels: Symbol("refreshLocalizedLabels"),
      restoreDeveloperMode: Symbol("restoreDeveloperMode"),
      setApplyingUrlState: Symbol("setApplyingUrlState"),
      suppressedPanelCloses: () => suppressedPanelClosesValue,
      syncUrlState: (...args: unknown[]) => {
        syncUrlStateCalls.push(args);
        return "synced";
      },
      translate: Symbol("translate"),
      updateModifierArtwork: Symbol("updateModifierArtwork"),
      updatePixelArtworkManifest: Symbol("updatePixelArtworkManifest"),
      updateWebAppManifest: Symbol("updateWebAppManifest"),
    };

    const result = createBrowserRuntimeConfig(options);
    expect(result).toEqual({
      initialized: true,
      options: initializeBrowserRuntime.mock.calls[0]![0],
    });

    const forwarded = initializeBrowserRuntime.mock.calls[0]![0];
    expect(forwarded.applyDialogUrlState).toBe(options.applyDialogUrlState);
    expect(forwarded.applyPixelArtworkClass).toBe(
      options.applyPixelArtworkClass,
    );
    expect(forwarded.applyStandalonePixelArtwork).toBe(
      options.applyStandalonePixelArtwork,
    );
    expect(forwarded.closePanelDialog).toBe(options.closePanelDialog);
    expect(forwarded.languageFlags).toBe(options.languageFlags);
    expect(forwarded.loadUiTranslations).toBe(options.loadUiTranslations);
    expect(forwarded.onPixelFontRevisionLoaded).toBe(
      options.onPixelFontRevisionLoaded,
    );
    expect(forwarded.refreshLocalizedLabels).toBe(
      options.refreshLocalizedLabels,
    );
    expect(forwarded.restoreDeveloperMode).toBe(
      options.restoreDeveloperMode,
    );
    expect(forwarded.setApplyingUrlState).toBe(options.setApplyingUrlState);
    expect(forwarded.translate).toBe(options.translate);
    expect(forwarded.updateModifierArtwork).toBe(
      options.updateModifierArtwork,
    );
    expect(forwarded.updatePixelArtworkManifest).toBe(
      options.updatePixelArtworkManifest,
    );
    expect(forwarded.updateWebAppManifest).toBe(
      options.updateWebAppManifest,
    );

    expect(forwarded.dialog()).toBe(dialogValue);
    expect(forwarded.languageDialog()).toBe(languageDialogValue);
    expect(forwarded.languageList()).toBe(languageListValue);
    expect(forwarded.languagePicker()).toBe(languagePickerValue);
    expect(forwarded.languagePickerFlag()).toBe(languagePickerFlagValue);
    expect(forwarded.languagePickerLabel()).toBe(languagePickerLabelValue);
    expect(forwarded.nextLoadId()).toBe(2);
    expect(forwarded.suppressedPanelCloses()).toBe(0);
    expect(forwarded.syncUrlState("a", "b")).toBe("synced");
    expect(syncUrlStateCalls).toEqual([["a", "b"]]);

    dialogValue = { id: "dialog-2" };
    languageDialogValue = { id: "language-dialog-2" };
    languageListValue = [{ code: "ar", name: "Arabic" }];
    languagePickerValue = { id: "picker-2" };
    languagePickerFlagValue = { id: "flag-2" };
    languagePickerLabelValue = { id: "label-2" };
    nextLoadId = 5;
    suppressedPanelClosesValue = 3;

    expect(forwarded.dialog()).toEqual({ id: "dialog-2" });
    expect(forwarded.languageDialog()).toEqual({ id: "language-dialog-2" });
    expect(forwarded.languageList()).toEqual([
      { code: "ar", name: "Arabic" },
    ]);
    expect(forwarded.languagePicker()).toEqual({ id: "picker-2" });
    expect(forwarded.languagePickerFlag()).toEqual({ id: "flag-2" });
    expect(forwarded.languagePickerLabel()).toEqual({ id: "label-2" });
    expect(forwarded.nextLoadId()).toBe(5);
    expect(forwarded.suppressedPanelCloses()).toBe(3);
  });
});
