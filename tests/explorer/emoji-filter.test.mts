import assert from 'node:assert/strict';
import {
  filterEmojiKeys,
  getEmojiGenders
} from '../../src/explorer/emoji-filter.js';

const emojiByKey = {
  manRunner: '🏃‍♂️',
  personRunning: '🏃',
  womanRunner: '🏃‍♀️'
};
const byId = {
  manRunner: {
    codePoints: '1F3C3 200D 2642 FE0F',
    group: 'People & Body',
    key: 'manRunner',
    sequenceType: 'zwj',
    shortName: 'man running',
    unicodeSubGroup: 'person-activity'
  },
  personRunning: {
    codePoints: '1F3C3',
    group: 'People & Body',
    key: 'personRunning',
    sequenceType: 'single',
    shortName: 'person running',
    unicodeSubGroup: 'person-activity'
  },
  womanRunner: {
    codePoints: '1F3C3 200D 2640 FE0F',
    group: 'People & Body',
    key: 'womanRunner',
    sequenceType: 'zwj',
    shortName: 'woman running',
    unicodeSubGroup: 'person-activity'
  }
};
const options = {
  allIds: Object.keys(byId),
  byId,
  emojiByKey,
  hairModifiers: [],
  items: Object.values(byId),
  orderMode: 'grouped',
  searchAnnotations: {},
  searchText: 'running',
  selectedGenders: [],
  selectedGroup: '',
  selectedSequenceType: '',
  selectedSubGroup: '',
  skinToneModifiers: [],
  subGroupSelectionKey: (group = '', subGroup = '') => `${group}::${subGroup}`
};

assert.deepEqual(filterEmojiKeys(options), Object.keys(byId));
assert.deepEqual(
  filterEmojiKeys({ ...options, selectedGenders: ['female'] }),
  ['womanRunner']
);
assert.deepEqual(
  filterEmojiKeys({ ...options, selectedSequenceType: 'zwj', orderMode: 'sequence' }),
  ['manRunner', 'womanRunner']
);
assert.deepEqual([...getEmojiGenders(byId.personRunning, emojiByKey)], ['neutral']);
