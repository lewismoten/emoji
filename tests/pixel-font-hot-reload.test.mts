import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  createPixelFontHotReloadController,
  installPixelFontHotReload,
  refreshExplorerPixelFont,
  refreshPixelFontStylesheet,
} from "../src/pixel-font-hot-reload.js";

const pendingTasks: Array<() => void> = [];
const flushTasks = async () => {
  while (pendingTasks.length) {
    const task = pendingTasks.shift();
    task?.();
    await Promise.resolve();
  }
};
const flushAsyncTurn = () => new Promise((resolve) => setTimeout(resolve, 0));

let stylesheetLoadedRevision = "";
const hotEvents: Record<string, () => void> = {};
const visibilityEvents: Record<string, () => void> = {};
let intervalHandler: (() => void | Promise<void>) | undefined;
const refreshCalls: string[] = [];

const fetchQueue: Array<
  () => Promise<{ ok: boolean; text: () => Promise<string> }>
> = [];
const controller = createPixelFontHotReloadController(
  {
    refreshStylesheet(revision: string) {
      refreshCalls.push(revision);
    },
  },
  {
    hot: {
      on(event: string, handler: () => void) {
        hotEvents[event] = handler;
      },
    },
    fetch: () => {
      const next = fetchQueue.shift();
      assert.ok(next, "expected queued fetch response");
      return next();
    },
    document: {
      hidden: false,
      addEventListener(event: string, handler: () => void) {
        visibilityEvents[event] = handler;
      },
    },
    window: {
      setInterval(handler: () => void | Promise<void>) {
        intervalHandler = handler;
        return 1;
      },
      requestAnimationFrame(handler: () => void) {
        pendingTasks.push(handler);
        return 1;
      },
    },
    now: () => 123,
  } as any,
);

fetchQueue.push(async () => ({
  ok: true,
  text: async () => "rev-1",
}));
controller.start();
await Promise.resolve();
await Promise.resolve();
await flushTasks();
assert.deepEqual(refreshCalls, ["rev-1"]);
assert.equal(typeof hotEvents["pixel-font:updated"], "function");
assert.equal(typeof visibilityEvents.visibilitychange, "function");
assert.equal(typeof intervalHandler, "function");

fetchQueue.push(async () => ({
  ok: true,
  text: async () => "rev-1",
}));
visibilityEvents.visibilitychange();
await Promise.resolve();
await flushTasks();
assert.deepEqual(refreshCalls, ["rev-1"]);

controller as any;

fetchQueue.push(async () => ({
  ok: true,
  text: async () => "rev-1",
}));
(controller as any).refresh();
await Promise.resolve();
await flushTasks();
assert.deepEqual(refreshCalls, ["rev-1"]);

(controller as any).refresh = controller.refresh;
(controller as any).refresh;

const documentRef = controller as any;
void documentRef;

const hiddenDeps = {
  hidden: true,
  addEventListener() {},
};
const hiddenFetchCalls: string[] = [];
const hiddenController = createPixelFontHotReloadController(
  {
    refreshStylesheet(revision: string) {
      hiddenFetchCalls.push(revision);
    },
  },
  {
    hot: undefined,
    fetch: async () => ({
      ok: true,
      text: async () => "hidden",
    }),
    document: hiddenDeps,
    window: {
      setInterval() {
        return 1;
      },
      requestAnimationFrame(handler: () => void) {
        pendingTasks.push(handler);
        return 1;
      },
    },
    now: () => 124,
  } as any,
);
await hiddenController.refresh();
await hiddenController.refresh(true);
await Promise.resolve();
await flushTasks();
assert.deepEqual(hiddenFetchCalls, ["hidden"]);

let resolvePendingFetch:
  ((value: { ok: boolean; text: () => Promise<string> }) => void) | undefined;
fetchQueue.push(
  () =>
    new Promise((resolve) => {
      resolvePendingFetch = resolve;
    }),
);
fetchQueue.push(async () => ({
  ok: true,
  text: async () => "rev-3",
}));
hotEvents["pixel-font:updated"]();
hotEvents["pixel-font:updated"]();
resolvePendingFetch?.({
  ok: true,
  text: async () => "rev-2",
});
await Promise.resolve();
await Promise.resolve();
await flushAsyncTurn();
await flushTasks();
assert.equal(refreshCalls.join(","), "rev-1,rev-2,rev-3");

