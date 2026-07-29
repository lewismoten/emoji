# Package usage

This guide covers the deeper `@lewismoten/emoji` package features: manifests,
categories, localization, version filtering, and direct browser use.

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

The root package export intentionally points at that curated popular pack, not
the full emoji dataset. This keeps the default install and browser usage small
for common “emoji picker” or reaction-list use cases.

## Categories and subgroups

Categories are separate modules and can be imported normally or lazy-loaded:

```js
import objects from "@lewismoten/emoji/categories/objects";

const { default: people } =
  await import("@lewismoten/emoji/categories/people-and-body");
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

## Variations

Modifier-focused packs are available for skin tones, hair, families, or every
supported variation:

```js
import skinTones from "@lewismoten/emoji/variations/skin-tones";
import hair from "@lewismoten/emoji/variations/hair";
import families from "@lewismoten/emoji/variations/families";
import variations from "@lewismoten/emoji/variations/all";
```

## Individual emoji

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
import britishEnglish from "@lewismoten/emoji/locales/en-GB" with { type: "json" };

const locale = mergeEmojiLocalePacks(english, britishEnglish);
const search = createEmojiSearch(locale);
```

The locale manifest identifies every available pack and provides its English
name, native name, text direction, base locale, CLDR version, and stored and
inherited entry counts:

```js
import locales from "@lewismoten/emoji/locales/manifest" with { type: "json" };

console.log(locales.locales);
```

Regional packs are published only when CLDR provides annotations that differ
from the base language. For example, `en-GB` exists, while an empty `en-US`
override is omitted. Each base pack also includes `labels` for broad picker
labels and `subgroups` for labels Unicode and CLDR do not translate directly.

Locale-manifest entries also identify whether the locale is right-to-left and
provide both English and native display labels so interfaces can present a
language picker without hard-coding language names.

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
import versions from "@lewismoten/emoji/versions/manifest" with { type: "json" };
import introducedIn17 from "@lewismoten/emoji/versions/17.0" with { type: "json" };

const releasesAvailableBy2025 = versions.versions
  .filter((release) => release.released <= "2025-12-31")
  .map((release) => release.version);

console.log(introducedIn17);
```

Version arrays are separate from the emoji lookup, so applications pay for
version metadata only when they use it. Proposed candidates are likewise
separate from released data:

```js
import proposed18 from "@lewismoten/emoji/proposed/18.0" with { type: "json" };

console.log(proposed18.status); // "draft"
```

Draft candidates may change or be removed before Unicode publishes the final
release.

The proposed manifest keeps the current draft `status`, `stage`, and expected
release metadata separate from stable release metadata so applications can
clearly distinguish “released”, “available in a selected release only”, and
“future/draft” UI states.

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

That browser-oriented `dist/esm/index.js` is deliberately self-contained: it
exports one large object rather than lazily importing category modules behind
the scenes. This preserves the older “drop one file into a site and get every
emoji key at once” workflow.
