import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspace = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const configFile = path.join(workspace, "config.json");
const atlasManifestFile = path.join(workspace, "atlases", "manifest.json");
const config = JSON.parse(await fs.readFile(configFile, "utf8"));
const atlasManifest = JSON.parse(
  await fs.readFile(atlasManifestFile, "utf8"),
);
const requested = process.argv[2];

if (!requested) {
  throw new Error("Provide patch, minor, major, or an explicit x.y.z version");
}

const current = parseVersion(config.fontVersion);
let next;
if (["patch", "minor", "major"].includes(requested)) {
  next = { ...current };
  if (requested === "patch") next.patch += 1;
  if (requested === "minor") {
    next.minor += 1;
    next.patch = 0;
  }
  if (requested === "major") {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  }
} else {
  next = parseVersion(requested);
}

config.fontVersion = `${next.major}.${next.minor}.${next.patch}`;
atlasManifest.fontVersion = config.fontVersion;
await Promise.all([
  fs.writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`),
  fs.writeFile(
    atlasManifestFile,
    `${JSON.stringify(atlasManifest, null, 2)}\n`,
  ),
]);
console.info(config.fontVersion);

function parseVersion(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) throw new Error(`Invalid semantic version: ${value}`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}
