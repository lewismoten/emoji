import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import terser from "@rollup/plugin-terser";
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
const appRuntimeSources = listRuntimeFiles(path.join("src", "app"));
const controlRuntimeSources = listRuntimeFiles(path.join("src", "controls"));
const explorerRuntimeSources = listRuntimeFiles(path.join("src", "explorer"));
const pixelEditorRuntimeSources = listRuntimeFiles(
  path.join("src", "pixel-editor"),
);
const staticSiteAssets = [
  {
    source: path.join(siteSourceDirectory, "favicon.svg"),
    target: "favicon.svg",
  },
  {
    source: path.join(siteSourceDirectory, "pwa", "icons", "favicon.ico"),
    target: "favicon.ico",
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
const stripQuery = (value) => value.replace(/\?.*$/, "");
const collapseInitialStylesheets = (html) => {
  let injected = false;
  return html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, (tag) => {
    if (
      tag.includes('id="pixel-font-stylesheet"') ||
      tag.includes('id="retro-text-font-stylesheet"')
    ) {
      return tag;
    }
    const hrefMatch = /href="([^"]+)"/.exec(tag);
    if (!hrefMatch) return tag;
    const href = stripQuery(hrefMatch[1]);
    const isLazyEditorStylesheet =
      href === "./pixel-editor.css" || href === "./explorer/pixel-editor.css";
    const isInitialExplorerStylesheet =
      href.startsWith("./src/site/") ||
      href.startsWith("./src/controls/") ||
      href === "./src/site/index.css" ||
      href.startsWith("./explorer/") ||
      href === "./index.css";
    if (isLazyEditorStylesheet) return "";
    if (!isInitialExplorerStylesheet) return tag;
    if (injected) return "";
    injected = true;
    return `<link rel="stylesheet" href="./index.css?v=${assetVersion}">`;
  });
};
const writeRootStylesheets = (outputDirectory) => {
  fs.copyFileSync(
    path.join(projectRoot, "explorer", "pixel-editor.css"),
    path.join(outputDirectory, "pixel-editor.css"),
  );
  fs.copyFileSync(
    path.join(projectRoot, "explorer", "index.css"),
    path.join(outputDirectory, "index.css"),
  );
};
const bundleDemoEntry = async ({
  input,
  output,
  outputDirectory,
  chunkDirectory,
  external = () => false,
  inlineDynamicImports = false,
}) => {
  const bundle = await rollup({
    input,
    external,
    treeshake: true,
    plugins: [terser()],
  });
  try {
    if (inlineDynamicImports) {
      await bundle.write({
        file: output,
        format: "es",
        inlineDynamicImports,
      });
      return;
    }
    await bundle.write({
      dir: outputDirectory,
      entryFileNames: path.basename(output),
      chunkFileNames: `${chunkDirectory}/[name]-[hash].js`,
      format: "es",
      inlineDynamicImports,
    });
  } finally {
    await bundle.close();
  }
};
const removeExtraJavaScript = (outputDirectory) => {
  const keep = new Set([
    path.join(outputDirectory, "index.js"),
    path.join(outputDirectory, "pixel-editor.js"),
  ]);
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(target);
        if (fs.readdirSync(target).length === 0)
          fs.rmSync(target, { recursive: true });
        continue;
      }
      if (!entry.name.endsWith(".js")) continue;
      if (target.includes(`${path.sep}chunks${path.sep}`)) continue;
      if (keep.has(target)) continue;
      fs.rmSync(target);
    }
  };
  visit(outputDirectory);
};
const bundleDemoRuntime = async (outputDirectory) => {
  await bundleDemoEntry({
    input: path.join(outputDirectory, "index.js"),
    output: path.join(outputDirectory, "index.js"),
    outputDirectory,
    chunkDirectory: "chunks",
    external: (id) => id.includes("pixel-editor.js"),
  });
  await bundleDemoEntry({
    input: path.join(outputDirectory, "pixel-editor.js"),
    output: path.join(outputDirectory, "pixel-editor.js"),
    outputDirectory,
    chunkDirectory: "chunks",
    inlineDynamicImports: true,
  });
  removeExtraJavaScript(outputDirectory);
};
const prepareDeployedScript = (source) =>
  source
    .replaceAll(
      "../../../pixel-font/retro-text-bitmap.mjs",
      "../../pixel-font/retro-text-bitmap.mjs",
    )
    .replace(
      /import\((['"])(\.+)\/pixel-editor-entry\.js\1\)/g,
      `import('$2/pixel-editor.js?v=${assetVersion}')`,
    )
    .replace(
      /import\((['"])(\.+)\/pixel-editor\.js\1\)/g,
      `import('$2/pixel-editor.js?v=${assetVersion}')`,
    )
    .replace(
      /(['"])\.\/explorer\/pixel-editor\.css\1/g,
      `'./pixel-editor.css?v=${assetVersion}'`,
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
      file,
      path.join(
        outputDirectory,
        "app",
        path.relative(path.join("src", "app"), file).replace(/\.ts$/, ".js"),
      ),
    );
  }

  for (const file of explorerRuntimeSources) {
    transpileModule(
      file,
      path.join(
        outputDirectory,
        "explorer",
        path
          .relative(path.join("src", "explorer"), file)
          .replace(/\.ts$/, ".js"),
      ),
    );
  }

  for (const file of controlRuntimeSources) {
    transpileModule(
      file,
      path.join(
        outputDirectory,
        "controls",
        path
          .relative(path.join("src", "controls"), file)
          .replace(/\.ts$/, ".js"),
      ),
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
      `<script defer src="./index.js" type="module"></script>`,
    )
    .replace(
      /<link rel="icon" href="\.\/favicon\.svg\?v=dev" sizes="any" type="image\/svg\+xml" \/>/,
      `<link rel="icon" href="./favicon.svg?v=${assetVersion}" sizes="any" type="image/svg+xml" />`,
    )
    .replace(
      /<link rel="icon" href="\.\/pwa\/icons\/icon-64\.png\?v=dev" sizes="64x64" type="image\/png" \/>/,
      `<link rel="icon" href="./pwa/icons/icon-64.png?v=${assetVersion}" sizes="64x64" type="image/png" />`,
    )
    .replace(
      /<link rel="icon" href="\.\/pwa\/icons\/icon-48\.png\?v=dev" sizes="48x48" type="image\/png" \/>/,
      `<link rel="icon" href="./pwa/icons/icon-48.png?v=${assetVersion}" sizes="48x48" type="image/png" />`,
    )
    .replace(
      /<link rel="icon" href="\.\/pwa\/icons\/icon-32\.png\?v=dev" sizes="32x32" type="image\/png" \/>/,
      `<link rel="icon" href="./pwa/icons/icon-32.png?v=${assetVersion}" sizes="32x32" type="image/png" />`,
    )
    .replace(
      /<link rel="icon" href="\.\/pwa\/icons\/icon-16\.png\?v=dev" sizes="16x16" type="image\/png" \/>/,
      `<link rel="icon" href="./pwa/icons/icon-16.png?v=${assetVersion}" sizes="16x16" type="image/png" />`,
    )
    .replace(
      /<link rel="shortcut icon" href="\.\/favicon\.ico\?v=dev" type="image\/x-icon" \/>/,
      `<link rel="shortcut icon" href="./favicon.ico?v=${assetVersion}" type="image/x-icon" />`,
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
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-choice-states\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-choice-states.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/src\/site\/themes\/retro\/retro-typography\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-typography.css?v=${assetVersion}">`,
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
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-choice-states\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-choice-states.css?v=${assetVersion}">`,
    )
    .replace(
      /<link\b(?=[^>]*\brel="stylesheet")(?=[^>]*\bhref="\.\/explorer\/themes\/retro\/retro-typography\.css")[^>]*\/?>/,
      `<link rel="stylesheet" href="./explorer/themes/retro/retro-typography.css?v=${assetVersion}">`,
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
const finalizeRenderedPage = (html) =>
  collapseInitialStylesheets(html).replace(/>\s+</g, "><").trim();

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

export const generateDemoPages = async (
  outputDirectory = "build/demo-pages",
) => {
  fs.mkdirSync(outputDirectory, { recursive: true });
  emitRuntimeModules(outputDirectory);
  writeRootStylesheets(outputDirectory);
  fs.mkdirSync(path.join(outputDirectory, "pixel-font"), { recursive: true });
  fs.copyFileSync(
    path.join("pixel-font", "retro-text-bitmap.mjs"),
    path.join(outputDirectory, "pixel-font", "retro-text-bitmap.mjs"),
  );
  fs.writeFileSync(
    path.join(outputDirectory, "index.html"),
    finalizeRenderedPage(renderPage("en", siteUrl, "en-US", "en", "")),
  );
  fs.writeFileSync(
    path.join(outputDirectory, "manifest.webmanifest"),
    renderManifest("en", "./", "en-US"),
  );
  for (const locale of locales) {
    fs.writeFileSync(
      path.join(outputDirectory, `index.${locale}.html`),
      finalizeRenderedPage(renderPage(locale, pageUrl(locale))),
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
  fs.mkdirSync(path.join(outputDirectory, "explorer"), { recursive: true });
  fs.copyFileSync(
    path.join("explorer", "catalog.json"),
    path.join(outputDirectory, "explorer", "catalog.json"),
  );
  fs.cpSync(
    path.join("explorer", "themes"),
    path.join(outputDirectory, "explorer", "themes"),
    {
      recursive: true,
    },
  );
  fs.cpSync(
    path.join("pixel-font", "build"),
    path.join(outputDirectory, "pixel-font", "build"),
    {
      recursive: true,
    },
  );
  if (fs.existsSync(path.join("pixel-font", "build-retro-text"))) {
    fs.cpSync(
      path.join("pixel-font", "build-retro-text"),
      path.join(outputDirectory, "pixel-font", "build-retro-text"),
      {
        recursive: true,
      },
    );
  }
  if (fs.existsSync(path.join("pixel-font", "atlases"))) {
    fs.cpSync(
      path.join("pixel-font", "atlases"),
      path.join(outputDirectory, "pixel-font", "atlases"),
      {
        recursive: true,
      },
    );
  }
  generateSiteIcons({
    favicon: path.join(siteSourceDirectory, "favicon.svg"),
    outputDirectory: path.join(outputDirectory, "pwa", "icons"),
  });
  await bundleDemoRuntime(outputDirectory);

  console.info(
    `Generated the en-US root and ${locales.length} localized demo pages in ${outputDirectory}.`,
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await generateDemoPages(process.argv[2] ?? ".");
}
