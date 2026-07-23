import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const root = path.resolve(workspace, "..");
const atlasDirectory = path.join(workspace, "atlases");
const config = JSON.parse(
  await fs.readFile(path.join(workspace, "config.json"), "utf8"),
);
const emoji = JSON.parse(
  await fs.readFile(path.join(root, "emoji.json"), "utf8"),
);
const skinToneModifiers = new Set(
  config.skinToneModifierCodePoints.map((point) => point.toUpperCase()),
);
const hairModifiers = new Set(
  config.hairModifierCodePoints.map((point) => point.toUpperCase()),
);
const eligible = emoji.sort(
  (left, right) =>
    left.order - right.order || left.key.localeCompare(right.key),
);
const eligibleByKey = new Map(eligible.map((item) => [item.key, item]));
const sheetCapacity = config.columns * config.maxRows;
const slotSize = config.cellSize + config.cellPadding * 2;
const imageWidth = config.outerPadding * 2 + config.columns * slotSize;

await fs.mkdir(atlasDirectory, { recursive: true });
const previousAssignments = await loadPreviousAssignments();
const buckets = new Map();

for (const item of eligible) {
  const modifierType = getModifierType(item);
  const bucketKey = `${modifierType}\0${item.group}\0${item.subGroup}`;
  if (!buckets.has(bucketKey)) {
    buckets.set(bucketKey, {
      modifierType,
      group: item.group,
      subGroup: item.subGroup,
      items: [],
    });
  }
  buckets.get(bucketKey).items.push(item);
}

const manifestSheets = [];
for (const bucket of [...buckets.values()].sort(compareBuckets)) {
  const assignments = assignBucket(bucket, previousAssignments);
  const partCount = Math.max(
    1,
    Math.ceil((assignments.at(-1)?.globalIndex + 1 || 0) / sheetCapacity),
  );
  for (let part = 0; part < partCount; part += 1) {
    const partAssignments = assignments.filter(
      (assignment) =>
        Math.floor(assignment.globalIndex / sheetCapacity) === part,
    );
    if (partAssignments.length === 0) continue;
    const rows = Math.ceil(
      (Math.max(
        ...partAssignments.map(
          (assignment) => assignment.globalIndex % sheetCapacity,
        ),
      ) +
        1) /
        config.columns,
    );
    const groupSlug = slug(bucket.group);
    const subGroupSlug = slug(bucket.subGroup);
    const suffix = partCount > 1 ? `-${String(part + 1).padStart(2, "0")}` : "";
    const prefix =
      bucket.modifierType === "base" ? "" : `modifiers/${bucket.modifierType}/`;
    const id = `${prefix}${groupSlug}/${subGroupSlug}${suffix}`;
    const image = `${id}.png`;
    const mapping = `${id}.json`;
    const imageHeight =
      config.headerHeight + rows * slotSize + config.footerHeight;
    const entries = partAssignments.map((assignment) => {
      const item = eligibleByKey.get(assignment.key);
      const index = assignment.globalIndex % sheetCapacity;
      const row = Math.floor(index / config.columns);
      const column = index % config.columns;
      const previous = assignment.previous ?? {};
      return {
        index,
        row,
        column,
        x: config.outerPadding + column * slotSize + config.cellPadding,
        y: config.headerHeight + row * slotSize + config.cellPadding,
        width: config.cellSize,
        height: config.cellSize,
        key: assignment.key,
        name: item?.shortName ?? previous.name ?? assignment.key,
        emoji: item?.emoji ?? previous.emoji ?? "",
        codePoints: item?.codePoints.split(/\s+/) ?? previous.codePoints ?? [],
        group: item?.group ?? previous.group ?? bucket.group,
        subGroup: item?.subGroup ?? previous.subGroup ?? bucket.subGroup,
        order: item?.order ?? previous.order ?? null,
        sequenceType: item?.sequenceType ?? previous.sequenceType ?? "",
        modifierType:
          item?.modifierType ?? previous.modifierType ?? bucket.modifierType,
        active: Boolean(item),
      };
    });
    const sidecar = {
      schemaVersion: config.schemaVersion,
      id,
      image,
      setName: config.setName,
      modifierType: bucket.modifierType,
      group: bucket.group,
      subGroup: bucket.subGroup,
      part: part + 1,
      partCount,
      createdDate: config.createdDate,
      author: config.author,
      url: config.url,
      cellSize: config.cellSize,
      cellPadding: config.cellPadding,
      slotSize,
      columns: config.columns,
      rows,
      capacity: config.columns * rows,
      imageWidth,
      imageHeight,
      headerHeight: config.headerHeight,
      footerHeight: config.footerHeight,
      entries,
    };
    await writeJson(path.join(atlasDirectory, mapping), sidecar);

    manifestSheets.push({
      id,
      image,
      mapping,
      modifierType: bucket.modifierType,
      group: bucket.group,
      subGroup: bucket.subGroup,
      part: part + 1,
      partCount,
      rows,
      imageWidth,
      imageHeight,
      activeCount: entries.filter((entry) => entry.active).length,
      assignedCount: entries.length,
      capacity: config.columns * rows,
    });
  }
}

