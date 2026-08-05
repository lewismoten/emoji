import assert from "node:assert/strict";
import { createExplorerShellFixture } from "./explorer-shell-direct-fixture.mjs";

const fixture = createExplorerShellFixture();

try {
  fixture.shell.renderPixelFontToggle();
  assert.equal(fixture.renderPixelFontToggleCalls.length, 1);

  assert.equal(fixture.audioController.renderSoundEffectsToggleCalls, 0);
  assert.equal(fixture.audioController.renderMusicToggleCalls, 0);
  assert.equal(fixture.audioController.syncHelpMusicCalls, 1);

  const emojiEvent = { type: "emoji-font" };
  fixture.shell.selectEmojiFont(emojiEvent as unknown as Event);
  assert.deepEqual(fixture.selectEmojiFontCalls.at(-1), [
    {
      renderPixelFontToggle: fixture.shell.renderPixelFontToggle,
    },
    emojiEvent,
  ]);

  const installEvent = {
    prevented: false,
    preventDefault() {
      this.prevented = true;
    },
  };
  fixture.beforeInstallHandlers[0]?.(installEvent);
  assert.equal(installEvent.prevented, true);
  assert.deepEqual(fixture.renderInstallAppButtonCalls, [
    fixture.installButton,
  ]);

  fixture.appInstalledHandlers[0]?.();
  assert.equal(fixture.installButton.hidden, true);

  const devModeOptions = fixture.developerModeCalls[0] as {
    disableDeveloperFeatures: () => void;
  };
  devModeOptions.disableDeveloperFeatures();
  assert.equal(fixture.versionModeSelector.value, "through");
  assert.equal(fixture.versionSelector.value, "16.0");
  assert.equal(fixture.state.orderMode, "grouped");
  assert.equal(fixture.state.selectedSequenceType, "");
  assert.equal(fixture.state.renderCategoryFiltersCalls, 1);
  assert.equal(fixture.orderButtonCalls.length > 0, true);

  const uiOptions = fixture.explorerUiCalls[0] as {
    deferredInstallPrompt: () => unknown;
    installWebApp: unknown;
    setDeferredInstallPrompt: (value: unknown) => void;
  };
  assert.equal(uiOptions.deferredInstallPrompt(), undefined);
  uiOptions.setDeferredInstallPrompt("later");
  assert.equal(uiOptions.deferredInstallPrompt(), "later");
  assert.equal(uiOptions.installWebApp, "install-web-app");

  fixture.state.items = [];
  fixture.state.orderMode = "grouped";
  fixture.versionSelector.value = "15.0";
  devModeOptions.disableDeveloperFeatures();
  assert.equal(fixture.versionSelector.value, "16.0");
} finally {
  fixture.restore();
}
