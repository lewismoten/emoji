export const coverageSummaryStartMarker: string;
export const coverageSummaryEndMarker: string;

export function renderCoverageReleaseSummary(
  buildManifest: Record<string, unknown>,
): string;

export function updateCoverageReleaseDocument(options: {
  workspace: string;
  buildManifest: Record<string, unknown>;
}): Promise<void>;
