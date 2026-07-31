import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { showEmojiSession as actualShowEmojiSession } from "../../../src/explorer/dialog/emoji-session.js";

const root = process.cwd();
const sourceText = await fs.readFile(
  path.join(root, "src/explorer/dialog/emoji-session.ts"),
  "utf8",
);

const transformedSource = sourceText
  .replace(
    'import { renderEmojiDialog } from "./dialog-render.js";',
    'import { renderEmojiDialog } from "./dialog-render-stub.mjs";',
  )
  .replace(/options: any/g, "options")
  .replace(/item: any/g, "item");

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "emoji-session-test-"),
);
const moduleFile = path.join(tempDirectory, "emoji-session.mjs");
const renderStubFile = path.join(tempDirectory, "dialog-render-stub.mjs");

await fs.writeFile(
  renderStubFile,
  [
    "export let lastOptions;",
    "export let callCount = 0;",
    "export function renderEmojiDialog(options) {",
    "  lastOptions = options;",
    "  callCount += 1;",
    "  return { copyValues: ['copied', options.id] };",
    "}",
    "",
  ].join("\n"),
);

await fs.writeFile(moduleFile, transformedSource);

const module = await import(pathToFileURL(moduleFile).href);
const renderStub = await import(pathToFileURL(renderStubFile).href);
assert.equal(typeof actualShowEmojiSession, "function");

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

const documentStub: any = {
  documentElement: { lang: "ar" },
};
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: documentStub,
});

