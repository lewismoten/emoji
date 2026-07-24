import fs from "node:fs";
import path from "node:path";

const siteDirectory = path.resolve(process.argv[2] ?? "_site");
const workerFile = path.join(siteDirectory, "service-worker.js");
const worker = fs.readFileSync(workerFile, "utf8");
const match = /const CORE_ASSETS = (\[[\s\S]*?\]);/.exec(worker);

if (!match) {
  throw new Error("The generated service worker has no core asset list");
}

const missing = JSON.parse(match[1])
  .map((asset) => asset.replace(/^\.\//, "").replace(/\?.*$/, ""))
  .map((asset) => asset || "index.html")
  .filter((asset) => !fs.existsSync(path.join(siteDirectory, asset)));

if (missing.length > 0) {
  throw new Error(
    `Pages site is missing ${missing.length} precache asset${missing.length === 1 ? "" : "s"}:\n${missing.join("\n")}`,
  );
}

const manifestFiles = fs
  .readdirSync(siteDirectory)
  .filter((file) => /^manifest(?:\.[\w-]+)?\.webmanifest$/.test(file));
if (manifestFiles.length === 0) {
  throw new Error("Pages site has no web app manifests");
}

const parsedManifests = new Map();
for (const file of manifestFiles) {
  const manifestFile = path.join(siteDirectory, file);
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  } catch (error) {
    throw new Error(
      `${file} is not valid JSON: ${error instanceof Error ? error.message : error}`,
    );
  }
  for (const property of ["name", "start_url", "lang", "dir"]) {
    if (typeof manifest[property] !== "string" || !manifest[property]) {
      throw new Error(`${file} has no valid ${property}`);
    }
  }
  parsedManifests.set(file, manifest);
}

const htmlFiles = fs
  .readdirSync(siteDirectory)
  .filter((file) => /^index(?:\.[\w-]+)?\.html$/.test(file));
for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(siteDirectory, file), "utf8");
  const link =
    /<link\b(?=[^>]*\brel="manifest")(?=[^>]*\bhref="([^"]+)")[^>]*>/.exec(
      html,
    );
  if (!link) {
    throw new Error(`${file} has no web app manifest link`);
  }
  const manifestFile = link[1].replace(/^\.\//, "").replace(/\?.*$/, "");
  if (!parsedManifests.has(manifestFile)) {
    throw new Error(`${file} references missing or invalid ${manifestFile}`);
  }
}

const fontDirectories = [
  path.join(siteDirectory, "pixel-font", "build", "font"),
  path.join(siteDirectory, "pixel-font", "build", "font", "proposed"),
].filter((directory) => fs.existsSync(directory));
const fontSignatures = {
  ".woff": "wOFF",
  ".woff2": "wOF2",
};
for (const directory of fontDirectories) {
  for (const file of fs.readdirSync(directory)) {
    const extension = path.extname(file);
    const expected = fontSignatures[extension];
    if (!expected) continue;
    const signature = fs
      .readFileSync(path.join(directory, file))
      .subarray(0, 4)
      .toString("ascii");
    if (signature !== expected) {
      throw new Error(
        `${path.relative(siteDirectory, path.join(directory, file))} has invalid ${extension.slice(1).toUpperCase()} data`,
      );
    }
  }
}

console.info(
  `Verified ${JSON.parse(match[1]).length} precache assets, ${manifestFiles.length} web app manifests, and browser font signatures in ${siteDirectory}.`,
);
