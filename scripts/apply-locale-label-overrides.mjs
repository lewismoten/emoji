import fs from 'node:fs';
import path from 'node:path';

const outputDirectory = 'locales';
const overrides = JSON.parse(fs.readFileSync('scripts/locale-label-overrides.json', 'utf8'));
const manifestPath = path.join(outputDirectory, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const sorted = entries => Object.fromEntries(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));

for (const entry of manifest.locales) {
  const localePath = path.join(outputDirectory, entry.file);
  const pack = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const baseLocale = entry.baseLocale ?? entry.locale;
  if (!entry.baseLocale) pack.subgroups = sorted(overrides[entry.locale] ?? {});
  entry.subgroupLabelCount = Object.keys(pack.subgroups ?? {}).length;
  entry.totalSubgroupLabelCount = Object.keys(overrides[baseLocale] ?? {}).length;
  fs.writeFileSync(localePath, `${JSON.stringify(pack, null, 2)}\n`);
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.info(`Applied complete Unicode subgroup labels for ${Object.keys(overrides).length} base locales.`);
