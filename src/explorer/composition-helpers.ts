import {
  displayEmojiKey,
  formatCompositionReduction,
  normalizeCodePoints
} from './emoji-format.js';

export function isCondensedSequenceControl(point: number) {
  return point === 0x200d || point === 0xfe0e || point === 0xfe0f;
}

export function findCompositionArtworkKey(
  hex: string,
  emojiKeyByCodePoints: Map<string, string>
) {
  const normalized = normalizeCodePoints(hex);
  return [
    emojiKeyByCodePoints.get(normalized),
    emojiKeyByCodePoints.get(`${normalized} FE0F`)
  ].find(Boolean);
}

export function findCompositionEmojiKey(
  hex: string,
  excludedEmojiKey: string,
  emojiKeyByCodePoints: Map<string, string>
) {
  const emojiKey = findCompositionArtworkKey(hex, emojiKeyByCodePoints);
  return emojiKey && emojiKey !== excludedEmojiKey ? emojiKey : undefined;
}

export function condenseCompositionPoints(
  points: Array<{ hex: string; point: number }>,
  currentEmojiKey: string,
  emojiKeyByCodePoints: Map<string, string>
) {
  const condensed: Array<
    | { component: { hex: string; point: number } }
    | {
        emojiKey: string;
        components: Array<{ hex: string; point: number }>;
      }
  > = [];
  for (let start = 0; start < points.length;) {
    let match:
      | {
          emojiKey: string;
          components: Array<{ hex: string; point: number }>;
        }
      | undefined;
    for (let end = points.length; end >= start + 2; end--) {
      if (start === 0 && end === points.length) continue;
      const codePoints = points
        .slice(start, end)
        .map(component => component.hex)
        .join(' ');
      const emojiKey = emojiKeyByCodePoints.get(codePoints);
      if (emojiKey && emojiKey !== currentEmojiKey) {
        match = { emojiKey, components: points.slice(start, end) };
        break;
      }
    }
    if (match) {
      condensed.push(match);
      start += match.components.length;
      continue;
    }
    condensed.push({ component: points[start] });
    start++;
  }
  return condensed;
}

export function describeCompositionPoint(
  point: number,
  translate: (key: string, fallback: string) => string
) {
  const special = {
    0x200d: ['ZWJ', 'zeroWidthJoiner', 'Zero-width joiner'],
    0xfe0e: ['VS15', 'textPresentation', 'Text presentation selector'],
    0xfe0f: ['VS16', 'emojiPresentation', 'Emoji presentation selector'],
    0x20e3: [
      null,
      'combiningKeycap',
      'Combining keycap',
      'keycapAbbreviation',
      'KEY'
    ],
    0xe007f: [null, 'cancelTag', 'Cancel tag', 'cancelTagAbbreviation', 'END']
  }[point] as [string | null, string, string, string?, string?] | undefined;
  if (special) {
    const label = translate(special[1], special[2]);
    const glyph = special[0] ?? translate(special[3]!, special[4]!);
    return { glyph, label, symbolic: true };
  }
  if (point >= 0x1f3fb && point <= 0x1f3ff) {
    const tones = [
      ['light', 'Light skin tone'],
      ['mediumLight', 'Medium-light skin tone'],
      ['medium', 'Medium skin tone'],
      ['mediumDark', 'Medium-dark skin tone'],
      ['dark', 'Dark skin tone']
    ] as const;
    const [key, fallback] = tones[point - 0x1f3fb];
    return {
      glyph: String.fromCodePoint(point),
      label: translate(key, fallback),
      symbolic: false
    };
  }
  if (point >= 0x1f1e6 && point <= 0x1f1ff) {
    const letter = String.fromCharCode(65 + point - 0x1f1e6);
    return {
      glyph: String.fromCodePoint(point),
      label: `${translate('regionalIndicator', 'Regional indicator')} ${letter}`,
      symbolic: false
    };
  }
  if (point >= 0xe0020 && point <= 0xe007e) {
    const character = String.fromCodePoint(point - 0xe0000);
    const visibleCharacter = character === ' ' ? '\u2420' : character;
    const tagLabel = translate('tagCharacter', 'Tag character');
    const tagAbbreviation = translate('tagAbbreviation', 'TAG');
    return {
      glyph: `${tagAbbreviation} ${visibleCharacter}`,
      label: `${tagLabel} ${visibleCharacter}`,
      symbolic: true
    };
  }
  return {
    glyph: String.fromCodePoint(point),
    label: `U+${point.toString(16).toUpperCase()}`,
    symbolic: false
  };
}

export function compositionTitle(
  emojiKey: string,
  searchAnnotations: Record<string, string[]>,
  byId: Record<string, { shortName?: string }>
) {
  return (
    searchAnnotations[emojiKey]?.[0] ??
    byId[emojiKey]?.shortName ??
    displayEmojiKey(emojiKey)
  );
}

export function compositionReductionLabel(
  from: number,
  to: number,
  options: {
    dir?: string;
    locale?: string;
    numberingSystem?: string;
  }
) {
  return formatCompositionReduction(from, to, options);
}
