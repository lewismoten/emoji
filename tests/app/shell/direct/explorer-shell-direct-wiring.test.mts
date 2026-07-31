import assert from "node:assert/strict";
import { createExplorerShellFixture } from "./explorer-shell-direct-fixture.mjs";

const fixture = createExplorerShellFixture();

try {
  assert.equal(
    typeof fixture.dependencyDefaults.createSavedEmojiController,
    "function",
  );
  assert.equal(
    typeof fixture.dependencyDefaults.createExplorerAudioController,
    "function",
  );
  assert.equal(
    typeof fixture.dependencyDefaults.createExplorerUiController,
    "function",
  );
  assert.equal(
    typeof fixture.dependencyDefaults.createDeveloperModeController,
    "function",
  );

  assert.equal(fixture.savedEmojiCalls.length, 1);
  assert.equal(fixture.audioCalls.length, 1);
  assert.equal(fixture.developerModeCalls.length, 1);
  assert.equal(fixture.explorerUiCalls.length, 1);
  assert.equal(fixture.beforeInstallHandlers.length, 1);
  assert.equal(fixture.appInstalledHandlers.length, 1);

  assert.equal(fixture.shell.renderSavedEmoji, "saved-render");
  assert.equal(fixture.shell.bindAudioInteractions, "bind-audio-interactions");
  assert.equal(fixture.shell.developerModeEnabled, "developer-enabled");
  assert.equal(fixture.shell.installApp, "explorer-install-app");
  assert.equal(fixture.shell.loadUiTranslations, "load-ui-translations");
  assert.equal(
    fixture.shell.renderMusicToggle,
    fixture.audioController.renderMusicToggle,
  );
  assert.equal(fixture.shell.renderDeveloperMode, "developer-render");
  assert.equal(
    fixture.shell.renderInstallAppButton,
    "ui-render-install-app-button",
  );
  assert.equal(
    fixture.shell.renderSoundEffectsToggle,
    fixture.audioController.renderSoundEffectsToggle,
  );
  assert.equal(
    fixture.shell.syncHelpMusic,
    fixture.audioController.syncHelpMusic,
  );
  assert.equal(fixture.shell.toggleDeveloperMode, "developer-change");
  assert.equal(fixture.shell.updateOnlineStatus, "update-online-status");
  assert.equal(fixture.shell.applyUiTranslations, "apply-ui-translations");
  assert.equal(fixture.shell.copiedCount(), 1);
} finally {
  fixture.restore();
}
