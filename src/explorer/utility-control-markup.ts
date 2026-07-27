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
