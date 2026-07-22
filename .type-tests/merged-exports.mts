import activities from '@lewismoten/emoji/categories/activities';
import emoji from '@lewismoten/emoji/all';
import { createEmojiSearch, mergeEmojiLocalePacks } from '@lewismoten/emoji/search';

const activity: string = activities.artistPalette;
const allEmoji: string = emoji.clinkingBeerMugs;
const search = createEmojiSearch({ annotations: { artistPalette: ['artist palette', 'painting'] } });
const matches: string[] = search('painting');
const mergedSearch = createEmojiSearch(mergeEmojiLocalePacks(
  { locale: 'en', annotations: { artistPalette: ['artist palette'] } },
  { locale: 'en-US', baseLocale: 'en', annotations: {} }
));

// Exact emoji names from merger-module declarations must remain available.
// @ts-expect-error Unknown emoji keys must still be rejected.
activities.notAnEmoji;
// @ts-expect-error Unknown emoji keys must still be rejected.
emoji.notAnEmoji;

void activity;
void allEmoji;
void matches;
void mergedSearch;
