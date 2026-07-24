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
    {"key": "lightSkinTone", "codePoints": ["1F3FB"]},
    {"key": "manLightSkinTone", "codePoints": ["1F468", "1F3FB"]},
    {"key": "woman", "codePoints": ["1F469"]},
    {"key": "peopleWithBunnyEars", "codePoints": ["1F46F"]},
    {
        "key": "peopleWithBunnyEarsLightSkinTone",
        "codePoints": ["1F46F", "1F3FB"],
    },
    {
        "key": "womenWithBunnyEarsLightSkinTone",
        "codePoints": ["1F46F", "1F3FB", "200D", "2640", "FE0F"],
    },
    {"key": "peopleWrestling", "codePoints": ["1F93C"]},
    {
        "key": "peopleWrestlingLightSkinTone",
        "codePoints": ["1F93C", "1F3FB"],
    },
    {
        "key": "womenWrestlingLightSkinTone",
        "codePoints": ["1F93C", "1F3FB", "200D", "2640", "FE0F"],
    },
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

assert features.startswith("feature ccmp {")
assert "sub emoji.man uni200D emoji.heart uni200D emoji.woman by emoji.couple;" in features
assert "sub emoji.man uni200D emoji.woman by emoji.pair;" in features
assert "sub emoji.man emoji.lightSkinTone by emoji.manLightSkinTone;" in features
assert (
    "sub emoji.peopleWithBunnyEars emoji.lightSkinTone uni200D uni2640 "
    "by emoji.womenWithBunnyEarsLightSkinTone;"
) in features
assert (
    "sub emoji.peopleWrestling emoji.lightSkinTone uni200D uni2640 "
    "by emoji.womenWrestlingLightSkinTone;"
) in features
assert features.index("by emoji.couple;") < features.index("by emoji.pair;")
assert "sub uni1F1FA uni1F1F8 by emoji.usFlag;" in features
assert "sub uni0031 uni20E3 by emoji.keycapOne;" in features
assert "uniE0067 uniE0062 uniE0065 uniE006E uniE0067 uniE007F" in features
assert "uniFE0F" not in features
assert compiler.is_zero_width_component(0x200D)
assert compiler.is_zero_width_component(0x20E3)
assert compiler.is_zero_width_component(0xE0067)
assert compiler.is_zero_width_component(0xE007F)
assert compiler.is_zero_width_component(0x1F3FB)
assert compiler.is_zero_width_component(0x1F3FF)
assert compiler.is_zero_width_component(0x1F9B0)
assert compiler.is_zero_width_component(0x1F9B3)
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


def pixels_for_unique_fallback():
    pixels = []
    for y in range(12):
        for x in range(12):
            color = (
                (255, 255, 0, 255)
                if x == y
                else (0, 0, 255, 255)
                if x + y == 11
                else (0, 0, 0, 0)
            )
            pixels.extend(color)
    return pixels


def pixels_for_black_silhouette():
    return [
        value
        for y in range(12)
        for x in range(12)
        for value in (
            (0, 0, 0, 255)
            if 2 <= x <= 9 and 2 <= y <= 9
            else (0, 0, 0, 0)
        )
    ]


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

