import { displayEmojiKey, normalizeDisplayName } from './emoji-format.js';

export function buildEscapeSequence(value: string) {
  const bits: string[] = [];
  for (let index = 0; index < value.length; index++) {
    const hex = value.codePointAt(index)!.toString(16);
    if (hex.length <= 4) {
      bits.push(`\\u${hex}`);
      continue;
    }
    bits.push(`\\u{${hex}}`);
    index++;
  }
  return bits.join('');
}

export function buildDialogCopyValues(options: {
  emoji: string;
  key: string;
  codePoints: string;
}) {
  return {
    emoji: options.emoji,
    key: options.key,
    escape: buildEscapeSequence(options.emoji),
    codePoints: options.codePoints
  };
}

export function resolveDialogTitle(options: {
  emojiKey: string;
  selectedSearchLocale: string;
  annotations: string[];
}) {
  const localized = Boolean(
    options.selectedSearchLocale && options.annotations.length > 0
  );
  return {
    title: localized
      ? options.annotations[0]
      : displayEmojiKey(options.emojiKey),
    showLocalized: localized,
    localizedKeywords: localized ? options.annotations.slice(1).join(' · ') : ''
  };
}

export function shouldHideEnglishName(
  dialogTitle: string,
  englishName: string
) {
  return (
    normalizeDisplayName(dialogTitle) === normalizeDisplayName(englishName)
  );
}

export function resolveDialogNavigationState(
  keys: string[],
  currentEmojiKey: string
) {
  const index = keys.indexOf(currentEmojiKey);
  return {
    index,
    previousDisabled: index <= 0,
    nextDisabled: index === -1 || index >= keys.length - 1,
    previousKey: index > 0 ? keys[index - 1] : '',
    nextKey: index >= 0 && index < keys.length - 1 ? keys[index + 1] : ''
  };
}

export function resolveCompositionParentLabel(options: {
  parentKey: string;
  searchAnnotations: Record<string, string[]>;
  byId: Record<string, { shortName?: string }>;
  translate: (key: string, fallback: string) => string;
}) {
  if (!options.parentKey) return '';
  const parentName =
    options.searchAnnotations[options.parentKey]?.[0] ??
    options.byId[options.parentKey]?.shortName ??
    displayEmojiKey(options.parentKey);
  return `${options.translate('backToEmoji', 'Back to emoji')}: ${parentName}`;
}
