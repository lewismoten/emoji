const FAVORITE_EMOJI_KEY = 'glowingStar';
const FAVORITE_EMOJI_FALLBACK = '⭐';
const FAVORITE_OFF_FALLBACK = '☆';

type FavoriteButtonElement = {
  classList?: { toggle(name: string, force?: boolean): void };
  dataset: Record<string, string | undefined>;
  querySelector(selector: string): FavoriteButtonElement | null;
  setAttribute(name: string, value: string): void;
  style: { setProperty(name: string, value: string): void };
  textContent: string | null;
  title: string;
};

declare const document: {
  documentElement: { dataset: Record<string, string | undefined> };
};

export function updateFavoriteGlyph(
  element: FavoriteButtonElement | null,
  applyPixelArtworkClass: (element: any, emojiKey: string) => void,
  favorite: boolean
) {
  if (!element) return;
  element.textContent = favorite ? FAVORITE_EMOJI_FALLBACK : FAVORITE_OFF_FALLBACK;
  applyPixelArtworkClass(element, favorite ? FAVORITE_EMOJI_KEY : '');
}

export function applyRetroFavoriteButtonState(
  button: FavoriteButtonElement,
  favorite: boolean
) {
  if (document.documentElement.dataset.theme !== 'retro') {
    button.style.setProperty('background', '');
    button.style.setProperty('color', '');
    button.style.setProperty('border-top-color', '');
    button.style.setProperty('border-left-color', '');
    button.style.setProperty('border-right-color', '');
    button.style.setProperty('border-bottom-color', '');
    button.style.setProperty('transform', '');
    return;
  }

  if (favorite) {
    button.style.setProperty('background', '#ffff55');
    button.style.setProperty('color', '#000000');
    button.style.setProperty('border-top-color', '#ffffff');
    button.style.setProperty('border-left-color', '#ffffff');
    button.style.setProperty('border-right-color', '#aa5500');
    button.style.setProperty('border-bottom-color', '#aa5500');
    button.style.setProperty('transform', 'translate(0, 0)');
    return;
  }

  button.style.setProperty('background', '#aaaaaa');
  button.style.setProperty('color', '#000000');
  button.style.setProperty('border-top-color', '#ffffff');
  button.style.setProperty('border-left-color', '#ffffff');
  button.style.setProperty('border-right-color', '#555555');
  button.style.setProperty('border-bottom-color', '#555555');
  button.style.setProperty('transform', 'translate(0, 0)');
}

export function updateFavoriteToggleButton(
  button: FavoriteButtonElement | null,
  options: {
    applyPixelArtworkClass: (element: any, emojiKey: string) => void;
    favoriteEmojiKeys: string[];
    currentEmojiKey: string;
    translate: (key: string, fallback: string) => string;
  }
) {
  if (!button) return;
  const favorite = options.favoriteEmojiKeys.includes(options.currentEmojiKey);
  button.setAttribute('aria-pressed', String(favorite));
  button.dataset.favoriteState = favorite ? 'on' : 'off';
  button.classList?.toggle('is-favorite', favorite);
  applyRetroFavoriteButtonState(button, favorite);
  updateFavoriteGlyph(
    button.querySelector('.favorite-glyph') ?? button.querySelector('[aria-hidden="true"]'),
    options.applyPixelArtworkClass,
    favorite
  );
  const key = favorite ? 'removeFavorite' : 'addFavorite';
  const fallback = favorite ? 'Remove favorite' : 'Add favorite';
  const label = options.translate(key, fallback);
  button.dataset.i18nAriaLabel = key;
  button.setAttribute('aria-label', label);
  button.title = label;
}
