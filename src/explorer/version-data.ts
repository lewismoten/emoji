type Version = {
  version: string;
  file?: string;
  released?: string;
  stage?: string;
  status?: string;
  expectedRelease?: string;
  retrieved?: string;
};

export async function loadVersionCatalog(options: {
  allIds: () => string[];
  byId: () => Record<string, any>;
  emojiByKey: () => Record<string, string>;
  getExplorerSubGroup: (item: any) => string;
  items: () => any[];
}) {
  const manifest = await fetch('versions/manifest.json').then(response =>
    response.json()
  );
  const released: Version[] = manifest.versions
    .filter((version: Version) => version.released)
    .sort((left: Version, right: Version) =>
      left.released!.localeCompare(right.released!)
    );
  const releasedKeys: Array<[string, Set<string>]> = await Promise.all(
    released.map(async version =>
      [
        version.version,
        new Set<string>(
        await fetch(`versions/${version.file}`).then(response => response.json())
        )
      ] as [string, Set<string>]
    )
  );
  const proposed: Version[] = (manifest.proposed ?? []).sort(
    (left: Version, right: Version) =>
      left.version.localeCompare(right.version, undefined, { numeric: true })
  );
  const proposedKeys: Array<[string, Set<string>]> = await Promise.all(
    proposed.map(async version => {
      const proposal = await fetch(version.file!).then(response => response.json());
      const proposalItems = proposal.emoji ?? [];
      proposalItems.forEach((item: any) => {
        if (options.emojiByKey()[item.key]) return;
        const explorerItem = {
          ...item,
          unicodeSubGroup: item.subGroup,
          subGroup: options.getExplorerSubGroup(item)
        };
        options.items().push(explorerItem);
        options.byId()[item.key] = explorerItem;
        options.emojiByKey()[item.key] = item.emoji;
        options.allIds().push(item.key);
      });
      return [
        version.version,
        new Set<string>(proposalItems.map((item: any) => item.key))
      ] as [string, Set<string>];
    })
  );
  return {
    proposed,
    released,
    versionKeys: new Map([...releasedKeys, ...proposedKeys])
  };
}

export function populateVersionSelector(options: {
  proposed: Version[];
  released: Version[];
  selectedLocale: string;
  selector: HTMLSelectElement;
  syncRange: () => void;
  translate: (key: string, fallback: string) => string;
}) {
  const previousValue = options.selector.value;
  options.selector.replaceChildren();
  const manifests = [...options.released, ...options.proposed];
  manifests.forEach(version => {
    const option = document.createElement('option');
    option.value = version.version;
    if (!version.released) {
      const stage = version.stage ?? version.status ?? 'draft';
      const timing = version.expectedRelease
        ? `${options.translate('expected', 'expected')} ${version.expectedRelease}`
        : `${options.translate('updated', 'updated')} ${new Date(
            version.retrieved!
          ).toLocaleDateString(options.selectedLocale || undefined)}`;
      option.text = `Emoji ${version.version} (${stage} · ${timing})`;
    } else {
      option.text = `Emoji ${version.version} (${options.translate(
        'released',
        'released'
      )} ${version.released})`;
    }
    options.selector.appendChild(option);
  });
  const defaultVersion =
    options.released.at(-1)?.version ?? manifests.at(-1)?.version ?? '';
  options.selector.value = manifests.some(
    version => version.version === previousValue
  )
    ? previousValue
    : defaultVersion;
  options.selector.disabled = manifests.length === 0;
  options.syncRange();
}
