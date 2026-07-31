import json
import sys
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

DETERMINISTIC_FONT_TIMESTAMP = 0


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
    bitmap_components = {}

    for entry in source["glyphs"]:
        name = glyph_name(entry["character"])
        bitmap = entry["bitmap"]
        component_name = bitmap_components.get(bitmap)
        if component_name is None:
            glyphs[name] = bitmap_glyph(
                bitmap,
                source["width"],
                source["height"],
                source["pixelSize"],
            )
            bitmap_components[bitmap] = name
        else:
            glyphs[name] = component_glyph(component_name, glyphs)
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
    font["head"].created = DETERMINISTIC_FONT_TIMESTAMP
    font["head"].modified = DETERMINISTIC_FONT_TIMESTAMP
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


def component_glyph(component_name, glyphs):
    pen = TTGlyphPen(glyphs)
    pen.addComponent(component_name, (1, 0, 0, 1, 0, 0))
    return pen.glyph()


def bitmap_glyph(bitmap, width, height, pixel_size):
    pen = TTGlyphPen(None)
    trace_bitmap_outline(pen, bitmap, width, height, pixel_size)
    return pen.glyph()


def trace_bitmap_outline(pen, bitmap, width, height, pixel_size):
    mask = bytes(pixel == "1" for pixel in bitmap)
    edges = boundary_edges(mask, width, height)
    ascender = height * pixel_size
    while edges:
        start = min(edges)
        contour = [start]
        current = start
        previous = None
        while True:
            options = edges.get(current, set())
            if not options:
                break
            target = choose_next_point(current, previous, options)
            options.remove(target)
            if not options:
                del edges[current]
            previous, current = current, target
            if current == start:
                break
            contour.append(current)
        draw_contour(pen, contour, pixel_size, ascender)


def boundary_edges(mask, width, height):
    edges = {}
    for y in range(height):
        for x in range(width):
            if not mask[y * width + x]:
                continue
            add_or_cancel_edge(edges, (x, y), (x + 1, y))
            add_or_cancel_edge(edges, (x + 1, y), (x + 1, y + 1))
            add_or_cancel_edge(edges, (x + 1, y + 1), (x, y + 1))
            add_or_cancel_edge(edges, (x, y + 1), (x, y))
    return edges


def add_or_cancel_edge(edges, start, end):
    reverse = edges.get(end)
    if reverse and start in reverse:
        reverse.remove(start)
        if not reverse:
            del edges[end]
    else:
        edges.setdefault(start, set()).add(end)


def choose_next_point(current, previous, options):
    if previous is None:
        return min(options)
    direction = (current[0] - previous[0], current[1] - previous[1])
    priority = [
        direction,
        turn_left(direction),
        turn_right(direction),
        (-direction[0], -direction[1]),
    ]
    for candidate_direction in priority:
        target = (
            current[0] + candidate_direction[0],
            current[1] + candidate_direction[1],
        )
        if target in options:
            return target
    return min(options)


def turn_left(direction):
    x, y = direction
    return (-y, x)


def turn_right(direction):
    x, y = direction
    return (y, -x)


def draw_contour(pen, contour, pixel_size, ascender):
    points = simplify_contour(
        [scale_point(point, pixel_size, ascender) for point in contour]
    )
    pen.moveTo(points[0])
    for point in points[1:]:
        pen.lineTo(point)
    pen.closePath()


def simplify_contour(points):
    if len(points) <= 2:
        return points
    simplified = []
    total = len(points)
    for index, point in enumerate(points):
        previous = points[index - 1]
        next_point = points[(index + 1) % total]
        if is_collinear(previous, point, next_point):
            continue
        simplified.append(point)
    return simplified or points


def is_collinear(previous, current, next_point):
    return (
        (previous[0] == current[0] == next_point[0])
        or (previous[1] == current[1] == next_point[1])
    )


def scale_point(point, pixel_size, ascender):
    x, y = point
    return (x * pixel_size, ascender - y * pixel_size)


if __name__ == "__main__":
    main()
