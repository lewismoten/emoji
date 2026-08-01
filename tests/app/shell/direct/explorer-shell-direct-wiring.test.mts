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
  assert.equal(fixture.shell.fullDeveloperModeEnabled, undefined);
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

  const savedOptions = fixture.savedEmojiCalls[0] as {
    applyPixelArtworkClass: () => unknown;
    byId: () => unknown;
    copiedEmojiKeys: () => unknown;
    currentEmojiKey: () => unknown;
    emojiByKey: () => unknown;
    favoriteEmojiKeys: () => unknown;
    searchAnnotations: () => unknown;
    setCopiedEmojiKeys: (keys: string[]) => void;
    setFavoriteEmojiKeys: (keys: string[]) => void;
    translate: unknown;
  };
  assert.equal(
    savedOptions.applyPixelArtworkClass(),
    "apply-pixel-artwork-class",
  );
  assert.deepEqual(savedOptions.byId(), fixture.state.byId);
  assert.deepEqual(savedOptions.copiedEmojiKeys(), ["wave"]);
  assert.equal(savedOptions.currentEmojiKey(), "wave");
  assert.deepEqual(savedOptions.emojiByKey(), fixture.state.emojiByKey);
  assert.deepEqual(savedOptions.favoriteEmojiKeys(), ["thumbsUp"]);
  assert.deepEqual(savedOptions.searchAnnotations(), { wave: ["hello"] });
  savedOptions.setCopiedEmojiKeys(["sparkles"]);
  savedOptions.setFavoriteEmojiKeys(["wave"]);
  assert.deepEqual(fixture.state.copiedEmojiKeys, ["sparkles"]);
  assert.deepEqual(fixture.state.favoriteEmojiKeys, ["wave"]);
  assert.equal(savedOptions.translate, "translate");
} finally {
  fixture.restore();
}
