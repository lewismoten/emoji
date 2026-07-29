import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/version-mode-runtime.js

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceText = await fs.readFile(
  path.join(root, "src/app/version-mode-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText.replace(
  'import { createVersionModeController } from "./version-mode-controller.js";',
  'import { createVersionModeController } from "./version-mode-controller-stub.mjs";',
).replace(/options: any/g, "options");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "version-mode-runtime-test-"),
);
const moduleFile = path.join(tempDirectory, "version-mode-runtime.mjs");
const stubFile = path.join(tempDirectory, "version-mode-controller-stub.mjs");

await fs.writeFile(
  stubFile,
  [
    "export const controllerCalls = [];",
    "export const controllerResult = { kind: 'version-mode-controller' };",
    "export function createVersionModeController(options) {",
    "  controllerCalls.push(options);",
    "  return controllerResult;",
    "}",
  ].join("\n"),
);
await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const stub = await import(pathToFileURL(stubFile).href);

let drawListValue = "draw-1";
let renderCategoryFiltersValue = "render-1";
let selectorValue = "selector-1";
let toggleValue = "toggle-1";

const result = module.createVersionModeRuntime({
  definitions: ["through", "selected"],
  drawList: () => drawListValue,
  renderCategoryFilters: () => renderCategoryFiltersValue,
  selector: () => selectorValue,
  toggle: () => toggleValue,
  translate: "translate",
});

assert.equal(result, stub.controllerResult);
assert.equal(stub.controllerCalls.length, 1);
assert.deepEqual(stub.controllerCalls[0].definitions, ["through", "selected"]);
assert.equal(stub.controllerCalls[0].translate, "translate");
assert.equal(stub.controllerCalls[0].drawList(), "draw-1");
assert.equal(stub.controllerCalls[0].renderCategoryFilters(), "render-1");
assert.equal(stub.controllerCalls[0].selector(), "selector-1");
assert.equal(stub.controllerCalls[0].toggle(), "toggle-1");

drawListValue = "draw-2";
renderCategoryFiltersValue = "render-2";
selectorValue = "selector-2";
toggleValue = "toggle-2";

assert.equal(stub.controllerCalls[0].drawList(), "draw-2");
assert.equal(stub.controllerCalls[0].renderCategoryFilters(), "render-2");
assert.equal(stub.controllerCalls[0].selector(), "selector-2");
assert.equal(stub.controllerCalls[0].toggle(), "toggle-2");