left_mask = bytes([1, 1, 0, 0])
right_mask = bytes([0, 0, 1, 0])
combined_mask = bytes([1, 1, 1, 0])
mask_decompositions = compiler.exact_mask_unions(
    {left_mask, right_mask, combined_mask}
)
assert mask_decompositions[combined_mask] == (right_mask, left_mask)
assert compiler.expand_mask_key(combined_mask, mask_decompositions) == [
    right_mask,
    left_mask,
]


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
    ] + [
        {
            "key": "uniqueFallback",
            "codePoints": ["1FAFF"],
            "pixels": pixels_for_unique_fallback(),
        },
        {
            "key": "blackSilhouette",
            "codePoints": ["25CF"],
            "pixels": pixels_for_black_silhouette(),
        },
    ]
    assert compiler.is_black_silhouette(painted_glyphs[-1]["pixels"])
    assert not compiler.is_black_silhouette(painted_glyphs[-2]["pixels"])
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
    assert feature_tags == {"ccmp"}
    ccmp_feature = next(
        record.Feature
        for record in font["GSUB"].table.FeatureList.FeatureRecord
        if record.FeatureTag == "ccmp"
    )
    assert ccmp_feature.LookupCount == 2
    assert font["post"].formatType == 3.0
    assert font["OS/2"].fsType == 0
    assert font["head"].fontRevision == 1.0
    assert {
        record.toUnicode()
        for record in font["name"].names
        if record.nameID == 5
    } == {"Version 1.0.0"}
    assert {record.platformID for record in font["name"].names} == {1, 3}
    cmap = font.getBestCmap()
    variation_cmap = next(
        table
        for table in font["cmap"].tables
        if table.format == 14
    )
    assert (0x2640, None) in variation_cmap.uvsDict[0xFE0F]
    assert (0x2764, None) in variation_cmap.uvsDict[0xFE0F]
    assert (0x31, None) in variation_cmap.uvsDict[0xFE0F]
    assert 0xFE0F not in cmap

    rules = {}
    lookup_rules = []
    man_rule_lengths = []
    for lookup in font["GSUB"].table.LookupList.Lookup:
        current_rules = {}
        for subtable in lookup.SubTable:
            for first, ligatures in getattr(subtable, "ligatures", {}).items():
                for ligature in ligatures:
                    inputs = (first, *ligature.Component)
                    rules[inputs] = ligature.LigGlyph
                    current_rules[inputs] = ligature.LigGlyph
                    if first == cmap[0x1F468]:
                        man_rule_lengths.append(len(inputs))
        lookup_rules.append(current_rules)

    assert rules[
        (
            cmap[0x1F468],
            cmap[0x200D],
            cmap[0x2764],
            cmap[0x200D],
            cmap[0x1F469],
        )
    ] in font.getGlyphOrder()
    assert rules[
        (cmap[0x1F468], cmap[0x200D], cmap[0x1F469])
    ] in font.getGlyphOrder()
    assert rules[
        (
            cmap[0x1F46F],
            cmap[0x1F3FB],
            cmap[0x200D],
            cmap[0x2640],
        )
    ] in font.getGlyphOrder()
    assert rules[
        (
            cmap[0x1F93C],
            cmap[0x1F3FB],
            cmap[0x200D],
            cmap[0x2640],
        )
    ] in font.getGlyphOrder()
    bunny_tone = lookup_rules[0][
        (cmap[0x1F46F], cmap[0x1F3FB])
    ]
    assert lookup_rules[1][
        (bunny_tone, cmap[0x200D], cmap[0x2640])
    ] == rules[
        (
            cmap[0x1F46F],
            cmap[0x1F3FB],
            cmap[0x200D],
            cmap[0x2640],
        )
    ]
    wrestling_tone = lookup_rules[0][
        (cmap[0x1F93C], cmap[0x1F3FB])
    ]
    assert lookup_rules[1][
        (wrestling_tone, cmap[0x200D], cmap[0x2640])
    ] == rules[
        (
            cmap[0x1F93C],
            cmap[0x1F3FB],
            cmap[0x200D],
            cmap[0x2640],
        )
    ]
    assert rules[(cmap[0x1F1FA], cmap[0x1F1F8])] in font.getGlyphOrder()
    assert rules[(cmap[0x31], cmap[0x20E3])] in font.getGlyphOrder()
    assert rules[
        (
            cmap[0x1F3F4],
            cmap[0xE0067],
            cmap[0xE0062],
            cmap[0xE0065],
            cmap[0xE006E],
            cmap[0xE0067],
            cmap[0xE007F],
        )
    ] in font.getGlyphOrder()
    assert man_rule_lengths == sorted(man_rule_lengths, reverse=True)

    for codepoint in (0x200D, 0x20E3, 0xE0067, 0xE007F):
        assert font["hmtx"].metrics[cmap[codepoint]][0] == 0
    assert font["hmtx"].metrics[cmap[0x1F3FB]][0] == compiler.UNITS_PER_EM
    assert cmap[0x1F3FB] in font["COLR"].ColorLayers
    color_layer_names = {
        layer.name
        for layers in font["COLR"].ColorLayers.values()
        for layer in layers
    }
    assert len(color_layer_names) == 5
    assert cmap[0x25CF] not in font["COLR"].ColorLayers
    unencoded_empty_glyphs = [
        name
        for name in font.getGlyphOrder()
        if name not in set(cmap.values())
        and not font["glyf"][name].isComposite()
        and font["glyf"][name].numberOfContours == 0
    ]
    assert unencoded_empty_glyphs == [".notdef"]
    base_glyph_names = {
        *rules.values(),
        cmap[0x1F468],
        cmap[0x1F3FB],
        cmap[0x1F469],
        cmap[0x2764],
        cmap[0x1FAFF],
        cmap[0x25CF],
    }
    assert all(font["glyf"][name].isComposite() for name in base_glyph_names)
    assert len(font["glyf"][cmap[0x1FAFF]].components) == 2
    assert {
        component.glyphName
        for component in font["glyf"][cmap[0x1FAFF]].components
    } == {
        layer.name
        for layer in font["COLR"].ColorLayers[cmap[0x1FAFF]]
    }

    for web_font_name in ("pixel-emoji.woff", "pixel-emoji.woff2"):
        web_font = TTFont(output_directory / web_font_name)
        assert {
            record.platformID for record in web_font["name"].names
        } == {3}

print("Verified required ligature generation for emoji sequences.")
