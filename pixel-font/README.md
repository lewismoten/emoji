# Pixel Emoji fallback font

Pixel Emoji is a compact color fallback font for emoji that an older device's
built-in fonts cannot display.

This project began after I discovered that one of my devices dould not display
Emoji 17.0. The device was no longer receiving the feature-bearing operating system updates
that normally deliver new system emoji, even though it could continue receiving
security support. A missing system-font glyph should not make a newer emoji
unavailable, so I started drawing a backup set for Emoji 17.0 and later
releases.

The project is a work in progress. A font build includes only emoji whose
artwork has been painted; the long-term goal is fallback coverage for new emoji
that otherwise appear as missing-glyph boxes on older systems.

[Open Emoji Explorer](https://lewismoten.github.io/emoji/) ·
[Browse the font preview](https://lewismoten.github.io/emoji/pixel-font/build/) ·
[Browse the PNG atlas gallery](ATLASES.md)

## Design

The artwork is inspired by the compact 12×12 pixel emoji used by early mobile
systems before emoji became part of Unicode. At that resolution, every pixel
has a job. The small grid keeps the font compact, preserves a distinctly retro
appearance, and scales with hard pixel edges at any size.

The primary artwork palette is limited to the 16 classic EGA colors. That
constraint keeps the visual language consistent and gives the compiler more
opportunities to reuse identical parts.

Skin tones are the intentional exception. The EGA palette could not represent
the meaning of Unicode's five skin-tone modifiers clearly or respectfully, so
an emoji containing a skin-tone modifier may use a five-color skin ramp in
addition to EGA. Those colors are contextual: they are available only when the
modifier is part of that emoji's Unicode sequence.

## What the build provides

- installable COLR/CPAL TrueType font;
- WOFF and WOFF2 fonts for websites;
- individual 12×12 PNG and crisp-edge SVG files;
- grouped PNG sprite atlases with machine-readable JSON cell maps;
- a browser preview comparing PNG, SVG, and font rendering;
- a repository-visible [atlas gallery](ATLASES.md) showing every source PNG
  sheet used by the compiler.

The font is intended as a fallback after the operating system's native emoji
font, not as a replacement for every system emoji. The PNG and SVG output also
makes the same artwork usable where custom color fonts are unavailable.

This workspace is separate from the published `@lewismoten/emoji` data
package. Compiled font files belong in release artifacts or a future dedicated
font package.

## Atlas format

Atlases are organized by Unicode group and subgroup. Each sheet is at most 16
cells wide and 8 rows tall; shorter subgroups produce shorter PNGs, while
large subgroups continue into numbered sheets. Every 12×12 artwork cell has
2 transparent pixels on each side, producing a clear 4-pixel gap between
neighboring emoji.

Each sheet has a compact 8×8-style bitmap header and footer containing the set
name, Unicode group, Unicode subgroup, creation date, author, and
`https://lewismoten.com`. The artwork area remains transparent.
When a subgroup needs multiple sheets, its subgroup label carries the part
number—for example, `COUNTRY-FLAG 1/3`—while the set name remains unchanged.

Each PNG has a same-named JSON sidecar:

```text
atlases/smileys-and-emotion/face-affection.png
atlases/smileys-and-emotion/face-affection.json
```

The JSON identifies the emoji assigned to every cell, including its key,
Unicode sequence, row, column, pixel bounds, category, and sequence type.
Assignments are stable: rerunning generation preserves existing cells and
places newly added Unicode emoji into the next free cells.

Unmodified emoji keep the original group/subgroup paths. Sequences containing
skin-tone modifiers (`U+1F3FB`–`U+1F3FF`) or hair components
(`U+1F9B0`–`U+1F9B3`) are assigned to separate atlas trees:

```text
atlases/modifiers/skin-tone/people-and-body/person-activity.png
atlases/modifiers/hair/people-and-body/person.png
atlases/modifiers/skin-and-hair/people-and-body/person.png
```

This keeps the base sheets compact while making every modifier combination
available to the editor and the same generated font.

## Artwork palette

The editor uses the 16 classic EGA colors as its primary palette. Emoji with
Unicode skin-tone modifiers also expose the applicable colors from this
five-color extension:

- light `#f2d2b6`;
- medium-light `#d5a078`;
- medium `#a66a45`;
- medium-dark `#70452f`;
- dark `#3b271d`.

Only tones present in the current Unicode sequence are shown. This keeps the
artwork EGA-inspired while preserving the meaning and visual distinction of
the standardized skin-tone modifiers. Clicking an already-selected tone cycles
through its normal color and the immediately neighboring lighter and darker
tones. A check marks the normal color; endpoint tones cycle through the one
neighbor they have.

## Sequence glyphs

Paint a sequence in its assigned atlas cell exactly like a single-code-point
emoji. The font compiler turns painted multi-code-point entries into required
OpenType ligatures:

- ZWJ sequences retain `U+200D` in the substitution;
- regional-indicator pairs form country flags;
- keycap sequences include the combining keycap;
- tag flags retain their tag characters and cancel tag;
- variation selectors are normalized out of the substitution.

Joiners, combining keycaps, tags, skin tones, and hair components receive
zero-width component glyphs. Ligature rules are emitted longest-first so a
shorter known sequence cannot consume the beginning of a longer one.

## Automatic component reuse

Artwork remains flattened in the PNG atlases; artists do not need to define
components manually. During each build, the compiler:

1. separates every painted glyph into one monochrome mask per RGBA color;
2. compares those masks across all painted glyphs;
3. stores identical geometry once, even when another glyph colors it
   differently;
4. replaces a mask with an exact union of existing masks when that removes
   duplicate geometry;
5. gives each emoji its own COLR layer recipe referencing the shared masks;
6. builds monochrome fallback glyphs as TrueType composites of existing masks,
   using a single shared silhouette when one is available.

This is lossless. A glyph with a small visual change reuses every unchanged
mask and stores only its unique masks. Completely unique artwork continues to
compile normally. The generated build manifest reports the total color layers,
rendered layers, unique masks, composed masks, reused layers, and fallback
composite strategies so binary savings can be measured as the artwork grows.
Production fonts omit optional glyph names and empty component glyphs that are
not required by a sequence.
The installable TTF retains both Macintosh and Windows naming records, while
the web-focused WOFF and WOFF2 files retain only modern Windows records.

## Commands

```sh
npm run pixel-font:generate
npm run pixel-font:validate
npm run pixel-font:build
```

Generation creates the JSON assignments but does not create empty PNG
templates. Emoji Explorer constructs the branded sheet in memory, then creates
the subgroup PNG when its first visible artwork is saved or downloaded.
Existing PNG artwork is never overwritten by generation.

`pixel-font:build` scans every mapped cell and builds only cells containing at
least one pixel with nonzero opacity. Fully transparent cells are ignored. Its
generated output under `pixel-font/build/` includes:

- individual 12×12 PNG files;
- standalone crisp-edge SVG files;
- a COLR/CPAL TrueType font;
- WOFF and WOFF2 web fonts;
- a machine-readable manifest;
- an HTML page comparing PNG, SVG, and font rendering.

The font compiler also deduplicates reusable pixel geometry. Fully opaque
glyphs with the same visible silhouette can share one dominant-color base and
store only their differing overlays, such as eyes and mouths. The optimizer
uses a candidate only when it reduces the total number of masks, and leaves
translucent or uniquely shaped artwork in its original color-layer form.
Optimization counts are recorded in `build/manifest.json` under
`componentOptimization`.

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

Emoji Explorer includes a 12×12 pixel editor in each emoji's details dialog.
Choose **Edit pixel art** to load that emoji's assigned atlas cell.
The native emoji tracing layer is for reference only and is never written into
the artwork.

The editor clipboard can copy the current grid—including unsaved changes—or
the exact PNG source of an already compiled custom-font glyph. Open another
emoji and choose **Paste** to use those pixels as an undoable edit.

In browsers that support the File System Access API, **Save atlas** asks you
to select the repository's `pixel-font/atlases/` directory and then updates
or creates the correct nested subgroup PNG directly. Save and download remain
disabled on a new sheet until at least one visible pixel has been drawn. The
browser must ask for this permission; the page cannot silently write into the
repository.

Other browsers download the updated, full atlas PNG. Replace the same-named
file under `pixel-font/atlases/`, then rebuild:

```sh
npm run pixel-font:build
```

Skin-tone and hair-modifier sequences use their separate modifier atlas trees
and are edited through the same interface.

## Editing

Atlas dimensions vary with subgroup size. Open a PNG in a pixel-art editor
with:

- artwork cells: 12×12 pixels;
- padded cell slots: 16×16 pixels;
- cell positions and image dimensions taken from the JSON sidecar;
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
<span class="pixel-emoji"></span>
<script type="module">
  import { applyPixelEmoji, findPixelEmoji } from "./examples/sprites.js";

  const mapping = "./atlases/smileys-and-emotion/face-affection.json";
  const image = "./atlases/smileys-and-emotion/face-affection.png";
  const entry = await findPixelEmoji(mapping, "smilingFaceWithHearts");
  applyPixelEmoji(document.querySelector(".pixel-emoji"), image, entry);
</script>
```

`image-rendering: pixelated` preserves the pixel-art appearance. Exact physical
pixel alignment is best at integer multiples of 12px.
