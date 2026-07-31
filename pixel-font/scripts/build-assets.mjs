import fs from "node:fs/promises";
import path from "node:path";

import { writeFontBuildState } from "./font-build-cache.mjs";
import { analyzeColorMasks } from "./build-assets/analysis.mjs";
import {
  canSkipBuild,
  loadBuildContext,
  prepareBuildDirectories,
} from "./build-assets/context.mjs";
import {
  collectGlyphArtifacts,
  countBySequenceType,
  coverageEntry,
  normalizedCodePoints,
} from "./build-assets/glyphs.mjs";
import {
  compileFonts,
  writeFontStylesheet,
  writeJson,
} from "./build-assets/output.mjs";
import {
  renderAtlasGallery,
  renderAtlasMarkdown,
  renderPreview,
} from "./build-assets/renderers.mjs";
import { updateCoverageReleaseDocument } from "./build-assets/coverage-release-doc.mjs";

const context = await loadBuildContext(process.argv);
const releasedFontDirectory = path.join(context.buildDirectory, "font");
const proposedFontDirectory = path.join(releasedFontDirectory, "proposed");
const releasedFontFiles = [
  path.join(releasedFontDirectory, "pixel-emoji.css"),
  path.join(releasedFontDirectory, "pixel-emoji.ttf"),
  path.join(releasedFontDirectory, "pixel-emoji.woff"),
  path.join(releasedFontDirectory, "pixel-emoji.woff2"),
];
const proposedFontFiles = [
  path.join(proposedFontDirectory, "pixel-emoji.ttf"),
  path.join(proposedFontDirectory, "pixel-emoji.woff"),
  path.join(proposedFontDirectory, "pixel-emoji.woff2"),
];
if (await canSkipBuild(context)) {
  console.log(
    `Pixel font sources are unchanged; reused existing ${context.fontsOnly ? "font-only" : "full"} ${context.optimize ? "optimized " : ""}build.\n` +
      `Released fonts: ${releasedFontDirectory}\n` +
      releasedFontFiles.map((file) => `  - ${file}`).join("\n"),
  );
  process.exit(0);
}
await prepareBuildDirectories(context);
const { editorGlyphs, glyphs, manifest, paintedAtlasSheets } =
  await collectGlyphArtifacts(context);