fetchQueue.push(async () => ({
  ok: false,
  text: async () => "ignored",
}));
hotEvents["pixel-font:updated"]();
await Promise.resolve();
await flushAsyncTurn();
await flushTasks();
assert.equal(refreshCalls.join(","), "rev-1,rev-2,rev-3");

fetchQueue.push(async () => {
  throw new Error("network");
});
hotEvents["pixel-font:updated"]();
await Promise.resolve();
await flushAsyncTurn();
await flushTasks();
assert.equal(refreshCalls.join(","), "rev-1,rev-2,rev-3");

installPixelFontHotReload({
  refreshStylesheet() {
    throw new Error("should not run without hot");
  },
});

const installHotEvents: Record<string, () => void> = {};
const installRefreshCalls: string[] = [];
const installOriginalDocument = globalThis.document;
const installOriginalFetch = globalThis.fetch;
const installOriginalWindow = globalThis.window;
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: async () => ({
    ok: true,
    text: async () => "rev-install",
  }),
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    setInterval() {
      return 1;
    },
    requestAnimationFrame(handler: () => void) {
      pendingTasks.push(handler);
      return 1;
    },
  },
});
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    hidden: false,
    addEventListener() {},
  },
});
installPixelFontHotReload(
  {
    refreshStylesheet(revision: string) {
      installRefreshCalls.push(revision);
    },
  },
  {
    on(event: string, handler: () => void) {
      installHotEvents[event] = handler;
    },
  } as any,
);
assert.equal(typeof installHotEvents["pixel-font:updated"], "function");
await Promise.resolve();
await Promise.resolve();
await flushTasks();
assert.equal(installRefreshCalls.join(","), "rev-install");

const tempRoot = path.join(process.cwd(), "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(
  path.join(tempRoot, "pixel-font-hot-reload-"),
);
const transformedSource = (
  await fs.readFile(
    path.join(process.cwd(), "build/src/pixel-font-hot-reload.js"),
    "utf8",
  )
).replaceAll("import.meta.hot", "globalThis.__pixelHot");
await fs.writeFile(
  path.join(tempDirectory, "pixel-font-hot-reload.mjs"),
  transformedSource,
);
const transformedModule = await import(
  pathToFileURL(path.join(tempDirectory, "pixel-font-hot-reload.mjs")).href
);
const installDefaultRefreshCalls: string[] = [];
(globalThis as typeof globalThis & { __pixelHot?: any }).__pixelHot = {
  on(event: string, handler: () => void) {
    installHotEvents[event] = handler;
  },
};
transformedModule.installPixelFontHotReload({
  refreshStylesheet(revision: string) {
    installDefaultRefreshCalls.push(revision);
  },
});
await Promise.resolve();
await Promise.resolve();
await flushTasks();
assert.equal(installDefaultRefreshCalls.join(","), "rev-install");
delete (globalThis as typeof globalThis & { __pixelHot?: any }).__pixelHot;

if (installOriginalDocument) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: installOriginalDocument,
  });
} else {
  Reflect.deleteProperty(globalThis, "document");
}
if (installOriginalFetch) {
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: installOriginalFetch,
  });
} else {
  Reflect.deleteProperty(globalThis, "fetch");
}
if (installOriginalWindow) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: installOriginalWindow,
  });
} else {
  Reflect.deleteProperty(globalThis, "window");
}

let stylesheetRemoved = false;
let previousIdRemoved = false;
let afterReplacement: any;
const replacementLink = {
  dataset: {} as Record<string, string>,
  href: "",
  addEventListener(event: string, handler: () => void) {
    assert.equal(event, "load");
    handler();
  },
};
const originalLink = {
  dataset: { revision: "rev-1" },
  href: "https://emoji.example/font.css?v=old",
  cloneNode() {
    return replacementLink;
  },
  removeAttribute(name: string) {
    if (name === "id") previousIdRemoved = true;
  },
  after(node: unknown) {
    afterReplacement = node;
  },
  remove() {
    stylesheetRemoved = true;
  },
};

const originalDocument = globalThis.document;
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    querySelector(selector: string) {
      if (selector === "#pixel-font-stylesheet") return originalLink;
      return null;
    },
    querySelectorAll() {
      return [];
    },
  },
});
refreshPixelFontStylesheet(
  {
    onStylesheetLoaded(revision: string) {
      stylesheetLoadedRevision = revision;
    },
  },
  "rev-2",
);
assert.equal(previousIdRemoved, true);
assert.equal(afterReplacement, replacementLink);
assert.equal(replacementLink.dataset.revision, "rev-2");
assert.match(replacementLink.href, /v=rev-2/);
assert.equal(stylesheetRemoved, true);
assert.equal(stylesheetLoadedRevision, "rev-2");

