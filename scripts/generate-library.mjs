import fs from 'node:fs';
import path from 'node:path';

const sourceDirectory = 'library';
const emoji = JSON.parse(fs.readFileSync('emoji.json', 'utf8'));
const popular = JSON.parse(fs.readFileSync('popular.json', 'utf8'));

const clean = directory => fs.rmSync(directory, { recursive: true, force: true });
const write = (file, contents) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${contents}\n`, 'utf8');
};
const slug = text => text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const pack = (file, items) => {
  const relative = key => path.relative(path.dirname(file), path.join(sourceDirectory, 'individual', key)).replaceAll('\\\\', '/').replace(/^([^./])/, './$1');
  const lines = items.map(({ key }, index) => `import value${index} from '${relative(key)}';`);
  lines.push('', `export default { ${items.map(({ key }, index) => `${JSON.stringify(key)}: value${index}`).join(', ')} } as const;`);
  write(file, lines.join('\n'));
};

clean(sourceDirectory);

for (const item of emoji) {
  write(
    path.join(sourceDirectory, 'individual', `${item.key}.ts`),
    `/** ${item.shortName} */\nexport default "${item.value}" as const;`
  );
}

const byKey = new Map(emoji.map(item => [item.key, item]));
const popularItems = popular.map(key => {
  const item = byKey.get(key);
  if (!item) throw new Error(`Unknown popular emoji: ${key}`);
  return item;
});
pack(path.join(sourceDirectory, 'popular.ts'), popularItems);
pack(path.join(sourceDirectory, 'all.ts'), emoji);

for (const group of [...new Set(emoji.map(item => item.group))]) {
  pack(path.join(sourceDirectory, 'categories', `${slug(group)}.ts`), emoji.filter(item => item.group === group));
}

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

console.log(`Generated ${emoji.length} individual modules, 10 categories, and ${Object.keys(variationPacks).length} variation packs.`);
