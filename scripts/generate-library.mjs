import fs from 'node:fs';
import path from 'node:path';

const sourceDirectory = 'library';
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const emoji = JSON.parse(fs.readFileSync('emoji.json', 'utf8'));
const popular = JSON.parse(fs.readFileSync('popular.json', 'utf8'));

const clean = directory => fs.rmSync(directory, { recursive: true, force: true });
const write = (file, contents) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${contents}\n`, 'utf8');
};
const slug = text => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const pack = (file, items) => {
  const lines = [
    'export default {',
    ...items.map(item => `  /** ${item.shortName} */\n  ${JSON.stringify(item.key)}: "${item.value}" as const,`),
    '} as const;'
  ];
  write(file, lines.join('\n'));
};

clean(sourceDirectory);

const byKey = new Map(emoji.map(item => [item.key, item]));
const popularItems = popular.map(key => {
  const item = byKey.get(key);
  if (!item) throw new Error(`Unknown popular emoji: ${key}`);
  return item;
});
pack(path.join(sourceDirectory, 'popular.ts'), popularItems);
pack(path.join(sourceDirectory, 'all.ts'), emoji);

const categories = [...new Set(emoji.map(item => item.group))].map(label => {
  const id = slug(label);
  const items = emoji.filter(item => item.group === label);
  pack(path.join(sourceDirectory, 'categories', `${id}.ts`), items);
  return {
    id,
    label,
    count: items.length,
    importPath: `${packageJson.name}/categories/${id}`
  };
});

const skinTone = item => /1F3F[B-F]/i.test(item.codePoints);
const hair = item => /1F9B[0-3]/i.test(item.codePoints);
const family = item => item.shortName.toLowerCase().startsWith('family:');
const variationPacks = {
  'skin-tones': emoji.filter(skinTone),
  hair: emoji.filter(hair),
  families: emoji.filter(family),
  all: emoji.filter(item => skinTone(item) || hair(item) || family(item))
};
for (const [name, items] of Object.entries(variationPacks)) {
  pack(path.join(sourceDirectory, 'variations', `${name}.ts`), items);
}

write('manifest.json', JSON.stringify({
  name: packageJson.name,
  packs: [
    { id: 'popular', label: 'Popular', count: popularItems.length, importPath: packageJson.name },
    { id: 'all', label: 'All emoji', count: emoji.length, importPath: `${packageJson.name}/all` }
  ],
  categories,
  variations: [
    { id: 'skin-tones', label: 'Skin tones', count: variationPacks['skin-tones'].length, importPath: `${packageJson.name}/variations/skin-tones` },
    { id: 'hair', label: 'Hair styles', count: variationPacks.hair.length, importPath: `${packageJson.name}/variations/hair` },
    { id: 'families', label: 'Families', count: variationPacks.families.length, importPath: `${packageJson.name}/variations/families` },
    { id: 'all', label: 'All variations', count: variationPacks.all.length, importPath: `${packageJson.name}/variations/all` }
  ]
}, null, 2));

console.log(`Generated ${emoji.length} emoji across popular, all, ${categories.length} categories, and ${Object.keys(variationPacks).length} variation packs.`);
