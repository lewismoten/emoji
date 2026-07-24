# Pixel Emoji

Pixel Emoji is a compact 12×12 color fallback font for newer Unicode emoji
that may be missing from older operating-system fonts. It is drawn by Lewis
Moten using a retro EGA-inspired palette with additional Unicode skin-tone
colors where modifiers require them.

The package contains a stable **Pixel Emoji** family for released characters
and a separate **Pixel Emoji Proposed** family for experimental draft
characters. Draft sequences can change before Unicode publishes them.

## Install

```sh
npm install @lewismoten/pixel-emoji
```

Load both families with the packaged stylesheet:

```css
@import "@lewismoten/pixel-emoji";

.emoji {
  font-family:
    var(--pixel-emoji-released-family), "Apple Color Emoji", "Segoe UI Emoji",
    sans-serif;
}

.emoji--proposed {
  font-family:
    var(--pixel-emoji-proposed-family), var(--pixel-emoji-released-family),
    "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
}
```

Keep the released family first for ordinary emoji. This prevents older text
shapers from splitting a released modifier or ZWJ sequence across the released,
proposed, and system fonts. Put the proposed family first only on text known to
contain draft emoji.

The stable font can also be installed directly from
`font/pixel-emoji.ttf`. WOFF and WOFF2 files are provided for websites.

## Metadata and embedding

`manifest.json` identifies the font release, Unicode coverage, proposed
versions, glyph counts, license, and included files.

The TTF uses installable embedding permissions. It may be installed, embedded,
edited, and redistributed in documents subject to the included ISC license.

See the [complete font documentation](https://github.com/lewismoten/emoji/tree/main/pixel-font)
and [Emoji Explorer](https://lewismoten.github.io/emoji/).