const manifest = {
  schemaVersion: config.schemaVersion,
  familyName: config.familyName,
  setName: config.setName,
  author: config.author,
  url: config.url,
  createdDate: config.createdDate,
  kind: "grouped-subgroups-with-modifier-atlases",
  layout: "grouped-subgroups-v2",
  cellSize: config.cellSize,
  cellPadding: config.cellPadding,
  slotSize,
  columns: config.columns,
  maxRows: config.maxRows,
  outerPadding: config.outerPadding,
  headerHeight: config.headerHeight,
  footerHeight: config.footerHeight,
  activeGlyphCount: eligible.length,
  baseGlyphCount: eligible.filter((item) => getModifierType(item) === "base")
    .length,
  modifierGlyphCount: eligible.filter(
    (item) => getModifierType(item) !== "base",
  ).length,
  modifierTypeCounts: countByModifierType(eligible),
  sequenceGlyphCount: eligible.filter((item) => item.sequenceType !== "single")
    .length,
  sequenceTypeCounts: countBySequenceType(eligible),
  assignedGlyphCount: manifestSheets.reduce(
    (total, sheet) => total + sheet.assignedCount,
    0,
  ),
  groupCount: new Set(eligible.map((item) => item.group)).size,
  subGroupCount: buckets.size,
  sheets: manifestSheets,
};
await writeJson(path.join(atlasDirectory, "manifest.json"), manifest);

console.log(
  `Mapped ${eligible.length.toLocaleString()} emoji into ${manifestSheets.length} ` +
    `subgroup atlas mappings across ${manifest.groupCount} groups.`,
);

async function loadPreviousAssignments() {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(atlasDirectory, "manifest.json"), "utf8"),
    );
    if (
      !["grouped-subgroups-v1", "grouped-subgroups-v2"].includes(
        manifest.layout,
      )
    )
      return new Map();
    const assignments = new Map();
    for (const sheet of manifest.sheets) {
      const sidecar = JSON.parse(
        await fs.readFile(path.join(atlasDirectory, sheet.mapping), "utf8"),
      );
      for (const entry of sidecar.entries ?? []) {
        assignments.set(entry.key, {
          modifierType: sidecar.modifierType ?? "base",
          group: sidecar.group,
          subGroup: sidecar.subGroup,
          globalIndex: (sidecar.part - 1) * sheetCapacity + entry.index,
          previous: entry,
        });
      }
    }
    return assignments;
  } catch {
    return new Map();
  }
}

function assignBucket(bucket, previous) {
  const assignments = new Map();
  const occupied = new Set();
  for (const item of bucket.items) {
    const existing = previous.get(item.key);
    if (
      existing?.modifierType !== bucket.modifierType ||
      existing?.group !== bucket.group ||
      existing?.subGroup !== bucket.subGroup
    )
      continue;
    assignments.set(item.key, {
      key: item.key,
      globalIndex: existing.globalIndex,
      previous: existing.previous,
    });
    occupied.add(existing.globalIndex);
  }
  let nextCell = 0;
  for (const item of bucket.items) {
    if (assignments.has(item.key)) continue;
    while (occupied.has(nextCell)) nextCell += 1;
    assignments.set(item.key, { key: item.key, globalIndex: nextCell });
    occupied.add(nextCell);
  }
  return [...assignments.values()].sort(
    (left, right) => left.globalIndex - right.globalIndex,
  );
}

function compareBuckets(left, right) {
  const typeOrder = ["base", "skin-tone", "hair", "skin-and-hair"];
  const typeDifference =
    typeOrder.indexOf(left.modifierType) -
    typeOrder.indexOf(right.modifierType);
  const leftOrder = Math.min(...left.items.map((item) => item.order));
  const rightOrder = Math.min(...right.items.map((item) => item.order));
  return (
    typeDifference ||
    leftOrder - rightOrder ||
    left.group.localeCompare(right.group) ||
    left.subGroup.localeCompare(right.subGroup)
  );
}

function getModifierType(item) {
  const points = item.codePoints
    .split(/\s+/)
    .map((point) => point.toUpperCase());
  const hasSkinTone = points.some((point) => skinToneModifiers.has(point));
  const hasHair = points.some((point) => hairModifiers.has(point));
  if (hasSkinTone && hasHair) return "skin-and-hair";
  if (hasSkinTone) return "skin-tone";
  if (hasHair) return "hair";
  return "base";
}

function countByModifierType(entries) {
  return Object.fromEntries(
    ["base", "skin-tone", "hair", "skin-and-hair"].map((type) => [
      type,
      entries.filter((entry) => getModifierType(entry) === type).length,
    ]),
  );
}

function slug(value) {
  return value
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const json = await format(JSON.stringify(value), { parser: "json" });
  await fs.writeFile(file, json);
}

function countBySequenceType(entries) {
  return Object.fromEntries(
    [...new Set(entries.map((entry) => entry.sequenceType))]
      .sort()
      .map((type) => [
        type,
        entries.filter((entry) => entry.sequenceType === type).length,
      ]),
  );
}
