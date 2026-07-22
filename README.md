# emoji

[![Emoji Explorer — Unicode emoji for JavaScript](https://raw.githubusercontent.com/lewismoten/emoji/main/social-preview.svg)](https://lewismoten.github.io/emoji/)

Provides Unicode Emoji 17.0 lookup packs that can be imported or lazy-loaded by need.

The generated dataset contains every Unicode-recommended fully-qualified emoji
sequence, including skin-tone, hair, gender, family, and ZWJ variants.

## Unicode version manifests

Each `versions/<version>.json` file contains only the exported emoji keys that
were introduced in that Unicode Emoji version. Load a manifest separately when
you need to include or exclude a release without adding version metadata to the
emoji lookup itself:

```js
const introducedIn17 = await fetch('./versions/17.0.json').then(response => response.json());
```

`versions/manifest.json` lists each version file, its official release date,
and its entry count. Use its ISO date to select all version files available by
a cutoff year or date.

## Installation

`npm i @lewismoten/emoji -s`

## Code

The root export is a small, curated popular pack:

```js
import emoji from "@lewismoten/emoji";
console.log(emoji.clinkingBeerMugs);
```

## Packs

Discover the available packs, labels, counts, and public import paths without
hard-coding them:

```js
import manifest from "@lewismoten/emoji/manifest" with { type: "json" };

console.log(manifest.categories);
```

`@lewismoten/emoji/orders/manifest` provides canonical Unicode key order and
the `sequenceType` field on each emoji supports sequence-aware rendering.

## Search and localization

Search is data-free until a locale pack is imported. Locale packs contain CLDR
short names and keywords where CLDR provides them, and can be loaded only for
the languages your app needs:

```js
import { createEmojiSearch } from "@lewismoten/emoji/search";
import english from "@lewismoten/emoji/locales/en" with { type: "json" };

const search = createEmojiSearch(english);
console.log(search("artist palette")); // ["artistPalette"]
```

Regional packs are compact overrides, so merge their base locale first. The
locale manifest exposes `baseLocale`, `count` (stored overrides), and
`totalCount` (annotations after inheritance):

```js
import { createEmojiSearch, mergeEmojiLocalePacks } from "@lewismoten/emoji/search";
import english from "@lewismoten/emoji/locales/en" with { type: "json" };
import americanEnglish from "@lewismoten/emoji/locales/en-US" with { type: "json" };

const search = createEmojiSearch(mergeEmojiLocalePacks(english, americanEnglish));
```

The included locale packs are listed in `@lewismoten/emoji/locales/manifest`.
Regional packs are published only when CLDR has annotations that differ from
their base language. When you request a regional locale, its base language is
generated first automatically: `npm run cldr -- en-US`.

Each locale pack also includes `labels`, the CLDR character-label dictionary
used by character pickers and keyboards. It supplies localized broad labels
such as `person`, `food_drink`, `travel_places`, and `symbols`; consumers can
keep their Unicode group/subgroup IDs stable while using these values for display.
The package supplements CLDR with `subgroups` for the Unicode subgroup labels
that CLDR does not define directly; the reviewable additions live in
`scripts/locale-label-overrides.json` and are merged during locale generation.

The Emoji Explorer uses a representative country flag beside each language to
make the picker easier to scan. Those flags are visual identifiers only; a base
language pack such as `es` or `ar` is not limited to that country or region.

Each top-level category is composed from Unicode subgroup imports. For example,
load only hand emoji instead of the full People & Body category:

```js
import hands from "@lewismoten/emoji/categories/people-and-body/hands";
```

Load all emojis only when a complete lookup is needed:

```js
import emoji from "@lewismoten/emoji/all";
```

Categories are separate modules and can be lazy-loaded:

```js
const { default: people } = await import("@lewismoten/emoji/categories/people-and-body");
```

Available categories are `activities`, `animals-and-nature`, `component`, `flags`,
`food-and-drink`, `objects`, `people-and-body`, `smileys-and-emotion`, `symbols`,
and `travel-and-places`.

Variant packs are available at `variations/skin-tones`, `variations/hair`,
`variations/families`, and `variations/all`:

```js
import families from "@lewismoten/emoji/variations/families";
```

For an individual emoji, use the `all` export. This avoids shipping thousands of tiny per-emoji files:

```js
import emoji from "@lewismoten/emoji/all";

const clinkingBeerMugs = emoji.clinkingBeerMugs;
```

For direct browser use, `dist/esm/index.js` is a self-contained module containing
the complete lookup object:

```html
<script type="module">
  import emoji from "./dist/esm/index.js";
  console.log(emoji.clinkingBeerMugs);
</script>
```

## Demo

A local demo can be ran using vite

```bash
npm i
npm start
http://localhost:5173
```

The live demo is hosted on GitHub pages:

<https://lewismoten.github.io/emoji/>

![Screenshot](screenshot.png)

## Data attribution

Generated emoji, ordering, release, and proposed data are derived from Unicode
data files and are distributed under the Unicode License v3 (`Unicode-3.0`).
See [NOTICE.md](NOTICE.md) for the required copyright and permission notice.
The Unicode word mark and logo are not used to endorse this package.

## Scripts

- clean: drops the build & dist folders
- build: creates typescript
- generate: creates popular, all, category, and variation source packs from `emoji.json` and `popular.json`
- bundle: creates JavaScript & TypeScript Definitions for packaging
- prepublishOnly: ensures a new bundle is created for publishing
- start: Runs demo site at http://localhost:5173
- test: builds the complete package and verifies every release data set and public pack
- unicode: downloads a Unicode Emoji version, regenerates `emoji.ts` and `emoji.json`, and rebuilds the packs
- unicode:proposed: downloads the current official Unicode draft data and writes only new candidate emoji to `proposed/`

To update to a future Unicode release, run:

```bash
npm run unicode -- 18.0
```

To inspect candidate emoji for the upcoming draft release without changing the stable package data, run:

```bash
npm run unicode:proposed
```

This writes `proposed/<draft-version>.json` and records it in `versions/manifest.json` under `proposed`. Draft entries have no release date and are clearly marked with `"status": "draft"`; they are separate from released version arrays because Unicode may change or remove them before release. To require a particular current draft version, pass it explicitly:

```bash
npm run unicode:proposed -- 18.0
```

Pass draft-release context to make the demo label the future version more clearly:

```bash
npm run unicode:proposed -- 18.0 --stage=beta --expected=2026-09
```
