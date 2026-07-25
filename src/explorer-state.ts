export type ExplorerState = {
  allIds: string[];
  availableCategoryKeys: Set<string>;
  availableGroups: string[];
  availableSequenceTypes: string[];
  availableSubGroups: Record<string, string[]>;
  byId: Record<string, any>;
  compositionMode: 'condensed' | 'full';
  currentEmojiCopies: Record<string, string>;
  currentEmojiKey: string;
  emojiByKey: Record<string, string>;
  emojiKeyByCodePoints: Map<string, string>;
  dialogNavigationKeys: string[];
  displayedKeys: string[];
  focusedEmojiKey: string;
  groupRepresentativeEmoji: Map<string, string>;
  groupedKeys: Record<string, string[]>;
  groups: string[];
  items: any[];
  orderMode: 'grouped' | 'sequence';
  releasedIds: Set<string>;
  proposedVersionManifests: any[];
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
  subGroups: Record<string, string[]>;
  subGroupRepresentativeEmoji: Map<string, string>;
  versionDataPromise?: Promise<unknown>;
  versionKeys: Map<string, Set<string>>;
  versionManifests: any[];
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
    currentEmojiCopies: {},
    currentEmojiKey: '',
    emojiByKey: {},
    emojiKeyByCodePoints: new Map(),
    dialogNavigationKeys: [],
    displayedKeys: [],
    focusedEmojiKey: '',
    groupRepresentativeEmoji: new Map(),
    groupedKeys: {},
    groups: [],
    items: [],
    orderMode: 'grouped',
    releasedIds: new Set(),
    proposedVersionManifests: [],
    selectedGroup: '',
    selectedSequenceType: '',
    selectedSubGroup: '',
    subGroups: {},
    subGroupRepresentativeEmoji: new Map(),
    versionKeys: new Map(),
    versionManifests: []
  };
}
