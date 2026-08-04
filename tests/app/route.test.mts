import assert from "node:assert/strict";
import * as route from "../../src/app/route.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const historyCalls: unknown[] = [];

try {
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

  assert.equal(route.hasLocation(), true);
  assert.equal(route.hasHistory(), true);
  assert.equal(route.getSearch(), "?mode=developer&panel=help&x=1");
  assert.equal(route.getHash(), "#top");
  assert.equal(
    route.getSearch(
      "https://emoji.example/index.ar.html?panel=favorites#sheet",
    ),
    "?panel=favorites",
  );
  assert.equal(
    route.getHash("https://emoji.example/index.ar.html?panel=favorites#sheet"),
    "#sheet",
  );
  assert.equal(route.getParam("x"), "1");
  assert.equal(route.getParam("missing"), "");
  assert.equal(route.getLocale(), "en");
  assert.equal(route.getPathName(), "/index.en.html");
  assert.equal(route.getOrigin(), "https://emoji.example");
  assert.equal(
    route.getHref(),
    "https://emoji.example/index.en.html?mode=developer&panel=help&x=1#top",
  );
  assert.equal(route.isLocalPreview(), false);
  assert.equal(route.getMode(), "developer");
  assert.equal(route.getIsDeveloper(), true);
  assert.equal(route.getPanel(), "help");
  assert.equal(route.getSearchParams(), "?mode=developer&panel=help&x=1");
  assert.equal(
    route.getSearchParams({ ignore: "panel" }),
    "?mode=developer&x=1",
  );
  assert.equal(
    route.getSearchParams({ ignore: ["panel", "x"], add: { locale: "ar" } }),
    "?mode=developer&locale=ar",
  );
  assert.equal(
    route.getSearchParams({ add: { locale: "fr" } }),
    "?mode=developer&panel=help&x=1&locale=fr",
  );
  assert.equal(
    route.getLocationUrl({ ignore: "panel", add: { locale: "ar" } }),
    "/index.en.html?mode=developer&x=1&locale=ar#top",
  );
  assert.equal(
    route.buildUrl("./index.ar.html").href,
    "https://emoji.example/index.ar.html",
  );
  assert.equal(
    route.buildUrl({
      pathname: "/index.ar.html",
      search: "?panel=language",
      hash: "#dialog",
    }).href,
    "https://emoji.example/index.ar.html?panel=language#dialog",
  );
  assert.deepEqual(route.getHistoryState(), { page: 1 });
  route.push("ar", {
    pathname: "/index.ar.html",
    search: "?panel=help",
    hash: "",
  });
  route.applyHistory("replace", "/index.en.html?panel=filters", { page: 2 });
  route.applyHistory("noop" as any, "/index.en.html?panel=ignored", {
    page: 3,
  });
  assert.deepEqual(historyCalls, [
    ["push", { locale: "ar" }, "/index.ar.html?panel=help"],
    ["replace", { page: 2 }, "/index.en.html?panel=filters"],
  ]);

  (globalThis.window as any).location = {
    origin: "https://emoji.example",
    pathname: "/index.en.html",
    search: "?mode=advanced&panel=favorites",
    hash: "",
  };
  assert.equal(route.getMode(), "advanced");
  assert.equal(route.getPanel(), "favorites");

  (globalThis.window as any).location.search = "?panel=language";
  assert.equal(route.getPanel(), "language");

  (globalThis.window as any).location.search = "?panel=filters";
  assert.equal(route.getPanel(), "filters");

  (globalThis.window as any).location = { pathname: "/local/index.html" };
  assert.equal(route.getLocale(), undefined);
  assert.equal(route.getHref(), "http://localhost/local/index.html");
  assert.equal(route.hasHistory(), true);

  Reflect.deleteProperty((globalThis as any).window, "location");
  assert.equal(
    route.buildUrl("./index.fr.html").href,
    "https://fallback.example/base/index.fr.html",
  );
  assert.equal(route.hasLocation(), false);

  Reflect.deleteProperty(globalThis.window as any, "history");
  assert.equal(route.hasHistory(), false);
  (globalThis.document as any).baseURI = undefined;
  assert.equal(
    route.buildUrl({ search: "?fallback=1", hash: "#hash" } as any).href,
    "http://localhost/?fallback=1#hash",
  );

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
  assert.equal(route.isLocalPreview(), true);
  assert.equal(route.getPanel(), "");
  assert.equal(route.getMode(), "");
  assert.equal(route.getSearchParams(), "");
} finally {
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
