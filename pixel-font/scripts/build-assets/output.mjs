import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

export async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeFontStylesheet(context, proposedGlyphs) {
  const fontFiles = ["pixel-emoji.woff2", "pixel-emoji.woff"];
  const releasedRevision = await hashFontFiles(
    context.fontDirectory,
    fontFiles,
  );
  const releasedFamily = `Pixel Emoji ${releasedRevision}`;
  const proposed = await createProposedFontRule(
    context,
    proposedGlyphs,
    fontFiles,
  );
  await fs.writeFile(
    path.join(context.fontDirectory, "pixel-emoji.css"),
    `:root {\n  --pixel-emoji-released-family: "${releasedFamily}";\n${proposed.property}}\n\n${proposed.rule}@font-face {\n  font-family: "${releasedFamily}";\n  src:\n    url("./pixel-emoji.woff2?v=${releasedRevision}") format("woff2"),\n    url("./pixel-emoji.woff?v=${releasedRevision}") format("woff");\n  font-display: swap;\n}\n`,
  );
}

export async function compileFonts(context, proposedGlyphs) {
  const python = await pythonCommand(context.workspace);
  await run(python, [
    path.join(context.root, "tests", "font-sequences.test.py"),
  ]);
  await runCompileFont(
    python,
    context,
    "font-source.json",
    context.fontDirectory,
  );
  if (proposedGlyphs.length > 0) {
    await runCompileFont(
      python,
      context,
      "proposed-font-source.json",
      context.proposedFontDirectory,
    );
  }
}

async function runCompileFont(python, context, sourceFile, outputDirectory) {
  await run(python, [
    path.join(context.workspace, "scripts", "compile-font.py"),
    path.join(context.buildDirectory, sourceFile),
    outputDirectory,
    ...(context.optimize ? ["--optimize"] : []),
  ]);
}

async function createProposedFontRule(context, proposedGlyphs, fontFiles) {
  if (proposedGlyphs.length === 0) return { property: "", rule: "" };
  const proposedValue = await hashFontFiles(
    context.proposedFontDirectory,
    fontFiles,
  );
  const proposedFamily = `Pixel Emoji Proposed ${proposedValue}`;
  return {
    property: `  --pixel-emoji-proposed-family: "${proposedFamily}";\n`,
    rule: `@font-face {\n  font-family: "${proposedFamily}";\n  src:\n    url("./proposed/pixel-emoji.woff2?v=${proposedValue}") format("woff2"),\n    url("./proposed/pixel-emoji.woff?v=${proposedValue}") format("woff");\n  font-display: swap;\n}\n\n`,
  };
}

async function hashFontFiles(directory, fontFiles) {
  const revision = createHash("sha256");
  for (const file of fontFiles) {
    revision.update(await fs.readFile(path.join(directory, file)));
  }
  return revision.digest("hex").slice(0, 12);
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with status ${code}`)),
    );
  });
}

async function pythonCommand(workspace) {
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
