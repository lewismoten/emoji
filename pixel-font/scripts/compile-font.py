#!/usr/bin/env python3

import json
import re
import sys
from pathlib import Path

from fontTools.colorLib.builder import buildCOLR, buildCPAL
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


UNITS_PER_EM = 960


def main():
    source_path = Path(sys.argv[1])
    output_directory = Path(sys.argv[2])
    source = json.loads(source_path.read_text())
    output_directory.mkdir(parents=True, exist_ok=True)

    family_name = source["familyName"]
    cell_size = source["cellSize"]
    if UNITS_PER_EM % cell_size != 0:
        raise ValueError(f"{cell_size}-pixel cells do not divide {UNITS_PER_EM} font units")
    pixel_size = UNITS_PER_EM // cell_size
    ascender = (cell_size - 2) * pixel_size
    descender = -2 * pixel_size
    glyph_sources = source["glyphs"]
    for glyph in glyph_sources:
        if len(glyph["pixels"]) != cell_size * cell_size * 4:
            raise ValueError(f"{glyph['key']} does not contain a {cell_size} by {cell_size} RGBA cell")
    base_names = {glyph["key"]: safe_name(glyph["key"]) for glyph in glyph_sources}
    codepoint_names = {}
    for glyph in glyph_sources:
        for codepoint in sequence(glyph):
            codepoint_names.setdefault(codepoint, f"uni{codepoint:04X}")
    zero_width_names = {
        name
        for codepoint, name in codepoint_names.items()
        if is_zero_width_component(codepoint)
    }

    single_by_codepoint = {
        sequence(glyph)[0]: base_names[glyph["key"]]
        for glyph in glyph_sources
        if len(sequence(glyph)) == 1
    }
    cmap = {
        codepoint: single_by_codepoint.get(codepoint, name)
        for codepoint, name in codepoint_names.items()
    }

    palette = sorted(
        {
            tuple(glyph["pixels"][offset : offset + 4])
            for glyph in glyph_sources
            for offset in range(0, len(glyph["pixels"]), 4)
            if glyph["pixels"][offset + 3] > 0
        }
    )
    palette_indexes = {color: index for index, color in enumerate(palette)}
    glyphs = {".notdef": empty_glyph()}
    color_glyphs = {}
    glyph_order = [".notdef"]
    color_layer_count = 0

    layer_specs = optimized_layer_specs(glyph_sources)
    source_mask_keys = []

    for glyph_source in glyph_sources:
        for color, use_silhouette in layer_specs[glyph_source["key"]]:
            color_layer_count += 1
            key = layer_mask_key(
                glyph_source["pixels"], color, use_silhouette
            )
            source_mask_keys.append(key)

    mask_decompositions = exact_mask_unions(set(source_mask_keys))
    rendered_mask_keys = sorted(
        {
            rendered_key
            for source_key in source_mask_keys
            for rendered_key in expand_mask_key(source_key, mask_decompositions)
        }
    )
    mask_names = {
        key: f"mask.{index:04d}"
        for index, key in enumerate(rendered_mask_keys)
    }

    component_names = sorted(set(cmap.values()) - set(base_names.values()))
    for name in component_names:
        glyphs[name] = empty_glyph()
        glyph_order.append(name)

    for key, name in mask_names.items():
        glyphs[name] = mask_glyph(key, cell_size, pixel_size, ascender)
        glyph_order.append(name)

    silhouette_counts = {}
    for glyph_source in glyph_sources:
        key = silhouette_mask_key(glyph_source["pixels"])
        silhouette_counts[key] = silhouette_counts.get(key, 0) + 1
    shared_silhouette_names = {}
    for key, count in sorted(silhouette_counts.items()):
        if count < 2:
            continue
        if key in mask_names:
            shared_silhouette_names[key] = mask_names[key]
            continue
        name = f"fallback.{len(shared_silhouette_names):04d}"
        shared_silhouette_names[key] = name
        glyphs[name] = mask_glyph(key, cell_size, pixel_size, ascender)
        glyph_order.append(name)

    for glyph_source in glyph_sources:
        base_name = base_names[glyph_source["key"]]
        layers = []
        for color, use_silhouette in layer_specs[glyph_source["key"]]:
            key = layer_mask_key(
                glyph_source["pixels"], color, use_silhouette
            )
            layers.extend(
                (mask_names[rendered_key], palette_indexes[color])
                for rendered_key in expand_mask_key(key, mask_decompositions)
            )
        if base_name not in glyphs:
            silhouette_key = silhouette_mask_key(glyph_source["pixels"])
            shared_name = shared_silhouette_names.get(silhouette_key)
            fallback_components = (
                [shared_name]
                if shared_name
                else list(dict.fromkeys(layer_name for layer_name, _color in layers))
            )
            glyphs[base_name] = component_glyphs(fallback_components, glyphs)
            glyph_order.append(base_name)
        color_glyphs[base_name] = layers

    builder = FontBuilder(UNITS_PER_EM, isTTF=True)
    builder.setupGlyphOrder(glyph_order)
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics(
        {
            name: (
                0 if name.startswith("mask.") or name in zero_width_names else UNITS_PER_EM,
                getattr(glyphs[name], "xMin", 0),
            )
            for name in glyph_order
        }
    )
    builder.setupHorizontalHeader(ascent=ascender, descent=descender)
    builder.setupNameTable(
        {
            "familyName": family_name,
            "styleName": "Regular",
            "uniqueFontIdentifier": f"{family_name} Regular 1.000",
            "fullName": f"{family_name} Regular",
            "psName": re.sub(r"[^A-Za-z0-9-]", "", family_name.replace(" ", "-")) + "-Regular",
            "version": "Version 1.000",
        }
    )
    builder.setupOS2(
        sTypoAscender=ascender,
        sTypoDescender=descender,
        usWinAscent=ascender,
        usWinDescent=abs(descender),
    )
    builder.setupPost()
    builder.setupMaxp()

    font = builder.font
    font["post"].formatType = 3.0
    if palette:
        font["COLR"] = buildCOLR(color_glyphs, version=0, glyphMap=font.getReverseGlyphMap())
        font["CPAL"] = buildCPAL(
            [[(red / 255, green / 255, blue / 255, alpha / 255) for red, green, blue, alpha in palette]]
        )

    features = ligature_features(glyph_sources, base_names, codepoint_names, single_by_codepoint)
    if features:
        addOpenTypeFeaturesFromString(font, features)

    validate_color_layer_metrics(font, color_glyphs)

    ttf_path = output_directory / "pixel-emoji.ttf"
    font.save(ttf_path)

    font["name"].names = [
        record for record in font["name"].names
        if record.platformID == 3
    ]
    font.flavor = "woff"
    font.save(output_directory / "pixel-emoji.woff")
    font.flavor = None
    try:
        font.flavor = "woff2"
        font.save(output_directory / "pixel-emoji.woff2")
    except ImportError:
        print("WOFF2 skipped: install the packages in pixel-font/requirements.txt.")
    print(
        f"Compiled {len(glyph_sources):,} glyphs with {color_layer_count:,} source color layers "
        f"using {len(mask_names):,} rendered pixel masks "
        f"({len(mask_decompositions):,} composed from existing parts)."
    )


