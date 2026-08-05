import * as preferences from "./preferences.js";
import * as doc from "./utils/document.js";

export type ExplorerMode = "standard" | "advanced" | "developer";
export type OrderMode = "grouped" | "sequence";
export type CompositionMode = "condensed";

type EmojiStatus = "fully-qualified" | "component";
type EmojiSequenceType =
  "flag" | "keycap" | "modifier" | "single" | "tag" | "zwj";

export type EmojiData = {
  key: string;
  emoji: string;
  codePoints: string;
  status: EmojiStatus;
  shortName: string;
  group: string;
  subGroup: string;
  order: number;
  sequenceType: EmojiSequenceType;
  unicodeSubGroup: string;
  hasExplorerSections?: boolean;
};

export type EmojiItem = Pick<
  EmojiData,
  "key" | "emoji" | "group" | "unicodeSubGroup" | "order"
>;

export type Catalog = {
  allIds: string[];
  byId: Record<string, EmojiData>;
  emojiByKey: Record<string, string>;
  groupedKeys: Record<string, Record<string, string[]>>;
  groups: string[];
  items: any[];
  releasedIds: Set<string>;
  subGroups: Record<string, string[]>;
};

const init = <T = any>(defaultValue: T, filter?: (value: T) => T) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T) => {
    if (typeof filter === "function") _value = filter(value);
    _value = value;
  };
  return { get, set };
};
type ValueTransformer<T> = (value: T) => T;
const transformIfProvided = <T>(value: T, transformer?: ValueTransformer<T>) =>
  transformer ? transformer(value) : value;

const initMap = <T = any>(
  defaultValue: Map<string, T>,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = (name: string) => _value.get(name);
  const set = (name: string, value: T) => {
    _value.set(name, transformIfProvided(value, transformer));
  };
  const replace = (value: Map<string, T>) => {
    _value = value;
  };
  const clear = () => {
    _value.clear();
  };
  return { get, set, clear, replace };
};
const initRecord = <T = any>(
  defaultValue: Record<string, T>,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = (name: string) => _value[name];
  const set = (name: string, value: T) => {
    _value[name] = transformIfProvided(value, transformer);
  };
  const clear = () => {
    _value = {};
  };
  const replace = (replacement: Record<string, T>) => {
    _value = replacement;
  };
  return { get, set, clear, replace };
};
const initSet = <T = any>(
  defaultValue: Set<T>,
  transformer?: ValueTransformer<Set<T>>,
) => {
  let _value = defaultValue;
  const first = () => _value.values().next().value;
  const replace = (value: Set<T>) => {
    _value = transformIfProvided(value, transformer);
  };
  const clear = () => {
    _value.clear();
  };
  return { first, replace, clear };
};
const initNum = <T extends number = number>(
  defaultValue: T,
  transformer?: ValueTransformer<T>,
) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T) => {
    _value = transformIfProvided(value, transformer);
  };
  const increment = () => ++_value;
  return { get, set, increment };
};

type ValueSet = Set<string>;
type PackageManifest = {
  packs: Array<{
    id: string;
    importPath: string;
    keys?: string[];
  }>;
  categories: Array<{
    label: string;
    importPath: string;
    subcategories: Array<{
      unicodeSubgroup: string;
      importPath: string;
    }>;
  }>;
};
// refactored
export const searchAnnotations = initRecord<string[]>({});
export const byId = initRecord<EmojiData>({});
export const emojiByKey = initRecord<string>({});

// in-process
export const subGroups = initRecord<string[]>({});

// on deck

// pending
export const developerModeUrlDismissed = init(false);
export const explorerModeFromUrl = init<ExplorerMode | undefined>(undefined);
export const developerModeFromUrl = init(false);
export const searchLabels = initRecord<string>({});
export const searchSubgroupLabels = initRecord<string>({});
export const groups = init<string[]>([]);
export const items = init<EmojiItem[]>([]);
export const proposedVersionManifests = init<any[]>([]);
export const versionManifests = init<any[]>([]);
export const versionKeys = initMap<ValueSet>(new Map<string, ValueSet>());
export const groupRepresentativeEmoji = initMap<string>(
  new Map<string, string>(),
);
export const subGroupRepresentativeEmoji = initMap<string>(
  new Map<string, string>(),
);
export const selectedGroup = init<string>("");
export const selectedSubGroup = init<string>("");
export const selectedSequenceType = init<string>("");
export const availableGroups = init<string[]>([]);
export const availableSequenceTypes = init<string[]>([]);
export const availableSubGroups = initRecord<string[]>({});
export const availableCategoryKeys = initSet<string>(new Set<string>());
export const allIds = init<string[]>([]);
export const searchLoadId = initNum<number>(0);
export const selectedSearchLocale = init<string>("");
export const releasedIds = initSet<string>(new Set<string>());
export const currentEmojiCopies = initRecord<string>({});
export const currentEmojiKey = init<string>("");
export const currentDialogParentStack = init<string[]>([]);
export const dialogNavigationKeys = init<string[]>([]);
export const compositionMode = init<CompositionMode>("condensed");
export const displayedKeys = init<string[]>([]);
export const packageManifest = init<PackageManifest>({
  packs: [],
  categories: [],
});
export const packageManifestPromise = init<Promise<unknown> | undefined>(
  undefined,
);
export const emojiKeyByCodePoints = initMap<string>(new Map<string, string>());
export const versionDataPromise = init<Promise<unknown> | undefined>(undefined);
export const favoriteEmojiKeys = init<string[]>([]);
export const searchLocales = init<string[]>([]);
export const copiedEmojiKeys = init<string[]>([]);
export const groupedKeys = initRecord<Record<string, string[]>>({});
export const focusedEmojiKey = init<string>("");

export const releasedVersions = init<{ version: string }[]>([]);
export const proposedVersions = init<{ version: string }[]>([]);
export const unicodeSubgroupLabelKeys = initRecord<string>({});

export const orderMode = init<OrderMode>("grouped", (value) => {
  if (["grouped", "sequence"].indexOf(value) === -1) return "grouped";
  return value;
});

export const applyCatalog = (catalog: Catalog) => {
  allIds.set(catalog.allIds);
  emojiByKey.replace(catalog.emojiByKey);
  groupedKeys.replace(catalog.groupedKeys);
  groups.set(catalog.groups);
  items.set(catalog.items);
  releasedIds.replace(catalog.releasedIds);
  subGroups.replace(catalog.subGroups);
};

const isValidExplorerMode = (mode: string): mode is ExplorerMode => {
  switch (mode) {
    case "standard":
    case "advanced":
    case "developer":
      return true;
    default:
      return false;
  }
};
export const getExplorerMode = (): ExplorerMode => {
  const datasetMode = doc.getData("explorerMode") ?? "";
  if (isValidExplorerMode(datasetMode)) return datasetMode;

  let mode = explorerModeFromUrl.get();
  if (mode && !developerModeUrlDismissed.get()) {
    return mode;
  }
  mode = preferences.getString("mode");
  switch (mode) {
    case "standard":
    case "advanced":
    case "developer":
      return mode;
    default:
      return "standard";
  }
};
