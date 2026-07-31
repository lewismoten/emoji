import assert from "node:assert/strict";
import { createShellRuntimeFixture } from "./explorer-bootstrap-shell-runtime-fixture.mjs";

const { bootstrap, emojiOptions, shellOptions, state } =
  await createShellRuntimeFixture();

assert.equal(shellOptions.savePreference, "save-preference");
assert.equal(shellOptions.state(), state);
assert.equal(
  shellOptions.pixelEditor().refreshFontBuild instanceof Function,
  true,
);
for (const [key, expected] of [
  ["applyPixelArtworkClass", "pixel-class"],
  ["developerModeToggle", "developer-mode-toggle"],
  ["drawList", "draw-list"],
  ["installAppButton", "install-app-button"],
  ["installDialog", "install-dialog"],
  ["loadVersionData", "load-version-data"],
  ["offlineStatus", "offline-status"],
  ["renderCategoryFilters", "render-category-filters"],
  ["renderSearchLanguages", "render-search-languages"],
  ["renderVersionModeToggle", "render-version-mode-toggle"],
  ["savedDialog", "saved-dialog"],
  ["syncVersionRange", "sync-version-range"],
  ["versionModeSelector", "version-mode-selector"],
  ["versionSelector", "version-selector"],
] as const) {
  assert.equal(shellOptions[key](), expected);
}
assert.deepEqual(shellOptions.emojiFontChoices(), ["system", "pixel"]);
assert.deepEqual(shellOptions.orderButtons(), ["grouped"]);
assert.deepEqual(shellOptions.themeChoices(), ["light", "dark"]);
assert.deepEqual(shellOptions.setDialogView("editor"), [
  "setDialogView",
  "editor",
]);
assert.deepEqual(shellOptions.syncUrlState(), ["syncUrlState"]);
assert.equal(shellOptions.translate("k", "v"), "k:v");

assert.equal(emojiOptions.state(), state);
for (const [key, expected] of [
  ["applyingUrlState", false],
  ["applyPixelArtworkClass", "pixel-class"],
  ["applyStandalonePixelArtwork", "pixel-class"],
  ["copyStatus", "copy-status"],
  ["developerModeEnabled", true],
  ["normalizeCodePoints", "norm:1F381"],
  ["setDialogView", ["setDialogView", "code"]],
  ["showEmoji", ["showEmoji-option", "wrappedGift"]],
  ["suppressDialogCloseSync", "suppressed"],
  ["syncUrlState", ["syncUrlState", "replace"]],
  ["translate", "copy:Copy"],
  ["urlStateReady", true],
] as const) {
  const value =
    key === "normalizeCodePoints"
      ? emojiOptions[key]("1F381")
      : key === "setDialogView"
        ? emojiOptions[key]("code")
        : key === "showEmoji"
          ? emojiOptions[key]("wrappedGift")
          : key === "syncUrlState"
            ? emojiOptions[key]("replace")
            : key === "translate"
              ? emojiOptions[key]("copy", "Copy")
              : emojiOptions[key]();
  assert.deepEqual(value, expected);
}

assert.equal(bootstrap.applyStandalonePixelArtwork, "pixel-class");
for (const [key, expected] of [
  ["addFavorite", "addFavorite"],
  ["bindAudioInteractions", "bindAudioInteractions"],
  ["copyToClipboardValue", "copyToClipboardValue"],
  ["getIntroducedVersion", "getIntroducedVersion"],
  ["installApp", "installApp"],
  ["loadPackageManifest", "loadPackageManifest"],
  ["loadUiTranslations", "loadUiTranslations"],
  ["onClick", "onClick"],
  ["onEmojiDialogClose", "onEmojiDialogClose"],
  ["recordCopiedEmoji", "recordCopiedEmoji"],
  ["refreshRenderedPixelEmoji", "refresh-rendered-pixel-emoji"],
  ["renderDeveloperMode", "renderDeveloperMode"],
  ["renderInstallAppButton", "renderInstallAppButton"],
  ["renderMusicToggle", "renderMusicToggle"],
  ["renderPixelFontToggle", "renderPixelFontToggle"],
  ["renderSavedEmoji", "renderSavedEmoji"],
  ["renderSoundEffectsToggle", "renderSoundEffectsToggle"],
  ["renderThemeToggle", "renderThemeToggle"],
  ["selectEmojiFont", "selectEmojiFont"],
  ["selectTheme", "selectTheme"],
  ["syncHelpMusic", "syncHelpMusic"],
  ["toggleDeveloperMode", "toggleDeveloperMode"],
  ["updateFavoriteButton", "updateFavoriteButton"],
  ["updateModifierPixelArtwork", "updateModifierPixelArtwork"],
  ["updateOnlineStatus", "updateOnlineStatus"],
  ["updatePixelArtworkManifest", "updatePixelArtworkManifest"],
  ["updateRenderingDiagnostic", "pixel-update-rendering-diagnostic"],
  ["applyUiTranslations", "applyUiTranslations"],
] as const) {
  assert.equal(bootstrap[key](), expected);
}
