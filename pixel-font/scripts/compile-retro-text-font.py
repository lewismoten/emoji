import json
import sys
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.misc.timeTools import timestampNow
from fontTools.pens.ttGlyphPen import TTGlyphPen


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Usage: compile-retro-text-font.py <source.json> <output-dir>")

    source = json.loads(Path(sys.argv[1]).read_text("utf8"))
    output_dir = Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)

    units_per_em = source["advanceWidth"] + source["pixelSize"]
    glyph_order = [".notdef"] + [glyph_name(entry["character"]) for entry in source["glyphs"]]
    glyphs = {".notdef": empty_glyph()}
    metrics = {".notdef": (source["advanceWidth"], 0)}
    cmap = {}

    for entry in source["glyphs"]:
        name = glyph_name(entry["character"])
        glyphs[name] = bitmap_glyph(
            entry["bitmap"],
            source["width"],
            source["height"],
            source["pixelSize"],
        )
        metrics[name] = (source["advanceWidth"], 0)
        cmap[entry["codePoint"]] = name

    builder = FontBuilder(units_per_em, isTTF=True)
    builder.setupGlyphOrder(glyph_order)
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(
        ascent=source["height"] * source["pixelSize"],
        descent=-source["pixelSize"],
        lineGap=source["lineGap"],
    )
    builder.setupMaxp()
    builder.setupNameTable(
        {
            "familyName": source["familyName"],
            "styleName": source["styleName"],
            "fullName": f'{source["familyName"]} {source["styleName"]}',
            "psName": "PixelLatinRetro-Regular",
            "version": f'Version {source["fontVersion"]}',
            "copyright": source["copyright"],
            "designer": source["designer"],
            "uniqueFontIdentifier": f'{source["familyName"]};{source["fontVersion"]};{source["designer"]}',
            "vendorURL": source["url"],
        }
    )
    builder.setupOS2(
        sTypoAscender=source["height"] * source["pixelSize"],
        sTypoDescender=-source["pixelSize"],
        sTypoLineGap=source["lineGap"],
        usWinAscent=source["height"] * source["pixelSize"],
        usWinDescent=source["pixelSize"],
        sxHeight=source["height"] * source["pixelSize"],
        sCapHeight=source["height"] * source["pixelSize"],
    )
    builder.setupPost()
    builder.setupHead(
        xMin=0,
        yMin=0,
        xMax=source["width"] * source["pixelSize"],
        yMax=source["height"] * source["pixelSize"],
    )

    font = builder.font
    font["head"].created = timestampNow()
    font["head"].modified = timestampNow()
    font["post"].isFixedPitch = 1
    font["OS/2"].xAvgCharWidth = source["advanceWidth"]
    ttf_path = output_dir / "pixel-latin-retro.ttf"
    font.save(ttf_path)
    font.flavor = "woff"
    font.save(output_dir / "pixel-latin-retro.woff")
    font.flavor = "woff2"
    font.save(output_dir / "pixel-latin-retro.woff2")


def glyph_name(character):
    return f"u{ord(character):04X}"


def empty_glyph():
    return TTGlyphPen(None).glyph()


def bitmap_glyph(bitmap, width, height, pixel_size):
    pen = TTGlyphPen(None)
    rows = [bitmap[index : index + width] for index in range(0, len(bitmap), width)]
    total_height = height * pixel_size
    for row_index, row in enumerate(rows):
        for column_index, pixel in enumerate(row):
            if pixel != "1":
                continue
            x = column_index * pixel_size
            y = total_height - ((row_index + 1) * pixel_size)
            pen.moveTo((x, y))
            pen.lineTo((x + pixel_size, y))
            pen.lineTo((x + pixel_size, y + pixel_size))
            pen.lineTo((x, y + pixel_size))
            pen.closePath()
    return pen.glyph()


if __name__ == "__main__":
    main()
