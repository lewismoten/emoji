# emoji

Provides a lookup list of emoji in unicode format.

## Installation

`npm i @lewismoten/emoji -s`

## Code

How to show :beers:

```js
import emoji from "@lewismoten/emoji";
console.log(emoji.clinkingBeerMugs);
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
