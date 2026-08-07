import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import * as state from "../../../../src/state.js";
import { loadVersionCatalog } from "../../../../src/explorer/filters/version-data.js";

describe("version-data load", () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  const originalFunction = globalThis.Function;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    (globalThis as any).window = originalWindow;
    globalThis.Function = originalFunction;
    state.byId.clear();
    state.emojiByKey.clear();
  });

  it("loads released and proposed catalogs across fetch and fallback paths", async () => {
    const fetchCalls: string[] = [];
    (globalThis as any).window = {};
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
                {
                  version: "9.0",
                  file: "proposed/9.0.json",
                  status: "draft",
                  retrieved: "2026-01-01T00:00:00.000Z",
                },
              ],
            };
          },
        } as Response;
      }
      if (url === "versions/15.0.json") return { ok: false } as Response;
      if (url === "src/data/versions/15.0.json") {
        return { ok: true, async json() { return ["wave"]; } } as Response;
      }
      if (url === "versions/16.0.json") {
        return { ok: true, async json() { return ["sparkles"]; } } as Response;
      }
      if (url === "proposed/18.0.json") return { ok: false } as Response;
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
      if (url === "proposed/9.0.json") {
        return { ok: true, async json() { return { emoji: [] }; } } as Response;
      }
      throw new Error(`Unexpected fetch ${url}`);
    }) as typeof fetch;

    const allIds = ["wave", "sparkles"];
    const items: any[] = [{ key: "wave" }];
    state.byId.replace({ wave: { key: "wave" } as any });
    state.emojiByKey.replace({ wave: "👋" });

    const catalog = await loadVersionCatalog({
      allIds: () => allIds,
      byId: () => state.byId.get(),
      emojiByKey: () => state.emojiByKey.get(),
      getExplorerSubGroup: (item: any) =>
        item.subGroup === "face-smiling" ? "Smileys" : item.subGroup,
      items: () => items,
    });

    expect(fetchCalls).toEqual([
      "versions/manifest.json",
      "src/data/versions/manifest.json",
      "versions/15.0.json",
      "versions/16.0.json",
      "src/data/versions/15.0.json",
      "proposed/9.0.json",
      "proposed/18.0.json",
      "src/data/proposed/18.0.json",
    ]);
    expect(catalog.released.map((version) => version.version)).toEqual([
      "15.0",
      "16.0",
    ]);
    expect(catalog.proposed.map((version) => version.version)).toEqual([
      "9.0",
      "18.0",
    ]);
    expect([...catalog.versionKeys.get("15.0")!]).toEqual(["wave"]);
    expect([...catalog.versionKeys.get("16.0")!]).toEqual(["sparkles"]);
    expect([...catalog.versionKeys.get("18.0")!]).toEqual(["draftFace", "wave"]);
    expect([...catalog.versionKeys.get("9.0")!]).toEqual([]);
    expect(state.emojiByKey.get("draftFace")).toBe("🫨");
    expect((state.byId.get("draftFace") as any).subGroup).toBe("Smileys");
    expect((state.byId.get("draftFace") as any).unicodeSubGroup).toBe(
      "face-smiling",
    );
    expect(allIds).toEqual(["wave", "sparkles", "draftFace"]);
    expect(items.map((item) => item.key)).toEqual(["wave", "draftFace"]);

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
    expect(fetchCalls).toEqual(["versions/manifest.json"]);
    expect(emptyCatalog.released).toHaveLength(0);
    expect(emptyCatalog.proposed).toHaveLength(0);
    expect(emptyCatalog.versionKeys.size).toBe(0);

    globalThis.Function = function (...args: string[]) {
      if (
        args[0] === "specifier" &&
        args[1] === 'return import(specifier);'
      ) {
        return (specifier: string) => {
          if (specifier === "node:fs/promises") {
            return Promise.resolve({ readFile });
          }
          if (specifier === "node:path") {
            return Promise.resolve({ resolve });
          }
          return Promise.reject(new Error(`Unexpected import ${specifier}`));
        };
      }
      return originalFunction(...args);
    } as any;
    Reflect.deleteProperty(globalThis, "window");
    const nodeFallbackCatalog = await loadVersionCatalog({
      allIds: () => [],
      byId: () => ({}),
      emojiByKey: () => ({}),
      getExplorerSubGroup: (item: any) => item.subGroup,
      items: () => [],
    });
    expect(Array.isArray(nodeFallbackCatalog.released)).toBe(true);

    globalThis.fetch = (async () => ({ ok: false })) as unknown as typeof fetch;
    const fileFallbackCatalog = await loadVersionCatalog({
      allIds: () => [],
      byId: () => ({}),
      emojiByKey: () => ({}),
      getExplorerSubGroup: (item: any) => item.subGroup,
      items: () => [],
    });
    expect(Array.isArray(fileFallbackCatalog.released)).toBe(true);

    (globalThis as any).window = {};
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url === "versions/manifest.json") {
        return { ok: false } as Response;
      }
      if (url === "src/data/versions/manifest.json") {
        return { ok: false } as Response;
      }
      throw new Error(`Unexpected error-path fetch ${url}`);
    }) as typeof fetch;
    await expect(
      loadVersionCatalog({
        allIds: () => [],
        byId: () => ({}),
        emojiByKey: () => ({}),
        getExplorerSubGroup: (item: any) => item.subGroup,
        items: () => [],
      }),
    ).rejects.toThrow(
      /Unable to load versions\/manifest\.json or src\/data\/versions\/manifest\.json/,
    );

    Reflect.deleteProperty(globalThis, "window");
    const fallbackFetchCalls: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = String(input);
      fallbackFetchCalls.push(url);
      throw new Error(`Fallback fetch ${url}`);
    }) as typeof fetch;
    const fallbackCatalog = await loadVersionCatalog({
      allIds: () => [],
      byId: () => ({}),
      emojiByKey: () => ({}),
      getExplorerSubGroup: (item: any) => item.subGroup,
      items: () => [],
    });
    expect(fallbackFetchCalls.includes("versions/manifest.json")).toBe(true);
    expect(fallbackFetchCalls.includes("versions/15.0.json")).toBe(true);
    expect(fallbackFetchCalls.includes("proposed/18.0.json")).toBe(true);
    expect(
      fallbackCatalog.released.some((version) => version.version === "15.0"),
    ).toBe(true);
    expect(
      fallbackCatalog.proposed.some((version) => version.version === "18.0"),
    ).toBe(true);
  });
});
