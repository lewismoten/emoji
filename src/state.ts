import * as preferences from "./preferences.js";
import * as doc from "./utils/document.js";
import { init, initArray, initRecord, initMap, initNum, initSet } from "./state-init.js";

export type ExplorerMode = "standard" | "advanced" | "developer";
export type OrderMode = "grouped" | "sequence" | "popular";
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
  name?: string;
  group: string;
  subGroup: string;
  order?: number;
  sequenceType: EmojiSequenceType;
  unicodeSubGroup: string;
  hasExplorerSections?: boolean;
};

export type EmojiItem = Pick<
  EmojiData,
  "key" | "emoji" | "group" | "unicodeSubGroup"
> & { order?: number };

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
export const groups = initArray<string>([]);
export const items = initArray<EmojiItem>([]);
export const proposedVersionManifests = initArray<any>([]);
export const versionManifests = initArray<any>([]);
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
export const availableGroups = initArray<string>([]);
export const availableSequenceTypes = initArray<string>([]);
export const availableSubGroups = initRecord<string[]>({});
export const availableCategoryKeys = initSet<string>(new Set<string>());
export const allIds = initArray<string>([]);
export const searchLoadId = initNum<number>(0);
export const selectedSearchLocale = init<string>("");
export const releasedIds = initSet<string>(new Set<string>());
export const currentEmojiCopies = initRecord<string>({});
export const currentEmojiKey = init<string>("");
export const currentDialogParentStack = initArray<string>([]);
export const dialogNavigationKeys = initArray<string>([]);
export const compositionMode = init<CompositionMode>("condensed");
export const displayedKeys = initArray<string>([]);
export const packageManifest = init<PackageManifest>({
  packs: [],
  categories: [],
});
export const packageManifestPromise = init<Promise<unknown> | undefined>(
  undefined,
);
export const emojiKeyByCodePoints = initMap<string>(new Map<string, string>());
export const versionDataPromise = init<Promise<unknown> | undefined>(undefined);
export const favoriteEmojiKeys = initArray<string>([]);
export const searchLocales = initArray<string>([]);
export const copiedEmojiKeys = initArray<string>([]);
export const groupedKeys = initRecord<Record<string, string[]>>({});
export const focusedEmojiKey = init<string>("");

export const releasedVersions = initArray<{ version: string }>([]);
export const proposedVersions = initArray<{ version: string }>([]);
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
