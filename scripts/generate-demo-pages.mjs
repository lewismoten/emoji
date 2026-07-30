import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateSiteIcons } from "./generate-site-icons.mjs";
import {
  renderSvgAssets,
  syncSvgSmileysFromAtlas,
} from "./render-svg-assets.mjs";
import { compileTypeScriptSources } from "./transpile-typescript.mjs";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const defaultSiteUrl = "https://lewismoten.github.io/emoji/";
const normalizeSiteUrl = (value) => `${value.replace(/\/+$/, "")}/`;
const siteUrl = normalizeSiteUrl(process.env.EMOJI_SITE_URL ?? defaultSiteUrl);
export const locales = ["en", "en-GB", "en-x-newspeak", "es", "hi", "zh", "ar"];
const rtlLocales = new Set(["ar"]);
const siteSourceDirectory = path.join(projectRoot, "src", "site");
const pwaSourceDirectory = path.join(siteSourceDirectory, "pwa");
const template = fs.readFileSync(
  path.join(siteSourceDirectory, "index.html"),
  "utf8",
);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const assetVersion = packageJson.version;
const english = JSON.parse(
  fs.readFileSync(path.join("src", "demo-locales", "ui.en.json"), "utf8"),
);
const webAppManifest = JSON.parse(
  fs.readFileSync(
    path.join(pwaSourceDirectory, "manifest.webmanifest"),
    "utf8",
  ),
);
const pixelFontRevision = createHash("sha256")
  .update(fs.readFileSync("pixel-font/build/font/pixel-emoji.css"))
  .update(fs.readFileSync("pixel-font/build/explorer-manifest.json"))
  .digest("hex")
  .slice(0, 12);
const retroTextRevision = fs.existsSync(
  "pixel-font/build-retro-text/pixel-latin-retro.css",
)
  ? createHash("sha256")
      .update(
        fs.readFileSync("pixel-font/build-retro-text/pixel-latin-retro.css"),
      )
      .update(
        fs.readFileSync("pixel-font/build-retro-text/pixel-latin-retro.woff2"),
      )
      .digest("hex")
      .slice(0, 12)
  : "dev";
const localeManifest = JSON.parse(
  fs.readFileSync(path.join("src", "data", "locales", "manifest.json"), "utf8"),
);
const runtimeLocalesDirectory = path.join("src", "data", "locales");
const runtimeDemoLocalesDirectory = path.join("src", "demo-locales");
const localeMetadata = new Map(
  localeManifest.locales.map((locale) => [locale.locale, locale]),
);
const languageFlags = {
  ar: "🇸🇦",
  en: "🇺🇸",
  "en-GB": "🇬🇧",
  "en-x-newspeak": "👁️",
  "en-US": "🇺🇸",
  es: "🇪🇸",
  hi: "🇮🇳",
  zh: "🇨🇳",
};

const pageUrl = (locale) => `${siteUrl}index.${locale}.html`;
const manifestFile = (locale) =>
  locale ? `manifest.${locale}.webmanifest` : "manifest.webmanifest";
const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const translationsFor = (locale) => {
  const base = locale.split("-")[0];
  const baseTranslations =
    base === "en"
      ? english
      : JSON.parse(
          fs.readFileSync(
            path.join(runtimeDemoLocalesDirectory, `ui.${base}.json`),
            "utf8",
          ),
        );
  const regionalFile = path.join(
    runtimeDemoLocalesDirectory,
    `ui.${locale}.json`,
  );
  const regionalTranslations =
    locale === base || !fs.existsSync(regionalFile)
      ? {}
      : JSON.parse(fs.readFileSync(regionalFile, "utf8"));
  return { ...english, ...baseTranslations, ...regionalTranslations };
};
const alternates = [
  `  <link rel="alternate" hreflang="x-default" href="${siteUrl}">`,
  `  <link rel="alternate" hreflang="en-US" href="${siteUrl}">`,
  ...locales.map(
    (locale) =>
      `  <link rel="alternate" hreflang="${locale}" href="${pageUrl(locale)}">`,
  ),
].join("\n");
const topLevelRuntimeSources = fs
  .readdirSync("src")
  .filter(
    (file) =>
      (file.endsWith(".ts") || file.endsWith(".js")) &&
      file !== "explorer.tsconfig.json",
  )
  .sort((left, right) => left.localeCompare(right, "en"));
