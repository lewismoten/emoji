import assert from "node:assert/strict";
import { loadExplorerShellFixture } from "./explorer-shell-fixture.mjs";

const fixture = await loadExplorerShellFixture();

try {
  fixture.shell.renderPixelFontToggle();
  assert.equal(fixture.uiStub.renderPixelFontToggleCalls.length, 1);
  assert.equal(
    fixture.uiStub.renderPixelFontToggleCalls[0].refreshRenderedPixelEmoji,
    "refresh-rendered-pixel-emoji",
  );

  fixture.shell.renderThemeToggle();
  assert.equal(fixture.uiStub.renderThemeToggleCalls.length, 1);
  assert.equal(fixture.audioStub.controller.renderSoundEffectsToggleCalls, 1);
  assert.equal(fixture.audioStub.controller.renderMusicToggleCalls, 1);
  assert.equal(fixture.audioStub.controller.syncHelpMusicCalls, 1);

  const emojiEvent = { type: "emoji-font" };
  fixture.shell.selectEmojiFont(emojiEvent as Event);
  assert.equal(fixture.uiStub.selectEmojiFontCalls.length, 1);
  assert.equal(fixture.uiStub.selectEmojiFontCalls[0][1], emojiEvent);

  const themeEvent = { type: "theme" };
  fixture.shell.selectTheme(themeEvent as Event);
  assert.equal(fixture.uiStub.selectThemeCalls.length, 1);
  assert.equal(fixture.uiStub.selectThemeCalls[0][1], themeEvent);

  const installEvent = {
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
  fixture.beforeInstallHandlers[0](installEvent);
  assert.equal(installEvent.prevented, true);
  assert.deepEqual(fixture.pwaStub.renderInstallAppButtonCalls, [
    fixture.installButton,
  ]);

  fixture.appInstalledHandlers[0]();
  assert.equal(fixture.installButton.hidden, true);

  const devModeOptions = fixture.uiStub.developerModeCalls[0];
  devModeOptions.disableDeveloperFeatures();
  assert.equal(fixture.versionModeSelector.value, "through");
  assert.equal(fixture.versionSelector.value, "16.0");
  assert.equal(fixture.state.orderMode, "grouped");
  assert.equal(fixture.state.selectedSequenceType, "");
  assert.equal(fixture.state.renderCategoryFiltersCalls, 1);

  const uiOptions = fixture.uiStub.explorerUiCalls[0];
  assert.equal(uiOptions.deferredInstallPrompt(), undefined);
  uiOptions.setDeferredInstallPrompt("later");
  assert.equal(uiOptions.deferredInstallPrompt(), "later");
  assert.equal(uiOptions.installWebApp, "install-web-app");

  fixture.state.items = [];
  fixture.state.orderMode = "grouped";
  fixture.state.selectedSequenceType = "single";
  fixture.versionModeSelector.value = "selected";
  fixture.versionSelector.value = "15.0";
  devModeOptions.disableDeveloperFeatures();
  assert.equal(fixture.versionModeSelector.value, "through");
  assert.equal(fixture.versionSelector.value, "16.0");
  assert.equal(fixture.state.orderMode, "grouped");
  assert.equal(fixture.state.selectedSequenceType, "single");
  assert.equal(fixture.state.renderCategoryFiltersCalls, 1);

  fixture.createExplorerShell({
    applyPixelArtworkClass: () => "apply-pixel-artwork-class",
    dialog: () => "dialog",
    drawList: () => ["draw-list"],
    emojiFontChoices: () => "emoji-font-choices",
    installAppButton: () => fixture.installButton,
    installDialog: () => "install-dialog",
    loadVersionData: () => ["load-version-data"],
    offlineStatus: () => "offline-status",
    orderButtons: () => undefined,
    pixelEditor: () => "pixel-editor",
    refreshRenderedPixelEmoji: "refresh-rendered-pixel-emoji",
    renderVersionModeToggle: () => ["render-version-mode-toggle"],
    renderCategoryFilters: () => {
      fixture.state.renderCategoryFiltersCalls =
        (fixture.state.renderCategoryFiltersCalls ?? 0) + 1;
    },
    savePreference: "save-preference",
    savedDialog: () => "saved-dialog",
    setDialogView: (...args: unknown[]) => ["set-dialog-view", args],
    state: () => ({
      ...fixture.state,
      items: [],
      orderMode: "grouped",
      selectedSequenceType: "single",
      versionManifests: [],
    }),
    syncUrlState: (...args: unknown[]) => ["sync-url-state", args],
    syncVersionRange: () => ["sync-version-range"],
    themeChoices: () => "theme-choices",
    translate: "translate",
    versionModeSelector: () => undefined,
    versionSelector: () => undefined,
  });
  const secondDevModeOptions = fixture.uiStub.developerModeCalls[1];
  assert.equal(
    typeof secondDevModeOptions.disableDeveloperFeatures,
    "function",
  );
  assert.doesNotThrow(() => secondDevModeOptions.disableDeveloperFeatures());
} finally {
  fixture.restore();
}
