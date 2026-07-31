import assert from "node:assert/strict";
import {
  loadVersionCatalog,
  populateVersionSelector,
} from "../../src/explorer/version-data.js";

const originalFetch = globalThis.fetch;
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

type FakeOption = { value: string; text: string };

class FakeSelect {
  value = "";
  disabled = false;
  options: FakeOption[] = [];

  replaceChildren() {
    this.options = [];
  }

  appendChild(option: FakeOption) {
    this.options.push(option);
  }
}

const fetchCalls: string[] = [];

try {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    fetchCalls.push(url);
    if (url === "versions/manifest.json") {
      return { ok: false } as Response;
    }
    if (url === "src/data/versions/manifest.json") {
      return {
        ok: true,
        async json() {
          return {
            versions: [
              { version: "16.0", file: "16.0.json", released: "2024-09-10" },
              { version: "15.0", file: "15.0.json", released: "2022-09-13" },
            ],
            proposed: [
              {
                version: "18.0",
                file: "proposed/18.0.json",
                stage: "beta",
                expectedRelease: "2026-09",
              },
            ],
          };
        },
      } as Response;
    }
    if (url === "versions/15.0.json") {
      return { ok: false } as Response;
    }
    if (url === "src/data/versions/15.0.json") {
      return {
        ok: true,
        async json() {
          return ["wave"];
        },
      } as Response;
    }
    if (url === "versions/16.0.json") {
      return {
        ok: true,
        async json() {
          return ["sparkles"];
        },
      } as Response;
    }
    if (url === "proposed/18.0.json") {
      return { ok: false } as Response;
    }
    if (url === "src/data/proposed/18.0.json") {
      return {
        ok: true,
        async json() {
          return {
            emoji: [
              {
                key: "draftFace",
                emoji: "🫨",
                group: "Smileys & Emotion",
                subGroup: "face-smiling",
              },
              {
                key: "wave",
                emoji: "👋",
                group: "People & Body",
                subGroup: "hand-fingers-open",
              },
            ],
          };
        },
      } as Response;
    }
    throw new Error(`Unexpected fetch ${url}`);
  }) as typeof fetch;

  const allIds = ["wave", "sparkles"];
  const byId: Record<string, any> = { wave: { key: "wave" } };
  const emojiByKey: Record<string, string> = { wave: "👋" };
  const items: any[] = [{ key: "wave" }];

  const catalog = await loadVersionCatalog({
    allIds: () => allIds,
    byId: () => byId,
    emojiByKey: () => emojiByKey,
    getExplorerSubGroup: (item: any) =>
      item.subGroup === "face-smiling" ? "Smileys" : item.subGroup,
    items: () => items,
  });

  assert.deepEqual(fetchCalls, [
    "versions/manifest.json",
    "src/data/versions/manifest.json",
    "versions/15.0.json",
    "versions/16.0.json",
    "src/data/versions/15.0.json",
    "proposed/18.0.json",
    "src/data/proposed/18.0.json",
  ]);
  assert.deepEqual(
    catalog.released.map((version) => version.version),
    ["15.0", "16.0"],
  );
  assert.deepEqual(
    catalog.proposed.map((version) => version.version),
    ["18.0"],
  );
  assert.deepEqual([...catalog.versionKeys.get("15.0")!], ["wave"]);
  assert.deepEqual([...catalog.versionKeys.get("16.0")!], ["sparkles"]);
  assert.deepEqual([...catalog.versionKeys.get("18.0")!], ["draftFace", "wave"]);
  assert.equal(emojiByKey.draftFace, "🫨");
  assert.equal(byId.draftFace.subGroup, "Smileys");
  assert.equal(byId.draftFace.unicodeSubGroup, "face-smiling");
  assert.deepEqual(allIds, ["wave", "sparkles", "draftFace"]);
  assert.deepEqual(items.map((item) => item.key), ["wave", "draftFace"]);

  fetchCalls.length = 0;
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    fetchCalls.push(url);
    if (url === "versions/manifest.json") {
      return {
        ok: true,
        async json() {
          return { versions: [], proposed: [] };
        },
      } as Response;
    }
    throw new Error(`Unexpected fast-path fetch ${url}`);
  }) as typeof fetch;
  const emptyCatalog = await loadVersionCatalog({
    allIds: () => [],
    byId: () => ({}),
    emojiByKey: () => ({}),
    getExplorerSubGroup: (item: any) => item.subGroup,
    items: () => [],
  });
  assert.deepEqual(fetchCalls, ["versions/manifest.json"]);
  assert.equal(emptyCatalog.released.length, 0);
  assert.equal(emptyCatalog.proposed.length, 0);
  assert.equal(emptyCatalog.versionKeys.size, 0);

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tag: string) {
        assert.equal(tag, "option");
        return { value: "", text: "" };
      },
    },
  });

  const selector = new FakeSelect();
  selector.value = "15.0";
  let syncCalls = 0;
  populateVersionSelector({
    proposed: catalog.proposed,
    released: catalog.released,
    selectedLocale: "en-US",
    selector: selector as any,
    syncRange: () => {
      syncCalls += 1;
    },
    translate: (key: string, fallback: string) =>
      ({
        expected: "expected",
        updated: "updated",
        released: "released",
      })[key] ?? fallback,
  });
  assert.equal(selector.options.length, 3);
  assert.equal(selector.options[0]?.value, "15.0");
  assert.equal(selector.options[0]?.text, "Emoji 15.0 (released 2022-09-13)");
  assert.equal(selector.options[2]?.text, "Emoji 18.0 (beta · expected 2026-09)");
  assert.equal(selector.value, "15.0");
  assert.equal(selector.disabled, false);
  assert.equal(syncCalls, 1);

  const updatedSelector = new FakeSelect();
  populateVersionSelector({
    proposed: [
      {
        version: "19.0",
        file: "proposed/19.0.json",
        retrieved: "2026-07-01T00:00:00.000Z",
      },
    ],
    released: [],
    selectedLocale: "en-US",
    selector: updatedSelector as any,
    syncRange: () => {
      syncCalls += 1;
    },
    translate: (key: string, fallback: string) =>
      ({
        expected: "expected",
        updated: "updated",
        released: "released",
      })[key] ?? fallback,
  });
  assert.match(updatedSelector.options[0]?.text ?? "", /^Emoji 19.0 \(draft · updated /);
  assert.equal(updatedSelector.value, "19.0");

  const statusSelector = new FakeSelect();
  populateVersionSelector({
    proposed: [
      {
        version: "20.0",
        file: "proposed/20.0.json",
        status: "preview",
        retrieved: "2026-08-01T00:00:00.000Z",
      },
    ],
    released: [],
    selectedLocale: "en-US",
    selector: statusSelector as any,
    syncRange: () => {
      syncCalls += 1;
    },
    translate: (key: string, fallback: string) =>
      ({
        expected: "expected",
        updated: "updated",
        released: "released",
      })[key] ?? fallback,
  });
  assert.match(
    statusSelector.options[0]?.text ?? "",
    /^Emoji 20.0 \(preview · updated /,
  );

  const fallbackSelector = new FakeSelect();
  fallbackSelector.value = "missing";
  populateVersionSelector({
    proposed: [],
    released: catalog.released,
    selectedLocale: "en-US",
    selector: fallbackSelector as any,
    syncRange: () => {
      syncCalls += 1;
    },
    translate: (_key: string, fallback: string) => fallback,
  });
  assert.equal(fallbackSelector.value, "16.0");

  const emptySelector = new FakeSelect();
  populateVersionSelector({
    proposed: [],
    released: [],
    selectedLocale: "en-US",
    selector: emptySelector as any,
    syncRange: () => {
      syncCalls += 1;
    },
    translate: (_key: string, fallback: string) => fallback,
  });
  assert.equal(emptySelector.value, "");
  assert.equal(emptySelector.disabled, true);

  globalThis.fetch = (async () => ({ ok: false })) as unknown as typeof fetch;
  await assert.rejects(
    loadVersionCatalog({
      allIds: () => [],
      byId: () => ({}),
      emojiByKey: () => ({}),
      getExplorerSubGroup: (item: any) => item.subGroup,
      items: () => [],
    }),
    /Unable to load versions\/manifest\.json or src\/data\/versions\/manifest\.json/,
  );
} finally {
  globalThis.fetch = originalFetch;
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
