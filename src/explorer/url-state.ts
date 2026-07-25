export type ExplorerUrlState = {
  search: string;
  version: string;
  versionMode: 'through' | 'selected';
  group: string;
  subGroup: string;
  sequenceType: string;
  skin: string[];
  hair: string[];
  gender: string[];
  order: 'grouped' | 'unicode' | 'sequence';
  compositionMode: 'condensed' | 'full';
  emoji: string;
  emojiMode: 'details' | 'code' | 'editor';
  panel: '' | 'favorites' | 'help' | 'language';
};

export function parseExplorerUrlState(options: {
  search: string;
  developerMode: boolean;
  preferredOrder?: string;
  allowedSequenceTypes: string[];
}) {
  const params = new URLSearchParams(options.search);
  const allowedOrders = [
    'grouped',
    'unicode',
    ...(options.developerMode ? ['sequence'] : [])
  ];
  const requestedOrder = params.get('order');
  const preferredOrder = options.preferredOrder ?? '';
  const order = allowedOrders.includes(requestedOrder ?? '')
    ? (requestedOrder as ExplorerUrlState['order'])
    : allowedOrders.includes(preferredOrder)
      ? (preferredOrder as ExplorerUrlState['order'])
      : 'grouped';
  return {
    search: params.get('q') ?? '',
    version: options.developerMode ? (params.get('version') ?? '') : '',
    versionMode:
      options.developerMode && params.get('mode') === 'selected'
        ? 'selected'
        : 'through',
    group: params.get('group') ?? '',
    subGroup: params.get('subgroup') ?? '',
    sequenceType: options.allowedSequenceTypes.includes(
      params.get('sequenceType') ?? ''
    )
      ? (params.get('sequenceType') ?? '')
      : '',
    skin: (params.get('skin') ?? '').split(',').filter(Boolean),
    hair: (params.get('hair') ?? '').split(',').filter(Boolean),
    gender: (params.get('gender') ?? '').split(',').filter(Boolean),
    order,
    compositionMode:
      params.get('composition') === 'full' ? 'full' : 'condensed',
    emoji: params.get('emoji') ?? '',
    emojiMode:
      options.developerMode &&
      ['code', 'editor'].includes(params.get('emojiMode') ?? '')
        ? ((params.get('emojiMode') ?? '') as ExplorerUrlState['emojiMode'])
        : 'details',
    panel: ['favorites', 'help', 'language'].includes(params.get('panel') ?? '')
      ? ((params.get('panel') ?? '') as ExplorerUrlState['panel'])
      : ''
  } satisfies ExplorerUrlState;
}

export function buildExplorerUrlQuery(options: {
  search: string;
  developerMode: boolean;
  latestReleasedVersion?: string;
  version: string;
  versionMode: 'through' | 'selected';
  order: 'grouped' | 'unicode' | 'sequence';
  group: string;
  subGroup: string;
  sequenceType: string;
  skin: string[];
  hair: string[];
  gender: string[];
  compositionMode: 'condensed' | 'full';
  currentEmojiKey: string;
  emojiMode: 'details' | 'code' | 'editor';
  panel: '' | 'favorites' | 'help' | 'language';
  dialogOpen: boolean;
}) {
  const params = new URLSearchParams();
  const search = options.search.trim();
  if (search) params.set('q', search);
  if (options.developerMode) {
    if (
      options.version &&
      (options.version !== options.latestReleasedVersion ||
        options.versionMode === 'selected')
    ) {
      params.set('version', options.version);
    }
    if (options.versionMode === 'selected') params.set('mode', 'selected');
    params.set('developer', '1');
  }
  if (options.order !== 'sequence' && options.group) {
    params.set('group', options.group);
  }
  if (options.order !== 'sequence' && options.subGroup) {
    params.set('subgroup', options.subGroup.split('::').slice(1).join('::'));
  }
  if (options.order === 'sequence' && options.sequenceType) {
    params.set('sequenceType', options.sequenceType);
  }
  if (options.skin.length) params.set('skin', options.skin.join(','));
  if (options.hair.length) params.set('hair', options.hair.join(','));
  if (options.gender.length) params.set('gender', options.gender.join(','));
  if (options.order !== 'grouped') params.set('order', options.order);
  if (options.compositionMode === 'full') params.set('composition', 'full');
  if (options.dialogOpen && options.currentEmojiKey) {
    params.set('emoji', options.currentEmojiKey);
    if (options.emojiMode === 'code') params.set('emojiMode', 'code');
    if (options.emojiMode === 'editor') params.set('emojiMode', 'editor');
  } else if (options.panel) {
    params.set('panel', options.panel);
  }
  return params.toString();
}
