import assert from "node:assert/strict";
import { loadExplorerShellFixture } from "./explorer-shell-fixture.mjs";

const fixture = await loadExplorerShellFixture();

try {
  const dependencies = fixture.createExplorerShellDependencies();
  assert.equal(typeof dependencies.createDeveloperModeController, "function");
  assert.equal(typeof dependencies.createExplorerAudioController, "function");
  assert.equal(typeof dependencies.createExplorerUiController, "function");
  assert.equal(typeof dependencies.createSavedEmojiController, "function");
  assert.equal(dependencies.installWebApp, "install-web-app");
  assert.equal(typeof dependencies.renderInstallAppButtonHelper, "function");
  assert.equal(typeof dependencies.renderPixelFontToggleHelper, "function");
  assert.equal(typeof dependencies.renderThemeToggleHelper, "function");
  assert.equal(typeof dependencies.selectEmojiFontHelper, "function");
  assert.equal(typeof dependencies.selectThemeHelper, "function");

  assert.equal(fixture.savedEmojiStub.calls.length, 1);
  assert.equal(fixture.audioStub.calls.length, 1);
  assert.equal(fixture.uiStub.developerModeCalls.length, 1);
  assert.equal(fixture.uiStub.explorerUiCalls.length, 1);
  assert.equal(fixture.beforeInstallHandlers.length, 1);
  assert.equal(fixture.appInstalledHandlers.length, 1);

  assert.equal(fixture.shell.renderSavedEmoji, "saved-render");
  assert.equal(fixture.shell.bindAudioInteractions, "bind-audio-interactions");
  assert.equal(fixture.shell.developerModeEnabled, "developer-enabled");
  assert.equal(fixture.shell.installApp, "explorer-install-app");
  assert.equal(fixture.shell.loadUiTranslations, "load-ui-translations");
  assert.equal(
    fixture.shell.renderMusicToggle,
    fixture.audioStub.controller.renderMusicToggle,
  );
  assert.equal(
    fixture.shell.renderDeveloperMode,
    fixture.uiStub.developerModeController.render,
  );
  assert.equal(
    fixture.shell.renderInstallAppButton,
    "ui-render-install-app-button",
  );
  assert.equal(
    fixture.shell.renderSoundEffectsToggle,
    fixture.audioStub.controller.renderSoundEffectsToggle,
  );
  assert.equal(
    fixture.shell.syncHelpMusic,
    fixture.audioStub.controller.syncHelpMusic,
  );
  assert.equal(
    fixture.shell.toggleDeveloperMode,
    fixture.uiStub.developerModeController.change,
  );
  assert.equal(fixture.shell.updateOnlineStatus, "update-online-status");
  assert.equal(fixture.shell.applyUiTranslations, "apply-ui-translations");
} finally {
  fixture.restore();
}
