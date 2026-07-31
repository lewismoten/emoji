import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { writeRetroTextBitmapModule } from "./retro-text-module.mjs";
import { updateRetroTextDoc } from "./update-retro-text-doc.mjs";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outputDirectory = path.join(workspace, "build-retro-text");
const sourceDirectory = path.join(workspace, "retro-text");
const sourceManifestFile = path.join(sourceDirectory, "manifest.json");
const sourceFile = path.join(outputDirectory, "retro-text-source.json");
const manifestFile = path.join(outputDirectory, "manifest.json");
const bitmapModuleFile = path.join(workspace, "retro-text-bitmap.mjs");
const outputFiles = [
  path.join(outputDirectory, "pixel-latin-retro.ttf"),
  path.join(outputDirectory, "pixel-latin-retro.woff"),
  path.join(outputDirectory, "pixel-latin-retro.woff2"),
  path.join(outputDirectory, "pixel-latin-retro.css"),
  manifestFile,
];

await fs.rm(outputDirectory, { recursive: true, force: true });
await fs.mkdir(outputDirectory, { recursive: true });

await run(process.execPath, [
  path.join(workspace, "scripts", "bootstrap-retro-text-source.mjs"),
]);

const atlasPython = await pythonCommand(["PIL"]);
const fontPython = await pythonCommand(["fontTools", "brotli"]);

await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "extract",
  sourceManifestFile,
  sourceFile,
]);

const source = JSON.parse(await fs.readFile(sourceFile, "utf8"));
await writeRetroTextBitmapModule(
  source.glyphs,
  bitmapModuleFile,
  "pixel-font/retro-text/manifest.json and atlas PNG pages",
);
await run(fontPython, [
  path.join(workspace, "scripts", "compile-retro-text-font.py"),
  sourceFile,
  outputDirectory,
]);
await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "render-sample",
  sourceManifestFile,
  sourceFile,
  path.join(sourceDirectory, "example-phrase.png"),
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
      glyphCount: source.glyphs.length,
      characterSet: ["Basic Latin", "Latin-1 Supplement"],
      files: [
        "pixel-latin-retro.ttf",
        "pixel-latin-retro.woff",
        "pixel-latin-retro.woff2",
        "pixel-latin-retro.css",
      ],
      sourceAssets: [
        "../retro-text/manifest.json",
        "../retro-text/latin-1.json",
        "../retro-text/latin-1.png",
        "../retro-text/extended-latin-and-symbols.json",
        "../retro-text/extended-latin-and-symbols.png",
        "../retro-text/example-phrase.png",
      ],
    },
    null,
    2,
  )}\n`,
);

const fileStats = await Promise.all(
  outputFiles.map(async (file) => ({
    file: path.basename(file),
    size: (await fs.stat(file)).st_size,
  })),
);
await updateRetroTextDoc({
  workspace,
  glyphCount: source.glyphs.length,
  fileStats,
});

await fs.rm(sourceFile, { force: true });
console.info(
  `Built ${source.familyName} with ${source.glyphs.length.toLocaleString()} glyphs.\n` +
    `Output directory: ${outputDirectory}\n` +
    outputFiles.map((file) => `  - ${file}`).join("\n"),
);

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
    const processHandle = spawn(command, ["-c", script], {
      stdio: "ignore",
    });
    processHandle.on("error", () => resolve(false));
    processHandle.on("close", (code) => resolve(code === 0));
  });
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
