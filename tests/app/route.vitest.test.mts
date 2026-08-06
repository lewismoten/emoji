import { afterEach, describe, expect, it } from "vitest";

import * as route from "../../src/app/route.js";

describe("route helpers", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );

  afterEach(() => {
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (originalDocument)
      Object.defineProperty(globalThis, "document", originalDocument);
    else Reflect.deleteProperty(globalThis, "document");
  });

  it("reads and mutates route state from window and document", () => {
    const historyCalls: unknown[] = [];
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          origin: "https://emoji.example",
          pathname: "/index.en.html",
          search: "?mode=developer&panel=help&x=1",
          hash: "#top",
        },
        history: {
          state: { page: 1 },
          pushState(state: unknown, _title: string, url: string) {
            historyCalls.push(["push", state, url]);
          },
          replaceState(state: unknown, _title: string, url: string) {
            historyCalls.push(["replace", state, url]);
          },
        },
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        baseURI: "https://fallback.example/base/index.en.html",
      },
    });

    expect(route.hasLocation()).toBe(true);
    expect(route.hasHistory()).toBe(true);
    expect(route.getSearch()).toBe("?mode=developer&panel=help&x=1");
    expect(route.getHash()).toBe("#top");
    expect(
      route.getSearch(
        "https://emoji.example/index.ar.html?panel=favorites#sheet",
      ),
    ).toBe("?panel=favorites");
    expect(
      route.getHash(
        "https://emoji.example/index.ar.html?panel=favorites#sheet",
      ),
    ).toBe("#sheet");
    expect(route.getParam("x")).toBe("1");
    expect(route.getParam("missing")).toBe("");
    expect(route.getLocale()).toBe("en");
    expect(route.getPathName()).toBe("/index.en.html");
    expect(route.getOrigin()).toBe("https://emoji.example");
    expect(route.getHref()).toBe(
      "https://emoji.example/index.en.html?mode=developer&panel=help&x=1#top",
    );
    expect(route.isLocalPreview()).toBe(false);
    expect(route.getMode()).toBe("developer");
    expect(route.getIsDeveloper()).toBe(true);
    expect(route.getPanel()).toBe("help");
    expect(route.getSearchParams()).toBe("?mode=developer&panel=help&x=1");
    expect(route.getSearchParams({ ignore: "panel" })).toBe(
      "?mode=developer&x=1",
    );
    expect(
      route.getSearchParams({
        ignore: ["panel", "x"],
        add: { locale: "ar" },
      }),
    ).toBe("?mode=developer&locale=ar");
    expect(route.getSearchParams({ add: { locale: "fr" } })).toBe(
      "?mode=developer&panel=help&x=1&locale=fr",
    );
    expect(
      route.getLocationUrl({ ignore: "panel", add: { locale: "ar" } }),
    ).toBe("/index.en.html?mode=developer&x=1&locale=ar#top");
    expect(route.buildUrl("./index.ar.html").href).toBe(
      "https://emoji.example/index.ar.html",
    );
    expect(
      route.buildUrl({
        pathname: "/index.ar.html",
        search: "?panel=language",
        hash: "#dialog",
      }).href,
    ).toBe("https://emoji.example/index.ar.html?panel=language#dialog");
    expect(route.getHistoryState()).toEqual({ page: 1 });

    route.push("ar", {
      pathname: "/index.ar.html",
      search: "?panel=help",
      hash: "",
    });
    route.applyHistory("replace", "/index.en.html?panel=filters", { page: 2 });
    route.applyHistory("noop" as any, "/index.en.html?panel=ignored", {
      page: 3,
    });
    expect(historyCalls).toEqual([
      ["push", { locale: "ar" }, "/index.ar.html?panel=help"],
      ["replace", { page: 2 }, "/index.en.html?panel=filters"],
    ]);

    (globalThis.window as any).location = {
      origin: "https://emoji.example",
      pathname: "/index.en.html",
      search: "?mode=advanced&panel=favorites",
      hash: "",
    };
    expect(route.getMode()).toBe("advanced");
    expect(route.getPanel()).toBe("favorites");

    (globalThis.window as any).location.search = "?panel=language";
    expect(route.getPanel()).toBe("language");

    (globalThis.window as any).location.search = "?panel=filters";
    expect(route.getPanel()).toBe("filters");

    (globalThis.window as any).location = { pathname: "/local/index.html" };
    expect(route.getLocale()).toBeUndefined();
    expect(route.getHref()).toBe("http://localhost/local/index.html");
    expect(route.hasHistory()).toBe(true);

    Reflect.deleteProperty(globalThis.window as any, "location");
    expect(route.buildUrl("./index.fr.html").href).toBe(
      "https://fallback.example/base/index.fr.html",
    );
    expect(route.hasLocation()).toBe(false);

    Reflect.deleteProperty(globalThis.window as any, "history");
    expect(route.hasHistory()).toBe(false);
    (globalThis.document as any).baseURI = undefined;
    expect(
      route.buildUrl({ search: "?fallback=1", hash: "#hash" } as any).href,
    ).toBe("http://localhost/?fallback=1#hash");

    (globalThis.window as any).location = {
      origin: "http://localhost:4173",
      pathname: "/index.en.html",
      search: "",
      hash: "",
    };
    (globalThis.window as any).history = {
      state: { page: 1 },
      pushState(state: unknown, _title: string, url: string) {
        historyCalls.push(["push", state, url] as any);
      },
      replaceState(state: unknown, _title: string, url: string) {
        historyCalls.push(["replace", state, url] as any);
      },
    };
    expect(route.isLocalPreview()).toBe(true);
    expect(route.getPanel()).toBe("");
    expect(route.getMode()).toBe("");
    expect(route.getSearchParams()).toBe("");
  });
});
