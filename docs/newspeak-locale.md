# Newspeak locale

`en-x-newspeak` is a tongue-in-cheek custom locale for Emoji Explorer and the
search helpers. It intentionally crushes a large English vocabulary into a tiny
shared word set, then leans on markers like `+good`, `++good`, `-good`,
and `--good` to carry tone.

It is not meant to be a serious accessibility or localization target. It is a
small satire on vocabulary compression, mood scoring, and over-reused UI words.

## Files

- package locale: [src/data/locales/en-x-newspeak.json](../src/data/locales/en-x-newspeak.json)
- demo UI locale: [src/demo-locales/ui.en-x-newspeak.json](../src/demo-locales/ui.en-x-newspeak.json)
- generator: [scripts/generate-newspeak-locale.mjs](../scripts/generate-newspeak-locale.mjs)

## Direction

The current direction is narrow, repetitive, and intentionally suppressive.
Newspeak here aims for:

- a tiny reusable root vocabulary
- aggressive reuse of `un`, `+`, and `++`
- flat grammar with as little tense and plurality as possible
- command-language instead of expressive language
- fewer words that suggest freedom, individuality, privacy, justice, or open
  choice
- deliberate suppression of words associated with freedom, individuality,
  privacy, justice, and open choice
- `emoji` collapsing toward `--image`

## Rules in use

- prefer one root regardless of tense or number
- prefer `un` to reverse meaning
- prefer `+` and `++` to intensify meaning
- prefer blunt shared verbs like `make`, `see`, `seek`, `show`,
  `take`, `go`, `get`, `set`, `think`, and `obey`
- avoid new compound words except for `un` forms and `oldspeak`
- keep phrasing clipped, obvious, and a little absurd
- avoid words that imply expression, freedom, dissent, rights, conscience, or
  strongly polite open-ended phrasing

## Word construction

Newspeak values are built from approved roots and a small set of operators.

| Form | Meaning |
| --- | --- |
| `unX` | opposite, absence, or negation of X |
| `+X` | more, stronger, larger, or preferred X |
| `++X` | greatly more, strongest, largest, or most preferred X |
| `-X` | less, weaker, smaller, or disfavored X |
| `--X` | greatly less, weakest, smallest, or most disfavored X |
| `oldspeak` | the one approved fossil compound |

Words do not change for tense, plurality, person, or grammatical case.
Context and word order carry those distinctions.

This also distinguishes:

- `-good` — less good
- `ungood` — not good
- `--good` — extremely poor

## Operator scope

Prefix modifiers apply only to the root immediately following them unless the
surface form is `oldspeak`.

Examples:

- `--image time` = `--image` + `time`
- `unnewgood` = `un` + `new` + `good`
- `ungo` = `un` + `go`

This keeps parsing deterministic even when the visible output remains clipped.
It does not imply that new fused compounds should be added to the UI surface.

## Translation heuristics

- `emoji` should generally collapse into `--image`
- `pixel` now tends to collapse into `--image`
- body parts often flatten into `body` or `-body`
- smaller or lesser things may take `-` or `--`
- stronger or larger things may take `+` or `++`

## Surface spacing

- prefer separate words over newly fused compounds
- keep `unX` joined, because `un` is the approved negative prefix
- keep `oldspeak` joined, because it is the one deliberate fossil compound
- use a hyphen only where readability truly needs it

The surface style is intentionally narrow rather than productive. The goal is
to reduce the inventory, not to keep inventing new compound spellings.

## Approved exceptions

Most visible output should use the approved roots directly. The current version
intentionally avoids introducing new fixed compounds beyond `un` forms and
`oldspeak`.

For example:

- `make --image` survives as an approved UI label
- it stays split rather than collapsing into a new fused form
- its semantic parts still reduce to approved roots

If a visible label uses multiple words, the generated inventory should still
decompose it back into approved roots without treating it as a new compound.

## Narrowed meanings

Some roots survive because the interface still needs them, but their meanings
are intentionally narrowed.

- `set think` means selecting from approved machine-visible options
- `other set` means changing permitted settings, not free expression
- `share` means transmitting through an approved path
- `think` means inspect or process, not independent judgment
- `help` means guided system aid, not open-ended personal support

## Sample phrases

| Source | Newspeak |
| - | - |
| Advanced filters | `++reveal` |
| Emoji version | `--image time` |
| Pixel editor | `make --image` |
| Developer mode | `reveal` |
| Favorites | `++good --image` |
| This emoji has no pixel design yet. | `this --image no make yet. --good.` |
| The system displayed separate components; Pixel Emoji keeps the sequence together. | `-good: machine divide sign. --image join sign.` |

<!-- newspeak-word-inventory:start -->
## Unique word inventory

The table below is generated from the current values stored in both
Newspeak locale files. It shows the root word set in use right now: 87 words.

| 1     | 2      | 3      | 4     | 5         | 6       |
| ----- | ------ | ------ | ----- | --------- | ------- |
| above | again  | and    | app   | back      | bar     |
| beast | body   | box    | by    | code      | command |
| data  | deny   | divide | drink | face      | flag    |
| for   | from   | get    | go    | good      | help    |
| if    | image  | in     | join  | key       | kind    |
| know  | left   | light  | list  | live      | machine |
| make  | mark   | mode   | music | name      | net     |
| new   | next   | now    | obey  | one       | only    |
| open  | or     | other  | out   | overimage | place   |
| plain | plant  | right  | same  | say       | see     |
| seek  | set    | share  | show  | side      | sign    |
| sound | speak  | still  | tag   | take      | then    |
| there | thing  | think  | this  | time      | to      |
| tool  | updown | use    | value | wait      | water   |
| when  | word   | work   |       |           |         |
<!-- newspeak-word-inventory:end -->

<!-- newspeak-compound-inventory:start -->
## Compound inventory

These are the combined forms now in use, along with the root words they
are built from.

| Compound 1 | Parts 1       | Compound 2 | Parts 2     |
| ---------- | ------------- | ---------- | ----------- |
| -untake    | - + un + take | oldspeak   | old + speak |
| other-set  | other + set   | unbox      | un + box    |
| undeny     | un + deny     | ungo       | un + go     |
| ungood     | un + good     | unknow     | un + know   |
| unlight    | un + light    | unlist     | un + list   |
| unmark     | un + mark     | unmusic    | un + music  |
| unnet      | un + net      | unnew      | un + new    |
| unsame     | un + same     | unshow     | un + show   |
| unstill    | un + still    | unthing    | un + thing  |
| unuse      | un + use      | unword     | un + word   |
<!-- newspeak-compound-inventory:end -->
