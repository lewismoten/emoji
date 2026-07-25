import assert from 'node:assert/strict';
import {
  buildExplorerUrlQuery,
  parseExplorerUrlState
} from '../../src/explorer/url-state.js';

const queryEntries = (value: string) =>
  Array.from(new URLSearchParams(value).entries()).sort(([left], [right]) =>
    left.localeCompare(right)
  );

assert.deepEqual(
  parseExplorerUrlState({
    search:
      '?q=gift&version=17.0&mode=selected&order=sequence&sequenceType=zwj&skin=1F3FB&hair=1F9B0&gender=female&composition=full&emoji=wrappedGift&emojiMode=code&panel=help',
    developerMode: true,
    preferredOrder: 'unicode',
    allowedSequenceTypes: ['single', 'zwj']
  }),
  {
    search: 'gift',
    version: '17.0',
    versionMode: 'selected',
    group: '',
    subGroup: '',
    sequenceType: 'zwj',
    skin: ['1F3FB'],
    hair: ['1F9B0'],
    gender: ['female'],
    order: 'sequence',
    compositionMode: 'full',
    emoji: 'wrappedGift',
    emojiMode: 'code',
    panel: 'help'
  }
);

assert.deepEqual(
  parseExplorerUrlState({
    search: '?order=sequence&emojiMode=editor&panel=language',
    developerMode: false,
    preferredOrder: 'unicode',
    allowedSequenceTypes: ['single', 'zwj']
  }),
  {
    search: '',
    version: '',
    versionMode: 'through',
    group: '',
    subGroup: '',
    sequenceType: '',
    skin: [],
    hair: [],
    gender: [],
    order: 'unicode',
    compositionMode: 'condensed',
    emoji: '',
    emojiMode: 'details',
    panel: 'language'
  }
);

assert.deepEqual(
  queryEntries(
    buildExplorerUrlQuery({
      search: 'gift',
      developerMode: true,
      latestReleasedVersion: '17.0',
      version: '18.0',
      versionMode: 'selected',
      order: 'sequence',
      group: 'Objects',
      subGroup: 'Objects::mail',
      sequenceType: 'zwj',
      skin: ['1F3FB'],
      hair: [],
      gender: ['female'],
      compositionMode: 'full',
      currentEmojiKey: 'wrappedGift',
      emojiMode: 'editor',
      panel: '',
      dialogOpen: true
    })
  ),
  queryEntries(
    'q=gift&version=18.0&mode=selected&developer=1&sequenceType=zwj&skin=1F3FB&gender=female&order=sequence&composition=full&emoji=wrappedGift&emojiMode=editor'
  )
);

assert.equal(
  buildExplorerUrlQuery({
    search: 'gift',
    developerMode: false,
    latestReleasedVersion: '17.0',
    version: '17.0',
    versionMode: 'through',
    order: 'unicode',
    group: 'Objects',
    subGroup: 'Objects::mail',
    sequenceType: '',
    skin: [],
    hair: [],
    gender: [],
    compositionMode: 'condensed',
    currentEmojiKey: '',
    emojiMode: 'details',
    panel: 'favorites',
    dialogOpen: false
  }),
  'q=gift&group=Objects&subgroup=mail&order=unicode&panel=favorites'
);
