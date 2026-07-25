import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const assetVersion = packageJson.version;
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
  `./explorer/index.css?v=${assetVersion}`,
  `./index.js?v=${assetVersion}`,
  ...explorerModules,
  ...appModules,
  "./pixel-font/build/font/pixel-emoji.css",
  "./pixel-font/build/font/pixel-emoji.woff2",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./manifest.webmanifest",
  "./offline.html",
];

const template = fs.readFileSync("scripts/service-worker.template.js", "utf8");
const assetHash = createHash("sha256");
for (const asset of coreAssets) {
  const file = asset.replace(/^\.\//, "").replace(/\?.*$/, "");
  assetHash.update(asset);
  if (
    file &&
    !/^index\.[^.]+(?:-[^.]+)?\.html$/.test(file) &&
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
    .replace("__CORE_ASSETS__", JSON.stringify(coreAssets, null, 2));

export const generateServiceWorker = (outputFile = "service-worker.js") => {
  fs.mkdirSync(path.dirname(path.resolve(outputFile)), { recursive: true });
  fs.writeFileSync(outputFile, renderServiceWorker());
  console.info(
    `Generated ${outputFile} with cache ${packageJson.version} and ${coreAssets.length} core assets.`,
  );
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  generateServiceWorker(process.argv[2]);
}
