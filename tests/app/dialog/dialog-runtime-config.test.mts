import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createDialogRuntimeConfig as actualCreateDialogRuntimeConfig } from "../../../src/app/dialog/dialog-runtime-config.js";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const sourceText = await fs.readFile(
  path.join(root, "src/app/dialog/dialog-runtime-config.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { initializeDialogRuntime } from "./dialog-runtime.js";',
    'import { initializeDialogRuntime } from "./dialog-runtime-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/value: string\[\]/g, "value")
  .replace(/key: string/g, "key")
  .replace(/value: string/g, "value")
  .replace(/\.\.\.args: any\[\]/g, "...args");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "dialog-runtime-config-test-"),
);
const moduleFile = path.join(tempDirectory, "dialog-runtime-config.mjs");
const runtimeStubFile = path.join(tempDirectory, "dialog-runtime-stub.mjs");

await fs.writeFile(
  runtimeStubFile,
  [
    "export let lastOptions;",
    "export const returnValue = { kind: 'runtime' };",
    "export function initializeDialogRuntime(options) {",
    "  lastOptions = options;",
    "  return returnValue;",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const runtimeStub = await import(pathToFileURL(runtimeStubFile).href);
assert.equal(typeof actualCreateDialogRuntimeConfig, "function");

const state = { hello: "world" };
const copyStatus = { textContent: "copied" };
const dialog = { open: false };
const byId = { grin: { key: "grin" } };
const emojiByKey = { grin: "😀" };
const dialogNavigationKeys = ["grin", "wave"];
const displayedKeys = ["wave"];
const searchAnnotations = { grin: ["happy"] };
const currentDialogParentStack = ["favorites"];
const callbackCalls: Array<[string, unknown[]]> = [];

const config = module.createDialogRuntimeConfig({
  applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
  applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
  byId: () => byId,
  copyStatus: () => copyStatus,
  currentDialogParentStack: () => currentDialogParentStack,
  currentEmojiKey: () => "grin",
  developerModeEnabled: () => true,
  dialog: () => dialog,
  dialogNavigationKeys: () => dialogNavigationKeys,
  displayedKeys: () => displayedKeys,
  displayGroupName: (value: string) => `group:${value}`,
  displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
  emojiByKey: () => emojiByKey,
  emojiNext: () => "wave",
  emojiParent: () => "favorites",
  emojiPrevious: () => "smile",
  focusInitialAction: Symbol("focusInitialAction"),
  getIntroducedVersion: (value: string) => `v:${value}`,
  openEditor: (key: string, value: string) => {
    callbackCalls.push(["openEditor", [key, value]]);
    return `${key}:${value}`;
  },
  searchAnnotations: () => searchAnnotations,
  sequenceTranslationKeys: { zwj: "zwj" },
  sequenceTypeLabels: { zwj: "ZWJ" },
  setCurrentDialogParentStack: (value: string[]) => {
    callbackCalls.push(["setCurrentDialogParentStack", [value]]);
    return value.length;
  },
  setDialogView: (...args: unknown[]) => {
    callbackCalls.push(["setDialogView", args]);
    return args.length;
  },
  state: () => state,
  statusTranslationKeys: { fullyQualified: "fullyQualified" },
  syncUrlState: (...args: unknown[]) => {
    callbackCalls.push(["syncUrlState", args]);
    return args.join(":");
  },
  translate: (key: string, fallback: string) => `${key}:${fallback}`,
  updateCompositionBackButton: (...args: unknown[]) => {
    callbackCalls.push(["updateCompositionBackButton", args]);
    return args.at(0);
  },
  updateDialogNavigation: (...args: unknown[]) => {
    callbackCalls.push(["updateDialogNavigation", args]);
    return args.at(-1);
  },
  updateEmojiComposition: Symbol("updateEmojiComposition"),
  updateFavoriteButton: Symbol("updateFavoriteButton"),
  updateRenderingDiagnostic: Symbol("updateRenderingDiagnostic"),
});

assert.equal(config, runtimeStub.returnValue);
assert.equal(typeof module.createDialogRuntimeConfig, "function");

const forwarded = runtimeStub.lastOptions;
assert.equal(
  forwarded.applyPixelArtworkClass.description,
  "applyPixelArtworkClass",
);
assert.equal(
  forwarded.applyStandalonePixelArtwork.description,
  "applyStandalonePixelArtwork",
);
assert.equal(forwarded.byId(), byId);
assert.equal(forwarded.copyStatus(), copyStatus);
assert.equal(forwarded.currentDialogParentStack(), currentDialogParentStack);
assert.equal(forwarded.currentEmojiKey(), "grin");
assert.equal(forwarded.developerModeEnabled(), true);
assert.equal(forwarded.dialog(), dialog);
assert.equal(forwarded.dialogNavigationKeys(), dialogNavigationKeys);
assert.equal(forwarded.displayedKeys(), displayedKeys);
assert.equal(forwarded.displayGroupName("Smileys"), "group:Smileys");
assert.equal(
  forwarded.displayUnicodeSubGroupName("face-smiling"),
  "sub:face-smiling",
);
assert.equal(forwarded.emojiByKey(), emojiByKey);
assert.equal(forwarded.emojiNext(), "wave");
assert.equal(forwarded.emojiParent(), "favorites");
assert.equal(forwarded.emojiPrevious(), "smile");
assert.equal(forwarded.focusInitialAction.description, "focusInitialAction");
assert.equal(forwarded.getIntroducedVersion("grin"), "v:grin");
assert.equal(forwarded.searchAnnotations(), searchAnnotations);
assert.deepEqual(forwarded.sequenceTranslationKeys, { zwj: "zwj" });
assert.deepEqual(forwarded.sequenceTypeLabels, { zwj: "ZWJ" });
assert.equal(forwarded.state(), state);
assert.deepEqual(forwarded.statusTranslationKeys, {
  fullyQualified: "fullyQualified",
});
assert.equal(forwarded.translate("group", "Group"), "group:Group");
assert.equal(
  forwarded.updateEmojiComposition.description,
  "updateEmojiComposition",
);
assert.equal(
  forwarded.updateFavoriteButton.description,
  "updateFavoriteButton",
);
assert.equal(
  forwarded.updateRenderingDiagnostic.description,
  "updateRenderingDiagnostic",
);

assert.equal(forwarded.openEditor("grin", "editor"), "grin:editor");
assert.equal(forwarded.setCurrentDialogParentStack(["help", "language"]), 2);
assert.equal(forwarded.setDialogView("emoji", "code"), 2);
assert.equal(forwarded.syncUrlState("emoji", "grin"), "emoji:grin");
assert.equal(forwarded.updateCompositionBackButton("back"), "back");
assert.equal(forwarded.updateDialogNavigation("prev", "next"), "next");
assert.deepEqual(callbackCalls, [
  ["openEditor", ["grin", "editor"]],
  ["setCurrentDialogParentStack", [["help", "language"]]],
  ["setDialogView", ["emoji", "code"]],
  ["syncUrlState", ["emoji", "grin"]],
  ["updateCompositionBackButton", ["back"]],
  ["updateDialogNavigation", ["prev", "next"]],
]);
