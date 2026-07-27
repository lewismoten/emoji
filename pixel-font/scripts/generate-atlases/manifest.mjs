import path from "node:path";

import { slug, writeJson } from "./generate-atlases-helpers.mjs";

export async function writeBucketAtlases(options) {
  const {
    atlasDirectory,
    bucket,
    config,
    eligibleByKey,
    imageWidth,
    previousAssignments,
    sheetCapacity,
  } = options;
  const { assignBucket } = options;
  const assignments = assignBucket(bucket, previousAssignments);
  const partCount = Math.max(
    1,
    Math.ceil((assignments.at(-1)?.globalIndex + 1 || 0) / sheetCapacity),
  );
  const sheets = [];

  for (let part = 0; part < partCount; part += 1) {
    const partAssignments = assignments.filter(
      (assignment) =>
        Math.floor(assignment.globalIndex / sheetCapacity) === part,
    );
    if (partAssignments.length === 0) continue;
    const sidecar = createSidecar({
      assignments: partAssignments,
      atlasDirectory,
      bucket,
      config,
      eligibleByKey,
      imageWidth,
      part,
      partCount,
      sheetCapacity,
    });
    await writeJson(path.join(atlasDirectory, `${sidecar.id}.json`), sidecar);
    sheets.push(createSheetManifest(sidecar));
  }

  return sheets;
}

function createSidecar(options) {
  const {
    assignments,
    bucket,
    config,
    eligibleByKey,
    imageWidth,
    part,
    partCount,
    sheetCapacity,
  } = options;
  const rows = Math.ceil(
    (Math.max(
      ...assignments.map(
        (assignment) => assignment.globalIndex % sheetCapacity,
      ),
    ) +
      1) /
      config.columns,
  );
  const id = createAtlasId(bucket, part, partCount);
  const image = `${id}.png`;
  const imageHeight =
    config.headerHeight +
    rows * (config.cellSize + config.cellPadding * 2) +
    config.footerHeight;
  const entries = assignments.map((assignment) =>
    createEntry({
      assignment,
      bucket,
      config,
      eligibleByKey,
      sheetCapacity,
    }),
  );

  return {
    schemaVersion: config.schemaVersion,
    id,
    image,
    modifierType: bucket.modifierType,
    ...(bucket.releaseStatus === "proposed"
      ? {
          releaseStatus: "proposed",
          unicodeVersion: bucket.unicodeVersion,
          proposalStage: bucket.proposalStage ?? "draft",
          expectedRelease: bucket.expectedRelease,
        }
      : {}),
    group: bucket.group,
    subGroup: bucket.subGroup,
    part: part + 1,
    partCount,
    rows,
    imageWidth,
    imageHeight,
    entries,
  };
}

function createAtlasId(bucket, part, partCount) {
  const groupSlug = slug(bucket.group);
  const subGroupSlug = slug(bucket.subGroup);
  const suffix = partCount > 1 ? `-${String(part + 1).padStart(2, "0")}` : "";
  const releasePrefix =
    bucket.releaseStatus === "proposed"
      ? `proposed/${bucket.unicodeVersion}/`
      : "";
  const modifierPrefix =
    bucket.modifierType === "base" ? "" : `modifiers/${bucket.modifierType}/`;
  return `${releasePrefix}${modifierPrefix}${groupSlug}/${subGroupSlug}${suffix}`;
}

function createEntry(options) {
  const { assignment, config, eligibleByKey, sheetCapacity } = options;
  const item = eligibleByKey.get(assignment.key);
  const index = assignment.globalIndex % sheetCapacity;
  const row = Math.floor(index / config.columns);
  const column = index % config.columns;
  const previous = assignment.previous ?? {};
  return {
    index,
    row,
    column,
    x:
      config.outerPadding +
      column * (config.cellSize + config.cellPadding * 2) +
      config.cellPadding,
    y:
      config.headerHeight +
      row * (config.cellSize + config.cellPadding * 2) +
      config.cellPadding,
    width: config.cellSize,
    height: config.cellSize,
    key: assignment.key,
    name: item?.shortName ?? previous.name ?? assignment.key,
    emoji: item?.emoji ?? previous.emoji ?? "",
    codePoints: item?.codePoints.split(/\s+/) ?? previous.codePoints ?? [],
    order: item?.order ?? previous.order ?? null,
    sequenceType: item?.sequenceType ?? previous.sequenceType ?? "",
    active: Boolean(item),
  };
}

function createSheetManifest(sidecar) {
  return {
    id: sidecar.id,
    image: sidecar.image,
    modifierType: sidecar.modifierType,
    ...(sidecar.releaseStatus === "proposed"
      ? {
          releaseStatus: "proposed",
          unicodeVersion: sidecar.unicodeVersion,
        }
      : {}),
    group: sidecar.group,
    subGroup: sidecar.subGroup,
    part: sidecar.part,
    partCount: sidecar.partCount,
    rows: sidecar.rows,
    imageWidth: sidecar.imageWidth,
    imageHeight: sidecar.imageHeight,
    activeCount: sidecar.entries.filter((entry) => entry.active).length,
    assignedCount: sidecar.entries.length,
  };
}
