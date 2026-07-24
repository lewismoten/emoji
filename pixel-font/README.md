# Pixel Emoji fallback font

Pixel Emoji is a compact color fallback font for emoji that an older device's
built-in fonts cannot display.

This project began after I discovered that one of my devices could not display
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

## Proposed Unicode coverage

The atlas generator also reads every draft listed under `proposed` in
`versions/manifest.json`. Proposed emoji receive versioned assignments under:

```text
atlases/proposed/18.0/smileys-and-emotion/face-smiling.json
atlases/proposed/18.0/modifiers/skin-tone/people-and-body/hand-fingers-closed.json
```

These JSON mappings are generated immediately, but an atlas PNG is not created
until artwork is saved from Emoji Explorer. Proposed cells are marked with
their Unicode version, proposal stage, and expected release date so they remain
distinguishable from released characters.

Painted proposed glyphs never enter the stable **Pixel Emoji** font. The build
places them in the separate **Pixel Emoji Proposed** font under
`build/font/proposed/` and writes both font faces into
`build/font/pixel-emoji.css`. Use the proposed face first to fall forward for
draft characters and then fall back through the stable and system fonts:

```css
font-family:
  "Pixel Emoji Proposed", "Pixel Emoji", "Apple Color Emoji", "Segoe UI Emoji",
  sans-serif;
```

Draft names, sequences, code points, and release plans may change. Proposed
artwork should therefore be considered experimental. After refreshing draft
data with `npm run unicode:proposed`, rerun `npm run pixel-font:generate`.
When Unicode releases that version and `emoji.json` is updated, regeneration
creates released assignments for its final entries. Copy the approved artwork
into those released cells and rebuild; proposed pixels are not silently
promoted because the final sequence or meaning may have changed.

```sh
npm run unicode:proposed
npm run pixel-font:generate
npm run pixel-font:build
```

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

The normalized v3 format uses `atlases/manifest.json` as the public authority
for metadata shared by every sheet: family and set names, author, website,
creation date, cell layout, padding, columns, and header/footer dimensions.
Consumers should load that manifest once rather than finding the same values
repeated in every sidecar. `config.json` remains the authoring source from
which the public manifest is generated.

Each sidecar contains only its sheet identity, image dimensions, Unicode group
and subgroup, modifier/proposal classification, part number, and entries. An
entry inherits that sheet classification and records its key, name, emoji,
Unicode sequence, order, sequence type, row, column, and pixel bounds. The
explicit `x`, `y`, `width`, and `height` values remain available so CSS sprite
consumers do not need to reproduce the atlas-layout calculations.

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
available to the editor and its corresponding released or proposed font.

Draft emoji add a version prefix before the same group, subgroup, and modifier
layout:

```text
atlases/proposed/18.0/objects/writing.json
atlases/proposed/18.0/modifiers/skin-tone/people-and-body/hand-fingers-closed.json
```

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
- a separate proposed TTF, WOFF, and WOFF2 set when proposed artwork exists;
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

When artwork is pasted between skin-tone variants, the editor converts normal,
highlight, and shadow colors to the destination modifiers. For an emoji with
multiple people, it looks for a painted variant of the same modifier-free
Unicode sequence whose people have distinct tones. It prefers middle tones,
uses that artwork to infer each person's region, and then converts ambiguous
colors by position. If no reliable helper is painted, conversion falls back to
the common two-person layout—first modifier on the left, second modifier on the
right—before using modifier order alone for other layouts. The lightest
highlight and darkest shadow extend to EGA white and black respectively.

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

Proposed entries are edited through the same interface after selecting the
proposed Unicode version in Emoji Explorer. Their atlas downloads and direct
saves retain the `proposed/<version>/` directory prefix.

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
