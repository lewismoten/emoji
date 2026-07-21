# emoji

Provides Unicode Emoji 17.0 lookup packs that can be imported or lazy-loaded by need.

The generated dataset contains every Unicode-recommended fully-qualified emoji
sequence, including skin-tone, hair, gender, family, and ZWJ variants.

## Installation

`npm i @lewismoten/emoji -s`

## Code

The root export is a small, curated popular pack:

```js
import emoji from "@lewismoten/emoji";
console.log(emoji.clinkingBeerMugs);
```

## Packs

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

For the smallest possible static or dynamic import, use an individual module:

```js
import clinkingBeerMugs from "@lewismoten/emoji/individual/clinkingBeerMugs";
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

## Scripts

- clean: drops the build & dist folders
- build: creates typescript
- generate: creates pack and individual source modules from `emoji.json` and `popular.json`
- bundle: creates JavaScript & TypeScript Definitions for packaging
- prepublishOnly: ensures a new bundle is created for publishing
- start: Runs demo site at http://localhost:5173
- test: Misc tests from research
- get-zwj: Downloads zero-width join data (deprecated)
- get-sequences: Downloads sequences (deprecated)
- get-test: Downloads test data
- parse: Downloads test data and parses it to create emoji.ts and emoji.json

## Scraper (Depricated)

Names and codes scraped from <https://unicode.org/emoji/charts/full-emoji-list.html>

- Open the web page
- Wait for it to load completely
- Copy code from `./scrape.js` into the browsers console
- Wait for the page to be parsed and new code generated
- Copy the generated code into `./emoji.js`
- In the terminal, type `npm run build`
