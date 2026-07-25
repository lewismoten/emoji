export type ExplorerState = {
  compositionMode: 'condensed' | 'full';
  orderMode: 'grouped' | 'sequence';
  selectedGroup: string;
  selectedSequenceType: string;
  selectedSubGroup: string;
};

export function createExplorerState(): ExplorerState {
  return {
    compositionMode: 'condensed',
    orderMode: 'grouped',
    selectedGroup: '',
    selectedSequenceType: '',
    selectedSubGroup: ''
  };
}
