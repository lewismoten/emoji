export function createModifierTypeResolver(config) {
  const skinToneModifiers = new Set(
    config.skinToneModifierCodePoints.map((point) => point.toUpperCase()),
  );
  const hairModifiers = new Set(
    config.hairModifierCodePoints.map((point) => point.toUpperCase()),
  );

  return (item) => {
    const points = item.codePoints
      .split(/\s+/)
      .map((point) => point.toUpperCase());
    const hasSkinTone = points.some((point) => skinToneModifiers.has(point));
    const hasHair = points.some((point) => hairModifiers.has(point));
    if (hasSkinTone && hasHair) return "skin-and-hair";
    if (hasSkinTone) return "skin-tone";
    if (hasHair) return "hair";
    return "base";
  };
}

export function buildBuckets(eligible, getModifierType) {
  const buckets = new Map();
  for (const item of eligible) {
    const modifierType = getModifierType(item);
    const releaseStatus = item.releaseStatus ?? "released";
    const unicodeVersion =
      releaseStatus === "proposed" ? item.unicodeVersion : null;
    const bucketKey = `${releaseStatus}\0${unicodeVersion ?? ""}\0${modifierType}\0${item.group}\0${item.subGroup}`;
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, {
        releaseStatus,
        unicodeVersion,
        modifierType,
        group: item.group,
        subGroup: item.subGroup,
        proposalStage: item.proposalStage ?? null,
        expectedRelease: item.expectedRelease ?? null,
        items: [],
      });
    }
    buckets.get(bucketKey).items.push(item);
  }
  return buckets;
}

export function compareBuckets(left, right) {
  const typeOrder = ["base", "skin-tone", "hair", "skin-and-hair"];
  const releaseDifference =
    (left.releaseStatus === "proposed" ? 1 : 0) -
    (right.releaseStatus === "proposed" ? 1 : 0);
  const versionDifference = String(left.unicodeVersion ?? "").localeCompare(
    String(right.unicodeVersion ?? ""),
    undefined,
    { numeric: true },
  );
  const typeDifference =
    typeOrder.indexOf(left.modifierType) -
    typeOrder.indexOf(right.modifierType);
  const leftOrder = Math.min(...left.items.map((item) => item.order));
  const rightOrder = Math.min(...right.items.map((item) => item.order));
  return (
    releaseDifference ||
    versionDifference ||
    typeDifference ||
    leftOrder - rightOrder ||
    left.group.localeCompare(right.group) ||
    left.subGroup.localeCompare(right.subGroup)
  );
}
