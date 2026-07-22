import activities from '@lewismoten/emoji/categories/activities';
import emoji from '@lewismoten/emoji/all';

const activity: string = activities.artistPalette;
const allEmoji: string = emoji.clinkingBeerMugs;

// Exact emoji names from merger-module declarations must remain available.
// @ts-expect-error Unknown emoji keys must still be rejected.
activities.notAnEmoji;
// @ts-expect-error Unknown emoji keys must still be rejected.
emoji.notAnEmoji;

void activity;
void allEmoji;
