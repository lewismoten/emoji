import * as state from "../../state.js";

type EmojiItem = {
  codePoints?: string;
  group?: string;
  key?: string;
  sequenceType?: string;
  shortName?: string;
  unicodeSubGroup?: string;
};

export function getEmojiGenders(item: EmojiItem) {
  const genders = new Set<string>();
  const name = item.shortName?.toLocaleLowerCase() ?? "";
  const points = ` ${item.codePoints ?? ""} `;
  if (
    points.includes(" 2642 ") ||
    /\b(man|men|boy|boys|father|prince|king|groom|male)\b/.test(name)
  ) {
    genders.add("male");
  }
  if (
    points.includes(" 2640 ") ||
    /\b(woman|women|girl|girls|mother|princess|queen|bride|female)\b/.test(name)
  ) {
    genders.add("female");
  }
  if (/\b(person|people|adult|adults|child|children)\b/.test(name)) {
    genders.add("neutral");
  }
  if (genders.size === 0) {
    const key = item.key ?? "";
    const capitalizedKey = key.charAt(0).toLocaleUpperCase() + key.slice(1);
    if (
      state.emojiByKey.get(`man${capitalizedKey}`) &&
      state.emojiByKey.get(`woman${capitalizedKey}`)
    ) {
      genders.add("neutral");
    }
  }
  return genders;
}

export function filterEmojiKeys(options: {
  allIds: string[];
  hairModifiers: string[];
  includedVersionKeys?: Set<string>;
  items: EmojiItem[];
  locale?: string;
  orderMode: string;
  popularKeys?: string[];
  searchText: string;
  selectedGenders: string[];
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  skinToneModifiers: string[];
  subGroupSelectionKey: (group?: string, subGroup?: string) => string;
}) {
  const keywords = options.searchText
    .toLocaleLowerCase(options.locale)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const itemsByKey = new Map(options.items.map((item) => [item.key, item]));
  const hasKeyword = (emojiKey: string) => {
    const searchableFields = [
      emojiKey,
      state.byId.get(emojiKey)?.shortName,
      ...(state.searchAnnotations.get(emojiKey) ?? []),
    ]
      .filter(Boolean)
      .map((field) => field!.toLocaleLowerCase(options.locale));
    return keywords.every((keyword) =>
      searchableFields.some((field) => field.includes(keyword)),
    );
  };
  const hasModifier = (key: string, modifier: string) =>
    itemsByKey.get(key)?.codePoints?.includes(modifier);
  let keys = options.allIds.filter(hasKeyword);
  if (options.includedVersionKeys) {
    keys = keys.filter((key) => options.includedVersionKeys!.has(key));
  }
  if (options.orderMode === "popular") {
    const popularKeySet = new Set(options.popularKeys ?? []);
    keys = keys.filter((key) => popularKeySet.has(key));
  }
  if (options.orderMode !== "sequence" && options.selectedGroup) {
    keys = keys.filter(
      (key) => state.byId.get(key)?.group === options.selectedGroup,
    );
  }
  if (options.orderMode !== "sequence" && options.selectedSubGroup) {
    keys = keys.filter(
      (key) =>{
        const {group, unicodeSubGroup} = state.byId.get(key) ?? {};
        return options.subGroupSelectionKey(group, unicodeSubGroup) === options.selectedSubGroup}
    );
  }
  if (options.orderMode === "sequence" && options.selectedSequenceType) {
    keys = keys.filter(
      (key) => state.byId.get(key)?.sequenceType === options.selectedSequenceType,
    );
  }
  for (const modifier of options.skinToneModifiers) {
    keys = keys.filter((key) => hasModifier(key, modifier));
  }
  for (const modifier of options.hairModifiers) {
    keys = keys.filter((key) => hasModifier(key, modifier));
  }
  if (options.selectedGenders.length > 0) {
    keys = keys.filter((key) =>
      options.selectedGenders.some((gender) =>
        getEmojiGenders(state.byId.get(key) ?? {}).has(
          gender,
        ),
      ),
    );
  }
  return keys;
}