const appRuntimeSources = fs
  .readdirSync(path.join("src", "app"))
  .filter((file) => file.endsWith(".ts"))
  .sort((left, right) => left.localeCompare(right, "en"));
const explorerRuntimeSources = fs
  .readdirSync(path.join("src", "explorer"))
  .filter((file) => file.endsWith(".ts"))
  .sort((left, right) => left.localeCompare(right, "en"));
const listRuntimeFiles = (directory) =>
  fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const relative = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listRuntimeFiles(relative)
        : entry.name.endsWith(".ts")
          ? [relative]
          : [];
    })
    .sort((left, right) => left.localeCompare(right, "en"));
const pixelEditorRuntimeSources = listRuntimeFiles(
  path.join("src", "pixel-editor"),
);
const staticSiteAssets = [
  {
    source: path.join(siteSourceDirectory, "favicon.svg"),
    target: "favicon.svg",
  },
  {
    source: path.join(siteSourceDirectory, "offline.html"),
    target: "offline.html",
  },
  {
    source: pwaSourceDirectory,
    target: "pwa",
    directory: true,
  },
];
const prepareDeployedScript = (source) =>
  source
    .replace(
      /import\((['"])(\.+)\/pixel-editor\.js\1\)/g,
      `import('$2/pixel-editor.js?v=${assetVersion}')`,
    )
    .replace(
      /(['"])\.\/explorer\/pixel-editor\.css\1/g,
      `'./explorer/pixel-editor.css?v=${assetVersion}'`,
    );
syncSvgSmileysFromAtlas();
renderSvgAssets();
const compiledTypeScript = compileTypeScriptSources();
process.once("exit", () => compiledTypeScript.dispose());
const transpileModule = (sourceFile, outputFile) => {
  const output = compiledTypeScript.read(sourceFile);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${prepareDeployedScript(output.trimEnd())}\n`);
};
const copyRuntimeModule = (sourceFile, outputFile) => {
  const source = fs.readFileSync(sourceFile, "utf8");
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${prepareDeployedScript(source.trimEnd())}\n`);
};
const emitRuntimeModules = (outputDirectory) => {
  for (const file of topLevelRuntimeSources) {
    const sourceFile = path.join("src", file);
    const outputFile =
      file === "index.ts"
        ? path.join(outputDirectory, "index.js")
        : file === "pixel-editor-entry.ts"
          ? path.join(outputDirectory, "pixel-editor.js")
          : path.join(outputDirectory, file.replace(/\.(ts|js)$/, ".js"));
    if (file.endsWith(".ts")) transpileModule(sourceFile, outputFile);
    else copyRuntimeModule(sourceFile, outputFile);
  }

  for (const file of appRuntimeSources) {
    transpileModule(
      path.join("src", "app", file),
      path.join(outputDirectory, "app", file.replace(/\.ts$/, ".js")),
    );
  }

  for (const file of explorerRuntimeSources) {
    transpileModule(
      path.join("src", "explorer", file),
      path.join(outputDirectory, "explorer", file.replace(/\.ts$/, ".js")),
    );
  }

  for (const file of pixelEditorRuntimeSources) {
    transpileModule(
      file,
      path.join(
        outputDirectory,
        path.relative("src", file).replace(/\.ts$/, ".js"),
      ),
    );
  }
};

export const renderPage = (
  locale,
  url,
  htmlLocale = locale,
  dataLocale = locale,
  manifestLocale = locale,
) => {
  const translations = translationsFor(locale);
  const title = `${translations.title} – Pixel Emoji & Unicode`;
  const description = `${translations.pixelHeroDescription} ${translations.aboutDescription}`;
  const localeDetails =
    localeMetadata.get(dataLocale) ?? localeMetadata.get(locale);
  const initialFlag =
    languageFlags[htmlLocale] ?? languageFlags[dataLocale] ?? "🌐";
  const initialLanguageLabel =
    localeDetails?.nativeLabel ?? translations.languageNotLoaded;
  const initialMatchCount = new Intl.NumberFormat(
    htmlLocale,
    htmlLocale.startsWith("ar") ? { numberingSystem: "arab" } : {},
  ).format(0);
  return template
    .replaceAll(defaultSiteUrl, siteUrl)
    .replace(
      /<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang="[^"]+")[^>]*\/?>\s*/g,
      "",
    )
    .replace(
      /<html lang="en"([^>]*)>/,
      `<html lang="${htmlLocale}"$1 dir="${rtlLocales.has(htmlLocale) ? "rtl" : "ltr"}" data-locale="${dataLocale}">`,
    )
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<script\b(?=[^>]*\bsrc="\.\/src\/index\.ts")[^>]*><\/script>/,
      `<script defer src="./index.js?v=${assetVersion}" type="module"></script>`,
    )
    .replace(
      /<link\b(?=[^>]*\bid="pixel-font-stylesheet")[^>]*\/?>/,
      `<link id="pixel-font-stylesheet" rel="stylesheet" href="./pixel-font/build/font/pixel-emoji.css?v=${pixelFontRevision}" data-font-revision="${pixelFontRevision}">`,
    )
    .replace(
      /<link\b(?=[^>]*\bid="retro-text-font-stylesheet")[^>]*\/?>/,
      `<link id="retro-text-font-stylesheet" rel="stylesheet" href="./pixel-font/build-retro-text/pixel-latin-retro.css?v=${retroTextRevision}" data-font-revision="${retroTextRevision}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/base\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/base-theme.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/dark\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/dark.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/light\/light\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/light/light.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/ega\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/ega.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-foundation\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-foundation.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-dialogs\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-dialogs.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-example-dialogs\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-example-dialogs.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-buttons\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-buttons.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-forms\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-forms.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-focus\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-focus.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/styles\/toolbar-controls\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/toolbar-controls.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/dialog\/dialog-close-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/dialog/dialog-close-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/dialog\/dialog-heading\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/dialog/dialog-heading.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/dialog\/dialog-navigate-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/dialog/dialog-navigate-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/dialog\/dialog-mode-back-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/dialog/dialog-mode-back-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/pickers\/language-picker\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/pickers/language-picker.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/pickers\/compact-choice-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/pickers/compact-choice-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/toolbar\/theme-choice-group\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/toolbar/theme-choice-group.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/pickers\/filter-picker-trigger\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/pickers/filter-picker-trigger.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/toolbar\/toolbar-trigger-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/toolbar/toolbar-trigger-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/pickers\/advanced-filters-trigger\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/pickers/advanced-filters-trigger.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/modifiers\/modifier-filter-control\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/modifiers/modifier-filter-control.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/version\/version-mode-toggle\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/version/version-mode-toggle.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/controls\/filters\/version\/version-step-button\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/controls/filters/version/version-step-button.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/styles\/dialog-controls\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/dialog-controls.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/index\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/index.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/light\/light\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/light/light.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/ega\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/ega.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-foundation\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-foundation.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-dialogs\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-dialogs.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-buttons\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-buttons.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-forms\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-forms.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-focus\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-focus.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/base-theme\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/base-theme.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/dark\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/dark.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/toolbar-controls\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/toolbar-controls.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/dialog-controls\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/dialog-controls.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/index\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/index.css?v=${assetVersion}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bname="application-name")[^>]*\/?>/,
      `<meta name="application-name" content="${escapeHtml(translations.title)}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bname="apple-mobile-web-app-title")[^>]*\/?>/,
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(translations.title)}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="manifest")(?=[^>]*\bhref="\.\/manifest\.webmanifest")[^>]*\/?>/,
      `<link rel="manifest" href="./${manifestFile(manifestLocale)}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bname="description")[^>]*\/?>/,
      `<meta name="description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="canonical")[^>]*\/?>/,
      `<link rel="canonical" href="${url}">\n${alternates}`,
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:title")[^>]*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:description")[^>]*\/?>/,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bproperty="og:url")[^>]*\/?>/,
      `<meta property="og:url" content="${url}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bname="twitter:title")[^>]*\/?>/,
      `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    )
    .replace(
      /<meta\b(?=[^>]*\bname="twitter:description")[^>]*\/?>/,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    )
    .replace(
      /"url": "https:\/\/lewismoten\.github\.io\/emoji\/"/,
      `"url": "${url}"`,
    )
    .replace(
      '"name": "Emoji Explorer"',
      `"name": ${JSON.stringify(translations.title)}`,
    )
    .replace(
      /("alternateName": "@lewismoten\/emoji",[\s\S]*?"description": )"[^"]*"/,
      `$1${JSON.stringify(description)}`,
    )
    .replace(
      /(<[^>]+data-i18n="([^"]+)"[^>]*>)([^<]*)(<\/[^>]+>)/g,
      (match, opening, key, contents, closing) =>
        `${opening}${escapeHtml(translations[key] ?? contents)}${closing}`,
    )
    .replace(
      /(<[^>]+data-i18n-placeholder="([^"]+)"[^>]*placeholder=")[^"]*(")/g,
      (match, opening, key, closing) =>
        `${opening}${escapeHtml(translations[key] ?? "")}${closing}`,
    )
    .replace(
      /(<[^>]+data-i18n-aria-label="([^"]+)"[^>]*aria-label=")[^"]*(")/g,
      (match, opening, key, closing) =>
        `${opening}${escapeHtml(translations[key] ?? "")}${closing}`,
    )
    .replace(
      /(<bdi\b(?=[^>]*\bclass="match-count")[^>]*>)[^<]*(<\/bdi>)/,
      `$1${escapeHtml(initialMatchCount)}$2`,
    )
    .replace(
      /(<span\b(?=[^>]*\bclass="language-picker-flag")[^>]*>)[^<]*(<\/span>)/,
      `$1${initialFlag}$2`,
    )
    .replace(
      /(<span\b(?=[^>]*\bclass="language-picker-label")[^>]*>)[^<]*(<\/span>)/,
      `$1${escapeHtml(initialLanguageLabel)}$2`,
    )
    .replace(/>\s+</g, "><")
    .trim();
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
      dir: rtlLocales.has(htmlLocale) ? "rtl" : "ltr",
      start_url: startUrl,
      screenshots: webAppManifest.screenshots,
    },
    null,
    2,
  )}\n`;
};

export const generateDemoPages = (outputDirectory = ".") => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  emitRuntimeModules(outputDirectory);
  fs.writeFileSync(
    path.join(outputDirectory, "index.html"),
    renderPage("en", siteUrl, "en-US", "en", ""),
  );
  fs.writeFileSync(
    path.join(outputDirectory, "manifest.webmanifest"),
    renderManifest("en", "./", "en-US"),
  );
  for (const locale of locales) {
    fs.writeFileSync(
      path.join(outputDirectory, `index.${locale}.html`),
      renderPage(locale, pageUrl(locale)),
    );
    fs.writeFileSync(
      path.join(outputDirectory, manifestFile(locale)),
      renderManifest(locale, `./index.${locale}.html`),
    );
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}</loc></url>
${locales.map((locale) => `  <url><loc>${pageUrl(locale)}</loc></url>`).join("\n")}
</urlset>\n`;
  fs.writeFileSync(path.join(outputDirectory, "sitemap.xml"), sitemap);
  fs.writeFileSync(
    path.join(outputDirectory, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}sitemap.xml\n`,
  );
  for (const asset of staticSiteAssets) {
    if (asset.directory) {
      fs.cpSync(asset.source, path.join(outputDirectory, asset.target), {
        recursive: true,
      });
    } else {
      fs.copyFileSync(asset.source, path.join(outputDirectory, asset.target));
    }
  }
  fs.cpSync(
    path.join("src", "data", "locales"),
    path.join(outputDirectory, "locales"),
    {
      recursive: true,
    },
  );
  fs.cpSync(
    path.join("src", "data", "orders"),
    path.join(outputDirectory, "orders"),
    {
      recursive: true,
    },
  );
  fs.cpSync(
    path.join("src", "data", "versions"),
    path.join(outputDirectory, "versions"),
    {
      recursive: true,
    },
  );
  fs.cpSync(
    path.join("src", "data", "proposed"),
    path.join(outputDirectory, "proposed"),
    {
      recursive: true,
    },
  );
  fs.cpSync(
    path.join("src", "demo-locales"),
    path.join(outputDirectory, "demo-locales"),
    {
      recursive: true,
    },
  );
  generateSiteIcons({
    favicon: path.join(siteSourceDirectory, "favicon.svg"),
    outputDirectory: path.join(outputDirectory, "pwa", "icons"),
  });

  console.info(
    `Generated the en-US root and ${locales.length} localized demo pages in ${outputDirectory}.`,
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateDemoPages(process.argv[2] ?? ".");
}
