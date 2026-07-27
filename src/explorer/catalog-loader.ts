export type CatalogState = {
  allIds: string[];
  byId: Record<string, any>;
  emojiByKey: Record<string, string>;
  groupedKeys: Record<string, Record<string, string[]>>;
  groups: string[];
  items: any[];
  releasedIds: Set<string>;
  subGroups: Record<string, string[]>;
};

export async function loadExplorerCatalog(options: {
  getExplorerSubGroup: (item: any) => string;
  isViteDevelopment: boolean;
  updatePixelArtworkManifest: (manifest: any) => void;
}): Promise<CatalogState> {
  const pixelFontRevision =
    document.querySelector<HTMLLinkElement>("#pixel-font-stylesheet")?.dataset
      .fontRevision ??
    (() => {
      const href = document.querySelector<HTMLLinkElement>(
        "#pixel-font-stylesheet",
      )?.href;
      if (!href) return "";
      return new URL(href, window.location.href).searchParams.get("v") ?? "";
    })();
  const pixelFontManifestUrl = options.isViteDevelopment
    ? `pixel-font/build/explorer-manifest.json?v=${Date.now()}`
    : pixelFontRevision
      ? `pixel-font/build/explorer-manifest.json?v=${pixelFontRevision}`
      : "pixel-font/build/explorer-manifest.json";
  const [catalog, pixelFontManifest] = await Promise.all([
    fetch("explorer/catalog.json").then((response) => response.json()),
    fetch(
      pixelFontManifestUrl,
      options.isViteDevelopment ? { cache: "no-store" } : undefined,
    )
      .then((response) => (response.ok ? response.json() : { glyphs: [] }))
      .catch(() => ({ glyphs: [] })),
  ]);
  const data: any[] = catalog.emoji.map((row: any[]) =>
    Object.fromEntries(
      catalog.fields.map((field: string, index: number) => [field, row[index]]),
    ),
  );
  options.updatePixelArtworkManifest(pixelFontManifest);
  const emojiByKey: Record<string, string> = Object.fromEntries(
    data.map((item: any) => [item.key, item.emoji]),
  );
  const items: any[] = data.map((item: any) => ({
    ...item,
    unicodeSubGroup: item.subGroup,
    subGroup: options.getExplorerSubGroup(item),
  }));
  const explorerSectionCounts = items.reduce(
    (counts: Map<string, Set<string>>, item: any) => {
      const key = `${item.group}:${item.unicodeSubGroup}`;
      if (!counts.has(key)) counts.set(key, new Set());
      counts.get(key)?.add(item.subGroup);
      return counts;
    },
    new Map(),
  );
  items.forEach((item) => {
    item.hasExplorerSections =
      (explorerSectionCounts.get(`${item.group}:${item.unicodeSubGroup}`)
        ?.size ?? 0) > 1;
  });
  const byId: Record<string, any> = Object.fromEntries(
    items.map((item: any) => [item.key, item]),
  );
  const groups: string[] = [
    ...new Set<string>(items.map((item: any) => item.group)),
  ].sort();
  const subGroups = items.reduce((all: Record<string, string[]>, item: any) => {
    const names = (all[item.group] ??= []);
    if (!names.includes(item.unicodeSubGroup)) names.push(item.unicodeSubGroup);
    return all;
  }, {});
  groups.forEach((group: string) => subGroups[group].sort());
  const groupedKeys: Record<string, Record<string, string[]>> = {};
  const allIds: string[] = [];
  groups.forEach((group: string) => {
    groupedKeys[group] = {};
    subGroups[group].forEach((unicodeSubGroup: string) => {
      const keys: string[] = (groupedKeys[group][unicodeSubGroup] = []);
      const subgroupItems = items.filter(
        (item: any) =>
          item.group === group && item.unicodeSubGroup === unicodeSubGroup,
      );
      [...new Set<string>(subgroupItems.map((item: any) => item.subGroup))]
        .sort()
        .forEach((section) => {
          subgroupItems
            .filter((item: any) => item.subGroup === section)
            .forEach((item: any) => {
              allIds.push(item.key);
              keys.push(item.key);
            });
        });
    });
  });
  return {
    allIds,
    byId,
    emojiByKey,
    groupedKeys,
    groups,
    items,
    releasedIds: new Set(allIds),
    subGroups,
  };
}
