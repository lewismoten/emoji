# Build and editor workflow

## Commands

```sh
npm run pixel-font:generate
npm run pixel-font:validate
npm run pixel-font:build
npm run pixel-font:build -- --fonts-only
npm run pixel-font:package
npm run pixel-font:version -- patch
```

`pixel-font:build` scans every mapped cell and builds only cells containing at
least one pixel with nonzero opacity. Fully transparent cells are ignored. Its
generated output under `pixel-font/build/` includes:

- individual 12×12 PNG files
- standalone crisp-edge SVG files
- a COLR/CPAL TrueType font
- WOFF and WOFF2 web fonts
- a separate proposed TTF, WOFF, and WOFF2 set when proposed artwork exists
- a machine-readable manifest
- an HTML page comparing PNG, SVG, and font rendering

The `--fonts-only` mode is used by the GitHub Pages deployment. It still emits
the released and proposed TTF, WOFF, and WOFF2 files, their shared CSS, the
machine-readable manifests, and a font-only preview, but skips all individual
PNG and SVG glyph files. Emoji Explorer crops the original source atlases when
it needs standalone pixel artwork, so its modifier previews and artwork-copy
tools do not depend on those generated glyph images.

Font compilation uses FontTools. Create the isolated Python environment once:

```sh
python3 -m venv pixel-font/.venv
pixel-font/.venv/bin/pip install -r pixel-font/requirements.txt
```

The build automatically prefers that environment. Without it, the system
Python is used and WOFF2 may be skipped if Brotli support is unavailable.

After building, run `npm start` and open
`http://localhost:5173/pixel-font/build/` to inspect the output.

### Current compiler notes

- The compiled color font currently uses COLR/CPAL v0.
- The compiler uses emoji key-based names internally, but the exported font
  currently writes `post` format 3.0, so custom glyph names are not preserved
  in the final font file.
- Fully black artwork is compiled as a recolorable silhouette glyph.
- Connected pixel regions are traced as merged outlines so stacked rows can
  become one larger composite path instead of many narrow row rectangles.
- The optimized build currently applies only two conservative reuse steps:
  exact silhouette sharing and exact disjoint two-part mask unions.

## Editing in Emoji Explorer

Emoji Explorer includes a 12×12 pixel editor in each emoji’s details dialog.
Choose **Edit pixel art** to load that emoji’s assigned atlas cell. The native
emoji tracing layer is for reference only and is never written into the
artwork.

The editor clipboard can copy the current grid—including unsaved changes—or
the exact PNG source of an already compiled custom-font glyph. Open another
emoji and choose **Paste** to use those pixels as an undoable edit.

When artwork is pasted between skin-tone variants, the editor converts normal,
highlight, and shadow colors to the destination modifiers. For an emoji with
multiple people, it looks for a painted variant of the same modifier-free
Unicode sequence whose people have distinct tones. It prefers middle tones,
uses that artwork to infer each person’s region, and then converts ambiguous
colors by position. If no reliable helper is painted, conversion falls back to
the common two-person layout—first modifier on the left, second modifier on
the right—before using modifier order alone for other layouts. The lightest
highlight and darkest shadow extend to EGA white and black respectively.

In browsers that support the File System Access API, **Save atlas** asks you
to select the repository’s `pixel-font/atlases/` directory and then updates
or creates the correct nested subgroup PNG directly. Save and download remain
disabled on a new sheet until at least one visible pixel has been drawn.

Other browsers download the updated, full atlas PNG. Replace the same-named
file under `pixel-font/atlases/`, then rebuild:

```sh
npm run pixel-font:build
```

## CSS clipping

See `examples/sprites.css` and `examples/sprites.js`. A cell can be displayed
at any CSS font size using a background image:

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

`image-rendering: pixelated` preserves the pixel-art appearance. Exact
physical pixel alignment is best at integer multiples of 12px.
