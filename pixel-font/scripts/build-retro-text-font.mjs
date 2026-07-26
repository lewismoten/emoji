import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  BITMAP_FONT_5X7,
  BITMAP_FONT_5X7_CHARACTERS,
} from "../retro-text-bitmap.mjs";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(workspace, "build-retro-text");
const sourceFile = path.join(outputDirectory, "retro-text-source.json");
const manifestFile = path.join(outputDirectory, "manifest.json");

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });

const glyphs = BITMAP_FONT_5X7_CHARACTERS.map((character) => ({
  character,
  codePoint: character.codePointAt(0),
  bitmap: BITMAP_FONT_5X7[character],
}));

const source = {
  familyName: "Pixel Latin Retro",
  styleName: "Regular",
  fontVersion: "1.0.0",
  copyright: "Copyright (c) 2026, Lewis Moten",
  designer: "Lewis Moten",
  url: "https://lewismoten.com",
  width: 5,
  height: 7,
  pixelSize: 128,
  advanceWidth: 768,
  lineGap: 128,
  glyphs,
};

await fs.writeFile(sourceFile, `${JSON.stringify(source, null, 2)}\n`);
await run(await pythonCommand(), [
  path.join(workspace, "scripts", "compile-retro-text-font.py"),
  sourceFile,
  outputDirectory,
]);

await fs.writeFile(
  path.join(outputDirectory, "pixel-latin-retro.css"),
  `:root {\n  --pixel-retro-latin-family: "Pixel Latin Retro";\n}\n\n@font-face {\n  font-family: "Pixel Latin Retro";\n  src:\n    url("./pixel-latin-retro.woff2") format("woff2"),\n    url("./pixel-latin-retro.woff") format("woff");\n  font-display: swap;\n  font-weight: 400;\n  font-style: normal;\n}\n`,
);

await fs.writeFile(
  manifestFile,
  `${JSON.stringify(
    {
      familyName: source.familyName,
      fontVersion: source.fontVersion,
      glyphCount: glyphs.length,
      characterSet: ["Basic Latin", "Latin-1 Supplement"],
      files: [
        "pixel-latin-retro.ttf",
        "pixel-latin-retro.woff",
        "pixel-latin-retro.woff2",
        "pixel-latin-retro.css",
      ],
    },
    null,
    2,
  )}\n`,
);

await fs.rm(sourceFile, { force: true });
console.info(
  `Built ${source.familyName} with ${glyphs.length.toLocaleString()} glyphs in ${path.relative(process.cwd(), outputDirectory)}.`,
);

async function pythonCommand() {
  const virtualEnvironmentPython =
    process.platform === "win32"
      ? path.join(workspace, ".venv", "Scripts", "python.exe")
      : path.join(workspace, ".venv", "bin", "python");
  try {
    await fs.access(virtualEnvironmentPython);
    return virtualEnvironmentPython;
  } catch {
    return process.platform === "win32" ? "python" : "python3";
  }
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const processHandle = spawn(command, args, { stdio: "inherit" });
    processHandle.on("error", reject);
    processHandle.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with status ${code}`)),
    );
  });
}
