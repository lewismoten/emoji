import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheFile = path.join(root, "cache", "test-bundle-state.json");
const inputs = [
  "package-lock.json",
  "package.json",
  "rollup.config.ts",
  "src/emoji-source",
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
  "build/demo-pages/index.ar.html",
  "build/demo-pages/service-worker.js",
  "build/tests/integration/package-core.test.mjs",
  "build/library",
  "build/rollup.config.js",
  "dist/manifest.json",
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
  const bundleResult = spawnSync(npm, ["run", "bundle"], {
    cwd: root,
    stdio: "inherit",
  });
  if (bundleResult.status !== 0) process.exit(bundleResult.status ?? 1);
  const tsc = process.platform === "win32" ? "npx.cmd" : "npx";
  const testCompileResult = spawnSync(
    tsc,
    ["tsc", "-p", "tests/tsconfig.json"],
    {
      cwd: root,
      stdio: "inherit",
    },
  );
  if (testCompileResult.status !== 0)
    process.exit(testCompileResult.status ?? 1);
  const demoResult = spawnSync(npm, ["run", "demo:locales", "--", "build/demo-pages"], {
    cwd: root,
    stdio: "inherit",
  });
  if (demoResult.status !== 0) process.exit(demoResult.status ?? 1);
  const serviceWorkerResult = spawnSync(
    npm,
    ["run", "demo:pwa", "--", "build/demo-pages/service-worker.js"],
    {
      cwd: root,
      stdio: "inherit",
    },
  );
  if (serviceWorkerResult.status !== 0)
    process.exit(serviceWorkerResult.status ?? 1);
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
