# Pixel Emoji artwork

This workspace stores pixel-emoji artwork in PNG sprite atlases. It is separate
from the published `@lewismoten/emoji` data package.

## Atlas format

Each atlas is a 256×256 transparent PNG divided into a 16×16 grid. Every cell
is a 16×16-pixel emoji, so each atlas can hold 256 glyphs.

Each PNG has a same-named JSON sidecar:

```text
atlases/base-000.png
atlases/base-000.json
```

The JSON identifies the emoji assigned to every cell, including its key,
Unicode sequence, row, column, pixel bounds, category, and sequence type.
Assignments are stable: rerunning generation preserves existing cells and
places newly added Unicode emoji into the next free cells.

The base atlas set excludes sequences containing skin-tone modifiers
(`U+1F3FB`–`U+1F3FF`) or hair components (`U+1F9B0`–`U+1F9B3`). Other
sequences—including flags, keycaps, variation selectors, and unmodified ZWJ
emoji—remain eligible.

## Commands

```sh
npm run pixel-font:generate
npm run pixel-font:validate
```

Generation creates missing transparent PNG templates but never overwrites an
existing PNG. This protects hand-edited artwork. Delete a specific atlas PNG
only when you intentionally want to recreate that blank template.

## Editing

Open an atlas PNG in a pixel-art editor with:

- canvas: 256×256 pixels;
- grid spacing: 16×16 pixels;
- interpolation/resampling disabled;
- transparent background;
- PNG output kept at its original dimensions.

Do not insert or remove canvas pixels. The JSON sidecar is the authority for
which emoji belongs in each cell.

## CSS clipping

See [`examples/sprites.css`](examples/sprites.css) and
[`examples/sprites.js`](examples/sprites.js). A cell can be displayed at any
CSS font size using a background image:

```html
<span
  class="pixel-emoji"
  style="
    --pixel-emoji-atlas: url('../atlases/base-000.png');
    --pixel-emoji-x: -3em;
    --pixel-emoji-y: -2em;
  "
></span>
```

`image-rendering: pixelated` preserves the pixel-art appearance. Exact physical
pixel alignment is best at integer multiples of 16px.

## Future font build

The next build stage will:

1. extract each occupied cell;
2. merge same-color pixels into SVG rectangles;
3. add `shape-rendering="crispEdges"`;
4. compile the SVG glyphs into COLR/CPAL and SVG OpenType tables;
5. emit installable TTF and web WOFF2 files under `pixel-font/build/`.

Compiled font files belong in release artifacts or a separate font package,
not in the existing emoji-data package.
