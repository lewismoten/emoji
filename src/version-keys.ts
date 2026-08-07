import * as state from "./state.js";

type VersionManifest = {
  version: string;
  stage?: string;
  status?: string;
};

type VersionCatalog = {
  proposed: VersionManifest[];
  released: VersionManifest[];
  versionKeys: Map<string, Set<string>>;
};

type IncludedVersionKeyCache = {
  key: string;
  value: Set<string>;
};

let includedVersionKeyCache: IncludedVersionKeyCache | undefined;

const getCacheKey = (versionMode: state.VersionMode, versionValue: string) =>
  JSON.stringify({
    proposed: state.proposedVersionManifests.get().map((item) => item.version),
    released: state.versionManifests.get().map((item) => item.version),
    versionKeys: [...state.versionKeys.get().entries()].map(
      ([version, keys]) => [version, [...keys].sort()],
    ),
    versionMode,
    versionValue,
  });

export const clearIncludedVersionKeyCache = () => {
  includedVersionKeyCache = undefined;
};

export const setVersionCatalog = (catalog: VersionCatalog) => {
  state.versionManifests.replace(catalog.released);
  state.proposedVersionManifests.replace(catalog.proposed);
  state.versionKeys.replace(catalog.versionKeys);
  if (!state.selectedVersion.get()) {
    setSelectedVersion(
      state.versionManifests.last()?.version ??
        state.proposedVersionManifests.last()?.version ??
        "",
    );
  }
  clearIncludedVersionKeyCache();
};

export const getAllVersionManifests = (): VersionManifest[] => [
  ...state.versionManifests.get(),
  ...state.proposedVersionManifests.get(),
];

export const setSelectedVersion = (value: string) => {
  state.selectedVersion.set(value);
  clearIncludedVersionKeyCache();
};

export const getSelectedVersion = () => state.selectedVersion.get();

export const setSelectedVersionMode = (value: state.VersionMode) => {
  state.selectedVersionMode.set(value);
  clearIncludedVersionKeyCache();
};

export const getSelectedVersionMode = () => state.selectedVersionMode.get();

export const syncSelectedVersionFromControl = (selector?: {
  value: string;
}) => {
  setSelectedVersion(selector?.value ?? "");
};

export const syncSelectedVersionModeFromControl = (selector?: {
  value: string;
}) => {
  setSelectedVersionMode(
    selector?.value === "selected" ? "selected" : "through",
  );
};

export const getVersionKeysFor = (version: string) =>
  state.versionKeys.get(version) ?? new Set<string>();

export const hasVersionKeyData = () => state.versionKeys.get().size > 0;

export const getIncludedVersionKeys = (options?: {
  versionMode?: state.VersionMode;
  versionValue?: string;
}) => {
  const versionMode = options?.versionMode ?? getSelectedVersionMode();
  const orderedVersions = getAllVersionManifests().length
    ? getAllVersionManifests().map((item) => item.version)
    : [...state.versionKeys.get().keys()];
  const versionValue =
    options?.versionValue ||
    getSelectedVersion() ||
    state.versionManifests.last()?.version ||
    orderedVersions.at(-1) ||
    "";
  const cacheKey = getCacheKey(versionMode, versionValue);
  if (includedVersionKeyCache?.key === cacheKey) {
    return includedVersionKeyCache.value;
  }

  const versionKeys = state.versionKeys.get();
  if (versionKeys.size === 0) {
    includedVersionKeyCache = {
      key: cacheKey,
      value: state.releasedIds.get(),
    };
    return includedVersionKeyCache.value;
  }
  if (versionMode === "selected") {
    includedVersionKeyCache = {
      key: cacheKey,
      value: getVersionKeysFor(versionValue),
    };
    return includedVersionKeyCache.value;
  }

  const selectedIndex = orderedVersions.findIndex(
    (version) => version === versionValue,
  );
  const value = new Set(
    orderedVersions
      .slice(0, selectedIndex + 1)
      .flatMap((version) => [...getVersionKeysFor(version)]),
  );
  includedVersionKeyCache = { key: cacheKey, value };
  return value;
};

export const findVersionAvailabilityIndex = (
  predicate: (keys: Set<string>) => boolean,
) =>
  getAllVersionManifests().findIndex((version) =>
    predicate(getVersionKeysFor(version.version)),
  );
