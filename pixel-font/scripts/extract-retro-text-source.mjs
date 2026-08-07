import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { writeRetroTextBitmapModule } from "./retro-text-module.mjs";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const sourceDirectory = path.join(workspace, "retro-text");
const outputDirectory = path.join(workspace, "build-retro-text");
const sourceManifestFile = path.join(sourceDirectory, "manifest.json");
const extractedSourceFile = path.join(outputDirectory, "retro-text-source.json");
const bitmapModuleFile = path.join(workspace, "retro-text-bitmap.mjs");

await fs.mkdir(outputDirectory, { recursive: true });

const atlasPython = await pythonCommand(["PIL"]);
await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "extract",
  sourceManifestFile,
  extractedSourceFile,
]);

const source = JSON.parse(await fs.readFile(extractedSourceFile, "utf8"));
await writeRetroTextBitmapModule(
  source.glyphs,
  bitmapModuleFile,
  "pixel-font/retro-text/manifest.json and atlas PNG pages",
);

console.info(
  `Extracted ${source.glyphs.length.toLocaleString()} retro text glyphs from atlas PNG pages.\n` +
    `  - ${extractedSourceFile}\n` +
    `  - ${bitmapModuleFile}`,
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
