import assert from "node:assert/strict";
import * as route from "../../src/app/route.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const historyCalls: any[] = [];

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
  assert.equal(route.getParam("x"), "1");
  assert.equal(route.getParam("missing"), "");
  assert.equal(route.getLocale(), "en");
  assert.equal(route.getPathName(), "/index.en.html");
  assert.equal(route.getOrigin(), "https://emoji.example");
  assert.equal(
    route.getHref(),
    "https://fallback.example/index.en.html?mode=developer&panel=help&x=1#top",
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
    route.getLocationUrl({ ignore: "panel", add: { locale: "ar" } }),
    "/index.en.html?mode=developer&x=1&locale=ar#top",
  );
  assert.equal(
    route.buildUrl("./index.ar.html").href,
    "https://fallback.example/index.ar.html",
  );
  assert.equal(
    route.buildUrl({
      pathname: "/index.ar.html",
      search: "?panel=language",
      hash: "#dialog",
    }).href,
    "https://fallback.example/index.ar.html?panel=language#dialog",
  );
  assert.deepEqual(route.getHistoryState(), { page: 1 });
  route.push("ar", {
    pathname: "/index.ar.html",
    search: "?panel=help",
    hash: "",
  });
  route.applyHistory("replace", "/index.en.html?panel=filters", { page: 2 });
  assert.deepEqual(historyCalls, [
    ["push", { locale: "ar" }, "/index.ar.html?panel=help"],
    ["replace", { page: 2 }, "/index.en.html?panel=filters"],
  ]);

  (globalThis.window as any).location = { pathname: "/local/index.html" };
  assert.equal(route.getLocale(), undefined);
  assert.equal(route.getHref(), "https://fallback.example/local/index.html");

  (globalThis.window as any).location = {
    origin: "http://localhost:4173",
    pathname: "/index.en.html",
    search: "",
    hash: "",
  };
  assert.equal(route.isLocalPreview(), true);
  assert.equal(route.getPanel(), "");
  assert.equal(route.getMode(), "");
} finally {
  if (originalWindow)
    Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
