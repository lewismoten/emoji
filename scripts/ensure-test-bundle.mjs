import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheFile = path.join(root, "cache", "test-bundle-state.json");
const inputs = [
  "emoji.json",
  "manifest.json",
  "package-lock.json",
  "package.json",
  "popular.json",
  "rollup.config.ts",
  "tsconfig.json",
  "src",
  "tests",
  "types",
  "scripts",
  "locales",
  "orders",
  "proposed",
  "versions",
];
const outputs = [
  "build/tests/integration/package-core.test.mjs",
  "build/library",
  "build/rollup.config.js",
  "dist/commonjs/popular.min.cjs",
  "dist/esm/index.js",
  "dist/esm/popular.min.js",
];

const fingerprint = await getFingerprint();
if (await hasCurrentBundle(fingerprint)) {
  console.info(
    "Test bundle sources are unchanged; reused existing build output.",
  );
} else {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["run", "bundle"], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  await fs.mkdir(path.dirname(cacheFile), { recursive: true });
  await fs.writeFile(cacheFile, `${JSON.stringify({ fingerprint })}\n`);
}

async function hasCurrentBundle(value) {
  try {
    const state = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (state.fingerprint !== value) return false;
    await Promise.all(
      outputs.map((output) => fs.access(path.join(root, output))),
    );
    return true;
  } catch {
    return false;
  }
}

async function getFingerprint() {
  const files = (await Promise.all(inputs.map(listInputFiles))).flat().sort();
  const hash = createHash("sha256");
  for (const file of files) {
    hash.update(path.relative(root, file));
    hash.update("\0");
    hash.update(await fs.readFile(file));
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function listInputFiles(input) {
  const file = path.join(root, input);
  const details = await fs.stat(file);
  if (details.isFile()) return [file];
  const entries = await fs.readdir(file, { withFileTypes: true });
  return (
    await Promise.all(
      entries
        .filter((entry) => entry.name !== ".DS_Store")
        .map((entry) => listInputFiles(path.join(input, entry.name))),
    )
  ).flat();
}
