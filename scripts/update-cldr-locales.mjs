import fs from 'node:fs';
import path from 'node:path';

const defaultLocales = ['en', 'en-US', 'en-GB', 'es', 'hi', 'hi-IN', 'zh', 'zh-CN', 'ar'];
const cldrVersion = process.env.CLDR_VERSION ?? '48.2.0';
const cldrSourceTag = `release-${cldrVersion.split('.').slice(0, 2).join('-')}`;
const requestedLocales = process.argv.slice(2).filter(argument => !argument.startsWith('--'));
const requestedOrDefaultLocales = requestedLocales.length > 0 ? requestedLocales : defaultLocales;
// A regional pack is an overlay, so always generate its base pack first. This
// also makes `npm run cldr -- en-US` self-contained and comparable.
const locales = [...new Set(requestedOrDefaultLocales.flatMap(locale => {
  const baseLocale = locale.split('-')[0];
  return baseLocale === locale ? [locale] : [baseLocale, locale];
}))];
const emoji = JSON.parse(fs.readFileSync('emoji.json', 'utf8'));
const customSubgroupLabels = JSON.parse(fs.readFileSync('scripts/locale-label-overrides.json', 'utf8'));
const outputDirectory = 'locales';
const manifestFile = path.join(outputDirectory, 'manifest.json');
const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
const nativeDisplayName = locale => new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
const rtlLocales = new Set(['ar', 'he', 'fa', 'ur']);

const sourceUrl = (packageName, directory, locale) =>
  `https://raw.githubusercontent.com/unicode-org/cldr-json/${cldrVersion}/cldr-json/${packageName}/${directory}/${locale}/annotations.json`;
const characterLabelsUrl = locale =>
  `https://raw.githubusercontent.com/unicode-org/cldr/${cldrSourceTag}/common/main/${locale}.xml`;
const fetchJson = async url => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};
const fetchText = async url => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  return response.text();
};
const fetchOptionalJson = async (packageName, directory, locale) => {
  try {
    return await fetchJson(sourceUrl(packageName, directory, locale));
  } catch (error) {
    if (error.status !== 404) throw error;
    return null;
  }
};
const fetchOptionalText = async url => {
  try {
    return await fetchText(url);
  } catch (error) {
    if (error.status !== 404) throw error;
    return null;
  }
};
const annotationsFrom = data => data.annotations?.annotations ?? data.annotationsDerived?.annotations ?? {};
const decodeXml = value => value
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");
const characterLabelsFrom = xml => {
  const labels = {};
  const section = xml?.match(/<characterLabels>([\s\S]*?)<\/characterLabels>/)?.[1] ?? '';
  for (const match of section.matchAll(/<characterLabel type="([^"]+)"[^>]*>([\s\S]*?)<\/characterLabel>/g)) {
    labels[match[1]] = decodeXml(match[2].trim());
  }
  return labels;
};

fs.mkdirSync(outputDirectory, { recursive: true });
const existingManifest = fs.existsSync(manifestFile)
  ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  : { locales: [] };
const manifest = new Map(existingManifest.locales.map(locale => [locale.locale, locale]));

