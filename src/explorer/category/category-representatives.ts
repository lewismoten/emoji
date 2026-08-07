import * as state from "../../state.js";

const subGroupKey = (group: string, subGroup: string) =>
  `${group}::${subGroup}`;

const inSubGroup = (group: string, subGroup: string) =>
  (candidate: state.EmojiItem)  => 
    candidate.group === group && 
    candidate.unicodeSubGroup === subGroup;

type Compare<T> = {
  (a: T, b: T): number
}

const addSubGroups = (
  group: string, 
  compare: Compare<state.EmojiItem>,
  subgroupKeys: Set<string>,
  keyBuilder: (group: string, subGroup: string) => string,
  sourceItems: state.EmojiItem[],
) => (subGroup: string) => {
  const item = sourceItems
    .filter(inSubGroup(group, subGroup))
    .sort(compare)[0];
  if (!item) return;
  state.subGroupRepresentativeEmoji.set(keyBuilder(group, subGroup), item.emoji)
  subgroupKeys.add(item.key);
}

const setupEmoji = (
  compare: Compare<state.EmojiItem>,
  keyBuilder: (group: string, subGroup: string) => string,
  sourceItems: state.EmojiItem[],
) => (group:string) => {
    const subgroupKeys = new Set<string>();
    (state.subGroups.get(group) ?? [])
      .forEach(addSubGroups(group, compare, subgroupKeys, keyBuilder, sourceItems));
    const candidates = sourceItems
      .filter((item) => item.group === group)
      .sort(compare);
    const item =
      candidates.find((candidate) => !subgroupKeys.has(candidate.key)) ??
      ((state.subGroups.get(group) ?? []).length === 1 && candidates.length === 1
        ? candidates[0]
        : undefined);
    if (item) state.subGroupRepresentativeEmoji.set(group, item.emoji);
  }

export function buildCategoryRepresentatives(): void;
export function buildCategoryRepresentatives(options: {
  groups?: string[];
  items?: state.EmojiItem[];
  subGroupKey?: (group: string, subGroup: string) => string;
  subGroups?: Record<string, string[]>;
}): { groups: Map<string, string>; subGroups: Map<string, string> };
export function buildCategoryRepresentatives(options?: {
  groups?: string[];
  items?: state.EmojiItem[];
  subGroupKey?: (group: string, subGroup: string) => string;
  subGroups?: Record<string, string[]>;
}) {
  const groupNames = options?.groups ?? state.groups.get();
  const items = options?.items ?? state.items.get();
  const proposedVersions = state.proposedVersions.get();
  const releasedVersions = state.releasedVersions.get();
  const keyFor = options?.subGroupKey ?? subGroupKey;
  const allSubGroups = options?.subGroups ?? state.subGroups.get();
  const versionOrder = new Map<string, number>();
  [
    ...releasedVersions,
    ...proposedVersions
  ].forEach(
    (version, index) => {
      for (const key of state.versionKeys.get(version.version) ?? []) {
        if (!versionOrder.has(key)) versionOrder.set(key, index);
      }
    },
  );
  const getVersion = (key: string) => (versionOrder.get(key) ?? Infinity);
  const itemOrder = new Map(
    items.map((item, index) => [item.key, item.order ?? index]),
  );
  const getOrder = (key:string): number => itemOrder.has(key)? itemOrder.get(key)! : -1;
  const byIntroduction: Compare<state.EmojiItem> = ({key: left}, {key: right}) =>
    getVersion(left) - getVersion(right) ||
    getOrder(left) - getOrder(right) ||
    left.localeCompare(right);
  if (!options) {
    state.subGroupRepresentativeEmoji.clear();
    groupNames.forEach(setupEmoji(byIntroduction, subGroupKey, items));
    return;
  }
  const groupMap = new Map<string, string>();
  const subGroupMap = new Map<string, string>();
  state.items.replace(items);
  state.groups.replace(groupNames);
  state.subGroups.replace(allSubGroups);
  state.subGroupRepresentativeEmoji.clear();
  state.subGroupRepresentativeEmoji.removeListener("set");
  state.subGroupRepresentativeEmoji.addListener("set", (name: string, value: string) => {
    if (name.includes("::")) subGroupMap.set(name, value);
    else groupMap.set(name, value);
  });
  try {
    groupNames.forEach(setupEmoji(byIntroduction, keyFor, items));
  } finally {
  }
  return { groups: groupMap, subGroups: subGroupMap };
}
