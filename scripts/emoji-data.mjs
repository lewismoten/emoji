import fs from "node:fs";
import path from "node:path";

export const emojiDataFields = [
  "key",
  "codePoints",
  "group",
  "subGroup",
  "order",
  "sequenceType",
  "shortName",
  "status",
];

export const escapeEmojiValue = (codePoints) =>
  codePoints
    .split(" ")
    .map((code) => `\\u{${code.toLowerCase()}}`)
    .join("");

export const inflateEmojiRecord = (emoji, values) => ({
  emoji,
  key: values[0],
  codePoints: values[1],
  group: values[2],
  subGroup: values[3],
  order: values[4],
  sequenceType: values[5],
  shortName: values[6],
  status: values[7],
  value: escapeEmojiValue(values[1]),
});

export const compactEmojiData = (records) => ({
  schemaVersion: 2,
  fields: emojiDataFields,
  emoji: Object.fromEntries(
    records.map((item) => [
      item.emoji,
      [
        item.key,
        item.codePoints,
        item.group,
        item.subGroup,
        item.order,
        item.sequenceType,
        item.shortName,
        item.status,
      ],
    ]),
  ),
});

export const splitEmojiSourceData = (records) => ({
  schemaVersion: 2,
  codepoints: Object.fromEntries(
    records.map((item) => [item.key, item.codePoints]),
  ),
  lookups: {
    statuses: [...new Set(records.map((item) => item.status))].sort(),
    groups: [...new Set(records.map((item) => item.group))].sort(),
    subGroups: [...new Set(records.map((item) => item.subGroup))].sort(),
    sequenceTypes: [
      ...new Set(records.map((item) => item.sequenceType)),
    ].sort(),
  },
  catalog: {},
});

export const parseCompactEmojiData = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => ({
      ...item,
      value: item.value ?? escapeEmojiValue(item.codePoints),
    }));
  }
  const entries = Object.entries(data.emoji ?? {});
  return entries
    .map(([emoji, values]) => inflateEmojiRecord(emoji, values))
    .sort((left, right) => left.key.localeCompare(right.key));
};

export const parseSplitEmojiSourceData = (data) => {
  const lookupData = data.lookups ?? data;
  const statuses = lookupData.statuses ?? [];
  const groups = lookupData.groups ?? [];
  const subGroups = lookupData.subGroups ?? [];
  const sequenceTypes = lookupData.sequenceTypes ?? [];
  const codepointEntries = Object.entries(data.codepoints ?? data.identity ?? {});
  return codepointEntries
    .map(([identityKey, codePointsValue]) => {
      const key = Array.isArray(codePointsValue)
        ? codePointsValue[0]
        : typeof codePointsValue === "string"
          ? identityKey
          : codePointsValue?.key;
      const codePoints = Array.isArray(codePointsValue)
        ? codePointsValue[1]
        : typeof codePointsValue === "string"
          ? codePointsValue
          : codePointsValue?.codePoints;
      const emoji = Array.isArray(codePointsValue)
        ? identityKey
        : typeof codePointsValue === "string"
          ? String.fromCodePoint(
              ...codePoints.split(" ").map((item) => Number.parseInt(item, 16)),
            )
          : key && codePoints
            ? identityKey
            : null;
      if (!emoji) throw new Error(`Unable to resolve emoji for ${key}`);
      const catalogValues = data.catalog?.[key] ?? data.catalog?.[emoji];
      if (!catalogValues)
        throw new Error(`Missing catalog metadata for ${key}`);
      const status =
        typeof catalogValues[0] === "number"
          ? statuses[catalogValues[0]]
          : catalogValues[0];
      const group =
        typeof catalogValues[2] === "number"
          ? groups[catalogValues[2]]
          : catalogValues[2];
      const subGroup =
        typeof catalogValues[3] === "number"
          ? subGroups[catalogValues[3]]
          : catalogValues[3];
      const sequenceType =
        typeof catalogValues[5] === "number"
          ? sequenceTypes[catalogValues[5]]
          : catalogValues[5];
      return inflateEmojiRecord(emoji, [
        key,
        codePoints,
        group,
        subGroup,
        catalogValues[4],
        sequenceType,
        catalogValues[1],
        status,
      ]);
    })
    .sort((left, right) => left.key.localeCompare(right.key));
};

