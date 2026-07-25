export type ExplorerState = {
  compositionMode: 'condensed' | 'full';
  currentEmojiCopies: Record<string, string>;
  currentEmojiKey: string;
  dialogNavigationKeys: string[];
  displayedKeys: string[];
  focusedEmojiKey: string;
  orderMode: 'grouped' | 'sequence';
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
};

export function createExplorerState(): ExplorerState {
  return {
    compositionMode: 'condensed',
    currentEmojiCopies: {},
    currentEmojiKey: '',
    dialogNavigationKeys: [],
    displayedKeys: [],
    focusedEmojiKey: '',
    orderMode: 'grouped',
    selectedGroup: '',
    selectedSequenceType: '',
    selectedSubGroup: ''
  };
}
