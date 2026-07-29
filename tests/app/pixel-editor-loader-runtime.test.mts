import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// coverage target: ../../src/app/pixel-editor-loader-runtime.js

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const sourceText = await fs.readFile(
  path.join(root, "src/app/pixel-editor-loader-runtime.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { createPixelEditorLoader } from "../explorer/pixel-editor-loader.js";',
    'import { createPixelEditorLoader } from "./pixel-editor-loader-stub.mjs";',
  )
  .replace(
    'import { loadStylesheet } from "../explorer/dialog/dialog-view.js";',
    'import { loadStylesheet } from "./dialog-view-stub.mjs";',
  )
  .replace(
    'import("../pixel-editor-entry.js")',
    'import("./pixel-editor-entry-stub.mjs")',
  )
  .replace(/options: any/g, "options")
  .replace(/editor: any/g, "editor")
  .replace(/promise: Promise<any> \| undefined/g, "promise");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-editor-loader-runtime-test-"),
);

await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-loader-stub.mjs"),
  [
    "export const calls = [];",
    "export function createPixelEditorLoader(options) {",
    "  calls.push(options);",
    "  return () => ['pixel-editor-loader-result', options];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "dialog-view-stub.mjs"),
  [
    "export const stylesheetCalls = [];",
    "export function loadStylesheet(href, id) {",
    "  stylesheetCalls.push([href, id]);",
    "  return ['load-stylesheet', href, id];",
    "}",
  ].join("\n"),
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-entry-stub.mjs"),
  'export default { kind: "pixel-editor-entry-stub" };\n',
);
await fs.writeFile(
  path.join(tempDirectory, "pixel-editor-loader-runtime.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-loader-runtime.mjs")).href
);
const loaderStub = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-editor-loader-stub.mjs")).href
);
const dialogViewStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-view-stub.mjs")).href
);
const { createPixelEditorRuntime } =
  module as typeof import("../../src/app/pixel-editor-loader-runtime.js");

let currentKey = "wave";
let dialog = "dialog";
let emojiByKey: Record<string, string> = { wave: "👋" };
let editor: unknown = "editor";
let promise: unknown = "promise";
const setCalls: unknown[][] = [];

const runtime = createPixelEditorRuntime({
  currentEmojiKey: () => currentKey,
  dialog: () => dialog,
  emojiByKey: () => emojiByKey,
  formatNumber: "format-number",
  formatPercent: "format-percent",
  getEditor: () => editor,
  getPromise: () => promise,
  setEditor(value: unknown) {
    setCalls.push(["editor", value]);
    editor = value as string;
  },
  setPromise(value: unknown) {
    setCalls.push(["promise", value]);
    promise = value as string;
  },
  translate: "translate",
});

assert.equal(loaderStub.calls.length, 1);
const call = loaderStub.calls[0];
assert.equal(call.currentEmojiKey(), "wave");
assert.equal(call.dialog(), "dialog");
assert.deepEqual(call.emojiByKey(), { wave: "👋" });
assert.equal(call.formatNumber, "format-number");
assert.equal(call.formatPercent, "format-percent");
assert.equal(call.getEditor(), "editor");
assert.equal(call.getPromise(), "promise");
assert.equal(call.translate, "translate");
assert.equal(call.loadEditor().then ? true : false, true);
assert.deepEqual(call.loadStylesheet(), [
  "load-stylesheet",
  "./explorer/pixel-editor.css",
  "pixel-editor-stylesheet",
]);
assert.deepEqual(dialogViewStub.stylesheetCalls, [
  ["./explorer/pixel-editor.css", "pixel-editor-stylesheet"],
]);

call.setEditor("next-editor");
call.setPromise("next-promise");
assert.deepEqual(setCalls, [
  ["editor", "next-editor"],
  ["promise", "next-promise"],
]);

currentKey = "sparkles";
dialog = "dialog-2";
emojiByKey = { sparkles: "✨" };
editor = "editor-2";
promise = "promise-2";
assert.equal(call.currentEmojiKey(), "sparkles");
assert.equal(call.dialog(), "dialog-2");
assert.deepEqual(call.emojiByKey(), { sparkles: "✨" });
assert.equal(call.getEditor(), "editor-2");
assert.equal(call.getPromise(), "promise-2");

assert.deepEqual(runtime.ensurePixelEditor(), [
  "pixel-editor-loader-result",
  call,
]);
