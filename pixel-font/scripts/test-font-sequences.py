#!/usr/bin/env python3

import importlib.util
import json
import sys
import tempfile
from pathlib import Path

from fontTools.ttLib import TTFont


compiler_path = Path(__file__).with_name("compile-font.py")
spec = importlib.util.spec_from_file_location("pixel_font_compiler", compiler_path)
compiler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)


glyph_sources = [
    {"key": "man", "codePoints": ["1F468"]},
    {"key": "woman", "codePoints": ["1F469"]},
    {"key": "heart", "codePoints": ["2764", "FE0F"]},
    {
        "key": "couple",
        "codePoints": ["1F468", "200D", "2764", "FE0F", "200D", "1F469"],
    },
    {"key": "pair", "codePoints": ["1F468", "200D", "1F469"]},
    {"key": "usFlag", "codePoints": ["1F1FA", "1F1F8"]},
    {"key": "keycapOne", "codePoints": ["0031", "FE0F", "20E3"]},
    {
        "key": "englandFlag",
        "codePoints": [
            "1F3F4",
            "E0067",
            "E0062",
            "E0065",
            "E006E",
            "E0067",
            "E007F",
        ],
    },
]
base_names = {
    glyph["key"]: compiler.safe_name(glyph["key"])
    for glyph in glyph_sources
}
codepoint_names = {
    codepoint: f"uni{codepoint:04X}"
    for glyph in glyph_sources
    for codepoint in compiler.sequence(glyph)
}
single_by_codepoint = {
    compiler.sequence(glyph)[0]: base_names[glyph["key"]]
    for glyph in glyph_sources
    if len(compiler.sequence(glyph)) == 1
}
features = compiler.ligature_features(
    glyph_sources,
    base_names,
    codepoint_names,
    single_by_codepoint,
)

assert features.startswith("feature rlig {")
assert "sub emoji.man uni200D emoji.heart uni200D emoji.woman by emoji.couple;" in features
assert "sub emoji.man uni200D emoji.woman by emoji.pair;" in features
assert features.index("by emoji.couple;") < features.index("by emoji.pair;")
assert "sub uni1F1FA uni1F1F8 by emoji.usFlag;" in features
assert "sub uni0031 uni20E3 by emoji.keycapOne;" in features
assert "uniE0067 uniE0062 uniE0065 uniE006E uniE0067 uniE007F" in features
assert "uniFE0F" not in features
assert compiler.is_zero_width_component(0x200D)
assert compiler.is_zero_width_component(0x20E3)
assert compiler.is_zero_width_component(0xE0067)
assert compiler.is_zero_width_component(0xE007F)
assert not compiler.is_zero_width_component(0x1F1FA)


def pixels_for_variation(variation):
    pixels = []
    for y in range(12):
        for x in range(12):
            color = (
                (255, 255, 255, 255)
                if x < 6
                else (255, 0, 0, 255)
                if y == 0 and x == 6 + variation
                else (0, 0, 0, 0)
            )
            pixels.extend(color)
    return pixels


def pixels_for_shared_face(eye_x):
    pixels = []
    for y in range(12):
        for x in range(12):
            visible = 1 <= x <= 10 and 1 <= y <= 10
            color = (
                (0, 0, 0, 255)
                if visible and y == 4 and x == eye_x
                else (255, 255, 0, 255)
                if visible
                else (0, 0, 0, 0)
            )
            pixels.extend(color)
    return pixels


shared_face_sources = [
    {"key": "faceA", "pixels": pixels_for_shared_face(3)},
    {"key": "faceB", "pixels": pixels_for_shared_face(4)},
]
shared_face_specs = compiler.optimized_layer_specs(shared_face_sources)
assert all(layers[0][1] is True for layers in shared_face_specs.values())
assert compiler.unique_layer_mask_count(
    shared_face_sources, shared_face_specs
) == 3

translucent_sources = [
    {
        "key": "translucentA",
        "pixels": [
            value
            for _pixel in range(12 * 12)
            for value in (255, 255, 0, 128)
        ],
    },
    {
        "key": "translucentB",
        "pixels": [
            value
            for _pixel in range(12 * 12)
            for value in (255, 255, 0, 128)
        ],
    },
]
assert all(
    not use_silhouette
    for layers in compiler.optimized_layer_specs(translucent_sources).values()
    for _color, use_silhouette in layers
)


with tempfile.TemporaryDirectory() as temporary_directory:
    temporary = Path(temporary_directory)
    source_path = temporary / "font-source.json"
    output_directory = temporary / "font"
    painted_glyphs = [
        {
            **glyph,
            "pixels": pixels_for_variation(index % 2),
        }
        for index, glyph in enumerate(glyph_sources)
    ]
    source_path.write_text(
        json.dumps(
            {
                "familyName": "Pixel Emoji Sequence Test",
                "cellSize": 12,
                "glyphs": painted_glyphs,
            }
        )
    )
    original_arguments = sys.argv
    try:
        sys.argv = [str(compiler_path), str(source_path), str(output_directory)]
        compiler.main()
    finally:
        sys.argv = original_arguments

    font = TTFont(output_directory / "pixel-emoji.ttf")
    feature_tags = {
        record.FeatureTag
        for record in font["GSUB"].table.FeatureList.FeatureRecord
    }
    assert feature_tags == {"rlig"}

    rules = {}
    man_rule_lengths = []
    for lookup in font["GSUB"].table.LookupList.Lookup:
        for subtable in lookup.SubTable:
            for first, ligatures in getattr(subtable, "ligatures", {}).items():
                for ligature in ligatures:
                    inputs = (first, *ligature.Component)
                    rules[inputs] = ligature.LigGlyph
                    if first == "emoji.man":
                        man_rule_lengths.append(len(inputs))

    assert rules[
        ("emoji.man", "uni200D", "emoji.heart", "uni200D", "emoji.woman")
    ] == "emoji.couple"
    assert rules[("emoji.man", "uni200D", "emoji.woman")] == "emoji.pair"
    assert rules[("uni1F1FA", "uni1F1F8")] == "emoji.usFlag"
    assert rules[("uni0031", "uni20E3")] == "emoji.keycapOne"
    assert rules[
        (
            "uni1F3F4",
            "uniE0067",
            "uniE0062",
            "uniE0065",
            "uniE006E",
            "uniE0067",
            "uniE007F",
        )
    ] == "emoji.englandFlag"
    assert man_rule_lengths == sorted(man_rule_lengths, reverse=True)

    cmap = font.getBestCmap()
    assert cmap[0x200D] == "uni200D"
    for codepoint in (0x200D, 0x20E3, 0xE0067, 0xE007F):
        assert font["hmtx"].metrics[cmap[codepoint]][0] == 0
    color_layer_names = {
        layer.name
        for layers in font["COLR"].ColorLayers.values()
        for layer in layers
    }
    assert color_layer_names == {"mask.0000", "mask.0001", "mask.0002"}
    assert [name for name in font.getGlyphOrder() if name.startswith("mask.")] == [
        "mask.0000",
        "mask.0001",
        "mask.0002",
    ]

print("Verified required ligature generation for emoji sequences.")
