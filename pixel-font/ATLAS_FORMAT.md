# Atlas format

Pixel Emoji source artwork is stored as PNG atlases plus JSON sidecars.

## Layout

Generation creates the JSON assignments but does not create empty PNG
templates. Emoji Explorer constructs the branded sheet in memory, then creates
the subgroup PNG when its first visible artwork is saved or downloaded.
Existing PNG artwork is never overwritten by generation.

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

## Modifier and proposed trees

Unmodified emoji keep the original group/subgroup paths. Sequences containing
skin-tone modifiers (`U+1F3FB`–`U+1F3FF`) or hair components
(`U+1F9B0`–`U+1F9B3`) are assigned to separate atlas trees:

```text
atlases/modifiers/skin-tone/people-and-body/person-activity.png
atlases/modifiers/hair/people-and-body/person.png
atlases/modifiers/skin-and-hair/people-and-body/person.png
```

Draft emoji add a version prefix before the same group, subgroup, and modifier
layout:

```text
atlases/proposed/18.0/objects/writing.json
atlases/proposed/18.0/modifiers/skin-tone/people-and-body/hand-fingers-closed.json
```

## Editing rules

Atlas dimensions vary with subgroup size. Open a PNG in a pixel-art editor
with:

- artwork cells: 12×12 pixels
- padded cell slots: 16×16 pixels
- cell positions and image dimensions taken from the JSON sidecar
- interpolation/resampling disabled
- transparent background
- PNG output kept at its original dimensions

Do not insert or remove canvas pixels. The JSON sidecar is the authority for
which emoji belongs in each cell.

A painted pixel may be opaque or partially transparent. The builder preserves
its exact RGBA value. Avoid editor resampling when you want a smaller,
reusable palette and hard pixel edges.

Browse the generated atlas gallery in [ATLASES.md](ATLASES.md).
