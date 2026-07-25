export function resolveRenderingDiagnostic(options: {
  codePoints?: string;
  emojiValue: string;
  painted: boolean;
  privateUsePoint?: number;
  developerMode: boolean;
  detailsVisible: boolean;
  systemEmojiAppearsSplit: (value: string) => boolean;
  translate: (key: string, fallback: string) => string;
}) {
  const points = (options.codePoints ?? '')
    .split(/\s+/)
    .filter(point => point && !['FE0E', 'FE0F'].includes(point.toUpperCase()));
  const split =
    Boolean(options.privateUsePoint) &&
    points.length > 1 &&
    options.systemEmojiAppearsSplit(options.emojiValue);
  return {
    sectionAvailable: options.painted && Boolean(options.privateUsePoint),
    invitationAvailable: !options.painted,
    sectionHidden:
      !options.detailsVisible ||
      !options.developerMode ||
      !options.painted ||
      !options.privateUsePoint,
    invitationHidden:
      !options.detailsVisible || !options.developerMode || options.painted,
    regularEditorHidden: !options.developerMode || !options.painted,
    split,
    resultText: split
      ? options.translate(
          'systemRenderingSplit',
          '⚠ The system displayed separate components; Pixel Emoji keeps the sequence together.'
        )
      : points.length > 1
        ? options.translate(
            'systemRenderingComposed',
            '✓ The system displayed one composed emoji.'
          )
        : options.translate(
            'systemRenderingSingle',
            'The system and Pixel Emoji renderings are shown above.'
          )
  };
}
