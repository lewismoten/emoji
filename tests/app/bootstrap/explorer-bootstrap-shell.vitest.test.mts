import { beforeEach, describe, expect, it, vi } from "vitest";

const state = {
  byId: { get: vi.fn(), replace: vi.fn() },
  emojiByKey: { get: vi.fn(), replace: vi.fn() },
  emojiKeyByCodePoints: { get: vi.fn(), replace: vi.fn() },
};

const getBoolean = vi.fn();

vi.mock("../../../src/state.js", () => state);
vi.mock("../../../src/preferences.js", () => ({
  getBoolean,
}));

describe("createExplorerBootstrapShellWithFactories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.byId.get.mockReturnValue({ wrappedGift: { key: "wrappedGift" } });
    state.emojiByKey.get.mockReturnValue({ wrappedGift: "🎁" });
    state.emojiKeyByCodePoints.get.mockReturnValue(
      new Map([["1F381", "wrappedGift"]]),
    );
    getBoolean.mockReturnValue(false);
  });

  it("wires pixel artwork, explorer shell, and emoji actions together", async () => {
    const createPixelArtworkManager = vi.fn((options: any) => ({
      applyPixelArtworkClass: "pixel-class",
      refreshRenderedPixelEmoji: vi.fn(() => "refresh-rendered-pixel-emoji"),
      updateModifierPixelArtwork: vi.fn(() => "update-modifier-pixel-artwork"),
      updatePixelArtworkManifest: vi.fn(() => "update-pixel-artwork-manifest"),
      updateRenderingDiagnostic: vi.fn((values: any) =>
        options.updateRenderingDiagnostic(values),
      ),
    }));
    const developerModeEnabled = vi.fn(() => true);
    const createExplorerShell = vi.fn(() => ({
      addFavorite: vi.fn(() => "addFavorite"),
      bindAudioInteractions: vi.fn(() => "bindAudioInteractions"),
      copyToClipboardValue: vi.fn(() => "copyToClipboardValue"),
      developerModeEnabled,
      fullDeveloperModeEnabled: vi.fn(() => false),
      getIntroducedVersion: vi.fn(() => "17.0"),
      installApp: vi.fn(() => "installApp"),
      loadPackageManifest: vi.fn(() => "loadPackageManifest"),
      loadUiTranslations: vi.fn(() => "loadUiTranslations"),
      onClick: vi.fn(() => "onClick"),
      onEmojiDialogClose: vi.fn(() => "onEmojiDialogClose"),
      recordCopiedEmoji: vi.fn(() => "recordCopiedEmoji"),
      renderDeveloperMode: vi.fn(() => "renderDeveloperMode"),
      renderInstallAppButton: vi.fn(() => "renderInstallAppButton"),
      renderPixelFontToggle: vi.fn(() => "renderPixelFontToggle"),
      renderSavedEmoji: vi.fn(() => "renderSavedEmoji"),
      selectEmojiFont: vi.fn(() => "selectEmojiFont"),
      syncHelpMusic: vi.fn(() => "syncHelpMusic"),
      toggleDeveloperMode: vi.fn(() => "toggleDeveloperMode"),
      updateFavoriteButton: vi.fn(() => "updateFavoriteButton"),
      updateOnlineStatus: vi.fn(() => "updateOnlineStatus"),
      applyUiTranslations: vi.fn(() => "applyUiTranslations"),
    }));
    const createEmojiActions = vi.fn(() => ({
      showEmoji: vi.fn(() => "showEmoji"),
    }));
    const updateRenderingDiagnostic = vi.fn((values: any) => values);

    const dialog = {
      classList: {
        contains: vi.fn((name: string) => name === "is-editor-view"),
      },
    };
    const refreshFontBuild = vi.fn();
    const options = {
      applyingUrlState: vi.fn(() => false),
      copyStatus: vi.fn(() => "copy-status"),
      developerModeToggle: vi.fn(() => "developer-mode-toggle"),
      dialog: vi.fn(() => dialog),
      drawList: vi.fn(() => "draw-list"),
      emojiFontChoices: vi.fn(() => ["system", "pixel"]),
      genderCheckboxes: vi.fn(() => ["neutral"]),
      getPixelEditor: vi.fn(() => ({ refreshFontBuild })),
      hairCheckboxes: vi.fn(() => ["red"]),
      installAppButton: vi.fn(() => "install-app-button"),
      installDialog: vi.fn(() => "install-dialog"),
      loadVersionData: vi.fn(() => "load-version-data"),
      modeChoices: vi.fn(() => ["standard", "advanced", "developer"]),
      normalizeCodePoints: vi.fn((value: string) => `norm:${value}`),
      offlineStatus: vi.fn(() => "offline-status"),
      orderButtons: vi.fn(() => ["grouped"]),
      renderCategoryFilters: vi.fn(() => "render-category-filters"),
      renderSearchLanguages: vi.fn(() => "render-search-languages"),
      renderVersionModeToggle: vi.fn(() => "render-version-mode-toggle"),
      savedDialog: vi.fn(() => "saved-dialog"),
      setDialogView: vi.fn((...args: unknown[]) => ["setDialogView", ...args]),
      showEmoji: vi.fn((...args: unknown[]) => ["showEmoji-option", ...args]),
      skinToneCheckboxes: vi.fn(() => ["1F3FB"]),
      suppressDialogCloseSync: vi.fn(() => "suppressed"),
      syncUrlState: vi.fn((...args: unknown[]) => ["syncUrlState", ...args]),
      syncVersionRange: vi.fn(() => "sync-version-range"),
      themeChoices: vi.fn(() => ["light", "dark"]),
      translate: vi.fn((key: string, fallback: string) => `${key}:${fallback}`),
      urlStateReady: vi.fn(() => true),
      versionModeSelector: vi.fn(() => "version-mode-selector"),
      versionSelector: vi.fn(() => "version-selector"),
    };

    const {
      createExplorerBootstrapShell,
      createExplorerBootstrapShellWithFactories,
    } = await import("../../../src/app/bootstrap/explorer-bootstrap-shell.js");

    const bootstrap = createExplorerBootstrapShellWithFactories(options, {
      createPixelArtworkManager,
      createExplorerShell,
      createEmojiActions,
      updateRenderingDiagnostic,
    });

    expect(createPixelArtworkManager).toHaveBeenCalledTimes(1);
    const pixelOptions = createPixelArtworkManager.mock.calls[0]![0];
    expect(pixelOptions.byId).toBe(state.byId.get);
    expect(pixelOptions.emojiByKey).toBe(state.emojiByKey.get);
    expect(pixelOptions.emojiKeyByCodePoints).toBe(
      state.emojiKeyByCodePoints.get,
    );
    expect(pixelOptions.genderCheckboxes()).toEqual(["neutral"]);
    expect(pixelOptions.hairCheckboxes()).toEqual(["red"]);
    expect(pixelOptions.normalizeCodePoints("1F381")).toBe("norm:1F381");
    expect(pixelOptions.skinToneCheckboxes()).toEqual(["1F3FB"]);
    expect(pixelOptions.pixelFontPreferred()).toBe(true);
    pixelOptions.refreshEditor();
    expect(refreshFontBuild).toHaveBeenCalledTimes(1);
    expect(pixelOptions.updateRenderingDiagnostic({ custom: true })).toEqual({
      custom: true,
      byId: { wrappedGift: { key: "wrappedGift" } },
      developerMode: true,
      detailsVisible: false,
      exampleDialog: dialog,
      translate: options.translate,
    });
    expect(updateRenderingDiagnostic).toHaveBeenCalledWith({
      custom: true,
      byId: { wrappedGift: { key: "wrappedGift" } },
      developerMode: true,
      detailsVisible: false,
      exampleDialog: dialog,
      translate: options.translate,
    });
    dialog.classList.contains.mockImplementation(
      (name: string) => name === "is-code-view",
    );
    expect(pixelOptions.updateRenderingDiagnostic({ next: true })).toEqual({
      next: true,
      byId: { wrappedGift: { key: "wrappedGift" } },
      developerMode: true,
      detailsVisible: false,
      exampleDialog: dialog,
      translate: options.translate,
    });
    dialog.classList.contains.mockImplementation(() => false);
    expect(pixelOptions.updateRenderingDiagnostic({ final: true })).toEqual({
      final: true,
      byId: { wrappedGift: { key: "wrappedGift" } },
      developerMode: true,
      detailsVisible: true,
      exampleDialog: dialog,
      translate: options.translate,
    });

    expect(createExplorerShell).toHaveBeenCalledTimes(1);
    const shellOptions: any = (createExplorerShell.mock.calls as any)[0][0];
    expect(shellOptions.applyPixelArtworkClass()).toBe("pixel-class");
    expect(shellOptions.developerModeToggle()).toBe("developer-mode-toggle");
    expect(shellOptions.modeChoices()).toEqual([
      "standard",
      "advanced",
      "developer",
    ]);
    expect(shellOptions.dialog()).toBe(dialog);
    expect(shellOptions.drawList()).toBe("draw-list");
    expect(shellOptions.emojiFontChoices()).toEqual(["system", "pixel"]);
    expect(shellOptions.installAppButton()).toBe("install-app-button");
    expect(shellOptions.installDialog()).toBe("install-dialog");
    expect(shellOptions.loadVersionData()).toBe("load-version-data");
    expect(shellOptions.offlineStatus()).toBe("offline-status");
    expect(shellOptions.orderButtons()).toEqual(["grouped"]);
    expect(shellOptions.pixelEditor()).toEqual({ refreshFontBuild });
    expect(shellOptions.refreshRenderedPixelEmoji()).toBe(
      "refresh-rendered-pixel-emoji",
    );
    expect(shellOptions.renderCategoryFilters()).toBe(
      "render-category-filters",
    );
    expect(shellOptions.renderSearchLanguages()).toBe(
      "render-search-languages",
    );
    expect(shellOptions.renderVersionModeToggle()).toBe(
      "render-version-mode-toggle",
    );
    expect(shellOptions.savedDialog()).toBe("saved-dialog");
    expect(shellOptions.setDialogView("details")).toEqual([
      "setDialogView",
      "details",
    ]);
    expect(shellOptions.syncUrlState("replace")).toEqual([
      "syncUrlState",
      "replace",
    ]);
    expect(shellOptions.syncVersionRange()).toBe("sync-version-range");
    expect(shellOptions.themeChoices()).toEqual(["light", "dark"]);
    expect(shellOptions.translate("copy", "Copy")).toBe("copy:Copy");
    expect(shellOptions.versionModeSelector()).toBe("version-mode-selector");
    expect(shellOptions.versionSelector()).toBe("version-selector");

    expect(createEmojiActions).toHaveBeenCalledTimes(1);
    const emojiOptions: any = (createEmojiActions.mock.calls as any)[0][0];
    expect(emojiOptions.applyingUrlState()).toBe(false);
    expect(emojiOptions.applyPixelArtworkClass()).toBe("pixel-class");
    expect(emojiOptions.applyStandalonePixelArtwork()).toBe("pixel-class");
    expect(emojiOptions.copyStatus()).toBe("copy-status");
    expect(emojiOptions.developerModeEnabled()).toBe(true);
    expect(emojiOptions.dialog()).toBe(dialog);
    expect(emojiOptions.normalizeCodePoints("1F381")).toBe("norm:1F381");
    expect(emojiOptions.setDialogView("code")).toEqual([
      "setDialogView",
      "code",
    ]);
    expect(emojiOptions.showEmoji("wrappedGift")).toEqual([
      "showEmoji-option",
      "wrappedGift",
    ]);
    expect(emojiOptions.suppressDialogCloseSync()).toBe("suppressed");
    expect(emojiOptions.syncUrlState("replace")).toEqual([
      "syncUrlState",
      "replace",
    ]);
    expect(emojiOptions.translate("copy", "Copy")).toBe("copy:Copy");
    expect(emojiOptions.urlStateReady()).toBe(true);

    expect(bootstrap.applyStandalonePixelArtwork).toBe("pixel-class");
    expect(bootstrap.addFavorite()).toBe("addFavorite");
    expect(bootstrap.copyToClipboardValue()).toBe("copyToClipboardValue");
    expect(bootstrap.developerModeEnabled()).toBe(true);
    expect(bootstrap.fullDeveloperModeEnabled()).toBe(false);
    expect(bootstrap.getIntroducedVersion()).toBe("17.0");
    expect(bootstrap.installApp()).toBe("installApp");
    expect(bootstrap.loadPackageManifest()).toBe("loadPackageManifest");
    expect(bootstrap.loadUiTranslations()).toBe("loadUiTranslations");
    expect(bootstrap.onClick()).toBe("onClick");
    expect(bootstrap.onEmojiDialogClose()).toBe("onEmojiDialogClose");
    expect(bootstrap.recordCopiedEmoji()).toBe("recordCopiedEmoji");
    expect(bootstrap.refreshRenderedPixelEmoji()).toBe(
      "refresh-rendered-pixel-emoji",
    );
    expect(bootstrap.renderDeveloperMode()).toBe("renderDeveloperMode");
    expect(bootstrap.renderInstallAppButton()).toBe("renderInstallAppButton");
    expect(bootstrap.updateModifierPixelArtwork()).toBe(
      "update-modifier-pixel-artwork",
    );
    expect(bootstrap.selectEmojiFont()).toBe("selectEmojiFont");
    expect(bootstrap.syncHelpMusic()).toBe("syncHelpMusic");
    expect(bootstrap.toggleDeveloperMode()).toBe("toggleDeveloperMode");
    expect(bootstrap.updateFavoriteButton()).toBe("updateFavoriteButton");
    expect(bootstrap.updateOnlineStatus()).toBe("updateOnlineStatus");
    expect(bootstrap.updatePixelArtworkManifest()).toBe(
      "update-pixel-artwork-manifest",
    );
    expect(bootstrap.showEmoji()).toBe("showEmoji");
    expect(bootstrap.bindAudioInteractions()).toBe("bindAudioInteractions");
    expect(bootstrap.renderSavedEmoji()).toBe("renderSavedEmoji");
    expect(bootstrap.applyUiTranslations()).toBe("applyUiTranslations");

    expect(createExplorerBootstrapShell).toBeTypeOf("function");
  });
});
