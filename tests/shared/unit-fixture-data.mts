import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type Emoji = {
  key: string;
  emoji: string;
  codePoints: string;
  group: string;
  order: number;
  sequenceType: string;
};

export type Version = {
  version: string;
  file: string;
  count: number;
};

export type ProposedVersion = Version & {
  status: 'draft';
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
    image: string;
    mapping: string;
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

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);

export const readJson = async <T,>(file: string) =>
  JSON.parse(await fs.readFile(path.join(root, file), 'utf8')) as T;

export const emoji = await readJson<Emoji[]>('emoji.json');
export const explorerCatalog = await readJson<{
  fields: string[];
  emoji: unknown[][];
}>('explorer/catalog.json');
export const orderManifest = await readJson<{ unicode: string[] }>(
  'orders/manifest.json'
);
export const manifest = await readJson<{
  versions: Version[];
  proposed?: ProposedVersion[];
}>('versions/manifest.json');
export const pixelAtlasManifest = await readJson<PixelAtlasManifest>(
  'pixel-font/atlases/manifest.json'
);
export const packageJson = await readJson<{
  version: string;
  scripts: Record<string, string>;
}>('package.json');
export const pixelFontConfig = await readJson<{
  fontVersion: string;
  packageName: string;
  embeddingPermissions: string;
}>('pixel-font/config.json');
export const arabicDemo = await fs.readFile(
  path.join(root, 'build/demo-pages/index.ar.html'),
  'utf8'
);
export const demoHtml = await fs.readFile(path.join(root, 'index.html'), 'utf8');
export const demoStyles = await fs.readFile(path.join(root, 'index.css'), 'utf8');