for (const locale of locales) {
  if (!/^[a-z]{2,3}(?:-[A-Z][a-z]{3}|-[A-Z]{2})?$/.test(locale)) {
    throw new Error(`Invalid locale code: ${locale}`);
  }
  console.info(`Downloading CLDR ${cldrVersion} annotations for ${locale}`);
  const baseLocale = locale.split('-')[0];
  const [baseAnnotations, baseDerivedAnnotations, annotations, derivedAnnotations, baseLabelsXml, labelsXml] = await Promise.all([
    fetchJson(sourceUrl('cldr-annotations-full', 'annotations', baseLocale)),
    fetchJson(sourceUrl('cldr-annotations-derived-full', 'annotationsDerived', baseLocale)),
    baseLocale === locale ? null : fetchOptionalJson('cldr-annotations-full', 'annotations', locale),
    baseLocale === locale ? null : fetchOptionalJson('cldr-annotations-derived-full', 'annotationsDerived', locale),
    fetchText(characterLabelsUrl(baseLocale)),
    baseLocale === locale ? null : fetchOptionalText(characterLabelsUrl(locale))
  ]);
  const baseSource = {
    ...annotationsFrom(baseDerivedAnnotations),
    ...annotationsFrom(baseAnnotations)
  };
  const source = {
    ...baseSource,
    ...annotationsFrom(derivedAnnotations ?? {}),
    ...annotationsFrom(annotations ?? {})
  };
  const entries = {};
  const baseEntries = {};
  for (const item of emoji) {
    const annotation = source[item.emoji];
    const termsFor = value => [...new Set([...(value?.tts ?? []), ...(value?.default ?? [])]
      .map(term => term.trim())
      .filter(Boolean))];
    const terms = termsFor(annotation);
    if (terms.length > 0) entries[item.key] = terms;
    const baseTerms = termsFor(baseSource[item.emoji]);
    if (baseTerms.length > 0) baseEntries[item.key] = baseTerms;
  }
  const annotationsToWrite = baseLocale === locale
    ? entries
    : Object.fromEntries(Object.entries(entries).filter(([key, terms]) => JSON.stringify(terms) !== JSON.stringify(baseEntries[key])));
  const baseLabels = characterLabelsFrom(baseLabelsXml);
  const labels = { ...baseLabels, ...characterLabelsFrom(labelsXml) };
  const labelsToWrite = baseLocale === locale
    ? labels
    : Object.fromEntries(Object.entries(labels).filter(([key, label]) => label !== baseLabels[key]));
  const baseSubgroups = customSubgroupLabels[baseLocale] ?? {};
  const subgroups = { ...baseSubgroups, ...(customSubgroupLabels[locale] ?? {}) };
  const subgroupsToWrite = baseLocale === locale
    ? subgroups
    : Object.fromEntries(Object.entries(subgroups).filter(([key, label]) => label !== baseSubgroups[key]));
  const file = `${locale}.json`;
  if (baseLocale !== locale && Object.keys(annotationsToWrite).length === 0 && Object.keys(labelsToWrite).length === 0 && Object.keys(subgroupsToWrite).length === 0) {
    fs.rmSync(path.join(outputDirectory, file), { force: true });
    manifest.delete(locale);
    console.info(`No ${locale}-specific CLDR data is available; omitted ${path.join(outputDirectory, file)} and use ${baseLocale} instead`);
    continue;
  }
  fs.writeFileSync(path.join(outputDirectory, file), `${JSON.stringify({
    locale,
    ...(baseLocale === locale ? {} : { baseLocale }),
    label: displayNames.of(locale) ?? locale,
    nativeLabel: nativeDisplayName(locale),
    rtl: rtlLocales.has(baseLocale),
    cldrVersion,
    annotations: annotationsToWrite,
    labels: labelsToWrite,
    subgroups: subgroupsToWrite
  }, null, 2)}\n`);
  manifest.set(locale, {
    locale,
    label: displayNames.of(locale) ?? locale,
    nativeLabel: nativeDisplayName(locale),
    rtl: rtlLocales.has(baseLocale),
    file,
    ...(baseLocale === locale ? {} : { baseLocale }),
    count: Object.keys(annotationsToWrite).length,
    totalCount: Object.keys(entries).length,
    characterLabelCount: Object.keys(labelsToWrite).length,
    totalCharacterLabelCount: Object.keys(labels).length,
    subgroupLabelCount: Object.keys(subgroupsToWrite).length,
    totalSubgroupLabelCount: Object.keys(subgroups).length,
    cldrVersion
  });
  console.info(`Wrote ${Object.keys(annotationsToWrite).length} CLDR annotations and ${Object.keys(labelsToWrite).length} character labels to ${path.join(outputDirectory, file)}`);
}

fs.writeFileSync(manifestFile, `${JSON.stringify({
  locales: [...manifest.values()].sort((left, right) => left.locale.localeCompare(right.locale))
}, null, 2)}\n`);
