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
  subgroupKeys: Set<string>
) => (subGroup: string) => {
  const item = state.items.get()
    .filter(inSubGroup(group, subGroup))
    .sort(compare)[0];
  if (!item) return;
  state.subGroupRepresentativeEmoji.set(subGroupKey(group, subGroup), item.emoji)
  subgroupKeys.add(item.key);
}

const setupEmoji = (
  compare: Compare<state.EmojiItem>
) => (group:string) => {
    const subgroupKeys = new Set<string>();
    state.subGroups.get(group)
      .forEach(addSubGroups(group, compare, subgroupKeys));
    const candidates = state.items.get()
      .filter((item) => item.group === group)
      .sort(compare);
    const item =
      candidates.find((candidate) => !subgroupKeys.has(candidate.key)) ??
      (state.subGroups.get(group).length === 1 && candidates.length === 1
        ? candidates[0]
        : undefined);
    if (item) state.subGroupRepresentativeEmoji.set(group, item.emoji);
  }

export function buildCategoryRepresentatives() {
  const versionOrder = new Map<string, number>();
  [
    ...state.releasedVersions.get(), 
    ...state.proposedVersions.get()
  ].forEach(
    (version, index) => {
      for (const key of state.versionKeys.get(version.version) ?? []) {
        if (!versionOrder.has(key)) versionOrder.set(key, index);
      }
    },
  );
  const getVersion = (key: string) => (versionOrder.get(key) ?? Infinity);
  const itemOrder = new Map(
    state.items.get().map((item, index) => [item.key, item.order ?? index]),
  );
  const getOrder = (key:string): number => itemOrder.has(key)? itemOrder.get(key)! : -1;
  const byIntroduction: Compare<state.EmojiItem> = ({key: left}, {key: right}) =>
    getVersion(left) - getVersion(right) ||
    getOrder(left) - getOrder(right) ||
    left.localeCompare(right);
  state.subGroupRepresentativeEmoji.clear();
  state.groups.get().forEach(setupEmoji(byIntroduction));
}
