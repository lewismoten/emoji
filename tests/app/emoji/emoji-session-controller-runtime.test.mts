import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/app/emoji/emoji-session-controller.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source.replace(
  /import\s+\{\s*showEmojiSession\s*\}\s+from\s+"..\/..\/explorer\/dialog\/emoji-session\.js";/,
  'import { showEmojiSession, calls } from "./emoji-session-stub.mjs";',
).replace(
  'import * as state from "../../state.js";',
  'import * as state from "../../../src/state.js";',
);

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "emoji-session-controller-runtime-"),
);

await fs.writeFile(
  path.join(tempDirectory, "emoji-session-stub.mjs"),
  `export const calls = [];
export function showEmojiSession(options) {
  calls.push(options);
  return options;
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "emoji-session-controller.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-session-controller.mjs")).href
);
const stub = await import(
  pathToFileURL(path.join(tempDirectory, "emoji-session-stub.mjs")).href
);

const state: any = {
  byId: { wrappedGift: { key: "wrappedGift" } },
  compositionMode: "condensed",
  currentEmojiCopies: { key: "before" },
  currentEmojiKey: "before",
  currentDialogParentStack: ["favorites"],
  dialogNavigationKeys: ["wrappedGift"],
  displayedKeys: ["wrappedGift"],
  emojiByKey: { wrappedGift: "🎁" },
  items: [{ key: "wrappedGift" }],
  searchAnnotations: { wrappedGift: ["gift"] },
  selectedSearchLocale: "en",
};

const controller = module.createEmojiSessionController({
  applyPixelArtworkClass: "apply-pixel",
  applyStandalonePixelArtwork: "apply-standalone",
  developerModeEnabled: () => true,
  dialog: () => ({ open: false }),
  displayGroupName: (value: string) => `group:${value}`,
  displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
  getIntroducedVersion: () => "17.0",
  openDialogAction: "open-dialog",
  openEditor: "open-editor",
  sequenceTranslationKeys: { single: "single" },
  sequenceTypeLabels: { single: "Single" },
  state: () => state,
  statusTranslationKeys: { "fully-qualified": "fullyQualified" },
  translate: (key: string, fallback: string) => `${key}:${fallback}`,
  updateDialogNavigation: "update-navigation",
  updateEmojiComposition: "update-composition",
  updateFavoriteButton: "update-favorite",
  updateRenderingDiagnostic: "update-rendering",
});

controller.showEmoji(
  "wrappedGift",
  false,
  ["wrappedGift", "sparkles"],
  "editor",
  "help",
);

assert.equal(stub.calls.length, 1);
const options = stub.calls[0];
assert.equal(options.applyPixelArtworkClass, "apply-pixel");
assert.equal(options.applyStandalonePixelArtwork, "apply-standalone");
assert.equal(options.byId, state.byId);
assert.equal(options.compositionMode, "condensed");
assert.equal(options.currentEmojiCopies.value, state.currentEmojiCopies);
assert.notEqual(options.currentEmojiCopies, state.currentEmojiCopies);
options.currentEmojiCopies.value = { key: "after" };
assert.deepEqual(options.currentEmojiCopies.value, { key: "after" });
assert.deepEqual(state.currentEmojiCopies, { key: "before" });
assert.equal(options.currentEmojiKey.value, "before");
options.currentEmojiKey.value = "wrappedGift";
assert.equal(options.currentEmojiKey.value, "wrappedGift");
assert.equal(state.currentEmojiKey, "before");
assert.deepEqual(options.currentDialogParentStack.value, ["favorites"]);
options.currentDialogParentStack.value = ["help"];
assert.deepEqual(options.currentDialogParentStack.value, ["help"]);
assert.deepEqual(state.currentDialogParentStack, ["favorites"]);
assert.equal(options.developerMode, true);
assert.deepEqual(options.dialog, { open: false });
assert.deepEqual(options.dialogNavigationKeys.value, ["wrappedGift"]);
options.dialogNavigationKeys.value = ["sparkles"];
assert.deepEqual(options.dialogNavigationKeys.value, ["sparkles"]);
assert.deepEqual(state.dialogNavigationKeys, ["wrappedGift"]);
assert.deepEqual(options.displayedKeys, { value: ["wrappedGift"] });
assert.deepEqual(options.emojiByKey, state.emojiByKey);
assert.equal(options.getIntroducedVersion(), "17.0");
assert.equal(options.id, "wrappedGift");
assert.equal(options.initialMode, "editor");
assert.deepEqual(options.items, state.items);
assert.deepEqual(options.navigationKeys, ["wrappedGift", "sparkles"]);
assert.equal(options.openDialog, false);
assert.equal(options.parentPanel, "help");
assert.equal(options.openDialogAction, "open-dialog");
assert.equal(options.openEditor, "open-editor");
assert.deepEqual(options.searchAnnotations, state.searchAnnotations);
assert.equal(options.selectedSearchLocale, "en");
assert.deepEqual(options.sequenceTranslationKeys, { single: "single" });
assert.deepEqual(options.sequenceTypeLabels, { single: "Single" });
assert.deepEqual(options.statusTranslationKeys, {
  "fully-qualified": "fullyQualified",
});
assert.equal(options.translate("x", "y"), "x:y");
assert.equal(options.updateDialogNavigation, "update-navigation");
assert.equal(options.updateEmojiComposition, "update-composition");
assert.equal(options.updateFavoriteButton, "update-favorite");
assert.equal(options.updateRenderingDiagnostic, "update-rendering");
