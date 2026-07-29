import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import {
  BITMAP_FONT_5X7,
  BITMAP_FONT_5X7_CHARACTERS,
} from "../retro-text-bitmap.mjs";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(workspace, "retro-text");
const manifestFile = path.join(sourceDirectory, "manifest.json");
const pageFile = path.join(sourceDirectory, "latin-1.json");
const sourceFile = path.join(sourceDirectory, "latin-1-source.json");

const rows = Array.from({ length: 16 }, () => Array(16).fill(null));
for (let codePoint = 0; codePoint <= 0xff; codePoint += 1) {
  const character = String.fromCodePoint(codePoint);
  if (!BITMAP_FONT_5X7[character]) continue;
  rows[Math.floor(codePoint / 16)][codePoint % 16] = character;
}

const glyphs = BITMAP_FONT_5X7_CHARACTERS.filter(
  (character) => character.codePointAt(0) <= 0xff,
).map((character) => ({
  bitmap: BITMAP_FONT_5X7[character],
  character,
  codePoint: character.codePointAt(0),
}));

const manifest = {
  familyName: "Pixel Latin Retro",
  styleName: "Regular",
  fontVersion: "1.0.0",
  copyright: "Copyright (c) 2026, Lewis Moten",
  designer: "Lewis Moten",
  url: "https://lewismoten.com",
  pixelSize: 128,
  advanceWidth: 768,
  lineGap: 128,
  glyphBox: { width: 5, height: 7 },
  samplePhrase:
    "A fuzzy wizard quietly vexes Jack by throwing six emoji pompoms.",
  sampleScale: 4,
  sampleWrap: 28,
  pages: [
    {
      id: "latin-1",
      image: "latin-1.png",
      map: "latin-1.json",
      label: "Latin-1",
      cellSize: 16,
      glyphBox: { x: 5, y: 4, width: 5, height: 7 },
      rangeStart: 0,
      rangeEnd: 255,
    },
  ],
};

await fs.mkdir(sourceDirectory, { recursive: true });
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(
  pageFile,
  `${JSON.stringify(
    {
      id: "latin-1",
      label: "Latin-1",
      rangeStart: 0,
      rangeEnd: 255,
      rows,
    },
    null,
    2,
  )}\n`,
);
await fs.writeFile(sourceFile, `${JSON.stringify({ glyphs }, null, 2)}\n`);

const atlasPython = await pythonCommand(["PIL"]);

await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "render-pages",
  manifestFile,
  sourceFile,
]);
await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "render-sample",
  manifestFile,
  sourceFile,
  path.join(sourceDirectory, "example-phrase.png"),
]);

await fs.rm(sourceFile, { force: true });
console.info(`Bootstrapped retro text source assets in ${sourceDirectory}.`);

async function pythonCommand(requiredModules = []) {
  const virtualEnvironmentPython =
    process.platform === "win32"
      ? path.join(workspace, ".venv", "Scripts", "python.exe")
      : path.join(workspace, ".venv", "bin", "python");
  try {
    await fs.access(virtualEnvironmentPython);
    if (await supportsModules(virtualEnvironmentPython, requiredModules))
      return virtualEnvironmentPython;
  } catch {
    // Fall through to the system interpreter.
  }
  const systemPython = process.platform === "win32" ? "python" : "python3";
  if (await supportsModules(systemPython, requiredModules)) return systemPython;
  throw new Error(
    `Unable to find a Python interpreter with: ${requiredModules.join(", ") || "no extra modules"}`,
  );
}

function supportsModules(command, modules) {
  return new Promise((resolve) => {
    const script = modules.length
      ? modules.map((moduleName) => `import ${moduleName}`).join("; ")
      : "pass";
    const handle = spawn(command, ["-c", script], { stdio: "ignore" });
    handle.on("error", () => resolve(false));
    handle.on("close", (code) => resolve(code === 0));
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const handle = spawn(command, args, { stdio: "inherit" });
    handle.on("error", reject);
    handle.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with status ${code}`)),
    );
  });
}
