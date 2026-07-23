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
npm run pixel-font:build
```

Generation creates missing transparent PNG templates but never overwrites an
existing PNG. This protects hand-edited artwork. Delete a specific atlas PNG
only when you intentionally want to recreate that blank template.

`pixel-font:build` scans every mapped cell and builds only cells containing at
least one pixel with nonzero opacity. Fully transparent cells are ignored. Its
generated output under `pixel-font/build/` includes:

- individual 16×16 PNG files;
- standalone crisp-edge SVG files;
- a COLR/CPAL TrueType font;
- WOFF and WOFF2 web fonts;
- a machine-readable manifest;
- an HTML page comparing PNG, SVG, and font rendering.

Font compilation uses FontTools. Create the isolated Python environment once:

```sh
python3 -m venv pixel-font/.venv
pixel-font/.venv/bin/pip install -r pixel-font/requirements.txt
```

The build automatically prefers that environment. Without it, the system
Python is used and WOFF2 may be skipped if Brotli support is unavailable.

After building, run `npm start` and open
`http://localhost:5173/pixel-font/build/` to inspect the output.

## Editing in Emoji Explorer

Emoji Explorer includes a 16×16 pixel editor in each base emoji's details
dialog. Choose **Edit pixel art** to load that emoji's assigned atlas cell.
The native emoji tracing layer is for reference only and is never written into
the artwork.

In browsers that support the File System Access API, **Save atlas** asks you
to select the repository's `pixel-font/atlases/` directory and then updates
the correct 256×256 PNG directly. The browser must ask for this permission;
the page cannot silently write into the repository.

Other browsers download the updated, full atlas PNG. Replace the same-named
file under `pixel-font/atlases/`, then rebuild:

```sh
npm run pixel-font:build
```

Skin-tone and hair-modifier sequences are intentionally outside the base
atlas set, so their editor shows an unavailable message.

## Editing

Open an atlas PNG in a pixel-art editor with:

- canvas: 256×256 pixels;
- grid spacing: 16×16 pixels;
- interpolation/resampling disabled;
- transparent background;
- PNG output kept at its original dimensions.

Do not insert or remove canvas pixels. The JSON sidecar is the authority for
which emoji belongs in each cell.

A painted pixel may be opaque or partially transparent. The builder preserves
its exact RGBA value. Avoid editor resampling when you want a smaller, reusable
palette and hard pixel edges.

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

Compiled font files belong in release artifacts or a separate font package,
not in the existing emoji-data package.