refreshPixelFontStylesheet(
  {
    onStylesheetLoaded() {
      throw new Error("should not run for same revision");
    },
  },
  "rev-1",
);

Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  },
});
refreshPixelFontStylesheet(
  {
    onStylesheetLoaded() {
      throw new Error("should not run without stylesheet");
    },
  },
  "rev-missing",
);

const artworkCalls: Array<[unknown, string]> = [];
const standaloneCalls: Array<[unknown, string, number]> = [];
let modifierRefreshes = 0;
let manifestPayload: unknown;
let manifestRevision = "";
const emojiCells = Array.from({ length: 121 }, (_, index) => ({
  dataset: { emojiKey: `emoji-${index}` },
  querySelector() {
    return `glyph-${index}`;
  },
}));
const dialogNode = {
  querySelectorAll(selector: string) {
    if (selector === "[data-composition-emoji]") {
      return [
        {
          dataset: { compositionEmoji: "composed-emoji" },
          querySelector() {
            return "composition-glyph";
          },
        },
      ];
    }
    if (selector === "[data-composition-artwork]") {
      return [
        {
          dataset: {
            compositionArtwork: "standalone-art",
            compositionPoint: "5",
          },
          querySelector() {
            return "standalone-glyph";
          },
        },
      ];
    }
    return [];
  },
  querySelector(selector: string) {
    if (selector === ".emoji-preview-glyph") return "preview-glyph";
    if (selector === ".emoji-composition-result .emoji-composition-glyph")
      return "result-glyph";
    return null;
  },
};
let fetchCallCount = 0;
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: async () => {
    fetchCallCount += 1;
    return {
      ok: true,
      async json() {
        return { version: "manifest" };
      },
    };
  },
});
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    requestAnimationFrame(handler: () => void) {
      handler();
      return 1;
    },
  },
});
Object.defineProperty(globalThis, "document", {
  configurable: true,
  value: {
    querySelectorAll() {
      return emojiCells;
    },
  },
});
await refreshExplorerPixelFont(
  {
    updateManifest(payload: unknown, revision: string) {
      manifestPayload = payload;
      manifestRevision = revision;
    },
    applyArtwork(target: unknown, key: string) {
      artworkCalls.push([target, key]);
    },
    applyStandaloneArtwork(target: unknown, artwork: string, point: number) {
      standaloneCalls.push([target, artwork, point]);
    },
    dialog: () => dialogNode,
    currentEmojiKey: () => "focused-emoji",
    updateModifierArtwork() {
      modifierRefreshes += 1;
    },
  },
  "rev-hot",
);
assert.equal(fetchCallCount, 1);
assert.deepEqual(manifestPayload, { version: "manifest" });
assert.equal(manifestRevision, "rev-hot");
assert.equal(artworkCalls.length, 124);
assert.deepEqual(standaloneCalls, [["standalone-glyph", "standalone-art", 5]]);
assert.equal(modifierRefreshes, 1);
assert.deepEqual(artworkCalls.at(-2), ["preview-glyph", "focused-emoji"]);
assert.deepEqual(artworkCalls.at(-1), ["result-glyph", "focused-emoji"]);

const warnings: unknown[][] = [];
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  warnings.push(args);
};
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: async () => ({ ok: false }),
});
await refreshExplorerPixelFont(
  {
    updateManifest() {},
    applyArtwork() {},
    applyStandaloneArtwork() {},
    dialog: () => dialogNode,
    currentEmojiKey: () => "focused-emoji",
    updateModifierArtwork() {},
  },
  "rev-fail",
);
assert.equal(
  warnings.some(
    (entry) =>
      entry[0] === "Pixel font result refresh unavailable" &&
      entry[1] instanceof Error,
  ),
  true,
);
console.warn = originalWarn;

if (originalDocument) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
} else {
  Reflect.deleteProperty(globalThis, "document");
}
if (originalFetch) {
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: originalFetch,
  });
} else {
  Reflect.deleteProperty(globalThis, "fetch");
}
if (originalWindow) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
} else {
  Reflect.deleteProperty(globalThis, "window");
}
