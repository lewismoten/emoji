import fs from "node:fs/promises";
import path from "node:path";
import { readEmojiJson } from "./emoji-data.mjs";

export type Emoji = {
  key: string;
  emoji: string;
  codePoints: string;
  group: string;
  subGroup?: string;
  order: number;
  sequenceType: string;
  shortName?: string;
  status?: string;
};

export type Version = {
  version: string;
  file: string;
  count: number;
};

export type ProposedVersion = Version & {
  status: "draft";
  released: null;
};

export type PixelAtlasManifest = {
  layout: string;
  author: string;
  url: string;
  cellSize: number;
  cellPadding: number;
  slotSize: number;
  columns: number;
  maxRows: number;
  activeGlyphCount: number;
  releasedGlyphCount: number;
  proposedGlyphCount: number;
  proposedVersions: {
    version: string;
    status: string;
    stage: string;
    expectedRelease: string | null;
    count: number;
  }[];
  baseGlyphCount: number;
  modifierGlyphCount: number;
  modifierTypeCounts: Record<string, number>;
  groupCount: number;
  subGroupCount: number;
  sheets: {
    id: string;
    image: string;
    modifierType: string;
    releaseStatus?: string;
    unicodeVersion?: string;
    group: string;
    subGroup: string;
    rows: number;
    imageWidth: number;
    imageHeight: number;
    assignedCount: number;
  }[];
};

export const root = path.resolve(process.cwd());

export const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), "utf8")) as T;

export const emoji = (await readEmojiJson(root)) as Emoji[];
export const explorerCatalog = await readJson<{
  fields: string[];
  emoji: unknown[][];
}>("explorer/catalog.json");
export const orderManifest = await readJson<{ unicode: string[] }>(
  "orders/manifest.json",
);
export const manifest = await readJson<{
  versions: Version[];
  proposed?: ProposedVersion[];
}>("versions/manifest.json");
export const pixelAtlasManifest = await readJson<PixelAtlasManifest>(
  "pixel-font/atlases/manifest.json",
);
export const packageJson = await readJson<{
  version: string;
  scripts: Record<string, string>;
}>("package.json");
export const pixelFontConfig = await readJson<{
  fontVersion: string;
  packageName: string;
  embeddingPermissions: string;
}>("pixel-font/config.json");
const readFirstAvailable = async (files: string[]) => {
  for (const file of files) {
    try {
      return await fs.readFile(path.join(root, file), "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  throw new Error(`Unable to read any fixture variant: ${files.join(", ")}`);
};

export const arabicDemo = await readFirstAvailable([
  "build/demo-pages/index.ar.html",
  "index.ar.html",
]);
export const demoHtml = await fs.readFile(
  path.join(root, "src", "site", "index.html"),
  "utf8",
);
export const demoStyles = (
  await Promise.all([
    fs.readFile(path.join(root, "src", "site", "themes", "dark.css"), "utf8"),
    fs.readFile(path.join(root, "src", "site", "themes", "light.css"), "utf8"),
    fs.readFile(path.join(root, "src", "site", "themes", "ega.css"), "utf8"),
    fs.readFile(
      path.join(root, "src", "site", "themes", "retro", "retro.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(
        root,
        "src",
        "site",
        "themes",
        "retro",
        "retro-foundation.css",
      ),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "themes", "retro", "retro-dialogs.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "themes", "retro", "retro-buttons.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "themes", "retro", "retro-forms.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "themes", "retro", "retro-focus.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "styles", "toolbar-controls.css"),
      "utf8",
    ),
    fs.readFile(
      path.join(root, "src", "site", "styles", "dialog-controls.css"),
      "utf8",
    ),
    fs.readFile(path.join(root, "src", "site", "index.css"), "utf8"),
  ])
).join("\n");
