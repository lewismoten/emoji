import fs from "node:fs/promises";
import path from "node:path";

export type EmojiRecord = {
  key: string;
  emoji: string;
  codePoints: string;
  group?: string;
  subGroup?: string;
  order?: number;
  sequenceType?: string;
  shortName?: string;
  status?: string;
  value?: string;
};

type CompactEmojiData = {
  schemaVersion: number;
  fields: string[];
  emoji: Record<string, unknown[]>;
};

type SplitLookupData = {
  statuses?: string[];
  groups?: string[];
  subGroups?: string[];
  sequenceTypes?: string[];
};

type SplitCatalogData = {
  schemaVersion?: number;
  catalog: Record<string, unknown[]>;
};

const escapeEmojiValue = (codePoints: string) =>
  codePoints
    .split(" ")
    .map((code) => `\\u{${code.toLowerCase()}}`)
    .join("");

export const parseEmojiData = (data: CompactEmojiData | EmojiRecord[]) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      value: item.value ?? escapeEmojiValue(item.codePoints),
    }));
  }
  return Object.entries(data.emoji)
    .map(([emoji, values]) => ({
      emoji,
      key: String(values[0]),
      codePoints: String(values[1]),
      group: values[2] === undefined ? undefined : String(values[2]),
      subGroup: values[3] === undefined ? undefined : String(values[3]),
      order: values[4] === undefined ? undefined : Number(values[4]),
      sequenceType: values[5] === undefined ? undefined : String(values[5]),
      shortName: values[6] === undefined ? undefined : String(values[6]),
      status: values[7] === undefined ? undefined : String(values[7]),
      value: escapeEmojiValue(String(values[1])),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
};

const parseSplitEmojiData = (
  codepoints: Record<string, string>,
  lookups: SplitLookupData,
  catalogData: SplitCatalogData,
) => {
  const statuses = lookups.statuses ?? [];
  const groups = lookups.groups ?? [];
  const subGroups = lookups.subGroups ?? [];
  const sequenceTypes = lookups.sequenceTypes ?? [];

  return Object.entries(codepoints)
    .map(([key, codePoints]) => {
      const emoji = String.fromCodePoint(
        ...codePoints.split(" ").map((item) => Number.parseInt(item, 16)),
      );
      const values = catalogData.catalog[key];
      if (!values) throw new Error(`Missing catalog metadata for ${key}`);
      const status =
        typeof values[0] === "number" ? statuses[values[0]] : String(values[0]);
      const group =
        typeof values[2] === "number" ? groups[values[2]] : String(values[2]);
      const subGroup =
        typeof values[3] === "number"
          ? subGroups[values[3]]
          : String(values[3]);
      const sequenceType =
        typeof values[5] === "number"
          ? sequenceTypes[values[5]]
          : String(values[5]);
      return {
        emoji,
        key,
        codePoints,
        group,
        subGroup,
        order: Number(values[4]),
        sequenceType,
        shortName: String(values[1]),
        status,
        value: escapeEmojiValue(codePoints),
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
};

export const readEmojiJson = async (root: string, file = "emoji.json") => {
  try {
    return parseEmojiData(
      JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as
        CompactEmojiData | EmojiRecord[],
    );
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code !== "ENOENT") throw error;
    return readEmojiSource(root);
  }
};

export const readEmojiSource = async (root: string) => {
  const directory = path.join(root, "src/emoji-source");
  const manifest = JSON.parse(
    await fs.readFile(path.join(directory, "emoji-source.json"), "utf8"),
  ) as {
    files?: {
      codepoints?: string;
      lookups?: string;
      catalog?: string;
    };
  };
  const codepoints = JSON.parse(
    await fs.readFile(
      path.join(directory, manifest.files?.codepoints ?? "codepoints.json"),
      "utf8",
    ),
  ) as Record<string, string>;
  const lookups = JSON.parse(
    await fs.readFile(
      path.join(directory, manifest.files?.lookups ?? "lookups.json"),
      "utf8",
    ),
  ) as SplitLookupData;
  const catalog = JSON.parse(
    await fs.readFile(
      path.join(directory, manifest.files?.catalog ?? "catalog.json"),
      "utf8",
    ),
  ) as SplitCatalogData;
  return parseSplitEmojiData(codepoints, lookups, catalog);
};

export const readEmojiData = readEmojiJson;
