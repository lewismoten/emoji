#!/usr/bin/env python3

import json
import re
import sys
from pathlib import Path

from fontTools.colorLib.builder import buildCOLR, buildCPAL
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen


UNITS_PER_EM = 1024
PIXEL_SIZE = UNITS_PER_EM // 16
ASCENDER = 896
DESCENDER = -128


def main():
    source_path = Path(sys.argv[1])
    output_directory = Path(sys.argv[2])
    source = json.loads(source_path.read_text())
    output_directory.mkdir(parents=True, exist_ok=True)

    family_name = source["familyName"]
    glyph_sources = source["glyphs"]
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
    mask_names = {}
    mask_sources = {}
    color_layer_count = 0

    for glyph_source in glyph_sources:
        for color in glyph_colors(glyph_source):
            color_layer_count += 1
            key = color_mask_key(glyph_source["pixels"], color)
            if key not in mask_names:
                name = f"mask.{len(mask_names):04d}"
                mask_names[key] = name
                mask_sources[key] = (glyph_source["pixels"], color)

    component_names = sorted(set(codepoint_names.values()) - set(base_names.values()))
    for name in component_names:
        glyphs[name] = empty_glyph()
        glyph_order.append(name)

    for key, name in mask_names.items():
        pixels, color = mask_sources[key]
        glyphs[name] = color_glyph(pixels, color)
        glyph_order.append(name)

    for glyph_source in glyph_sources:
        base_name = base_names[glyph_source["key"]]
        if base_name not in glyphs:
            glyphs[base_name] = silhouette_glyph(glyph_source["pixels"])
            glyph_order.append(base_name)
        layers = []
        for color in glyph_colors(glyph_source):
            key = color_mask_key(glyph_source["pixels"], color)
            layers.append((mask_names[key], palette_indexes[color]))
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
    builder.setupHorizontalHeader(ascent=ASCENDER, descent=DESCENDER)
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
        sTypoAscender=ASCENDER,
        sTypoDescender=DESCENDER,
        usWinAscent=ASCENDER,
        usWinDescent=abs(DESCENDER),
    )
    builder.setupPost()
    builder.setupMaxp()

    font = builder.font
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

    font.flavor = "woff"
    font.save(output_directory / "pixel-emoji.woff")
    font.flavor = None
    try:
        font.flavor = "woff2"
        font.save(output_directory / "pixel-emoji.woff2")
    except ImportError:
        print("WOFF2 skipped: install the packages in pixel-font/requirements.txt.")
    print(
        f"Compiled {len(glyph_sources):,} glyphs with {color_layer_count:,} color layers "
        f"using {len(mask_names):,} unique pixel masks."
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
        or 0xE0020 <= codepoint <= 0xE007F
    )


def safe_name(key):
    return "emoji." + re.sub(r"[^A-Za-z0-9_.]", "_", key)


def empty_glyph():
    return TTGlyphPen(None).glyph()


def silhouette_glyph(pixels):
    return pixels_for_color(pixels, None)


def color_glyph(pixels, color):
    return pixels_for_color(pixels, color)


def glyph_colors(glyph):
    return sorted(
        {
            tuple(glyph["pixels"][offset : offset + 4])
            for offset in range(0, len(glyph["pixels"]), 4)
            if glyph["pixels"][offset + 3] > 0
        }
    )


def color_mask_key(pixels, selected_color):
    return bytes(
        tuple(pixels[offset : offset + 4]) == selected_color
        for offset in range(0, len(pixels), 4)
    )


def pixels_for_color(pixels, selected_color):
    pen = TTGlyphPen(None)
    for y in range(16):
        x = 0
        while x < 16:
            offset = (y * 16 + x) * 4
            color = tuple(pixels[offset : offset + 4])
            matches = color[3] > 0 and (selected_color is None or color == selected_color)
            if not matches:
                x += 1
                continue
            width = 1
            while x + width < 16:
                next_offset = (y * 16 + x + width) * 4
                next_color = tuple(pixels[next_offset : next_offset + 4])
                if next_color[3] == 0 or (selected_color is not None and next_color != selected_color):
                    break
                width += 1
            x_min = x * PIXEL_SIZE
            x_max = (x + width) * PIXEL_SIZE
            y_max = ASCENDER - y * PIXEL_SIZE
            y_min = y_max - PIXEL_SIZE
            pen.moveTo((x_min, y_min))
            pen.lineTo((x_min, y_max))
            pen.lineTo((x_max, y_max))
            pen.lineTo((x_max, y_min))
            pen.closePath()
            x += width
    return pen.glyph()


if __name__ == "__main__":
    main()
