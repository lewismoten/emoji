import assert from "node:assert/strict";
import { findSkinTonePasteHelper } from "../../src/pixel-editor/controllers/pixel-editor-transfer-skin-tone.js";

const visiblePixels = new Uint8ClampedArray([1, 0, 0, 255]);
const invisiblePixels = new Uint8ClampedArray([0, 0, 0, 0]);
const helperOwnershipPixels = new Uint8ClampedArray(12 * 12 * 4);
helperOwnershipPixels[0] = 0xd5;
helperOwnershipPixels[1] = 0xa0;
helperOwnershipPixels[2] = 0x78;
helperOwnershipPixels[3] = 0xff;
const lastPixelOffset = helperOwnershipPixels.length - 4;
helperOwnershipPixels[lastPixelOffset] = 0x70;
helperOwnershipPixels[lastPixelOffset + 1] = 0x45;
helperOwnershipPixels[lastPixelOffset + 2] = 0x2f;
helperOwnershipPixels[lastPixelOffset + 3] = 0xff;
const draftOwnershipPixels = new Uint8ClampedArray(12 * 12 * 4);
draftOwnershipPixels[0] = 0xa6;
draftOwnershipPixels[1] = 0x6a;
draftOwnershipPixels[2] = 0x45;
draftOwnershipPixels[3] = 0xff;
const draftLastPixelOffset = draftOwnershipPixels.length - 4;
draftOwnershipPixels[draftLastPixelOffset] = 0x70;
draftOwnershipPixels[draftLastPixelOffset + 1] = 0x45;
draftOwnershipPixels[draftLastPixelOffset + 2] = 0x2f;
draftOwnershipPixels[draftLastPixelOffset + 3] = 0xff;

const clipboard = {
  skinTones: ["1F3FB", "1F3FF"],
  baseSequence: "1F46F",
  sourceKey: "peopleWithBunnyEarsPartyingLight",
};

const currentEntry = {
  key: "peopleWithBunnyEarsPartyingMedium",
  codePoints: ["1F46F", "1F3FB", "1F3FF"],
};

const makeManifest = (glyphs: Record<string, any>) => ({ glyphs });

const extractCell = async (_blob: unknown, entry: { key: string }) => {
  if (entry.key.includes("Invisible")) return invisiblePixels;
  if (
    entry.key.includes("Helper") ||
    entry.key === "helper" ||
    entry.key === "firstInvisible"
  ) {
    return helperOwnershipPixels;
  }
  if (
    entry.key === "draft-only" ||
    entry.key === "peopleWithBunnyEarsPartyingDraft"
  ) {
    return draftOwnershipPixels;
  }
  return visiblePixels;
};

const originalFetch = globalThis.fetch;

function setFetch(handler: any) {
  (globalThis as any).fetch = handler;
}

await (async () => {
  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard: { ...clipboard, skinTones: ["1F3FB"] },
    currentEntry,
    extractCell,
    loadManifest: async () => makeManifest({}),
  });
  assert.equal(result, undefined);
})();

await (async () => {
  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard: { ...clipboard, baseSequence: "1F9D1" },
    currentEntry,
    extractCell,
    loadManifest: async () => makeManifest({}),
  });
  assert.equal(result, undefined);
})();

await (async () => {
  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard,
    currentEntry: { ...currentEntry, codePoints: ["1F46F", "1F3FB"] },
    extractCell,
    loadManifest: async () => makeManifest({}),
  });
  assert.equal(result, undefined);
})();