export const readJsonFileSync = (file) =>
  JSON.parse(fs.readFileSync(file, "utf8"));

export const emojiSourceManifest = {
  schemaVersion: 1,
  format: "emoji-source",
  files: {
    codepoints: "codepoints.json",
    lookups: "lookups.json",
    catalog: "catalog.json",
  },
  codepoints: {
    schemaVersion: 1,
    key: "emojiKey",
    value: "codePoints",
  },
  catalog: {
    schemaVersion: 2,
    key: "emojiKey",
    fields: [
      "statusIndex",
      "shortName",
      "groupIndex",
      "subGroupIndex",
      "order",
      "sequenceTypeIndex",
    ],
    lookupFile: "lookups.json",
  },
  lookups: {
    schemaVersion: 1,
    fields: ["statuses", "groups", "subGroups", "sequenceTypes"],
  },
};

export const readEmojiDataSync = (file = "emoji.json") =>
  fs.existsSync(file)
    ? parseCompactEmojiData(readJsonFileSync(file))
    : readEmojiSourceSync("src/emoji-source");

export const readEmojiSourceSync = (directory = "src/emoji-source") => {
  const manifestFile = path.join(directory, "emoji-source.json");
  const manifest = fs.existsSync(manifestFile)
    ? readJsonFileSync(manifestFile)
    : emojiSourceManifest;
  const codepoints = readJsonFileSync(
    path.join(directory, manifest.files?.codepoints ?? "codepoints.json"),
  );
  const lookups = readJsonFileSync(
    path.join(directory, manifest.files?.lookups ?? "lookups.json"),
  );
  const catalog = readJsonFileSync(
    path.join(directory, manifest.files?.catalog ?? "catalog.json"),
  );
  return parseSplitEmojiSourceData({
    codepoints,
    lookups,
    ...catalog,
  });
};

export const writeCompactEmojiDataSync = (file, records) => {
  fs.writeFileSync(
    file,
    `${JSON.stringify(compactEmojiData(records))}\n`,
    "utf8",
  );
};

const writeJsonFileSync = (file, value, spaces = 0) => {
  fs.writeFileSync(file, `${JSON.stringify(value, null, spaces)}\n`, "utf8");
};

export const writeEmojiSourceSync = (directory, records) => {
  const source = splitEmojiSourceData(records);
  const statusIndex = new Map(
    source.lookups.statuses.map((value, index) => [value, index]),
  );
  const groupIndex = new Map(
    source.lookups.groups.map((value, index) => [value, index]),
  );
  const subGroupIndex = new Map(
    source.lookups.subGroups.map((value, index) => [value, index]),
  );
  const sequenceTypeIndex = new Map(
    source.lookups.sequenceTypes.map((value, index) => [value, index]),
  );
  source.catalog = Object.fromEntries(
    records.map((item) => [
      item.key,
      [
        statusIndex.get(item.status),
        item.shortName,
        groupIndex.get(item.group),
        subGroupIndex.get(item.subGroup),
        item.order,
        sequenceTypeIndex.get(item.sequenceType),
      ],
    ]),
  );
  fs.mkdirSync(directory, { recursive: true });
  writeJsonFileSync(
    path.join(directory, "emoji-source.json"),
    emojiSourceManifest,
    2,
  );
  writeJsonFileSync(path.join(directory, "codepoints.json"), source.codepoints, 2);
  writeJsonFileSync(path.join(directory, "lookups.json"), source.lookups, 2);
  writeJsonFileSync(
    path.join(directory, "catalog.json"),
    {
      schemaVersion: source.schemaVersion,
      catalog: source.catalog,
    },
    2,
  );
};
