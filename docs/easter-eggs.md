# Easter eggs

Emoji Explorer has a few intentionally playful features hiding alongside the
more serious Unicode and package tooling work.

## Newspeak locale

`en-x-newspeak` is a custom parody locale that crushes language into a tiny,
reused vocabulary and leans on symbols like `+good`, `++good`, `-good`, and
`--good` for tone.

It now follows a fairly specific direction: tiny root vocabulary, aggressive
`un` negation, flat grammar, minimal tense/plural handling, and a deliberately
blunt command-like tone.

Newspeak rides on top of English as its fallback layer, so any missing
Newspeak entry will still display in English until that override is added.

- locale data: [src/data/locales/en-x-newspeak.json](../src/data/locales/en-x-newspeak.json)
- demo UI strings: [src/demo-locales/ui.en-x-newspeak.json](../src/demo-locales/ui.en-x-newspeak.json)
- notes, rules, and generated vocabulary list:
  [newspeak-locale.md](newspeak-locale.md)

## Retro theme

The retro theme strips the Explorer down to a deliberately old-school visual
style built around the EGA palette, square edges, sharper focus cues, and a
different text feel.

- theme source: [src/site/themes/retro/retro.css](../src/site/themes/retro/retro.css)

## Theme music and sound effects

Retro mode started the audio idea, but the light and dark themes now also have
their own music and sound sets. Audio is optional and can be toggled in Help
and settings.

- audio implementation: [src/explorer/audio](../src/explorer/audio)

## Retro text font

The separate Pixel Latin Retro font gives retro mode its tiny bitmap text look
for Latin-script UI copy and documents its own source atlases and coverage.

- font notes: [../pixel-font/RETRO_TEXT_FONT.md](../pixel-font/RETRO_TEXT_FONT.md)
