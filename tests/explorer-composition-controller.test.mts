import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Direct source under test: ../src/explorer-composition-controller.js

const root = process.cwd();
const sourcePath = path.join(
  root,
  "build/src/explorer-composition-controller.js",
);
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source.replace(
  'import { updateEmojiComposition } from "./explorer/dialog/dialog-render.js";',
  'import { updateEmojiComposition, calls } from "./dialog-render-stub.mjs";',
);

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "explorer-composition-controller-"),
);

await fs.writeFile(
  path.join(tempDirectory, "dialog-render-stub.mjs"),
  `export const calls = [];
export function updateEmojiComposition(options) {
  calls.push(options);
}`,
);
await fs.writeFile(
  path.join(tempDirectory, "explorer-composition-controller.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "explorer-composition-controller.mjs"))
    .href
);
const dialogRenderStub = await import(
  pathToFileURL(path.join(tempDirectory, "dialog-render-stub.mjs")).href
);

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: {
        dir: "rtl",
        lang: "ar",
      },
    },
  });

  const dialog = {
    classList: {
      contains(name: string) {
        return name === "is-code-view";
      },
    },
  };

  module.updateExplorerComposition(
    {
      applyPixelArtworkClass: "applyPixelArtworkClass",
      applyStandalonePixelArtwork: "applyStandalonePixelArtwork",
      byId: () => ({ sparkles: { key: "sparkles" } }),
      compositionMode: () => "full",
      developerModeEnabled: () => true,
      dialog: () => dialog,
      emojiByKey: () => ({ sparkles: "✨" }),
      emojiKeyByCodePoints: () => new Map([["2728", "sparkles"]]),
      searchAnnotations: () => ({ sparkles: ["Sparkles"] }),
      selectedLocale: () => "en",
      translate: (key: string) => `translated:${key}`,
    },
    { key: "sparkles" },
    "✨",
  );

  assert.equal(dialogRenderStub.calls.length, 1);
  assert.equal(
    dialogRenderStub.calls[0].applyPixelArtworkClass,
    "applyPixelArtworkClass",
  );
  assert.equal(
    dialogRenderStub.calls[0].applyStandalonePixelArtwork,
    "applyStandalonePixelArtwork",
  );
  assert.deepEqual(dialogRenderStub.calls[0].byId, {
    sparkles: { key: "sparkles" },
  });
  assert.equal(dialogRenderStub.calls[0].compositionMode, "full");
  assert.equal(dialogRenderStub.calls[0].developerMode, true);
  assert.equal(dialogRenderStub.calls[0].detailsVisible, false);
  assert.equal(dialogRenderStub.calls[0].dir, "rtl");
  assert.deepEqual(dialogRenderStub.calls[0].emojiByKey, { sparkles: "✨" });
  assert.deepEqual(
    [...dialogRenderStub.calls[0].emojiKeyByCodePoints.entries()],
    [["2728", "sparkles"]],
  );
  assert.equal(dialogRenderStub.calls[0].exampleDialog, dialog);
  assert.deepEqual(dialogRenderStub.calls[0].item, { key: "sparkles" });
  assert.equal(dialogRenderStub.calls[0].locale, "ar");
  assert.equal(dialogRenderStub.calls[0].numberingSystem, "arab");
  assert.deepEqual(dialogRenderStub.calls[0].searchAnnotations, {
    sparkles: ["Sparkles"],
  });
  assert.equal(dialogRenderStub.calls[0].translate("x"), "translated:x");
  assert.equal(dialogRenderStub.calls[0].value, "✨");

  (globalThis.document as any).documentElement.lang = "";
  dialogRenderStub.calls.length = 0;
  const detailsDialog = {
    classList: {
      contains() {
        return false;
      },
    },
  };
  module.updateExplorerComposition(
    {
      applyPixelArtworkClass: "pixel",
      applyStandalonePixelArtwork: "standalone",
      byId: () => ({}),
      compositionMode: () => "condensed",
      developerModeEnabled: () => false,
      dialog: () => detailsDialog,
      emojiByKey: () => ({}),
      emojiKeyByCodePoints: () => new Map(),
      searchAnnotations: () => ({}),
      selectedLocale: () => "en-GB",
      translate: (key: string) => key,
    },
    null,
    "",
  );
  assert.equal(dialogRenderStub.calls[0].locale, "en-GB");
  assert.equal(dialogRenderStub.calls[0].numberingSystem, undefined);
  assert.equal(dialogRenderStub.calls[0].detailsVisible, true);
} finally {
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