def validate_color_layer_metrics(font, color_glyphs):
    for layers in color_glyphs.values():
        for layer_name, _palette_index in layers:
            glyph = font["glyf"][layer_name]
            _advance, left_side_bearing = font["hmtx"].metrics[layer_name]
            if left_side_bearing != glyph.xMin:
                raise ValueError(
                    f"{layer_name} has side-bearing {left_side_bearing}; expected {glyph.xMin}"
                )


def sequence(glyph):
    return [
        int(codepoint, 16)
        for codepoint in glyph["codePoints"]
        if int(codepoint, 16) not in {0xFE0E, 0xFE0F}
    ]


def ligature_features(glyph_sources, base_names, codepoint_names, single_by_codepoint):
    substitutions = {}
    for glyph in glyph_sources:
        codepoints = sequence(glyph)
        if len(codepoints) < 2:
            continue
        inputs = tuple(
            single_by_codepoint.get(codepoint, codepoint_names[codepoint])
            for codepoint in codepoints
        )
        if len(inputs) > 1:
            output = base_names[glyph["key"]]
            previous = substitutions.get(inputs)
            if previous is not None and previous != output:
                raise ValueError(
                    f"Conflicting normalized sequence for {previous} and {output}"
                )
            substitutions[inputs] = output
    if not substitutions:
        return ""
    rules = [
        f"  sub {' '.join(inputs)} by {output};"
        for inputs, output in sorted(
            substitutions.items(),
            key=lambda item: (-len(item[0]), item[0], item[1]),
        )
    ]
    return "feature rlig {\n" + "\n".join(rules) + "\n} rlig;\n"


