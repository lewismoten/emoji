# Coverage and releases

## Coverage status

<!-- coverage-summary:start -->
- **Emoji 16.0:** complete coverage of all 8 entries introduced by the released version
- **Emoji 17.0:** complete coverage of all 163 entries introduced by the released version
- **Emoji 18.0 beta draft:** complete coverage of all 19 currently tracked entries

“Complete” refers to the entries introduced by those versions, not all
emoji from earlier Unicode versions. Proposed versions remain subject to
Unicode draft changes until their final release.

| Emoji release | Painted entries | Tracked entries | Coverage |
| ------------- | --------------: | --------------: | -------: |
| 0.6 | 31 | 719 | 4.3% |
| 0.7 | 1 | 139 | 0.7% |
| 1.0 | 21 | 490 | 4.3% |
| 2.0 | 28 | 286 | 9.8% |
| 3.0 | 2 | 157 | 1.3% |
| 4.0 | 2 | 598 | 0.3% |
| 5.0 | 6 | 239 | 2.5% |
| 11.0 | 1 | 161 | 0.6% |
| 12.0 | 2 | 230 | 0.9% |
| 12.1 | 4 | 168 | 2.4% |
| 13.0 | 0 | 117 | 0% |
| 13.1 | 0 | 217 | 0% |
| 14.0 | 1 | 112 | 0.9% |
| 15.0 | 0 | 31 | 0% |
| 15.1 | 9 | 118 | 7.6% |
| **16.0** | **8** | **8** | **100.0%** |
| **17.0** | **163** | **163** | **100.0%** |
| **18.0 beta draft** | **19** | **19** | **100.0%** |
| **Total** | **298** | **3,972** | **7.5%** |
<!-- coverage-summary:end -->

Released coverage is calculated by comparing the painted glyphs in
`build/manifest.json` with the keys introduced by each file under `versions/`.
The Emoji 18.0 row compares the proposed font with `proposed/18.0.json`.

## Proposed Unicode coverage

The atlas generator also reads every draft listed under `proposed` in
`versions/manifest.json`. Proposed emoji receive versioned assignments under
the same group/subgroup tree with a `proposed/<version>/` prefix.

Painted proposed glyphs never enter the stable **Pixel Emoji** font. The build
places them in the separate **Pixel Emoji Proposed** font under
`build/font/proposed/` and writes both font faces into
`build/font/pixel-emoji.css`.

Draft names, sequences, code points, and release plans may change. Proposed
artwork should therefore be considered experimental. After refreshing draft
data with `npm run unicode:proposed`, rerun `npm run pixel-font:generate`.
When Unicode releases that version and `src/data/emoji/` is updated,
regeneration creates released assignments for its final entries.

## Font releases and embedding

Pixel Emoji has an independent semantic version in `config.json`. The font
version changes when artwork, coverage, metadata, or compilation behavior
changes; it is not the same as the highest supported Unicode Emoji version.

One rolling stable font contains all painted released artwork. Historical
builds remain available through immutable npm versions and GitHub Releases
rather than separate Emoji 16-only or Emoji 17-only font families.

The TTF sets the OpenType `OS/2.fsType` field to `0`, granting installable
embedding. This permits editable document and PDF embedding as well as
preview-and-print embedding, subject to the ISC license included with every
package and release.
