import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultSiteUrl = 'https://lewismoten.github.io/emoji/';
const normalizeSiteUrl = value => `${value.replace(/\/+$/, '')}/`;
const siteUrl = normalizeSiteUrl(
  process.env.EMOJI_SITE_URL ?? defaultSiteUrl
);
export const locales = ['en', 'en-GB', 'es', 'hi', 'zh', 'ar'];
const rtlLocales = new Set(['ar']);
const template = fs.readFileSync('index.html', 'utf8');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const assetVersion = packageJson.version;
const deployedScript = fs
  .readFileSync('index.js', 'utf8')
  .replace(
    "import('./pixel-editor.js')",
    `import('./pixel-editor.js?v=${assetVersion}')`
  );
const english = JSON.parse(fs.readFileSync('demo-locales/en.json', 'utf8'));
const webAppManifest = JSON.parse(
  fs.readFileSync('manifest.webmanifest', 'utf8')
);
const localeManifest = JSON.parse(
  fs.readFileSync('locales/manifest.json', 'utf8')
);
const localeMetadata = new Map(
  localeManifest.locales.map(locale => [locale.locale, locale])
);
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
const manifestFile = locale =>
  locale ? `manifest.${locale}.webmanifest` : 'manifest.webmanifest';
const escapeHtml = value =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const translationsFor = locale => {
  const base = locale.split('-')[0];
  const baseTranslations =
    base === 'en'
      ? english
      : JSON.parse(fs.readFileSync(`demo-locales/${base}.json`, 'utf8'));
  const regionalFile = `demo-locales/${locale}.json`;
  const regionalTranslations =
    locale === base || !fs.existsSync(regionalFile)
      ? {}
      : JSON.parse(fs.readFileSync(regionalFile, 'utf8'));
  return { ...english, ...baseTranslations, ...regionalTranslations };
};
const alternates = [
  `  <link rel="alternate" hreflang="x-default" href="${siteUrl}">`,
  `  <link rel="alternate" hreflang="en-US" href="${siteUrl}">`,
  ...locales.map(
    locale =>
      `  <link rel="alternate" hreflang="${locale}" href="${pageUrl(locale)}">`
  )
].join('\n');

