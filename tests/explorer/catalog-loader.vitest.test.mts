import assert from "node:assert/strict";
import { afterAll, describe, it } from "vitest";

import { loadExplorerCatalog } from "../../src/explorer/catalog-loader.js";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalFetch = globalThis.fetch;

afterAll(() => {
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  globalThis.fetch = originalFetch;
});

describe("catalog-loader", () => {
  it("loads catalog data and pixel manifest using the stylesheet revision", async () => {
    const fetchCalls: Array<[string, RequestInit | undefined]> = [];

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === "#pixel-font-stylesheet") {
            return {
              dataset: { fontRevision: "font-rev-123" },
              href: "https://example.test/pixel-font.css?v=href-rev",
            };
          }
          return null;
        },
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: { href: "https://example.test/demo/" },
      },
    });

    globalThis.fetch = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      const url = String(input);
      fetchCalls.push([url, init]);
      if (url === "explorer/catalog.json") {
        return {
          ok: true,
          async json() {
            return {
              fields: ["key", "emoji", "group", "subGroup", "name"],
              emoji: [
                [
                  "wave",
                  "👋",
                  "People & Body",
                  "hand-fingers-open",
                  "waving hand",
                ],
                ["sparkles", "✨", "Activities", "event", "sparkles"],
                ["mailbox", "📫", "Objects", "mail", "mailbox"],
              ],
            };
          },
        } as Response;
      }
      if (url === "pixel-font/build/explorer-manifest.json?v=font-rev-123") {
        return {
          ok: true,
          async json() {
            return { glyphs: ["wave"] };
          },
        } as Response;
      }
      throw new Error(`Unexpected fetch ${url}`);
    }) as typeof fetch;

    let receivedManifest: unknown;
    const result = await loadExplorerCatalog({
      getExplorerSubGroup: (item: any) =>
        item.subGroup === "hand-fingers-open" ? "Hands" : item.subGroup,
      isViteDevelopment: false,
      updatePixelArtworkManifest: (manifest: unknown) => {
        receivedManifest = manifest;
      },
    });

    assert.deepEqual(fetchCalls, [
      ["explorer/catalog.json", undefined],
      ["pixel-font/build/explorer-manifest.json?v=font-rev-123", undefined],
    ]);
    assert.deepEqual(receivedManifest, { glyphs: ["wave"] });
    assert.deepEqual(result.allIds, ["sparkles", "mailbox", "wave"]);
    assert.equal(result.byId.wave.unicodeSubGroup, "hand-fingers-open");
    assert.equal(result.byId.wave.subGroup, "Hands");
    assert.equal(result.byId.wave.hasExplorerSections, false);
    assert.equal(result.byId.wave.name, "waving hand");
    assert.equal(result.emojiByKey.sparkles, "✨");
    assert.deepEqual(result.groups, ["Activities", "Objects", "People & Body"]);
    assert.deepEqual(result.subGroups["People & Body"], ["hand-fingers-open"]);
    assert.deepEqual(result.groupedKeys.Objects.mail, ["mailbox"]);
    assert.deepEqual(result.items.map((item) => item.key), [
      "wave",
      "sparkles",
      "mailbox",
    ]);
    assert.deepEqual([...result.releasedIds], ["sparkles", "mailbox", "wave"]);
  });

  it("falls back to cache-busting in vite mode and empty glyphs on manifest failure", async () => {
    const fetchCalls: Array<[string, RequestInit | undefined]> = [];

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector(selector: string) {
          if (selector === "#pixel-font-stylesheet") {
            return {
              dataset: {},
              href: "https://example.test/pixel-font.css?v=href-rev-2",
            };
          }
          return null;
        },
      },
    });

    globalThis.fetch = (async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      const url = String(input);
      fetchCalls.push([url, init]);
      if (url === "explorer/catalog.json") {
        return {
          ok: true,
          async json() {
            return { fields: ["key", "emoji", "group", "subGroup"], emoji: [] };
          },
        } as Response;
      }
      if (url.startsWith("pixel-font/build/explorer-manifest.json?v=")) {
        return {
          ok: false,
          async json() {
            return {};
          },
        } as Response;
      }
      throw new Error(`Unexpected fetch ${url}`);
    }) as typeof fetch;

    let receivedManifest: unknown = undefined;
    const viteResult = await loadExplorerCatalog({
      getExplorerSubGroup: (item: any) => item.subGroup,
      isViteDevelopment: true,
      updatePixelArtworkManifest: (manifest: unknown) => {
        receivedManifest = manifest;
      },
    });

    assert.equal(fetchCalls[0]?.[0], "explorer/catalog.json");
    assert.match(
      fetchCalls[1]?.[0] ?? "",
      /^pixel-font\/build\/explorer-manifest\.json\?v=\d+$/,
    );
    assert.deepEqual(fetchCalls[1]?.[1], { cache: "no-store" });
    assert.deepEqual(receivedManifest, { glyphs: [] });
    assert.deepEqual(viteResult.allIds, []);
  });
});
