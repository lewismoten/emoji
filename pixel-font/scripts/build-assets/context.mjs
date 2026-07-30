import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canReuseFontBuild,
  getFontBuildFingerprint,
} from "../font-build-cache.mjs";

export async function loadBuildContext(argv = process.argv) {
  const workspace = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const root = path.resolve(workspace, "..");
  const atlasDirectory = path.join(workspace, "atlases");
  const buildDirectory = path.join(workspace, "build");
  const pngDirectory = path.join(buildDirectory, "png");
  const svgDirectory = path.join(buildDirectory, "svg");
  const fontDirectory = path.join(buildDirectory, "font");
  const proposedFontDirectory = path.join(fontDirectory, "proposed");
  const fontsOnly = argv.includes("--fonts-only");
  const optimize = argv.includes("--optimize");
  const buildFingerprint = await getFontBuildFingerprint({ root, workspace });
  const config = JSON.parse(
    await fs.readFile(path.join(workspace, "config.json"), "utf8"),
  );
  const atlasManifest = JSON.parse(
    await fs.readFile(path.join(atlasDirectory, "manifest.json"), "utf8"),
  );
  const versionManifest = JSON.parse(
    await fs.readFile(
      path.join(root, "src", "data", "versions", "manifest.json"),
      "utf8",
    ),
  );

  return {
    atlasDirectory,
    atlasManifest,
    buildDirectory,
    buildFingerprint,
    config,
    fontDirectory,
    fontsOnly,
    optimize,
    pngDirectory,
    proposedFontDirectory,
    root,
    svgDirectory,
    versionManifest,
    workspace,
  };
}

export async function canSkipBuild(context) {
  return canReuseFontBuild({
    buildDirectory: context.buildDirectory,
    fingerprint: context.buildFingerprint,
    fontsOnly: context.fontsOnly,
    optimize: context.optimize,
  });
}

export async function prepareBuildDirectories(context) {
  await fs.rm(context.buildDirectory, { recursive: true, force: true });
  await Promise.all([
    ...(!context.fontsOnly
      ? [
          fs.mkdir(context.pngDirectory, { recursive: true }),
          fs.mkdir(context.svgDirectory, { recursive: true }),
        ]
      : []),
    fs.mkdir(context.fontDirectory, { recursive: true }),
    fs.mkdir(context.proposedFontDirectory, { recursive: true }),
  ]);
}