export const renderPage = (
  locale,
  url,
  htmlLocale = locale,
  dataLocale = locale,
  manifestLocale = locale
) => {
  const translations = translationsFor(locale);
  const title = `${translations.title} – Pixel Emoji & Unicode`;
  const description = `${translations.pixelHeroDescription} ${translations.aboutDescription}`;
  const localeDetails =
    localeMetadata.get(dataLocale) ?? localeMetadata.get(locale);
  const initialFlag =
    languageFlags[htmlLocale] ?? languageFlags[dataLocale] ?? '🌐';
  const initialLanguageLabel =
    localeDetails?.nativeLabel ?? translations.languageNotLoaded;
  const initialMatchCount = new Intl.NumberFormat(
    htmlLocale,
    htmlLocale.startsWith('ar') ? { numberingSystem: 'arab' } : {}
  ).format(0);
  return template
    .replaceAll(defaultSiteUrl, siteUrl)
    .replace(
      /<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang="[^"]+")[^>]*\/?>\s*/g,
      ''
    )
    .replace(
      /<html lang="en"([^>]*)>/,
      `<html lang="${htmlLocale}"$1 dir="${rtlLocales.has(htmlLocale) ? 'rtl' : 'ltr'}" data-locale="${dataLocale}">`
    )
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<script\b(?=[^>]*\bsrc="\.\/index\.js")[^>]*><\/script>/,
      `<script defer src="./index.js?v=${assetVersion}" type="module"></script>`
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/index\.css\?direct")[^>]*\/?>/,
      `<link rel="stylesheet" href="./index.css?direct&v=${assetVersion}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bname="application-name")[^>]*\/?>/,
      `<meta name="application-name" content="${escapeHtml(translations.title)}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bname="apple-mobile-web-app-title")[^>]*\/?>/,
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(translations.title)}">`
    )
    .replace(
      /<link\b(?=[^>]*\brel="manifest")(?=[^>]*\bhref="\.\/manifest\.webmanifest")[^>]*\/?>/,
      `<link rel="manifest" href="./${manifestFile(manifestLocale)}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bname="description")[^>]*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}">`
    )
    .replace(
      /<link\b(?=[^>]*\brel="canonical")[^>]*\/?>/,
      `<link rel="canonical" href="${url}">\n${alternates}`
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:title")[^>]*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:description")[^>]*\/?>/,
      `<meta property="og:description" content="${escapeHtml(description)}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:url")[^>]*\/?>/,
      `<meta property="og:url" content="${url}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bname="twitter:title")[^>]*\/?>/,
      `<meta name="twitter:title" content="${escapeHtml(title)}">`
    )
    .replace(
      /<meta\b(?=[^>]*\bname="twitter:description")[^>]*\/?>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`
    )
    .replace(
      /"url": "https:\/\/lewismoten\.github\.io\/emoji\/"/,
      `"url": "${url}"`
    )
    .replace(
      '"name": "Emoji Explorer"',
      `"name": ${JSON.stringify(translations.title)}`
    )
    .replace(
      /("alternateName": "@lewismoten\/emoji",[\s\S]*?"description": )"[^"]*"/,
      `$1${JSON.stringify(description)}`
    )
    .replace(
      /(<[^>]+data-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/g,
      (match, opening, key, contents, closing) =>
        `${opening}${escapeHtml(translations[key] ?? contents)}${closing}`
    )
    .replace(
      /(<[^>]+data-i18n-placeholder="([^"]+)"[^>]*placeholder=")[^"]*(")/g,
      (match, opening, key, closing) =>
        `${opening}${escapeHtml(translations[key] ?? '')}${closing}`
    )
    .replace(
      /(<[^>]+data-i18n-aria-label="([^"]+)"[^>]*aria-label=")[^"]*(")/g,
      (match, opening, key, closing) =>
        `${opening}${escapeHtml(translations[key] ?? '')}${closing}`
    )
    .replace(
      /(<bdi\b(?=[^>]*\bclass="match-count")[^>]*>)[^<]*(<\/bdi>)/,
      `$1${escapeHtml(initialMatchCount)}$2`
    )
    .replace(
      /(<span\b(?=[^>]*\bclass="language-picker-flag")[^>]*>)[^<]*(<\/span>)/,
      `$1${initialFlag}$2`
    )
    .replace(
      /(<span\b(?=[^>]*\bclass="language-picker-label")[^>]*>)[^<]*(<\/span>)/,
      `$1${escapeHtml(initialLanguageLabel)}$2`
    );
};

export const renderManifest = (locale, startUrl, htmlLocale = locale) => {
  const translations = translationsFor(locale);
  return `${JSON.stringify(
    {
      ...webAppManifest,
      name: translations.title,
      short_name: translations.title,
      description: translations.aboutDescription,
      lang: htmlLocale,
      dir: rtlLocales.has(htmlLocale) ? 'rtl' : 'ltr',
      start_url: startUrl,
      screenshots: webAppManifest.screenshots?.map(screenshot => ({
        ...screenshot,
        label: translations.aboutTitle
      }))
    },
    null,
    2
  )}\n`;
};

export const generateDemoPages = (outputDirectory = '.') => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  if (path.resolve(outputDirectory) !== process.cwd()) {
    fs.writeFileSync(path.join(outputDirectory, 'index.js'), deployedScript);
  }
  fs.writeFileSync(
    path.join(outputDirectory, 'index.html'),
    renderPage('en', siteUrl, 'en-US', 'en', '')
  );
  fs.writeFileSync(
    path.join(outputDirectory, 'manifest.webmanifest'),
    renderManifest('en', './', 'en-US')
  );
  for (const locale of locales) {
    fs.writeFileSync(
      path.join(outputDirectory, `index.${locale}.html`),
      renderPage(locale, pageUrl(locale))
    );
    fs.writeFileSync(
      path.join(outputDirectory, manifestFile(locale)),
      renderManifest(locale, `./index.${locale}.html`)
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}</loc></url>
${locales.map(locale => `  <url><loc>${pageUrl(locale)}</loc></url>`).join('\n')}
</urlset>\n`;
  fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), sitemap);
  fs.writeFileSync(
    path.join(outputDirectory, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`
  );

  console.info(
    `Generated the en-US root and ${locales.length} localized demo pages in ${outputDirectory}.`
  );
};

if (path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generateDemoPages(process.argv[2] ?? '.');
}