def is_zero_width_component(codepoint):
    return (
        codepoint in {0x200D, 0x20E3}
        or 0x1F3FB <= codepoint <= 0x1F3FF
        or 0x1F9B0 <= codepoint <= 0x1F9B3
        or 0xE0020 <= codepoint <= 0xE007F
    )


def safe_name(key):
    return "emoji." + re.sub(r"[^A-Za-z0-9_.]", "_", key)


def empty_glyph():
    return TTGlyphPen(None).glyph()


def component_glyphs(component_names, glyphs):
    pen = TTGlyphPen(glyphs)
    for component_name in component_names:
        pen.addComponent(component_name, (1, 0, 0, 1, 0, 0))
    return pen.glyph()


def silhouette_glyph(pixels, cell_size, pixel_size, ascender):
    return pixels_for_color(pixels, None, cell_size, pixel_size, ascender)


def color_glyph(pixels, color, cell_size, pixel_size, ascender):
    return pixels_for_color(pixels, color, cell_size, pixel_size, ascender)


def glyph_colors(glyph):
    return sorted(
        {
            tuple(glyph["pixels"][offset : offset + 4])
            for offset in range(0, len(glyph["pixels"]), 4)
            if glyph["pixels"][offset + 3] > 0
        }
    )


def optimized_layer_specs(glyph_sources):
    specs = {
        glyph["key"]: [(color, False) for color in glyph_colors(glyph)]
        for glyph in glyph_sources
    }
    silhouette_groups = {}
    for glyph in glyph_sources:
        silhouette_groups.setdefault(
            silhouette_mask_key(glyph["pixels"]), []
        ).append(glyph)

    current_mask_count = unique_layer_mask_count(glyph_sources, specs)
    for silhouette, group in sorted(silhouette_groups.items()):
        if len(group) < 2:
            continue
        candidate = dict(specs)
        changed = False
        for glyph in group:
            layers = silhouette_layer_specs(glyph)
            if layers is not None:
                candidate[glyph["key"]] = layers
                changed = True
        if not changed:
            continue
        candidate_mask_count = unique_layer_mask_count(
            glyph_sources, candidate
        )
        if candidate_mask_count < current_mask_count:
            specs = candidate
            current_mask_count = candidate_mask_count
    return specs


def silhouette_layer_specs(glyph):
    colors = glyph_colors(glyph)
    pixels = glyph["pixels"]
    if not colors or any(
        pixels[offset + 3] != 255
        for offset in range(0, len(pixels), 4)
        if pixels[offset + 3] > 0
    ):
        return None

    counts = {
        color: sum(
            tuple(pixels[offset : offset + 4]) == color
            for offset in range(0, len(pixels), 4)
        )
        for color in colors
    }
    base_color = min(colors, key=lambda color: (-counts[color], color))
    return [(base_color, True)] + [
        (color, False) for color in colors if color != base_color
    ]


