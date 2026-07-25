type MinimalElement = {
  append(...nodes: unknown[]): void;
  before(...nodes: unknown[]): void;
  childNodes: unknown[];
  className: string;
  dataset: Record<string, string | undefined>;
  innerHTML: string;
  insertAdjacentHTML(position: InsertPosition, text: string): void;
  prepend(...nodes: unknown[]): void;
  querySelector(selector: string): MinimalElement | null;
  remove(): void;
  replaceWith(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  hidden?: boolean;
  textContent: string | null;
  title?: string;
  type?: string;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
  querySelector(selector: string): MinimalElement | null;
};

type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

declare const window: {
  matchMedia(query: string): { matches: boolean };
};

export function positionFavoriteButton() {
  const favoriteButton = document.querySelector(
    '.example-dialog .toggle-favorite'
  );
  const dialogTitleRow = document.querySelector(
    '.example-dialog .dialog-title-row'
  );
  const dialogControls = document.querySelector(
    '.example-dialog .dialog-controls'
  );
  if (!favoriteButton || !dialogTitleRow || !dialogControls) return;
  if (window.matchMedia('(max-width: 560px)').matches) {
    dialogControls.querySelector('form')?.before(favoriteButton);
  } else {
    dialogTitleRow.prepend(favoriteButton);
  }
}

export function ensureUtilityControls() {
  const searchControls = document.querySelector('.search-controls');
  const fontComparison = document.querySelector('.pixel-comparison');
  if (fontComparison && !fontComparison.querySelector('.emoji-font-choice')) {
    fontComparison.setAttribute('role', 'group');
    fontComparison.dataset.i18nAriaLabel = 'emojiStyle';
    fontComparison.setAttribute('aria-label', 'Emoji style');
    Array.from(fontComparison.childNodes).forEach((preview, index) => {
      if (!preview || typeof preview !== 'object') return;
      const button = document.createElement('button');
      const font = index === 0 ? 'system' : 'pixel';
      button.className = `emoji-font-choice emoji-font-choice-${font}`;
      button.type = 'button';
      button.dataset.emojiFont = font;
      button.setAttribute('aria-pressed', String(font === 'pixel'));
      button.append(...(preview as MinimalElement).childNodes);
      (preview as MinimalElement).replaceWith(button);
    });
  }
  if (searchControls && !searchControls.querySelector('.saved-picker')) {
    searchControls.insertAdjacentHTML(
      'beforeend',
      `
      <button class="saved-picker" type="button" aria-haspopup="dialog" aria-controls="saved-dialog" data-i18n-aria-label="savedEmoji" aria-label="Saved emoji">
        <span aria-hidden="true">⭐</span>
        <span class="saved-picker-label" data-i18n="favorites">Favorites</span>
      </button>
    `
    );
  }
  searchControls?.querySelector('.pixel-font-toggle')?.remove();
  if (searchControls && !searchControls.querySelector('.help-picker')) {
    searchControls.insertAdjacentHTML(
      'beforeend',
      `
      <button class="help-picker" type="button" aria-haspopup="dialog" aria-controls="help-dialog" data-i18n-aria-label="helpAndSettings" aria-label="Help and settings">
        <span aria-hidden="true">?</span>
      </button>
    `
    );
  }

  const dialogTitle = document.querySelector(
    '.example-dialog .dialog-heading > div:first-child'
  );
  let dialogTitleRow = dialogTitle?.querySelector('.dialog-title-row');
  if (dialogTitle && !dialogTitleRow) {
    dialogTitleRow = document.createElement('div');
    dialogTitleRow.className = 'dialog-title-row';
    const title = dialogTitle.querySelector('h2');
    title?.before(dialogTitleRow);
    if (title) dialogTitleRow.append(title);
  }
  let favoriteButton = document.querySelector(
    '.example-dialog .toggle-favorite'
  );
  const dialogControls = document.querySelector(
    '.example-dialog .dialog-controls'
  );
  if (dialogControls && !favoriteButton) {
    favoriteButton = document.createElement('button');
    favoriteButton.className = 'toggle-favorite';
    favoriteButton.type = 'button';
    favoriteButton.setAttribute('aria-pressed', 'false');
    favoriteButton.innerHTML = '<span aria-hidden="true">☆</span>';
    dialogControls.querySelector('form')?.before(favoriteButton);
  }
  if (dialogControls && favoriteButton) {
    favoriteButton.querySelector('.toggle-favorite-label')?.remove();
    favoriteButton.dataset.i18nAriaLabel = 'addFavorite';
    favoriteButton.setAttribute('aria-label', 'Add favorite');
    favoriteButton.title = 'Add favorite';
    positionFavoriteButton();
  }
  const dialogDetails = document.querySelector(
    '.example-dialog .emoji-dialog-details'
  );
  if (
    dialogDetails &&
    !document.querySelector('.example-dialog .emoji-composition')
  ) {
    dialogDetails.insertAdjacentHTML(
      'afterend',
      `
      <section class="emoji-composition" hidden>
        <div class="emoji-composition-heading">
          <h3 data-i18n="builtFrom">Built from</h3>
          <button class="emoji-composition-mode" type="button" aria-pressed="false" hidden>Show full sequence</button>
        </div>
        <div class="emoji-composition-equation" dir="ltr"></div>
      </section>
    `
    );
  }
  const composition = document.querySelector(
    '.example-dialog .emoji-composition'
  );
  if (composition && !composition.querySelector('.emoji-composition-heading')) {
    const heading = document.createElement('div');
    const title = composition.querySelector('h3');
    heading.className = 'emoji-composition-heading';
    title?.before(heading);
    if (title) heading.append(title);
  }
  const compositionHeading = composition?.querySelector(
    '.emoji-composition-heading'
  );
  if (
    compositionHeading &&
    !compositionHeading.querySelector('.emoji-composition-mode')
  ) {
    const mode = document.createElement('button');
    mode.className = 'emoji-composition-mode';
    mode.type = 'button';
    mode.hidden = true;
    mode.setAttribute('aria-pressed', 'false');
    mode.textContent = 'Show full sequence';
    compositionHeading.append(mode);
  }

  const main = document.querySelector('main');
  if (main && !document.querySelector('.saved-dialog')) {
    main.insertAdjacentHTML(
      'beforeend',
      `
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
    `
    );
  }
  if (main && !document.querySelector('.help-dialog')) {
    main.insertAdjacentHTML(
      'beforeend',
      `
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
    `
    );
  }
  const helpLanguageControl = document.querySelector(
    '.help-dialog .help-language-control'
  );
  const languagePicker = document.querySelector('.language-picker');
  if (helpLanguageControl && languagePicker) {
    helpLanguageControl.append(languagePicker);
  }
}
