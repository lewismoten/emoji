# @lewismoten/emoji

[![Emoji Explorer — Unicode emoji for JavaScript](https://raw.githubusercontent.com/lewismoten/emoji/main/social-preview.svg)](https://lewismoten.github.io/emoji/)

Named Unicode Emoji 17.0 lookup packs for JavaScript and TypeScript. Import a
small popular set, the complete collection, a Unicode category or subgroup, or
a modifier-focused variation pack.

The generated dataset contains every Unicode-recommended fully-qualified emoji
sequence, including skin-tone, hair, gender, family, and ZWJ variants. Proposed
Emoji 18.0 candidates are kept separate from released emoji.

[Explore the emoji](https://lewismoten.github.io/emoji/) ·
[View the package on npm](https://www.npmjs.com/package/@lewismoten/emoji) ·
[Download the Pixel Emoji fallback font](pixel-font/README.md)

## Installation

```bash
npm install @lewismoten/emoji
```

## Quick start

The root export is a small, curated popular pack:

```js
import emoji from "@lewismoten/emoji";

console.log(emoji.clinkingBeerMugs); // 🍻
```

Import the complete lookup only when it is needed:

```js
import emoji from "@lewismoten/emoji/all";

console.log(emoji.wrappedGift); // 🎁
```

CommonJS is also supported:

```js
const emoji = require("@lewismoten/emoji/all");
```

### TypeScript

Every JavaScript export includes declarations with exact emoji keys. Editors
can autocomplete expressions such as `emoji.` and show declaration comments
that include the emoji name and glyph.

## Choosing a pack

The machine-readable package manifest lists every pack, label, entry count,
Unicode category, subgroup, and public import path:

```js
import manifest from "@lewismoten/emoji/manifest" with { type: "json" };

console.log(manifest.categories);
```

Using the manifest prevents applications from hard-coding a category list that
may change when Unicode adds or reorganizes emoji. The popular pack also lists
its curated `keys`, allowing consumers to check whether a specific emoji is
available from the root export.

### Categories and subgroups

Categories are separate modules and can be imported normally or lazy-loaded:

```js
import objects from "@lewismoten/emoji/categories/objects";

const { default: people } = await import(
  "@lewismoten/emoji/categories/people-and-body"
);
```

Each category is composed from smaller Unicode subgroup modules. For example,
an application can load only hand emoji instead of the complete People & Body
category:

```js
import hands from "@lewismoten/emoji/categories/people-and-body/hands";
```

Available top-level categories are `activities`, `animals-and-nature`,
`component`, `flags`, `food-and-drink`, `objects`, `people-and-body`,
`smileys-and-emotion`, `symbols`, and `travel-and-places`.

### Variations

Modifier-focused packs are available for skin tones, hair, families, or every
supported variation:

```js
import skinTones from "@lewismoten/emoji/variations/skin-tones";
import hair from "@lewismoten/emoji/variations/hair";
import families from "@lewismoten/emoji/variations/families";
import variations from "@lewismoten/emoji/variations/all";
```

### Individual emoji

Individual per-emoji files are intentionally not generated because thousands
of tiny files make the installed package unnecessarily large. Use the `all`
lookup when an individual key is needed:

```js
import emoji from "@lewismoten/emoji/all";

const clinkingBeerMugs = emoji.clinkingBeerMugs;
```

## Search and localization

The search implementation contains no language data until a locale pack is
loaded. Locale packs contain CLDR short names, keywords, character labels, and
additional translated subgroup labels:

```js
import { createEmojiSearch } from "@lewismoten/emoji/search";
import english from "@lewismoten/emoji/locales/en" with { type: "json" };

const search = createEmojiSearch(english);

console.log(search("artist palette")); // ["artistPalette"]
console.log(search("painting")); // includes "artistPalette"
```

Regional packs contain only annotations that differ from their base language.
Merge the base and regional packs before searching:

```js
import {
  createEmojiSearch,
  mergeEmojiLocalePacks,
} from "@lewismoten/emoji/search";
import english from "@lewismoten/emoji/locales/en" with { type: "json" };
import britishEnglish from "@lewismoten/emoji/locales/en-GB" with {
  type: "json",
};

const locale = mergeEmojiLocalePacks(english, britishEnglish);
const search = createEmojiSearch(locale);
```

The locale manifest identifies every available pack and provides its English
name, native name, text direction, base locale, CLDR version, and stored and
inherited entry counts:

```js
import locales from "@lewismoten/emoji/locales/manifest" with {
  type: "json",
};

console.log(locales.locales);
```

Regional packs are published only when CLDR provides annotations that differ
from the base language. For example, `en-GB` exists, while an empty `en-US`
override is omitted. Each base pack also includes `labels` for broad picker
labels and `subgroups` for labels Unicode and CLDR do not translate directly.

The Emoji Explorer uses representative country flags to make languages easier
to scan. These flags are visual identifiers only; a base language such as `es`
or `ar` is not limited to one country or region.

## Unicode order and versions

Use the order manifest to display keys in canonical Unicode order:

```js
import order from "@lewismoten/emoji/orders/manifest" with { type: "json" };

console.log(order.unicode);
```

Each `versions/<version>.json` file contains only the exported keys introduced
in that Unicode Emoji version. The version manifest lists every file, official
release date, and entry count:

```js
import versions from "@lewismoten/emoji/versions/manifest" with {
  type: "json",
};
import introducedIn17 from "@lewismoten/emoji/versions/17.0" with {
  type: "json",
};

const releasesAvailableBy2025 = versions.versions
  .filter(release => release.released <= "2025-12-31")
  .map(release => release.version);

console.log(introducedIn17);
```

Version arrays are separate from the emoji lookup, so applications pay for
version metadata only when they use it. Proposed candidates are likewise
separate from released data:

```js
import proposed18 from "@lewismoten/emoji/proposed/18.0" with {
  type: "json",
};

console.log(proposed18.status); // "draft"
```

Draft candidates may change or be removed before Unicode publishes the final
release.

## Direct browser use

`dist/esm/index.js` is a self-contained browser module containing the complete
lookup object. It does not load category modules behind the scenes.

Use it from a CDN:

```html
<script type="module">
  import emoji from "https://cdn.jsdelivr.net/npm/@lewismoten/emoji@4/dist/esm/index.js";

  console.log(emoji.clinkingBeerMugs);
</script>
```

Or copy `dist/esm/index.js` and serve it with an application:

```html
<script type="module">
  import emoji from "./dist/esm/index.js";

  console.log(emoji.clinkingBeerMugs);
</script>
```

## Pixel Emoji fallback font

[Pixel Emoji](pixel-font/README.md) is a compact 12×12 color fallback font for
new emoji that older operating-system fonts cannot display. Its custom artwork
currently covers every entry introduced with Emoji 16.0 and 17.0, plus every
entry in the currently tracked Emoji 18.0 beta draft.

Released and proposed characters are kept in separate font families so
applications can opt into draft coverage without treating it as stable. The
GitHub Pages workflow builds the fonts from the source atlases; compiled fonts
are not included in the npm package or committed under `pixel-font/build/`.

**Released:** [TTF](https://lewismoten.github.io/emoji/pixel-font/build/font/pixel-emoji.ttf) ·
[WOFF2](https://lewismoten.github.io/emoji/pixel-font/build/font/pixel-emoji.woff2) ·
**Proposed:** [TTF](https://lewismoten.github.io/emoji/pixel-font/build/font/proposed/pixel-emoji.ttf) ·
[WOFF2](https://lewismoten.github.io/emoji/pixel-font/build/font/proposed/pixel-emoji.woff2) ·
[Web-font CSS](https://lewismoten.github.io/emoji/pixel-font/build/font/pixel-emoji.css)

See the [font documentation and complete coverage table](pixel-font/README.md)
for WOFF downloads, design constraints, atlas details, sequence handling, and
local build instructions.

## Emoji Explorer demo

The [live Emoji Explorer](https://lewismoten.github.io/emoji/) demonstrates
search, localization, category and subgroup browsing, release filtering,
modifier filtering, and Unicode and sequence ordering.

It is an installable web app. After the first visit, the explorer and its core
Unicode data work offline. Search-language packs are cached for offline use
after they are selected once.

Run the demo locally with Vite:

```bash
npm install
npm start
```

Then open <http://localhost:5173/>. Localized routes such as
<http://localhost:5173/index.ar.html> are generated in memory by Vite.

![Emoji Explorer screenshot](https://raw.githubusercontent.com/lewismoten/emoji/main/screenshot.png)

## Data attribution and license

The package source code is distributed under the [ISC license](LICENSE.md).

Generated emoji, ordering, release, localization, and proposed data are derived
from Unicode and CLDR data files. Unicode data is distributed under the Unicode
License v3 (`Unicode-3.0`). See [NOTICE.md](NOTICE.md) for the copyright,
permission, attribution, and trademark notices. The Unicode word mark and logo
are not used to endorse this package.

## Development scripts

- `npm run clean` removes generated `build` and `dist` directories.
- `npm run generate` creates popular, complete, category, subgroup, and
  variation source packs from `emoji.json` and `popular.json`.
- `npm run build` regenerates the library and compiles TypeScript.
- `npm run bundle` produces the publishable JavaScript and TypeScript files.
- `npm test` builds the package and verifies Unicode releases, public package
  specifiers, TypeScript declarations, localized demo pages, and PWA assets.
- `npm start` runs the local Emoji Explorer.
- `npm run format` formats repository JSON files with Prettier.
- `npm run cldr -- <locale>` downloads CLDR annotations and regenerates locale
  packs. A regional locale automatically generates its base language first.
- `npm run unicode -- <version>` downloads a released Unicode Emoji version and
  regenerates the library data.
- `npm run unicode:proposed` downloads the current official Unicode draft data.
- `npm run pixel-font:generate` updates pixel-font atlas assignments without
  creating empty PNG sheets.
- `npm run pixel-font:validate` verifies every active atlas assignment.
- `npm run pixel-font:build` creates the complete local font, glyph-image,
  manifest, and preview output.
- `npm run pixel-font:build -- --fonts-only` creates the deployment font files
  and manifests without individual PNG or SVG glyph output.

Update to a future released version with:

```bash
npm run unicode -- 18.0
```

Inspect the current draft without changing stable emoji data with:

```bash
npm run unicode:proposed
```

To require a particular draft version and provide display context for the demo:

```bash
npm run unicode:proposed -- 18.0 --stage=beta --expected=2026-09
```

The draft command writes `proposed/<version>.json` and records it under
`proposed` in `versions/manifest.json`. Draft entries have no release date and
remain separate from released version arrays.
