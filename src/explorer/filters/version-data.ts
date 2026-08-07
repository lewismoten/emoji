import * as state from "../../state.js";
type Version = {
  version: string;
  file?: string;
  released?: string;
  stage?: string;
  status?: string;
  expectedRelease?: string;
  retrieved?: string;
};

declare const process: {
  cwd(): string;
};

export async function loadVersionCatalog(options: {
  allIds: () => string[];
  byId?: () => Record<string, any>;
  emojiByKey?: () => Record<string, string>;
  getExplorerSubGroup: (item: any) => string;
  items: () => any[];
}) {
  const loadJsonFromFile = async (filePath: string) => {
    const runtimeImport = (specifier: string) => import(specifier);
    const [{ readFile }, { resolve }] = (await Promise.all([
      runtimeImport("node:fs/promises"),
      runtimeImport("node:path"),
    ])) as [
      { readFile(path: string, encoding: string): Promise<string> },
      { resolve(...paths: string[]): string },
    ];
    return JSON.parse(await readFile(resolve(process.cwd(), filePath), "utf8"));
  };

  const fetchJsonWithFallback = async (primary: string, fallback: string) => {
    try {
      const response = await fetch(primary);
      if (response.ok) return response.json();
    } catch {}
    if (typeof window === "undefined") {
      return loadJsonFromFile(fallback);
    }
    const secondary = await fetch(fallback);
    if (!secondary.ok) {
      throw new Error(`Unable to load ${primary} or ${fallback}`);
    }
    return secondary.json();
  };
  const manifest = await fetchJsonWithFallback(
    "versions/manifest.json",
    "src/data/versions/manifest.json",
  );
  const released: Version[] = manifest.versions
    .filter((version: Version) => version.released)
    .sort((left: Version, right: Version) =>
      left.released!.localeCompare(right.released!),
    );
  const releasedKeys: Array<[string, Set<string>]> = await Promise.all(
    released.map(
      async (version) =>
        [
          version.version,
          new Set<string>(
            await fetchJsonWithFallback(
              `versions/${version.file}`,
              `src/data/versions/${version.file}`,
            ),
          ),
        ] as [string, Set<string>],
    ),
  );
  const proposed: Version[] = (manifest.proposed ?? []).sort(
    (left: Version, right: Version) =>
      left.version.localeCompare(right.version, undefined, { numeric: true }),
  );
  const proposedKeys: Array<[string, Set<string>]> = await Promise.all(
    proposed.map(async (version) => {
      const proposal = await fetchJsonWithFallback(
        version.file!,
        `src/data/${version.file!}`,
      ) as {
        count: number,
        emoji: Omit<state.EmojiData, "unicodeSubGroup">[],
        retrieved: string,
        source: string,
        status: "draft",
        unicodeVersion: string
      };
      const proposalItems = proposal.emoji ?? [];
      proposalItems.forEach((item) => {
        if (state.emojiByKey.get(item.key)) return;
        const explorerItem = {
          ...item,
          unicodeSubGroup: item.subGroup,
          subGroup: options.getExplorerSubGroup(item),
        };
        options.items().push(explorerItem);
        state.byId.set(item.key, explorerItem);
        state.emojiByKey.set(item.key, item.emoji);
        options.allIds().push(item.key);
      });
      return [
        version.version,
        new Set<string>(proposalItems.map((item: any) => item.key)),
      ] as [string, Set<string>];
    }),
  );
  return {
    proposed,
    released,
    versionKeys: new Map([...releasedKeys, ...proposedKeys]),
  };
}

type SelectOptionLike = { value: string; text: string };

type SelectLike = {
  appendChild?: (option: SelectOptionLike) => void;
  disabled: boolean;
  options: ArrayLike<SelectOptionLike> | SelectOptionLike[];
  replaceChildren?: () => void;
  value: string;
};

function clearSelectOptions(selector: SelectLike) {
  if (typeof selector.replaceChildren === "function") {
    selector.replaceChildren();
    return;
  }
  if (Array.isArray(selector.options)) {
    selector.options.length = 0;
  }
}

function appendSelectOption(selector: SelectLike, option: SelectOptionLike) {
  if (typeof selector.appendChild === "function") {
    selector.appendChild(option);
    return;
  }
  if (Array.isArray(selector.options)) {
    selector.options.push(option);
  }
}

function createSelectOption(): SelectOptionLike {
  return typeof document !== "undefined"
    ? document.createElement("option")
    : { value: "", text: "" };
}

export function populateVersionSelector(options: {
  proposed: Version[];
  released: Version[];
  selectedLocale: string;
  selector: SelectLike;
  syncRange: () => void;
  translate: (key: string, fallback: string) => string;
}) {
  const previousValue = options.selector.value;
  clearSelectOptions(options.selector);
  const manifests = [...options.released, ...options.proposed];
  manifests.forEach((version) => {
    const option = createSelectOption();
    option.value = version.version;
    if (!version.released) {
      const stage = version.stage ?? version.status ?? "draft";
      const timing = version.expectedRelease
        ? `${options.translate("expected", "expected")} ${version.expectedRelease}`
        : `${options.translate("updated", "updated")} ${new Date(
            version.retrieved!,
          ).toLocaleDateString(options.selectedLocale || undefined)}`;
      option.text = `Emoji ${version.version} (${stage} · ${timing})`;
    } else {
      option.text = `Emoji ${version.version} (${options.translate(
        "released",
        "released",
      )} ${version.released})`;
    }
    appendSelectOption(options.selector, option);
  });
  const defaultVersion =
    options.released.at(-1)?.version ?? manifests.at(-1)?.version ?? "";
  options.selector.value = manifests.some(
    (version) => version.version === previousValue,
  )
    ? previousValue
    : defaultVersion;
  options.selector.disabled = manifests.length === 0;
  options.syncRange();
}
