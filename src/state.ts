import * as preferences from "./preferences.js";
import * as doc from "./utils/document.js";

export type ExplorerMode = "standard" | "advanced" | "developer";
export type OrderMode = "grouped" | "sequence";
export type CompositionMode = "condensed";

export type Catalog = {
  allIds: string[];
  byId: Record<string, any>;
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
const initNum = <T extends number = number>(
  defaultValue: T,
  filter?: (value: T) => T,
) => {
  let _value = defaultValue;
  const get = () => _value;
  const set = (value: T) => {
    if (typeof filter === "function") _value = filter(value);
    _value = value;
  };
  const increment = () => ++_value;
  return { get, set, increment };
};

type KeyValue = Record<string, string>;
type KeyValues = Record<string, string[]>;
type GroupedKeys = Record<string, KeyValues>;
type ValueSet = Set<string>;
type MapValue = Map<string, string>;
type MapValues = Map<string, ValueSet>;
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
export const developerModeUrlDismissed = init(false);
export const explorerModeFromUrl = init<ExplorerMode | undefined>(undefined);
export const developerModeFromUrl = init(false);
export const searchLabels = init<KeyValue>({});
export const searchSubgroupLabels = init<KeyValue>({});
export const groups = init<string[]>([]);
export const subGroups = init<KeyValues>({});
export const items = init<any[]>([]);
export const proposedVersionManifests = init<any[]>([]);
export const versionManifests = init<any[]>([]);
export const versionKeys = init<MapValues>(new Map<string, ValueSet>());
export const groupRepresentativeEmoji = init<MapValue>(
  new Map<string, string>(),
);
export const subGroupRepresentativeEmoji = init<MapValue>(
  new Map<string, string>(),
);
export const selectedGroup = init<string>("");
export const selectedSubGroup = init<string>("");
export const selectedSequenceType = init<string>("");
export const availableGroups = init<string[]>([]);
export const availableSequenceTypes = init<string[]>([]);
export const availableSubGroups = init<KeyValues>({});
export const availableCategoryKeys = init<ValueSet>(new Set<string>());
export const byId = init<KeyValue>({});
export const allIds = init<string[]>([]);
export const emojiByKey = init<KeyValue>({});
export const searchLoadId = initNum<number>(0);
export const selectedSearchLocale = init<string>("");
export const releasedIds = init<ValueSet>(new Set<string>());
export const currentEmojiCopies = init<KeyValue>({});
export const currentEmojiKey = init<string>("");
export const currentDialogParentStack = init<string[]>([]);
export const dialogNavigationKeys = init<string[]>([]);
export const compositionMode = init<CompositionMode>("condensed");
export const searchAnnotations = init<KeyValues>({});
export const displayedKeys = init<string[]>([]);
export const packageManifest = init<PackageManifest>({
  packs: [],
  categories: [],
});
export const packageManifestPromise = init<Promise<unknown> | undefined>(
  undefined,
);
export const emojiKeyByCodePoints = init<MapValue>(new Map<string, string>());
export const versionDataPromise = init<Promise<unknown> | undefined>(undefined);
export const favoriteEmojiKeys = init<string[]>([]);
export const searchLocales = init<string[]>([]);
export const copiedEmojiKeys = init<string[]>([]);
export const groupedKeys = init<GroupedKeys>({});
export const focusedEmojiKey = init<string>("");

export const orderMode = init<OrderMode>("grouped", (value) => {
  if (["grouped", "sequence"].indexOf(value) === -1) return "grouped";
  return value;
});

export const applyCatalog = (catalog: Catalog) => {
  allIds.set(catalog.allIds);
  byId.set(catalog.byId);
  emojiByKey.set(catalog.emojiByKey);
  groupedKeys.set(catalog.groupedKeys);
  groups.set(catalog.groups);
  items.set(catalog.items);
  releasedIds.set(catalog.releasedIds);
  subGroups.set(catalog.subGroups);
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
