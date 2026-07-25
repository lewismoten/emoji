export function buildCategoryRepresentatives(options: {
  groups: string[];
  items: any[];
  proposedVersions: any[];
  releasedVersions: any[];
  subGroupKey: (group: string, subGroup: string) => string;
  subGroups: Record<string, string[]>;
  versionKeys: Map<string, Set<string>>;
}) {
  const versionOrder = new Map<string, number>();
  [...options.releasedVersions, ...options.proposedVersions].forEach(
    (version, index) => {
      for (const key of options.versionKeys.get(version.version) ?? []) {
        if (!versionOrder.has(key)) versionOrder.set(key, index);
      }
    }
  );
  const itemOrder = new Map(
    options.items.map((item, index) => [item.key, item.order ?? index])
  );
  const byIntroduction = (left: any, right: any) =>
    (versionOrder.get(left.key) ?? Infinity) -
      (versionOrder.get(right.key) ?? Infinity) ||
    itemOrder.get(left.key) - itemOrder.get(right.key) ||
    left.key.localeCompare(right.key);
  const groups = new Map<string, string>();
  const subGroups = new Map<string, string>();
  options.groups.forEach(group => {
    const subgroupKeys = new Set<string>();
    options.subGroups[group].forEach(subGroup => {
      const item = options.items
        .filter(candidate => candidate.group === group && candidate.unicodeSubGroup === subGroup)
        .sort(byIntroduction)[0];
      if (!item) return;
      subGroups.set(options.subGroupKey(group, subGroup), item.emoji);
      subgroupKeys.add(item.key);
    });
    const candidates = options.items
      .filter(item => item.group === group)
      .sort(byIntroduction);
    const item = candidates.find(candidate => !subgroupKeys.has(candidate.key)) ??
      (options.subGroups[group].length === 1 && candidates.length === 1 ? candidates[0] : undefined);
    if (item) groups.set(group, item.emoji);
  });
  return { groups, subGroups };
}