try {
  const missingOptions: any = {
    id: "unknown",
    emojiByKey: {},
    currentEmojiKey: { value: "before" },
  };
  assert.equal(module.showEmojiSession(missingOptions), undefined);
  assert.equal(missingOptions.currentEmojiKey.value, "before");
  assert.equal(renderStub.callCount, 0);

  const byId = {
    wrappedGift: { status: "fully-qualified" },
  };
  const items = [
    {
      key: "wrappedGift",
      group: "Activities",
      unicodeSubGroup: "event",
    },
  ];
  const mainOptions: any = {
    id: "wrappedGift",
    emojiByKey: {
      wrappedGift: "🎁",
      smile: "😀",
      wave: "👋",
    },
    byId,
    items,
    searchAnnotations: {
      wrappedGift: ["gift", "present"],
    },
    applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
    applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
    compositionMode: "full",
    developerMode: true,
    dialogNavigationKeys: { value: ["before"] },
    displayedKeys: { value: ["smile", "wrappedGift", "missing"] },
    displayGroupName: (value: string) => `group:${value}`,
    displayUnicodeSubGroupName: (value: string) => `sub:${value}`,
    dialog: {
      classList: {
        contains(name: string) {
          return name === "is-editor-view";
        },
      },
    },
    getIntroducedVersion: (value: string) => `v:${value}`,
    currentEmojiKey: { value: "before" },
    currentDialogParentStack: { value: ["stale"] },
    currentEmojiCopies: { value: [] },
    openDialog: true,
    openDialogActionCalls: [] as Array<[string, string]>,
    openDialogAction(mode: string, panel: string) {
      mainOptions.openDialogActionCalls.push([mode, panel]);
    },
    openEditorCalls: [] as Array<[string, string]>,
    openEditor(key: string, value: string) {
      mainOptions.openEditorCalls.push([key, value]);
    },
    updateDialogNavigationCalls: 0,
    updateDialogNavigation() {
      mainOptions.updateDialogNavigationCalls += 1;
    },
    selectedSearchLocale: "en-GB",
    sequenceTranslationKeys: { zwj: "zwj" },
    sequenceTypeLabels: { zwj: "ZWJ" },
    statusTranslationKeys: { fullyQualified: "fullyQualified" },
    translate: (key: string, fallback: string) => `${key}:${fallback}`,
    updateFavoriteButton: Symbol("updateFavoriteButton"),
    updateRenderingDiagnostic: Symbol("updateRenderingDiagnostic"),
    updateEmojiComposition: Symbol("updateEmojiComposition"),
    parentPanel: "favorites",
    initialMode: "code",
  };

  module.showEmojiSession(mainOptions);
  assert.deepEqual(mainOptions.dialogNavigationKeys.value, ["smile", "wrappedGift"]);
  assert.equal(mainOptions.currentEmojiKey.value, "wrappedGift");
  assert.deepEqual(mainOptions.currentDialogParentStack.value, ["favorites"]);
  assert.deepEqual(mainOptions.currentEmojiCopies.value, ["copied", "wrappedGift"]);
  assert.deepEqual(mainOptions.openDialogActionCalls, [["code", "favorites"]]);
  assert.equal(mainOptions.updateDialogNavigationCalls, 1);
  assert.deepEqual(mainOptions.openEditorCalls, [["wrappedGift", "🎁"]]);
  assert.equal(renderStub.callCount, 1);
  assert.equal(renderStub.lastOptions.annotations[0], "gift");
  assert.equal(renderStub.lastOptions.currentEmojiKey, "wrappedGift");
  assert.deepEqual(renderStub.lastOptions.dialogNavigationKeys, ["smile", "wrappedGift"]);
  assert.equal(renderStub.lastOptions.group, "Activities");
  assert.equal(renderStub.lastOptions.subGroup, "event");
  assert.equal(renderStub.lastOptions.locale, "ar");
  assert.equal(renderStub.lastOptions.numberingSystem, "arab");
  assert.equal(renderStub.lastOptions.value, "🎁");

  documentStub.documentElement.lang = "";
  const fallbackOptions: any = {
    id: "wave",
    emojiByKey: {
      wave: "👋",
      grin: "😀",
    },
    byId: {},
    items: [],
    searchAnnotations: {},
    applyPixelArtworkClass: Symbol("applyPixelArtworkClass"),
    applyStandalonePixelArtwork: Symbol("applyStandalonePixelArtwork"),
    compositionMode: "full",
    developerMode: false,
    dialogNavigationKeys: { value: ["before"] },
    displayedKeys: { value: ["wave", "missing"] },
    displayGroupName: (value: string) => value,
    displayUnicodeSubGroupName: (value: string) => value,
    dialog: {
      classList: {
        contains() {
          return false;
        },
      },
    },
    getIntroducedVersion: (value: string) => value,
    currentEmojiKey: { value: "before" },
    currentDialogParentStack: { value: ["stale"] },
    currentEmojiCopies: { value: [] },
    openDialog: false,
    openDialogAction() {
      throw new Error("openDialogAction should not run");
    },
    openEditor() {
      throw new Error("openEditor should not run");
    },
    updateDialogNavigationCalls: 0,
    updateDialogNavigation() {
      fallbackOptions.updateDialogNavigationCalls += 1;
    },
    selectedSearchLocale: "es",
    sequenceTranslationKeys: {},
    sequenceTypeLabels: {},
    statusTranslationKeys: {},
    translate: (_key: string, fallback: string) => fallback,
    updateFavoriteButton: Symbol("updateFavoriteButton"),
    updateRenderingDiagnostic: Symbol("updateRenderingDiagnostic"),
    updateEmojiComposition: Symbol("updateEmojiComposition"),
    parentPanel: "",
    initialMode: undefined,
  };

  module.showEmojiSession(fallbackOptions);
  assert.deepEqual(fallbackOptions.dialogNavigationKeys.value, ["before"]);
  assert.equal(fallbackOptions.currentEmojiKey.value, "wave");
  assert.deepEqual(fallbackOptions.currentDialogParentStack.value, []);
  assert.equal(fallbackOptions.updateDialogNavigationCalls, 1);
  assert.equal(renderStub.callCount, 2);
  assert.equal(renderStub.lastOptions.locale, "es");
  assert.equal(renderStub.lastOptions.numberingSystem, undefined);
  assert.equal(renderStub.lastOptions.group, "(none)");
  assert.equal(renderStub.lastOptions.subGroup, "(none)");

  const parentResetOptions = {
    ...fallbackOptions,
    id: "grin",
    emojiByKey: { grin: "😀" },
    currentDialogParentStack: { value: ["favorites"] },
    navigationKeys: ["grin", "missing"],
    dialogNavigationKeys: { value: [] },
    currentEmojiKey: { value: "before" },
    currentEmojiCopies: { value: [] },
    updateDialogNavigationCalls: 0,
    updateDialogNavigation() {
      parentResetOptions.updateDialogNavigationCalls += 1;
    },
    parentPanel: "",
  } as any;

  module.showEmojiSession(parentResetOptions);
  assert.deepEqual(parentResetOptions.dialogNavigationKeys.value, ["grin"]);
  assert.deepEqual(parentResetOptions.currentDialogParentStack.value, []);
  assert.equal(parentResetOptions.currentEmojiKey.value, "grin");
  assert.deepEqual(parentResetOptions.currentEmojiCopies.value, ["copied", "grin"]);
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else delete (globalThis as any).document;
}
