import fs from "node:fs/promises";
import path from "node:path";

export const coverageSummaryStartMarker = "<!-- coverage-summary:start -->";
export const coverageSummaryEndMarker = "<!-- coverage-summary:end -->";

export function renderCoverageReleaseSummary(buildManifest) {
  const released = buildManifest.releasedCoverage ?? [];
  const proposed = buildManifest.proposedCoverage ?? [];
  const entries = [...released, ...proposed];
  const completeEntries = [...released, ...proposed].filter(
    (entry) => entry.complete,
  );
  const bullets =
    completeEntries.length > 0
      ? completeEntries
          .map((entry) => `- ${renderCompleteCoverageBullet(entry)}`)
          .join("\n")
      : "- No Unicode releases have complete painted coverage yet.";
  const table = [
    "| Emoji release | Painted entries | Tracked entries | Coverage |",
    "| ------------- | --------------: | --------------: | -------: |",
    ...entries.map(renderCoverageRow),
    renderCoverageTotalRow(entries),
  ].join("\n");
  return [
    coverageSummaryStartMarker,
    bullets,
    "",
    "“Complete” refers to the entries introduced by those versions, not all",
    "emoji from earlier Unicode versions. Proposed versions remain subject to",
    "Unicode draft changes until their final release.",
    "",
    table,
    coverageSummaryEndMarker,
  ].join("\n");
}

export async function updateCoverageReleaseDocument(options) {
  const file = path.join(options.workspace, "COVERAGE_AND_RELEASES.md");
  const current = await fs.readFile(file, "utf8");
  const start = current.indexOf(coverageSummaryStartMarker);
  const end = current.indexOf(coverageSummaryEndMarker);
  if (start < 0 || end < 0 || end < start) {
    throw new Error("Coverage summary markers are missing from COVERAGE_AND_RELEASES.md");
  }
  const replacement = renderCoverageReleaseSummary(options.buildManifest);
  const updated =
    current.slice(0, start) +
    replacement +
    current.slice(end + coverageSummaryEndMarker.length);
  if (updated !== current) await fs.writeFile(file, updated, "utf8");
}

function renderCompleteCoverageBullet(entry) {
  const tracked = Number(entry.trackedGlyphCount ?? 0).toLocaleString();
  if (entry.status || entry.stage) {
    return `**Emoji ${renderReleaseLabel(entry)}:** complete coverage of all ${tracked} currently tracked entries`;
  }
  return `**Emoji ${entry.version}:** complete coverage of all ${tracked} entries introduced by the released version`;
}

function renderCoverageRow(entry) {
  const label = entry.complete ? `**${renderReleaseLabel(entry)}**` : renderReleaseLabel(entry);
  const painted = formatCell(entry.paintedGlyphCount, entry.complete);
  const tracked = formatCell(entry.trackedGlyphCount, entry.complete);
  const coverage = formatCell(formatPercent(entry.coverage), entry.complete);
  return `| ${label} | ${painted} | ${tracked} | ${coverage} |`;
}

function renderCoverageTotalRow(entries) {
  const paintedTotal = entries.reduce(
    (sum, entry) => sum + Number(entry.paintedGlyphCount ?? 0),
    0,
  );
  const trackedTotal = entries.reduce(
    (sum, entry) => sum + Number(entry.trackedGlyphCount ?? 0),
    0,
  );
  const coverage =
    trackedTotal === 0 ? 0 : (paintedTotal / trackedTotal) * 100;
  return `| **Total** | **${paintedTotal.toLocaleString()}** | **${trackedTotal.toLocaleString()}** | **${formatPercent(coverage)}** |`;
}

function renderReleaseLabel(entry) {
  const suffix = [entry.stage, entry.status].filter(Boolean).join(" ").trim();
  return suffix ? `${entry.version} ${suffix}` : entry.version;
}

function formatCell(value, emphasize) {
  const rendered =
    typeof value === "number" ? value.toLocaleString() : String(value);
  return emphasize ? `**${rendered}**` : rendered;
}

function formatPercent(value) {
  const amount = Number(value ?? 0);
  if (amount === 0) return "0%";
  return `${amount.toFixed(1).replace(/\\.0$/, "")}%`;
}
