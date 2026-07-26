import fs from "node:fs/promises";
import path from "node:path";

export async function loadPreviousAssignments(atlasDirectory, sheetCapacity) {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(atlasDirectory, "manifest.json"), "utf8"),
    );
    if (
      ![
        "grouped-subgroups-v1",
        "grouped-subgroups-v2",
        "grouped-subgroups-v3",
      ].includes(manifest.layout)
    )
      return new Map();

    const assignments = new Map();
    for (const sheet of manifest.sheets) {
      const mappingFile = `${sheet.id}.json`;
      const sidecar = JSON.parse(
        await fs.readFile(path.join(atlasDirectory, mappingFile), "utf8"),
      );
      for (const entry of sidecar.entries ?? []) {
        assignments.set(entry.key, {
          releaseStatus: sidecar.releaseStatus ?? "released",
          unicodeVersion: sidecar.unicodeVersion ?? null,
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

export function assignBucket(bucket, previous) {
  const assignments = new Map();
  const occupied = new Set();
  for (const item of bucket.items) {
    const existing = previous.get(item.key);
    if (
      existing?.releaseStatus !== bucket.releaseStatus ||
      existing?.unicodeVersion !== bucket.unicodeVersion ||
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
