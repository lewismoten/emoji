import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const {
  coverageSummaryEndMarker,
  coverageSummaryStartMarker,
  renderCoverageReleaseSummary,
  updateCoverageReleaseDocument,
} = await import(
  pathToFileURL(
    path.join(root, "pixel-font/scripts/build-assets/coverage-release-doc.mjs"),
  ).href
);

const buildManifest = {
  releasedCoverage: [
    {
      version: "16.0",
      trackedGlyphCount: 8,
      paintedGlyphCount: 8,
      coverage: 100,
      complete: true,
    },
    {
      version: "17.0",
      trackedGlyphCount: 163,
      paintedGlyphCount: 120,
      coverage: 73.6,
      complete: false,
    },
  ],
  proposedCoverage: [
    {
      version: "18.0",
      stage: "beta",
      status: "draft",
      trackedGlyphCount: 19,
      paintedGlyphCount: 19,
      coverage: 100,
      complete: true,
    },
  ],
};

const rendered = renderCoverageReleaseSummary(buildManifest);
assert.match(rendered, /^<!-- coverage-summary:start -->\n\n- /);
assert.match(rendered, /Emoji 16\.0/);
assert.match(rendered, /Emoji 18\.0 beta draft/);
assert.match(
  rendered,
  /\| Emoji release\s+\| Painted entries \| Tracked entries \|\s+Coverage \|/,
);
assert.match(rendered, /\| \*\*16\.0\*\*\s+\|/);
assert.match(rendered, /\| 17\.0\s+\|/);
assert.match(
  rendered,
  /\| \*\*Total\*\*\s+\|\s+\*\*147\*\*\s+\|\s+\*\*190\*\*\s+\|\s+\*\*77\.4%\*\* \|/,
);
assert.match(
  rendered,
  /\| \*\*Total\*\*\s+\|\s+\*\*147\*\*\s+\|\s+\*\*190\*\*\s+\|\s+\*\*77\.4%\*\* \|\n\n<!-- coverage-summary:end -->$/,
);

const workspace = await fs.mkdtemp(
  path.join(os.tmpdir(), "coverage-release-doc-"),
);
await fs.writeFile(
  path.join(workspace, "COVERAGE_AND_RELEASES.md"),
  [
    "# Coverage and releases",
    "",
    "before",
    coverageSummaryStartMarker,
    "old",
    coverageSummaryEndMarker,
    "after",
    "",
  ].join("\n"),
  "utf8",
);
await updateCoverageReleaseDocument({ workspace, buildManifest });
const updated = await fs.readFile(
  path.join(workspace, "COVERAGE_AND_RELEASES.md"),
  "utf8",
);

assert.match(updated, /^# Coverage and releases/m);
assert.match(updated, /before/);
assert.match(updated, /after/);
assert.match(updated, /Emoji 18\.0 beta draft/);
assert.match(
  updated,
  /\| \*\*Total\*\*\s+\|\s+\*\*147\*\*\s+\|\s+\*\*190\*\*\s+\|\s+\*\*77\.4%\*\* \|/,
);
assert.doesNotMatch(updated, /\nold\n/);

const missingMarkersWorkspace = await fs.mkdtemp(
  path.join(os.tmpdir(), "coverage-release-doc-missing-"),
);
await fs.writeFile(
  path.join(missingMarkersWorkspace, "COVERAGE_AND_RELEASES.md"),
  "# Coverage and releases\n\nNo markers here.\n",
  "utf8",
);
await assert.rejects(
  updateCoverageReleaseDocument({
    workspace: missingMarkersWorkspace,
    buildManifest,
  }),
  /Coverage summary markers are missing/,
);
