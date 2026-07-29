import json
import sys
from pathlib import Path

from PIL import Image


def main():
    if len(sys.argv) < 2:
        raise SystemExit(
            "Usage: retro-text-atlas.py <extract|render-pages|render-sample> ..."
        )

    command = sys.argv[1]
    if command == "extract" and len(sys.argv) == 4:
        extract_source(Path(sys.argv[2]), Path(sys.argv[3]))
        return
    if command == "render-pages" and len(sys.argv) == 4:
        render_pages(Path(sys.argv[2]), Path(sys.argv[3]))
        return
    if command == "render-sample" and len(sys.argv) == 5:
        render_sample(Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4]))
        return

    raise SystemExit(
        "Usage: retro-text-atlas.py <extract|render-pages|render-sample> ..."
    )


def load_manifest(manifest_path):
    manifest = json.loads(manifest_path.read_text("utf8"))
    root = manifest_path.parent
    return manifest, root


def load_page(root, page):
    page_data = json.loads((root / page["map"]).read_text("utf8"))
    page_image = Image.open(root / page["image"]).convert("RGBA")
    return page_data, page_image


def iter_page_cells(page_rows):
    for row_index, row in enumerate(page_rows):
        for column_index, character in enumerate(row):
            if character is None or character == "":
                continue
            yield row_index, column_index, character


def extract_bitmap(image, row_index, column_index, cell_size, glyph_box):
    start_x = column_index * cell_size + glyph_box["x"]
    start_y = row_index * cell_size + glyph_box["y"]
    bits = []
    for y in range(glyph_box["height"]):
        for x in range(glyph_box["width"]):
            alpha = image.getpixel((start_x + x, start_y + y))[3]
            red, green, blue, alpha = image.getpixel((start_x + x, start_y + y))
            is_dark = (red + green + blue) < 384
            bits.append("1" if alpha > 0 and is_dark else "0")
    return "".join(bits)


def draw_bitmap(draw, bitmap, x, y, glyph_width, glyph_height):
    for row in range(glyph_height):
        for column in range(glyph_width):
            if bitmap[row * glyph_width + column] != "1":
                continue
            draw.putpixel((x + column, y + row), (0, 0, 0, 255))


def extract_source(manifest_path, output_path):
    manifest, root = load_manifest(manifest_path)
    glyphs = []
    for page in manifest["pages"]:
        page_data, page_image = load_page(root, page)
        cell_size = page["cellSize"]
        glyph_box = page["glyphBox"]
        for row_index, column_index, character in iter_page_cells(page_data["rows"]):
            glyphs.append(
                {
                    "character": character,
                    "codePoint": ord(character),
                    "bitmap": extract_bitmap(
                        page_image, row_index, column_index, cell_size, glyph_box
                    ),
                }
            )

    glyphs.sort(key=lambda entry: entry["codePoint"])
    source = {
        "familyName": manifest["familyName"],
        "styleName": manifest["styleName"],
        "fontVersion": manifest["fontVersion"],
        "copyright": manifest["copyright"],
        "designer": manifest["designer"],
        "url": manifest["url"],
        "width": manifest["glyphBox"]["width"],
        "height": manifest["glyphBox"]["height"],
        "pixelSize": manifest["pixelSize"],
        "advanceWidth": manifest["advanceWidth"],
        "lineGap": manifest["lineGap"],
        "glyphs": glyphs,
    }
    output_path.write_text(json.dumps(source, indent=2, ensure_ascii=False) + "\n", "utf8")


def render_pages(manifest_path, source_path):
    manifest, root = load_manifest(manifest_path)
    glyph_source = json.loads(source_path.read_text("utf8"))
    bitmaps = {entry["character"]: entry["bitmap"] for entry in glyph_source["glyphs"]}
    glyph_width = manifest["glyphBox"]["width"]
    glyph_height = manifest["glyphBox"]["height"]

    for page in manifest["pages"]:
      page_data = json.loads((root / page["map"]).read_text("utf8"))
      cell_size = page["cellSize"]
      rows = len(page_data["rows"])
      columns = max(len(row) for row in page_data["rows"])
      image = Image.new("RGBA", (columns * cell_size, rows * cell_size), (255, 255, 255, 255))
      for y in range(0, rows * cell_size, cell_size):
          for x in range(columns * cell_size):
              image.putpixel((x, y), (216, 216, 216, 255))
      for x in range(0, columns * cell_size, cell_size):
          for y in range(rows * cell_size):
              image.putpixel((x, y), (216, 216, 216, 255))
      for row_index, column_index, character in iter_page_cells(page_data["rows"]):
          bitmap = bitmaps.get(character)
          if bitmap is None:
              continue
          draw_bitmap(
              image,
              bitmap,
              column_index * cell_size + page["glyphBox"]["x"],
              row_index * cell_size + page["glyphBox"]["y"],
              glyph_width,
              glyph_height,
          )
      image.save(root / page["image"])


def wrap_text(words, max_line_length):
    lines = []
    line = ""
    for word in words:
        next_line = word if line == "" else f"{line} {word}"
        if len(next_line) <= max_line_length or line == "":
            line = next_line
            continue
        lines.append(line)
        line = word
    if line:
        lines.append(line)
    return lines


def collect_sample_lines(manifest):
    sample_entries = manifest.get("samplePhrases")
    if sample_entries:
        lines = []
        for entry in sample_entries:
            lines.extend(wrap_text(entry["text"].split(), manifest.get("sampleWrap", 28)))
        return lines
    return wrap_text(manifest["samplePhrase"].split(), manifest.get("sampleWrap", 28))


def render_sample(manifest_path, source_path, output_path):
    manifest, _ = load_manifest(manifest_path)
    glyph_source = json.loads(source_path.read_text("utf8"))
    bitmaps = {entry["character"]: entry["bitmap"] for entry in glyph_source["glyphs"]}
    glyph_width = manifest["glyphBox"]["width"]
    glyph_height = manifest["glyphBox"]["height"]
    scale = manifest.get("sampleScale", 4)
    lines = collect_sample_lines(manifest)
    rendered_width = max(len(line) for line in lines) * (glyph_width + 1)
    rendered_height = len(lines) * (glyph_height + 2) - 1
    image = Image.new(
        "RGBA",
        (rendered_width * scale, rendered_height * scale),
        (255, 255, 255, 255),
    )
    for line_index, line in enumerate(lines):
        for character_index, character in enumerate(line):
            bitmap = bitmaps.get(character)
            if bitmap is None:
                continue
            glyph = Image.new("RGBA", (glyph_width, glyph_height), (0, 0, 0, 0))
            draw_bitmap(glyph, bitmap, 0, 0, glyph_width, glyph_height)
            position = (
                character_index * (glyph_width + 1) * scale,
                line_index * (glyph_height + 2) * scale,
            )
            image.alpha_composite(
                glyph.resize(
                    (
                        glyph_width * scale,
                        glyph_height * scale,
                    ),
                    resample=Image.Resampling.NEAREST,
                ),
                position,
            )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)


if __name__ == "__main__":
    main()
