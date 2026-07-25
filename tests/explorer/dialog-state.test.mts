import assert from 'node:assert/strict';
import {
  buildDialogCopyValues,
  buildEscapeSequence,
  resolveCompositionParentLabel,
  resolveDialogNavigationState,
  resolveDialogTitle,
  shouldHideEnglishName
} from '../../src/explorer/dialog-state.js';

assert.equal(buildEscapeSequence('A😀'), '\\u41\\u{1f600}');

assert.deepEqual(
  buildDialogCopyValues({
    emoji: '🎁',
    key: 'wrappedGift',
    codePoints: 'U+1F381'
  }),
  {
    emoji: '🎁',
    key: 'wrappedGift',
    escape: '\\u{1f381}',
    codePoints: 'U+1F381'
  }
);

assert.deepEqual(
  resolveDialogTitle({
    emojiKey: 'wrappedGift',
    selectedSearchLocale: 'ar',
    annotations: ['هدية ملفوفة', 'احتفال', 'مناسبة']
  }),
  {
    title: 'هدية ملفوفة',
    showLocalized: true,
    localizedKeywords: 'احتفال · مناسبة'
  }
);

assert.deepEqual(
  resolveDialogTitle({
    emojiKey: 'wrappedGift',
    selectedSearchLocale: '',
    annotations: []
  }),
  {
    title: 'Wrapped gift',
    showLocalized: false,
    localizedKeywords: ''
  }
);

assert.equal(shouldHideEnglishName('Wrapped gift', 'wrapped gift'), true);
assert.equal(shouldHideEnglishName('هدية ملفوفة', 'Wrapped gift'), false);

assert.deepEqual(
  resolveDialogNavigationState(['wave', 'gift', 'rocket'], 'gift'),
  {
    index: 1,
    previousDisabled: false,
    nextDisabled: false,
    previousKey: 'wave',
    nextKey: 'rocket'
  }
);

assert.equal(
  resolveCompositionParentLabel({
    parentKey: 'blackFlag',
    searchAnnotations: { blackFlag: ['Black flag'] },
    byId: {},
    translate: (key, fallback) =>
      key === 'backToEmoji' ? 'Back to emoji' : fallback
  }),
  'Back to emoji: Black flag'
);
