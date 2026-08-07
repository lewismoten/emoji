import * as preferences from "./preferences.js";
import * as doc from "./utils/document.js";
import {
  createArrayStore,
  createMapStore,
  createNumberStore,
  createRecordStore,
  createSetStore,
  createStore,
} from "./state-store.js";

export type ExplorerMode = "standard" | "advanced" | "developer";
export type OrderMode = "grouped" | "sequence" | "popular";
export type CompositionMode = "condensed";
export type VersionMode = "through" | "selected";

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
export const searchAnnotations = createRecordStore<string[]>({});
export const byId = createRecordStore<EmojiData>({});
export const emojiByKey = createRecordStore<string>({});

// in-process
export const subGroups = createRecordStore<string[]>({});

// on deck

// pending
export const developerModeUrlDismissed = createStore(false);
export const explorerModeFromUrl = createStore<ExplorerMode | undefined>(
  undefined,
);
export const developerModeFromUrl = createStore(false);
export const searchLabels = createRecordStore<string>({});
export const searchSubgroupLabels = createRecordStore<string>({});
export const groups = createArrayStore<string>([]);
export const items = createArrayStore<EmojiItem>([]);
type VersionManifest = {
  version: string;
  stage?: string;
  status?: string;
};
export const proposedVersionManifests = createArrayStore<VersionManifest>([]);
export const versionManifests = createArrayStore<VersionManifest>([]);
export const versionKeys = createMapStore<ValueSet>(
  new Map<string, ValueSet>(),
);
export const groupRepresentativeEmoji = createMapStore<string>(
  new Map<string, string>(),
);
export const subGroupRepresentativeEmoji = createMapStore<string>(
  new Map<string, string>(),
);
export const selectedGroup = createStore<string>("");
export const selectedSubGroup = createStore<string>("");
export const selectedSequenceType = createStore<string>("");
export const availableGroups = createArrayStore<string>([]);
export const availableSequenceTypes = createArrayStore<string>([]);
export const availableSubGroups = createRecordStore<string[]>({});
export const availableCategoryKeys = createSetStore<string>(new Set<string>());
export const allIds = createArrayStore<string>([]);
export const searchLoadId = createNumberStore(0);
export const selectedSearchLocale = createStore<string>("");
export const releasedIds = createSetStore<string>(new Set<string>());
export const selectedVersion = createStore<string>("");
export const selectedVersionMode = createStore<VersionMode>("through", {
  transform: (value) => (value === "selected" ? "selected" : "through"),
});
export const currentEmojiCopies = createRecordStore<string>({});
export const currentEmojiKey = createStore<string>("");
export const currentDialogParentStack = createArrayStore<string>([]);
export const dialogNavigationKeys = createArrayStore<string>([]);
export const compositionMode = createStore<CompositionMode>("condensed");
export const displayedKeys = createArrayStore<string>([]);
export const packageManifest = createStore<PackageManifest>({
  packs: [],
  categories: [],
});
export const packageManifestPromise = createStore<Promise<unknown> | undefined>(
  undefined,
);
export const emojiKeyByCodePoints = createMapStore<string>(
  new Map<string, string>(),
);
export const versionDataPromise = createStore<Promise<unknown> | undefined>(
  undefined,
);
export const favoriteEmojiKeys = createArrayStore<string>([]);
export const searchLocales = createArrayStore<string>([]);
export const copiedEmojiKeys = createArrayStore<string>([]);
export const groupedKeys = createRecordStore<Record<string, string[]>>({});
export const focusedEmojiKey = createStore<string>("");

export const releasedVersions = createArrayStore<{ version: string }>([]);
export const proposedVersions = createArrayStore<{ version: string }>([]);
export const unicodeSubgroupLabelKeys = createRecordStore<string>({});

export const orderMode = createStore<OrderMode>("grouped", {
  transform: (value) => {
    if (["grouped", "sequence"].indexOf(value) === -1) return "grouped";
    return value;
  },
});

export const applyCatalog = (catalog: Catalog) => {
  allIds.replace(catalog.allIds);
  emojiByKey.replace(catalog.emojiByKey);
  groupedKeys.replace(catalog.groupedKeys);
  groups.replace(catalog.groups);
  items.replace(catalog.items);
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
  let mode = explorerModeFromUrl.get();
  if (mode && !developerModeUrlDismissed.get()) {
    return mode;
  }
  mode = preferences.getString("mode");
  if (isValidExplorerMode(mode)) return mode;

  const datasetMode = doc.getData("explorerMode") ?? "";
  if (isValidExplorerMode(datasetMode)) return datasetMode;

  return "standard";
};
