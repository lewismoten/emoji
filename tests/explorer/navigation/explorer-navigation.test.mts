import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as sourceModule from "../../../src/explorer/navigation/explorer-navigation.js";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/explorer/navigation/explorer-navigation.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'export { createExplorerNavigation } from "./explorer-navigation-controller.js";',
    'export { createExplorerNavigation } from "./explorer-navigation-controller-stub.mjs";',
  )
  .replace(
    'export { createExplorerNavigationDependencies } from "./explorer-navigation-dependencies.js";',
    'export { createExplorerNavigationDependencies } from "./explorer-navigation-dependencies-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-navigation-facade-"),
);

await fs.writeFile(
  path.join(tempDirectory, "explorer-navigation-controller-stub.mjs"),
  `export function createExplorerNavigation() {
  return { kind: "controller" };
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-navigation-dependencies-stub.mjs"),
  `export function createExplorerNavigationDependencies() {
  return { kind: "dependencies" };
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-navigation.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-navigation.mjs")).href
);

assert.equal(typeof sourceModule.createExplorerNavigation, "function");
assert.equal(typeof sourceModule.createExplorerNavigationDependencies, "function");
assert.deepEqual(module.createExplorerNavigation(), { kind: "controller" });
assert.deepEqual(module.createExplorerNavigationDependencies(), {
  kind: "dependencies",
});
