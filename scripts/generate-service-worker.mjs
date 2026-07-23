import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const versionManifest = JSON.parse(
  fs.readFileSync("versions/manifest.json", "utf8"),
);
const demoLocales = fs
  .readdirSync("demo-locales")
  .filter((file) => file.endsWith(".json"))
  .map((file) => `./demo-locales/${file}`);
const localizedPages = ["en", "en-GB", "es", "hi", "zh", "ar"].map(
  (locale) => `./index.${locale}.html`,
);
const versionFiles = versionManifest.versions.map(
  (version) => `./versions/${version.file}`,
);
const proposedFiles = (versionManifest.proposed ?? []).map(
  (version) => `./${version.file}`,
);
const pixelAtlasManifest = JSON.parse(
  fs.readFileSync("pixel-font/atlases/manifest.json", "utf8"),
);
const pixelAtlasFiles = pixelAtlasManifest.sheets.flatMap((sheet) => {
  const image = `./pixel-font/atlases/${sheet.image}`;
  return [
    `./pixel-font/atlases/${sheet.mapping}`,
    ...(fs.existsSync(image.replace(/^\.\//, "")) ? [image] : []),
  ];
});
const coreAssets = [
  "./",
  "./index.html",
  ...localizedPages,
  "./index.css?direct",
  "./index.js",
  "./emoji.json",
  "./manifest.json",
  "./dist/esm/index.js",
  "./pixel-font/build/manifest.json",
  "./pixel-font/build/editor-manifest.json",
  "./pixel-font/build/font/pixel-emoji.woff2",
  ...pixelAtlasFiles,
  "./pixel-editor.js",
  "./favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./manifest.webmanifest",
  "./offline.html",
  "./locales/manifest.json",
  "./orders/manifest.json",
  "./versions/manifest.json",
  ...demoLocales,
  ...versionFiles,
  ...proposedFiles,
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