def unique_layer_mask_count(glyph_sources, specs):
    return len(
        {
            layer_mask_key(glyph["pixels"], color, use_silhouette)
            for glyph in glyph_sources
            for color, use_silhouette in specs[glyph["key"]]
        }
    )


def layer_mask_key(pixels, selected_color, use_silhouette):
    if use_silhouette:
        return silhouette_mask_key(pixels)
    return color_mask_key(pixels, selected_color)


def silhouette_mask_key(pixels):
    return bytes(
        pixels[offset + 3] > 0
        for offset in range(0, len(pixels), 4)
    )


def color_mask_key(pixels, selected_color):
    return bytes(
        tuple(pixels[offset : offset + 4]) == selected_color
        for offset in range(0, len(pixels), 4)
    )


def exact_mask_unions(mask_keys):
    ordered = sorted(mask_keys, key=lambda key: (sum(key), key))
    decompositions = {}
    for target in ordered:
        parts = [
            candidate
            for candidate in ordered
            if candidate != target and mask_is_proper_subset(candidate, target)
        ]
        match = next(
            (
                (left, right)
                for left_index, left in enumerate(parts)
                for right in parts[left_index:]
                if masks_are_disjoint(left, right)
                and mask_union(left, right) == target
            ),
            None,
        )
        if match:
            decompositions[target] = match
    return decompositions


def mask_is_proper_subset(candidate, target):
    return candidate != target and all(
        not value or target[index]
        for index, value in enumerate(candidate)
    )


def mask_union(left, right):
    return bytes(
        left_value or right[index]
        for index, left_value in enumerate(left)
    )


def masks_are_disjoint(left, right):
    return all(
        not left_value or not right[index]
        for index, left_value in enumerate(left)
    )


def expand_mask_key(key, decompositions):
    parts = decompositions.get(key)
    if not parts:
        return [key]
    return [
        rendered
        for part in parts
        for rendered in expand_mask_key(part, decompositions)
    ]


def mask_glyph(mask, cell_size, pixel_size, ascender):
    pen = TTGlyphPen(None)
    for y in range(cell_size):
        x = 0
        while x < cell_size:
            if not mask[y * cell_size + x]:
                x += 1
                continue
            width = 1
            while (
                x + width < cell_size
                and mask[y * cell_size + x + width]
            ):
                width += 1
            add_pixel_run(pen, x, y, width, pixel_size, ascender)
            x += width
    return pen.glyph()


def pixels_for_color(pixels, selected_color, cell_size, pixel_size, ascender):
    pen = TTGlyphPen(None)
    for y in range(cell_size):
        x = 0
        while x < cell_size:
            offset = (y * cell_size + x) * 4
            color = tuple(pixels[offset : offset + 4])
            matches = color[3] > 0 and (selected_color is None or color == selected_color)
            if not matches:
                x += 1
                continue
            width = 1
            while x + width < cell_size:
                next_offset = (y * cell_size + x + width) * 4
                next_color = tuple(pixels[next_offset : next_offset + 4])
                if next_color[3] == 0 or (selected_color is not None and next_color != selected_color):
                    break
                width += 1
            add_pixel_run(pen, x, y, width, pixel_size, ascender)
            x += width
    return pen.glyph()


def add_pixel_run(pen, x, y, width, pixel_size, ascender):
    x_min = x * pixel_size
    x_max = (x + width) * pixel_size
    y_max = ascender - y * pixel_size
    y_min = y_max - pixel_size
    pen.moveTo((x_min, y_min))
    pen.lineTo((x_min, y_max))
    pen.lineTo((x_max, y_max))
    pen.lineTo((x_max, y_min))
    pen.closePath()


if __name__ == "__main__":
    main()
