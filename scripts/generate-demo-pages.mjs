import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteUrl = 'https://lewismoten.github.io/emoji/';
export const locales = ['en', 'en-GB', 'es', 'hi', 'zh', 'ar'];
const rtlLocales = new Set(['ar']);
const template = fs.readFileSync('index.html', 'utf8');
const english = JSON.parse(fs.readFileSync('demo-locales/en.json', 'utf8'));
const localeManifest = JSON.parse(fs.readFileSync('locales/manifest.json', 'utf8'));
const localeMetadata = new Map(localeManifest.locales.map(locale => [locale.locale, locale]));
const languageFlags = {
  ar: '🇸🇦',
  en: '🇺🇸',
  'en-GB': '🇬🇧',
  'en-US': '🇺🇸',
  es: '🇪🇸',
  hi: '🇮🇳',
  zh: '🇨🇳'
};

const pageUrl = locale => `${siteUrl}index.${locale}.html`;
const escapeHtml = value => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const translationsFor = locale => {
  const base = locale.split('-')[0];
  const baseTranslations = base === 'en'
    ? english
    : JSON.parse(fs.readFileSync(`demo-locales/${base}.json`, 'utf8'));
  const regionalFile = `demo-locales/${locale}.json`;
  const regionalTranslations = locale === base || !fs.existsSync(regionalFile)
    ? {}
    : JSON.parse(fs.readFileSync(regionalFile, 'utf8'));
  return { ...english, ...baseTranslations, ...regionalTranslations };
};
const alternates = [
  `  <link rel="alternate" hreflang="x-default" href="${siteUrl}">`,
  `  <link rel="alternate" hreflang="en-US" href="${siteUrl}">`,
  ...locales.map(locale => `  <link rel="alternate" hreflang="${locale}" href="${pageUrl(locale)}">`)
].join('\n');

export const renderPage = (locale, url, htmlLocale = locale, dataLocale = locale) => {
  const translations = translationsFor(locale);
  const title = `${translations.title} – Unicode Emoji`;
  const description = translations.aboutDescription;
  const localeDetails = localeMetadata.get(dataLocale) ?? localeMetadata.get(locale);
  const initialFlag = languageFlags[htmlLocale] ?? languageFlags[dataLocale] ?? '🌐';
  const initialLanguageLabel = localeDetails?.nativeLabel ?? translations.languageNotLoaded;
  const initialMatchCount = new Intl.NumberFormat(htmlLocale, htmlLocale.startsWith('ar')
    ? { numberingSystem: 'arab' }
    : {}).format(0);
  return template
    .replace(/^  <link rel="alternate" hreflang="[^"]+" href="[^"]+">\n/gm, '')
    .replace('<html lang="en">', `<html lang="${htmlLocale}" dir="${rtlLocales.has(htmlLocale) ? 'rtl' : 'ltr'}" data-locale="${dataLocale}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url}">\n${alternates}`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(description)}">`)
    .replace(/"url": "https:\/\/lewismoten\.github\.io\/emoji\/"/, `"url": "${url}"`)
    .replace('"name": "Emoji Explorer"', `"name": ${JSON.stringify(translations.title)}`)
    .replace(/"description": "A localized Unicode emoji explorer[^"]*"/, `"description": ${JSON.stringify(description)}`)
    .replace(/(<[^>]+data-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/g, (match, opening, key, contents, closing) =>
      `${opening}${escapeHtml(translations[key] ?? contents)}${closing}`)
    .replace(/(<[^>]+data-i18n-placeholder="([^"]+)"[^>]*placeholder=")[^"]*(")/g, (match, opening, key, closing) =>
      `${opening}${escapeHtml(translations[key] ?? '')}${closing}`)
    .replace(/(<[^>]+data-i18n-aria-label="([^"]+)"[^>]*aria-label=")[^"]*(")/g, (match, opening, key, closing) =>
      `${opening}${escapeHtml(translations[key] ?? '')}${closing}`)
    .replace(/(<bdi class="match-count">)[^<]*(<\/bdi>)/, `$1${escapeHtml(initialMatchCount)}$2`)
    .replace(/(<span class="language-picker-flag"[^>]*>)[^<]*(<\/span>)/, `$1${initialFlag}$2`)
    .replace(/(<span class="language-picker-label">)[^<]*(<\/span>)/, `$1${escapeHtml(initialLanguageLabel)}$2`);
};

export const generateDemoPages = (outputDirectory = '.') => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  fs.writeFileSync(path.join(outputDirectory, 'index.html'), renderPage('en', siteUrl, 'en-US', 'en'));
  for (const locale of locales) {
    fs.writeFileSync(path.join(outputDirectory, `index.${locale}.html`), renderPage(locale, pageUrl(locale)));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}</loc></url>
${locales.map(locale => `  <url><loc>${pageUrl(locale)}</loc></url>`).join('\n')}
</urlset>\n`;
  fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), sitemap);

  console.info(`Generated the en-US root and ${locales.length} localized demo pages in ${outputDirectory}.`);
};

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateDemoPages(process.argv[2] ?? '.');
}
