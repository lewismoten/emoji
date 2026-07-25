import assert from 'node:assert/strict';
import { resolveRenderingDiagnostic } from '../../src/explorer/rendering-diagnostic.js';

const translate = (key: string, fallback: string) => `${key}:${fallback}`;

assert.deepEqual(
  resolveRenderingDiagnostic({
    codePoints: '1F469 200D 1F52C',
    emojiValue: '👩‍🔬',
    painted: true,
    privateUsePoint: 0xe001,
    developerMode: true,
    detailsVisible: true,
    systemEmojiAppearsSplit: () => true,
    translate
  }),
  {
    sectionAvailable: true,
    invitationAvailable: false,
    sectionHidden: false,
    invitationHidden: true,
    regularEditorHidden: false,
    split: true,
    resultText:
      'systemRenderingSplit:⚠ The system displayed separate components; Pixel Emoji keeps the sequence together.'
  }
);

assert.equal(
  resolveRenderingDiagnostic({
    codePoints: '1F381',
    emojiValue: '🎁',
    painted: false,
    privateUsePoint: undefined,
    developerMode: true,
    detailsVisible: true,
    systemEmojiAppearsSplit: () => false,
    translate
  }).invitationAvailable,
  true
);