const componentAnalysis = analyzeColorMasks(glyphs, context.optimize);
const releasedGlyphs = glyphs.filter(
  (glyph) => glyph.releaseStatus !== "proposed",
);
const proposedGlyphs = glyphs.filter(
  (glyph) => glyph.releaseStatus === "proposed",
);
const proposedSequenceCodePoints = new Set(
  proposedGlyphs
    .filter((glyph) => normalizedCodePoints(glyph).length > 1)
    .flatMap(normalizedCodePoints),
);
const proposedSupportGlyphs = releasedGlyphs.filter((glyph) => {
  const codePoints = normalizedCodePoints(glyph);
  return (
    codePoints.length === 1 && proposedSequenceCodePoints.has(codePoints[0])
  );
});
const proposedFontGlyphs = [...proposedSupportGlyphs, ...proposedGlyphs];
const releasedPaintedKeys = new Set(releasedGlyphs.map((glyph) => glyph.key));
const proposedPaintedKeys = new Set(proposedGlyphs.map((glyph) => glyph.key));
const releasedCoverage = await Promise.all(
  context.versionManifest.versions.map(async (version) => {
    const keys = JSON.parse(
      await fs.readFile(
        path.join(context.root, "src", "data", "versions", version.file),
        "utf8",
      ),
    );
    return coverageEntry(version, keys, releasedPaintedKeys);
  }),
);
const proposedCoverage = await Promise.all(
  (context.versionManifest.proposed ?? []).map(async (version) => {
    const proposal = JSON.parse(
      await fs.readFile(
        path.join(context.root, "src", "data", version.file),
        "utf8",
      ),
    );
    return coverageEntry(
      version,
      (proposal.emoji ?? []).map((emoji) => emoji.key),
      proposedPaintedKeys,
    );
  }),
);
const buildManifest = {
  schemaVersion: 1,
  familyName: manifest.familyName,
  fontVersion: manifest.fontVersion,
  packageName: manifest.packageName,
  author: manifest.author,
  url: manifest.url,
  copyright: manifest.copyright,
  license: manifest.license,
  licenseUrl: manifest.licenseUrl,
  embeddingPermissions: manifest.embeddingPermissions,
  releasedCoverage,
  proposedCoverage,
  cellSize: manifest.cellSize,
  glyphCount: glyphs.length,
  releasedGlyphCount: releasedGlyphs.length,
  proposedGlyphCount: proposedGlyphs.length,
  proposedVersions: manifest.proposedVersions ?? [],
  silhouetteGlyphCount: glyphs.filter(
    (glyph) => glyph.rendering === "silhouette",
  ).length,
  sequenceGlyphCount: glyphs.filter((glyph) => glyph.sequenceType !== "single")
    .length,
  sequenceTypeCounts: countBySequenceType(glyphs),
  componentOptimization: componentAnalysis,
  fontSets: {
    released: {
      familyName: manifest.familyName,
      glyphCount: releasedGlyphs.length,
      files: {
        css: "font/pixel-emoji.css",
        ttf: "font/pixel-emoji.ttf",
        woff: "font/pixel-emoji.woff",
        woff2: "font/pixel-emoji.woff2",
      },
    },
    proposed: {
      familyName: `${manifest.familyName} Proposed`,
      glyphCount: proposedGlyphs.length,
      supportGlyphCount: proposedSupportGlyphs.length,
      versions: [
        ...new Set(
          proposedGlyphs.map((glyph) => glyph.unicodeVersion).filter(Boolean),
        ),
      ],
      files:
        proposedGlyphs.length > 0
          ? {
              ttf: "font/proposed/pixel-emoji.ttf",
              woff: "font/proposed/pixel-emoji.woff",
              woff2: "font/proposed/pixel-emoji.woff2",
            }
          : null,
    },
  },
  glyphs: glyphs.map(({ pixels, ...glyph }) => glyph),
};
if (Object.keys(editorGlyphs).length !== manifest.activeGlyphCount) {
  throw new Error(
    "Pixel editor manifest does not cover every active atlas assignment",
  );
}
await writeJson(
  path.join(context.buildDirectory, "manifest.json"),
  buildManifest,
);
await fs.writeFile(
  path.join(context.buildDirectory, "explorer-manifest.json"),
  `${JSON.stringify({
    schemaVersion: 1,
    fields: ["key", "privateUseCodePoint", "releaseStatus"],
    glyphs: buildManifest.glyphs.map((glyph) => [
      glyph.key,
      glyph.privateUseCodePoint,
      glyph.releaseStatus,
    ]),
  })}\n`,
  "utf8",
);
await writeJson(path.join(context.buildDirectory, "editor-manifest.json"), {
  schemaVersion: 1,
  setName: manifest.setName,
  author: manifest.author,
  url: manifest.url,
  createdDate: manifest.createdDate,
  cellSize: manifest.cellSize,
  cellPadding: manifest.cellPadding,
  outerPadding: manifest.outerPadding,
  headerHeight: manifest.headerHeight,
  footerHeight: manifest.footerHeight,
  glyphCount: Object.keys(editorGlyphs).length,
  glyphs: editorGlyphs,
});
await writeJson(path.join(context.buildDirectory, "font-source.json"), {
  familyName: manifest.familyName,
  fontVersion: manifest.fontVersion,
  author: manifest.author,
  url: manifest.url,
  copyright: manifest.copyright,
  license: manifest.license,
  licenseUrl: manifest.licenseUrl,
  embeddingPermissions: manifest.embeddingPermissions,
  cellSize: manifest.cellSize,
  glyphs: releasedGlyphs,
});
if (proposedGlyphs.length > 0) {
  await writeJson(
    path.join(context.buildDirectory, "proposed-font-source.json"),
    {
      familyName: `${manifest.familyName} Proposed`,
      fontVersion: manifest.fontVersion,
      author: manifest.author,
      url: manifest.url,
      copyright: manifest.copyright,
      license: manifest.license,
      licenseUrl: manifest.licenseUrl,
      embeddingPermissions: manifest.embeddingPermissions,
      cellSize: manifest.cellSize,
      glyphs: proposedFontGlyphs,
    },
  );
}

await compileFonts(context, proposedGlyphs);
await writeFontStylesheet(context, proposedGlyphs);
await Promise.all([
  fs.rm(path.join(context.buildDirectory, "font-source.json"), { force: true }),
  fs.rm(path.join(context.buildDirectory, "proposed-font-source.json"), {
    force: true,
  }),
]);
await fs.writeFile(
  path.join(context.buildDirectory, "index.html"),
  renderPreview(buildManifest),
);
await fs.writeFile(
  path.join(context.buildDirectory, "atlases.html"),
  renderAtlasGallery(manifest, paintedAtlasSheets),
);
await fs.writeFile(
  path.join(context.workspace, "ATLASES.md"),
  renderAtlasMarkdown(manifest, paintedAtlasSheets),
);
await updateCoverageReleaseDocument({
  workspace: context.workspace,
  buildManifest,
});
await fs.writeFile(
  path.join(context.workspace, "font-build.revision"),
  `${Date.now()}\n`,
);
await writeFontBuildState({
  buildDirectory: context.buildDirectory,
  fingerprint: context.buildFingerprint,
  fontsOnly: context.fontsOnly,
  optimize: context.optimize,
});

console.log(
  `Built ${glyphs.length.toLocaleString()} painted glyph${glyphs.length === 1 ? "" : "s"}${context.fontsOnly ? " in fonts-only mode" : ""} ` +
    `${context.optimize ? "with optimization " : "without optimization "}from ${manifest.sheets.length} atlases.\n` +
    `Released fonts: ${releasedFontDirectory}\n` +
    releasedFontFiles.map((file) => `  - ${file}`).join("\n") +
    (proposedGlyphs.length > 0
      ? `\nProposed fonts: ${proposedFontDirectory}\n` +
        proposedFontFiles.map((file) => `  - ${file}`).join("\n")
      : ""),
);
