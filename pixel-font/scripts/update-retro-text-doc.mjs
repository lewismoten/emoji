import fs from "node:fs/promises";
import path from "node:path";

export const retroTextDocMarkers = {
  start: "<!-- retro-text-build-stats:start -->",
  end: "<!-- retro-text-build-stats:end -->",
};

export async function updateRetroTextDoc(options) {
  const docPath = path.join(options.workspace, "RETRO_TEXT_FONT.md");
  const markdown = await fs.readFile(docPath, "utf8");
  if (
    !markdown.includes(retroTextDocMarkers.start) ||
    !markdown.includes(retroTextDocMarkers.end)
  ) {
    throw new Error(
      "Retro text build stats markers are missing from RETRO_TEXT_FONT.md",
    );
  }

  const tableRows = options.fileStats
    .map(
      (entry) =>
        `| \`${entry.file}\` | ${entry.size
          .toLocaleString("en-US")
          .padStart(10, " ")} bytes |`,
    )
    .join("\n");

  const bulletRows = options.fileStats
    .filter((entry) => entry.file !== "pixel-latin-retro.css")
    .map(
      (entry) =>
        `- \`${entry.file}\`: about ${(entry.size / 1024).toFixed(1)} KB`,
    )
    .join("\n");

  const replacement =
    `${retroTextDocMarkers.start}\n` +
    `As of the current build, Pixel Latin Retro contains ${options.glyphCount.toLocaleString("en-US")} glyphs and ships as:\n\n` +
    `| File | Size |\n` +
    `| ---- | ---: |\n` +
    `${tableRows}\n\n` +
    `At the moment, aggressive size optimization is not a priority because the compiled font is already small:\n\n` +
    `${bulletRows}\n` +
    `${retroTextDocMarkers.end}`;

  const updated = markdown.replace(
    new RegExp(
      `${escapeRegExp(retroTextDocMarkers.start)}[\\s\\S]*?${escapeRegExp(retroTextDocMarkers.end)}`,
    ),
    replacement,
  );
  await fs.writeFile(docPath, updated, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
