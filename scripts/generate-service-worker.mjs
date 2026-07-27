import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const assetVersion = packageJson.version;
const topLevelModules = fs
  .readdirSync("src")
  .filter(
    (file) =>
      (file.endsWith(".ts") || file.endsWith(".js")) &&
      file !== "explorer.tsconfig.json" &&
      file !== "pixel-editor-entry.js",
  )
  .map((file) => `./${file.replace(/\.(ts|js)$/, ".js")}`);
const explorerModules = fs
  .readdirSync("src/explorer")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => `./explorer/${file.replace(/\.ts$/, ".js")}`);
const appModules = fs
  .readdirSync("src/app")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => `./app/${file.replace(/\.ts$/, ".js")}`);
const coreAssets = [
  "./",
  `./explorer/themes/dark.css?v=${assetVersion}`,
  `./explorer/themes/light.css?v=${assetVersion}`,
  `./explorer/themes/ega.css?v=${assetVersion}`,
  `./explorer/themes/retro.css?v=${assetVersion}`,
  `./explorer/themes/retro-foundation.css?v=${assetVersion}`,
  `./explorer/themes/retro-dialogs.css?v=${assetVersion}`,
  `./explorer/themes/retro-buttons.css?v=${assetVersion}`,
  `./explorer/themes/retro-forms.css?v=${assetVersion}`,
  `./explorer/themes/retro-focus.css?v=${assetVersion}`,
  `./explorer/toolbar-controls.css?v=${assetVersion}`,
  `./explorer/dialog-controls.css?v=${assetVersion}`,
  `./explorer/index.css?v=${assetVersion}`,
  `./index.js?v=${assetVersion}`,
  ...topLevelModules,
  ...explorerModules,
  ...appModules,
  "./pixel-font/build/font/pixel-emoji.css",
  "./pixel-font/build/font/pixel-emoji.woff2",
  "./pixel-font/build-retro-text/pixel-latin-retro.css",
  "./pixel-font/build-retro-text/pixel-latin-retro.woff2",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./manifest.webmanifest",
  "./offline.html",
];
const sourceFileForAsset = (asset) => {
  const file = asset.replace(/^\.\//, "").replace(/\?.*$/, "");
  if (!file) return "";
  if (file === "index.js") return path.join("src", "index.ts");
  if (file === "explorer/themes/dark.css")
    return path.join("src", "site", "themes", "dark.css");
  if (file === "explorer/themes/light.css")
    return path.join("src", "site", "themes", "light.css");
  if (file === "explorer/themes/ega.css")
    return path.join("src", "site", "themes", "ega.css");
  if (file === "explorer/themes/retro.css")
    return path.join("src", "site", "themes", "retro.css");
  if (file === "explorer/themes/retro-foundation.css")
    return path.join("src", "site", "themes", "retro-foundation.css");
  if (file === "explorer/themes/retro-dialogs.css")
    return path.join("src", "site", "themes", "retro-dialogs.css");
  if (file === "explorer/themes/retro-buttons.css")
    return path.join("src", "site", "themes", "retro-buttons.css");
  if (file === "explorer/themes/retro-forms.css")
    return path.join("src", "site", "themes", "retro-forms.css");
  if (file === "explorer/themes/retro-focus.css")
    return path.join("src", "site", "themes", "retro-focus.css");
  if (file === "explorer/toolbar-controls.css")
    return path.join("src", "site", "styles", "toolbar-controls.css");
  if (file === "explorer/dialog-controls.css")
    return path.join("src", "site", "styles", "dialog-controls.css");
  if (file === "manifest.webmanifest")
    return path.join("src", "site", "manifest.webmanifest");
  if (file === "offline.html") return path.join("src", "site", "offline.html");
  if (file === "favicon.svg") return path.join("src", "site", "favicon.svg");
  if (
    file === "icons/icon-192.png" ||
    file === "icons/icon-512.png" ||
    file === "icons/icon-maskable-512.png"
  ) {
    return path.join("src", "site", "favicon.svg");
  }
  return file;
};
const existingCoreAssets = coreAssets.filter((asset) => {
  const sourceFile = sourceFileForAsset(asset);
  return sourceFile === "" || fs.existsSync(sourceFile);
});

const template = fs.readFileSync("scripts/service-worker.template.js", "utf8");
const assetHash = createHash("sha256");
for (const asset of existingCoreAssets) {
  const file = sourceFileForAsset(asset);
  assetHash.update(asset);
  if (
    file &&
    !/^index\.[^.]+(?:-[^.]+)?\.html$/.test(path.basename(file)) &&
    fs.existsSync(file)
  ) {
    assetHash.update(fs.readFileSync(file));
  }
}
const assetRevision = assetHash.digest("hex").slice(0, 12);
export const renderServiceWorker = () =>
  template
    .replace("__PACKAGE_VERSION__", packageJson.version)
    .replace("__ASSET_REVISION__", assetRevision)
    .replace("__CORE_ASSETS__", JSON.stringify(existingCoreAssets, null, 2));

export const generateServiceWorker = (outputFile = "service-worker.js") => {
  fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
  fs.writeFileSync(outputFile, renderServiceWorker());
  console.info(
    `Generated ${outputFile} with cache ${packageJson.version} and ${existingCoreAssets.length} core assets.`,
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateServiceWorker(process.argv[2]);
}
