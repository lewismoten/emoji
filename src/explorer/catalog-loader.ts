import {querySelector} from '../utils/document.js';
import * as route from '../app/route.js';
import * as state from  "../state.js";
import { EmojiData } from '../state.js';

export type CatalogState = {
  allIds: string[];
  groupedKeys: Record<string, Record<string, string[]>>;
  groups: string[];
  items: any[];
  releasedIds: Set<string>;
};

export async function loadExplorerCatalog(options: {
  getExplorerSubGroup: (item: any) => string;
  isViteDevelopment: boolean;
  updatePixelArtworkManifest: (manifest: any) => void;
}): Promise<CatalogState> {
  const pixelFontRevision =
    querySelector<HTMLLinkElement>("#pixel-font-stylesheet")?.dataset
      .fontRevision ??
    (() => {
      const href = querySelector<HTMLLinkElement>(
        "#pixel-font-stylesheet",
      )?.href;
      if (!href) return "";
      return route.getParam("v", href);
    })();
  const pixelFontManifestUrl = options.isViteDevelopment
    ? `pixel-font/build/explorer-manifest.json?v=${Date.now()}`
    : pixelFontRevision
      ? `pixel-font/build/explorer-manifest.json?v=${pixelFontRevision}`
      : "pixel-font/build/explorer-manifest.json";

type Catalog = {
  schemaVersion: number,
  fields: string[],
  emoji: any[][]
}
  const [catalog, pixelFontManifest]: [Catalog, any] = await Promise.all([
    fetch("explorer/catalog.json").then((response) => response.json()),
    fetch(
      pixelFontManifestUrl,
      options.isViteDevelopment ? { cache: "no-store" } : undefined,
    )
      .then((response) => (response.ok ? response.json() : { glyphs: [] }))
      .catch(() => ({ glyphs: [] })),
  ]);
  const asKey = (values: any[]) => (name: string, index: number) => [name, values[index]]
  const data = catalog.emoji.map((row) =>
    Object.fromEntries(
      catalog.fields.map(asKey(row)),
    ) as Omit<EmojiData, "unicodeSubGroup" | "hasExplorerSections">
  );
  options.updatePixelArtworkManifest(pixelFontManifest);
  state.emojiByKey.replace(Object.fromEntries(
    data.map((item) => [item.key, item.emoji]),
  ));
  const items: EmojiData[] = data.map((item) => ({
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
  state.byId.replace(Object.fromEntries(
    items.map((item) => [item.key, item]),
  ));
  const groups: string[] = [
    ...new Set<string>(items.map((item: any) => item.group)),
  ].sort();
  const subGroups = items.reduce((all: Record<string, string[]>, item: any) => {
    const names = (all[item.group] ??= []);
    if (!names.includes(item.unicodeSubGroup)) names.push(item.unicodeSubGroup);
    return all;
  }, {});
  groups.forEach((group: string) => subGroups[group].sort());
  state.subGroups.replace(subGroups);

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
    groupedKeys,
    groups,
    items,
    releasedIds: new Set(allIds)
  };
}
