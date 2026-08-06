import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const root = process.cwd();

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

describe("pixel-font/coverage-release-doc", () => {
  it("renders and updates the coverage release summary block", async () => {
    const rendered = renderCoverageReleaseSummary(buildManifest);
    expect(rendered).toMatch(/^<!-- coverage-summary:start -->\n\n- /);
    expect(rendered).toMatch(/Emoji 16\.0/);
    expect(rendered).toMatch(/Emoji 18\.0 beta draft/);
    expect(rendered).toMatch(
      /\| Emoji release\s+\| Painted entries \| Tracked entries \|\s+Coverage \|/,
    );
    expect(rendered).toMatch(/\| \*\*16\.0\*\*\s+\|/);
    expect(rendered).toMatch(/\| 17\.0\s+\|/);
    expect(rendered).toMatch(
      /\| \*\*Total\*\*\s+\|\s+\*\*147\*\*\s+\|\s+\*\*190\*\*\s+\|\s+\*\*77\.4%\*\* \|/,
    );
    expect(rendered).toMatch(
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

    expect(updated).toMatch(/^# Coverage and releases/m);
    expect(updated).toMatch(/before/);
    expect(updated).toMatch(/after/);
    expect(updated).toMatch(/Emoji 18\.0 beta draft/);
    expect(updated).toMatch(
      /\| \*\*Total\*\*\s+\|\s+\*\*147\*\*\s+\|\s+\*\*190\*\*\s+\|\s+\*\*77\.4%\*\* \|/,
    );
    expect(updated).not.toMatch(/\nold\n/);

    const missingMarkersWorkspace = await fs.mkdtemp(
      path.join(os.tmpdir(), "coverage-release-doc-missing-"),
    );
    await fs.writeFile(
      path.join(missingMarkersWorkspace, "COVERAGE_AND_RELEASES.md"),
      "# Coverage and releases\n\nNo markers here.\n",
      "utf8",
    );
    await expect(
      updateCoverageReleaseDocument({
        workspace: missingMarkersWorkspace,
        buildManifest,
      }),
    ).rejects.toThrow(/Coverage summary markers are missing/);
  });
});
