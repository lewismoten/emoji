import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const assetVersion = packageJson.version;
const coreAssets = [
  "./",
  `./index.css?v=${assetVersion}`,
  `./index.js?v=${assetVersion}`,
  `./pixel-editor.js?v=${assetVersion}`,
  `./pixel-editor.css?v=${assetVersion}`,
  "./pixel-font/build/font/pixel-emoji.css",
  "./pixel-font/build/font/pixel-emoji.woff2",
  "./pixel-font/build-retro-text/pixel-latin-retro.css",
  "./pixel-font/build-retro-text/pixel-latin-retro.woff2",
  "./favicon.svg",
  "./favicon.ico",
  "./pwa/icons/icon-16.png",
  "./pwa/icons/icon-32.png",
  "./pwa/icons/icon-192.png",
  "./pwa/icons/icon-512.png",
  "./pwa/icons/icon-maskable-512.png",
  "./pwa/screenshot.png",
  "./pwa/narrow/screenshot-explorer.jpg",
  "./pwa/narrow/screenshot-emoji.jpg",
  "./pwa/narrow/screenshot-saved.jpg",
  "./pwa/narrow/screenshot-help.jpg",
  "./pwa/wide/screenshot-explorer-wide.jpg",
  "./pwa/wide/screenshot-emoji-wide.jpg",
  "./pwa/wide/screenshot-saved-wide.jpg",
  "./pwa/wide/screenshot-help-wide.jpg",
  "./manifest.webmanifest",
  "./offline.html",
];
const sourceFileForAsset = (asset) => {
  const file = asset.replace(/^\.\//, "").replace(/\?.*$/, "");
  if (!file) return "";
  if (file === "index.js") return path.join("src", "index.ts");
  if (file === "index.css") return path.join("explorer", "index.css");
  if (file === "pixel-editor.js")
    return path.join("src", "pixel-editor-entry.ts");
  if (file === "pixel-editor.css")
    return path.join("explorer", "pixel-editor.css");
  if (file === "manifest.webmanifest")
    return path.join("src", "site", "pwa", "manifest.webmanifest");
  if (file === "offline.html") return path.join("src", "site", "offline.html");
  if (file === "favicon.svg") return path.join("src", "site", "favicon.svg");
  if (file === "favicon.ico")
    return path.join("src", "site", "pwa", "icons", "favicon.ico");
  if (
    file === "pwa/icons/icon-16.png" ||
    file === "pwa/icons/icon-32.png" ||
    file === "pwa/icons/icon-192.png" ||
    file === "pwa/icons/icon-512.png" ||
    file === "pwa/icons/icon-maskable-512.png"
  ) {
    return path.join("src", "site", file);
  }
  if (file === "pwa/screenshot.png")
    return path.join("src", "site", "pwa", "screenshot.png");
  if (
    file === "pwa/narrow/screenshot-explorer.jpg" ||
    file === "pwa/narrow/screenshot-emoji.jpg" ||
    file === "pwa/narrow/screenshot-saved.jpg" ||
    file === "pwa/narrow/screenshot-help.jpg" ||
    file === "pwa/wide/screenshot-explorer-wide.jpg" ||
    file === "pwa/wide/screenshot-emoji-wide.jpg" ||
    file === "pwa/wide/screenshot-saved-wide.jpg" ||
    file === "pwa/wide/screenshot-help-wide.jpg"
  ) {
    return path.join("src", "site", file);
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