await (async () => {
  const helperEntry = {
    key: "peopleWithBunnyEarsPartyingHelper",
    codePoints: ["1F46F", "1F3FC", "1F3FE"],
    atlas: "people/helper.png",
    painted: true,
  };
  const duplicateToneEntry = {
    key: "peopleWithBunnyEarsPartyingDuplicate",
    codePoints: ["1F46F", "1F3FB", "1F3FB"],
    atlas: "people/duplicate.png",
    painted: true,
  };
  const sourceEntry = {
    key: clipboard.sourceKey,
    codePoints: ["1F46F", "1F3FB", "1F3FF"],
    atlas: "people/source.png",
    painted: true,
  };
  const currentGlyph = {
    key: currentEntry.key,
    codePoints: ["1F46F", "1F3FB", "1F3FF"],
    atlas: "people/current.png",
    painted: true,
  };
  const unpaintedDraftEntry = {
    key: "peopleWithBunnyEarsPartyingDraft",
    codePoints: ["1F46F", "1F3FD", "1F3FE"],
    atlas: "people/draft.png",
    painted: false,
  };
  const wrongBaseEntry = {
    key: "familyHelper",
    codePoints: ["1F46A", "1F3FC", "1F3FE"],
    atlas: "people/family.png",
    painted: true,
  };
  const result = await findSkinTonePasteHelper({
    artworkDrafts: () =>
      new Map([
        [
          "peopleWithBunnyEarsPartyingDraft",
          {
            pixels: draftOwnershipPixels,
          },
        ],
      ]),
    clipboard,
    currentEntry,
    extractCell,
    loadManifest: async () =>
      makeManifest({
        helperEntry,
        duplicateToneEntry,
        sourceEntry,
        currentGlyph,
        unpaintedDraftEntry,
        wrongBaseEntry,
      }),
  });
  assert.equal((result?.entry as any)?.key, "peopleWithBunnyEarsPartyingDraft");
  assert.ok(result?.ownership);
})();

await (async () => {
  const result = await findSkinTonePasteHelper({
    artworkDrafts: () =>
      new Map([
        [
          "draft-only",
          {
            pixels: draftOwnershipPixels,
          },
        ],
      ]),
    clipboard,
    currentEntry,
    extractCell,
    loadManifest: async () =>
      makeManifest({
        firstInvisible: {
          key: "firstInvisible",
          codePoints: ["1F46F", "1F3FC", "1F3FE"],
          atlas: "people/Invisible.png",
          painted: true,
        },
        "draft-only": {
          key: "draft-only",
          codePoints: ["1F46F", "1F3FD", "1F3FE"],
          atlas: "people/draft.png",
          painted: false,
        },
      }),
  });
  assert.equal((result?.entry as any)?.key, "draft-only");
})();

await (async () => {
  setFetch(
    async (input: string | URL | Request) =>
      ({
        ok: String(input).includes("helper.png"),
        headers: {
          get: () =>
            String(input).includes("helper.png") ? "image/png" : "text/plain",
        },
        blob: async () => ({ input }),
      }) as any,
  );

  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard,
    currentEntry,
    extractCell,
    loadManifest: async () =>
      makeManifest({
        helper: {
          key: "helper",
          codePoints: ["1F46F", "1F3FC", "1F3FE"],
          atlas: "people/helper.png",
          painted: true,
        },
      }),
  });
  assert.equal((result?.entry as any)?.key, "helper");
  assert.ok(result?.ownership);
})();

await (async () => {
  setFetch(async () => {
    throw new Error("offline");
  });

  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard,
    currentEntry,
    extractCell,
    loadManifest: async () =>
      makeManifest({
        helper: {
          key: "helper",
          codePoints: ["1F46F", "1F3FC", "1F3FE"],
          atlas: "people/helper.png",
          painted: true,
        },
      }),
  });
  assert.deepEqual(result, {
    entry: undefined,
    ownership: result?.ownership,
  });
  assert.ok(result?.ownership);
})();

await (async () => {
  setFetch(
    async () =>
      ({
        ok: true,
        headers: {
          get: () => "text/plain",
        },
        blob: async () => ({}),
      }) as any,
  );

  const result = await findSkinTonePasteHelper({
    artworkDrafts: () => new Map(),
    clipboard,
    currentEntry,
    extractCell,
    loadManifest: async () =>
      makeManifest({
        helper: {
          key: "helper",
          codePoints: ["1F46F", "1F3FC", "1F3FE"],
          atlas: "people/helper.png",
          painted: true,
        },
      }),
  });
  assert.ok(result?.ownership);
  assert.equal(result?.entry, undefined);
})();

if (originalFetch) globalThis.fetch = originalFetch;
else delete (globalThis as any).fetch;
