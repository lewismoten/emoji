export const savedPickerMarkup = `
  <button class="saved-picker" type="button" aria-haspopup="dialog" aria-controls="saved-dialog" data-i18n-aria-label="savedEmoji" aria-label="Saved emoji">
    <span class="modifier-emoji favorite-glyph" aria-hidden="true">⭐</span>
    <span class="saved-picker-label" data-i18n="favorites">Favorites</span>
  </button>
`;

export const helpPickerMarkup = `
  <button class="help-picker" type="button" aria-haspopup="dialog" aria-controls="help-dialog" data-i18n-aria-label="helpAndSettings" aria-label="Help and settings">
    <span aria-hidden="true">?</span>
  </button>
`;

export const emojiCompositionMarkup = `
  <section class="emoji-composition" hidden>
    <div class="emoji-composition-heading">
      <h3 data-i18n="builtFrom">Built from</h3>
      <button class="emoji-composition-mode" type="button" aria-pressed="false" hidden>Show full sequence</button>
    </div>
    <div class="emoji-composition-equation" dir="ltr"></div>
  </section>
`;

export const savedDialogMarkup = `
  <dialog class="saved-dialog" id="saved-dialog" aria-labelledby="saved-title">
    <div class="dialog-heading">
      <h2 id="saved-title" data-i18n="savedEmoji">Saved emoji</h2>
      <form method="dialog"><button class="dialog-close" data-i18n-aria-label="close" aria-label="Close">×</button></form>
    </div>
    <section class="saved-section" aria-labelledby="favorites-title">
      <h3 id="favorites-title" data-i18n="favorites">Favorites</h3>
      <div class="saved-emoji-list favorites-list"></div>
      <p class="saved-empty favorites-empty" data-i18n="noFavorites">Favorite emoji will appear here.</p>
    </section>
    <section class="saved-section" aria-labelledby="copied-title">
      <h3 id="copied-title" data-i18n="recentlyCopied">Recently Copied</h3>
      <div class="saved-emoji-list copied-list"></div>
      <p class="saved-empty copied-empty" data-i18n="noRecentlyCopied">Copied emoji will appear here.</p>
    </section>
  </dialog>
`;

export const helpDialogMarkup = `
  <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title">
    <div class="dialog-heading">
      <h2 id="help-title" data-i18n="helpAndSettings">Help and settings</h2>
      <form method="dialog"><button class="dialog-close" data-i18n-aria-label="close" aria-label="Close">×</button></form>
    </div>
    <section class="help-pixel" aria-labelledby="help-pixel-title">
      <h3 id="help-pixel-title" data-i18n="pixelHelpTitle">Pixel Emoji in the Explorer</h3>
      <p data-i18n="pixelHelpDescription">Pixel font: On uses the original 12×12 font when artwork is available. Turn it off to prefer your system font; Pixel Emoji remains a fallback for unsupported emoji.</p>
      <a href="https://github.com/lewismoten/emoji/tree/main/pixel-font" data-i18n="pixelHelpLink">Learn about and download Pixel Emoji</a>
    </section>
    <section class="help-settings" aria-labelledby="help-settings-title">
      <h3 id="help-settings-title" data-i18n="settings">Settings</h3>
      <div class="setting-row">
        <div>
          <h4 data-i18n="language">Language</h4>
          <p data-i18n="chooseLanguageDescription">Choose a language for emoji search.</p>
        </div>
        <div class="help-language-control"></div>
      </div>
      <div class="setting-row">
        <div>
          <h4 data-i18n="theme">Theme</h4>
          <p data-i18n="themeDescription">Switch between dark, light, and retro themes.</p>
        </div>
        <div class="setting-choice-group theme-choices" role="group" data-i18n-aria-label="theme" aria-label="Theme">
          <button class="setting-choice theme-choice" type="button" data-theme="dark" aria-pressed="true">
            <span aria-hidden="true">🌙</span>
            <span data-i18n="dark">Dark</span>
          </button>
          <button class="setting-choice theme-choice" type="button" data-theme="light" aria-pressed="false">
            <span aria-hidden="true">☀️</span>
            <span data-i18n="light">Light</span>
          </button>
          <button class="setting-choice theme-choice" type="button" data-theme="retro" aria-pressed="false">
            <span aria-hidden="true">🕹️</span>
            <span data-i18n="retro">Retro</span>
          </button>
        </div>
      </div>
      <div class="setting-row">
        <div>
          <h4 data-i18n="soundEffects">Sound effects</h4>
          <p data-i18n="soundEffectsDescription">In retro mode, buttons and dialog windows can play 8-bit sound effects.</p>
        </div>
        <label class="setting-switch">
          <input class="sound-effects-toggle" type="checkbox" role="switch">
          <span data-i18n="soundEffects">Sound effects</span>
        </label>
      </div>
      <div class="setting-row">
        <div>
          <h4 data-i18n="music">Music</h4>
          <p data-i18n="musicDescription">In retro mode, the Help and settings dialog can play 8-bit music.</p>
        </div>
        <label class="setting-switch">
          <input class="music-toggle" type="checkbox" role="switch">
          <span data-i18n="music">Music</span>
        </label>
      </div>
      <div class="setting-row">
        <div>
          <h4 data-i18n="developerMode">Developer mode</h4>
          <p data-i18n="developerModeDescription">Show sequence construction, technical metadata, code tools, rendering diagnostics, and the pixel editor.</p>
        </div>
        <label class="setting-switch">
          <input class="developer-mode-toggle" type="checkbox" role="switch">
          <span data-i18n="developerMode">Developer mode</span>
        </label>
      </div>
    </section>
    <h3 class="shortcut-heading" data-i18n="keyboardShortcuts">Keyboard shortcuts</h3>
    <dl class="shortcut-list">
      <div><dt><kbd>/</kbd></dt><dd data-i18n="shortcutSearch">Focus search</dd></div>
      <div><dt><kbd>←</kbd> <kbd>→</kbd></dt><dd data-i18n="shortcutNavigate">Navigate emoji</dd></div>
      <div><dt><kbd>Enter</kbd></dt><dd data-i18n="shortcutOpen">Open the selected emoji</dd></div>
      <div><dt><kbd>Esc</kbd></dt><dd data-i18n="shortcutClose">Close a dialog or clear search</dd></div>
      <div><dt><kbd>?</kbd></dt><dd data-i18n="shortcutHelp">Open Help and settings</dd></div>
    </dl>
  </dialog>
`;
