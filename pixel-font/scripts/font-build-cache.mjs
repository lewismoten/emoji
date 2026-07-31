import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const buildStateFile = ".font-build-state.json";

export async function getFontBuildFingerprint({ root, workspace }) {
  const inputs = [
    path.join(workspace, "config.json"),
    path.join(workspace, "requirements.txt"),
    path.join(workspace, "atlases"),
    path.join(workspace, "scripts"),
    path.join(root, "tests", "pixel-font", "font-sequences.test.py"),
    path.join(root, "src", "data", "versions"),
    path.join(root, "src", "data", "proposed"),
  ];
  const files = (
    await Promise.all(inputs.map((input) => listFiles(input)))
  ).flat();
  const hash = createHash("sha256");
  for (const file of files.sort()) {
    hash.update(path.relative(root, file));
    hash.update("\0");
    hash.update(await fs.readFile(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export async function canReuseFontBuild({
  buildDirectory,
  fingerprint,
  fontsOnly,
  optimize,
}) {
  try {
    const state = JSON.parse(
      await fs.readFile(path.join(buildDirectory, buildStateFile), "utf8"),
    );
    if (state.fingerprint !== fingerprint) return false;
    if (!fontsOnly && state.mode !== "full") return false;
    if (Boolean(state.optimize) !== Boolean(optimize)) return false;
    const requiredFiles = [
      "manifest.json",
      "explorer-manifest.json",
      "editor-manifest.json",
      "font/pixel-emoji.css",
      "font/pixel-emoji.ttf",
      "font/pixel-emoji.woff",
      "font/pixel-emoji.woff2",
    ];
    if (!fontsOnly) {
      requiredFiles.push("index.html", "atlases.html", "png", "svg");
    }
    await Promise.all(
      requiredFiles.map((file) => fs.access(path.join(buildDirectory, file))),
    );
    return true;
  } catch {
    return false;
  }
}

export async function writeFontBuildState({
  buildDirectory,
  fingerprint,
  fontsOnly,
  optimize,
}) {
  await fs.writeFile(
    path.join(buildDirectory, buildStateFile),
    `${JSON.stringify({
      fingerprint,
      mode: fontsOnly ? "fonts-only" : "full",
      optimize: Boolean(optimize),
    })}\n`,
  );
}

async function listFiles(input) {
  const details = await fs.stat(input);
  if (details.isFile()) return [input];
  const entries = await fs.readdir(input, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => listFiles(path.join(input, entry.name))),
  );
  return files.flat();
}
