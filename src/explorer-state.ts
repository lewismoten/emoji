export type ExplorerState = {
  allIds: string[];
  availableCategoryKeys: Set<string>;
  availableGroups: string[];
  availableSequenceTypes: string[];
  availableSubGroups: Record<string, string[]>;
  byId: Record<string, any>;
  compositionMode: 'condensed' | 'full';
  copiedEmojiKeys: string[];
  currentEmojiCopies: Record<string, string>;
  currentEmojiKey: string;
  developerModeFromUrl: boolean;
  developerModeUrlDismissed: boolean;
  emojiByKey: Record<string, string>;
  emojiKeyByCodePoints: Map<string, string>;
  dialogNavigationKeys: string[];
  displayedKeys: string[];
  focusedEmojiKey: string;
  explorerPreferences: Record<string, any>;
  favoriteEmojiKeys: string[];
  groupRepresentativeEmoji: Map<string, string>;
  groupedKeys: Record<string, string[]>;
  groups: string[];
  items: any[];
  orderMode: 'grouped' | 'sequence';
  packageManifest: { packs: any[]; categories: any[] };
  packageManifestPromise?: Promise<unknown>;
  releasedIds: Set<string>;
  proposedVersionManifests: any[];
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  searchAnnotations: Record<string, string[]>;
  searchLabels: Record<string, string>;
  searchLoadId: number;
  searchLocales: any[];
  searchSubgroupLabels: Record<string, string>;
  selectedSearchLocale: string;
  subGroups: Record<string, string[]>;
  subGroupRepresentativeEmoji: Map<string, string>;
  versionDataPromise?: Promise<unknown>;
  versionKeys: Map<string, Set<string>>;
  versionManifests: any[];
  uiStrings: Record<string, string>;
};

export function createExplorerState(): ExplorerState {
  return {
    allIds: [],
    availableCategoryKeys: new Set(),
    availableGroups: [],
    availableSequenceTypes: [],
    availableSubGroups: {},
    byId: {},
    compositionMode: 'condensed',
    copiedEmojiKeys: [],
    currentEmojiCopies: {},
    currentEmojiKey: '',
    developerModeFromUrl: false,
    developerModeUrlDismissed: false,
    emojiByKey: {},
    emojiKeyByCodePoints: new Map(),
    dialogNavigationKeys: [],
    displayedKeys: [],
    focusedEmojiKey: '',
    explorerPreferences: {},
    favoriteEmojiKeys: [],
    groupRepresentativeEmoji: new Map(),
    groupedKeys: {},
    groups: [],
    items: [],
    orderMode: 'grouped',
    packageManifest: { packs: [], categories: [] },
    releasedIds: new Set(),
    proposedVersionManifests: [],
    selectedGroup: '',
    selectedSequenceType: '',
    selectedSubGroup: '',
    searchAnnotations: {},
    searchLabels: {},
    searchLoadId: 0,
    searchLocales: [],
    searchSubgroupLabels: {},
    selectedSearchLocale: '',
    subGroups: {},
    subGroupRepresentativeEmoji: new Map(),
    versionKeys: new Map(),
    versionManifests: [],
    uiStrings: {}
  };
}
