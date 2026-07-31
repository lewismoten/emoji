import assert from "node:assert/strict";
import {
  ensureImportExamples,
  getCodeExampleText,
  loadPackageManifest,
  renderImportExamples,
  resolveImportExamples,
} from "../../../../src/explorer/emoji/import-examples.js";

const manifest = {
  packs: [
    { id: "popular", importPath: "@lewismoten/emoji/popular", keys: ["wave"] },
    { id: "all", importPath: "@lewismoten/emoji/all" },
  ],
  categories: [
    {
      label: "Objects",
      importPath: "@lewismoten/emoji/categories/objects",
      subcategories: [
        {
          unicodeSubgroup: "mail",
          importPath: "@lewismoten/emoji/categories/objects/mail",
        },
      ],
    },
  ],
};

assert.deepEqual(
  resolveImportExamples(manifest, {
    key: "wave",
    group: "Objects",
    unicodeSubGroup: "mail",
  }),
  {
    allPath: "@lewismoten/emoji/all",
    popularPath: "@lewismoten/emoji/popular",
    showPopular: true,
    categoryPath: "@lewismoten/emoji/categories/objects",
    showCategory: true,
    subgroupPath: "@lewismoten/emoji/categories/objects/mail",
    showSubgroup: true,
  },
);

assert.deepEqual(
  resolveImportExamples(manifest, {
    key: "rocket",
    group: "Travel & Places",
    unicodeSubGroup: "sky",
  }),
  {
    allPath: "@lewismoten/emoji/all",
    popularPath: "",
    showPopular: false,
    categoryPath: "",
    showCategory: false,
    subgroupPath: "",
    showSubgroup: false,
  },
);

assert.deepEqual(
  resolveImportExamples(
    {
      packs: [],
      categories: [],
    } as any,
    {
      key: "rocket",
      group: "Travel & Places",
      unicodeSubGroup: "sky",
    },
  ),
  {
    allPath: "@lewismoten/emoji/all",
    popularPath: "",
    showPopular: false,
    categoryPath: "",
    showCategory: false,
    subgroupPath: "",
    showSubgroup: false,
  },
);

assert.deepEqual(
  resolveImportExamples(
    {
      packs: [{ id: "popular", importPath: "@lewismoten/emoji/popular", keys: ["wave"] }],
      categories: [],
    } as any,
    {
      key: "wave",
      group: "Objects",
      unicodeSubGroup: "mail",
    },
  ),
  {
    allPath: "@lewismoten/emoji/all",
    popularPath: "@lewismoten/emoji/popular",
    showPopular: true,
    categoryPath: "",
    showCategory: false,
    subgroupPath: "",
    showSubgroup: false,
  },
);

class FakeNode {
  className = "";
  hidden = false;
  textContent: string | null = "";
  childNodes: any[] = [];
  parent: FakeNode | null = null;

  constructor(className = "") {
    this.className = className;
  }

  append(...nodes: any[]) {
    for (const node of nodes) {
      if (node instanceof FakeNode) node.parent = this;
      this.childNodes.push(node);
    }
  }

  after(...nodes: any[]) {
    if (!this.parent) return;
    const index = this.parent.childNodes.indexOf(this);
    this.parent.childNodes.splice(index + 1, 0, ...nodes);
    nodes.forEach((node) => {
      if (node instanceof FakeNode) node.parent = this.parent;
    });
  }

  replaceChildren(...nodes: any[]) {
    this.childNodes = [];
    this.append(...nodes);
  }

  querySelector(selector: string): FakeNode | null {
    return this.querySelectorAll(selector)[0] ?? null;
  }

  querySelectorAll(selector: string): FakeNode[] {
    const classes = selector
      .split(/\s+/)
      .map((value) => value.replace(/^\./, ""));
    const results: FakeNode[] = [];
    const walk = (node: FakeNode) => {
      for (const child of node.childNodes) {
        if (!(child instanceof FakeNode)) continue;
        walk(child);
        if (
          classes.length === 1 &&
          child.className.split(/\s+/).includes(classes[0]!)
        ) {
          results.push(child);
        } else if (
          classes.length === 2 &&
          child.className.split(/\s+/).includes(classes[1]!) &&
          child.parent?.className.split(/\s+/).includes(classes[0]!)
        ) {
          results.push(child);
        }
      }
    };
    walk(this);
    return results;
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
const originalFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
const originalWarn = console.warn;

try {
  const queried = new Map<string, FakeNode>();
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement() {
        return new FakeNode();
      },
      querySelector(selector: string) {
        return queried.get(selector) ?? null;
      },
    },
  });

  const dialog = new FakeNode("dialog");
  const code = new FakeNode("code");
  const line = new FakeNode("line");
  const stringNode = new FakeNode("string");
  line.append(stringNode);
  code.append(line);
  dialog.append(code);

  queried.set(".emoji-import-path", new FakeNode("emoji-import-path"));
  queried.set(".emoji-popular-import", new FakeNode("emoji-popular-import"));
  queried.set(".emoji-popular-import-path", new FakeNode("emoji-popular-import-path"));
  queried.set(".emoji-category-import", new FakeNode("emoji-category-import"));
  queried.set(".emoji-category-import-path", new FakeNode("emoji-category-import-path"));
  queried.set(".emoji-subgroup-import", new FakeNode("emoji-subgroup-import"));
  queried.set(".emoji-subgroup-import-path", new FakeNode("emoji-subgroup-import-path"));

  ensureImportExamples(dialog as any);
  assert.equal(
    stringNode.querySelector(".emoji-import-path")?.textContent,
    "@lewismoten/emoji/all",
  );
  assert.equal(code.querySelectorAll(".line").length, 4);

  const codeDialog = new FakeNode("dialog");
  const codeRoot = new FakeNode("code");
  const codeLineA = new FakeNode("line");
  codeLineA.textContent = 'import emoji from "@lewismoten/emoji/all";';
  const codeLineB = new FakeNode("line");
  codeLineB.textContent = "console.log(emoji.wave);";
  const hiddenLine = new FakeNode("line");
  hiddenLine.hidden = true;
  hiddenLine.textContent = "hidden";
  codeRoot.append(codeLineA, codeLineB, hiddenLine);
  codeDialog.append(codeRoot);
  assert.equal(
    getCodeExampleText(codeDialog as any),
    'import emoji from "@lewismoten/emoji/all";\nconsole.log(emoji.wave);',
  );

  renderImportExamples(manifest as any, {
    key: "wave",
    group: "Objects",
    unicodeSubGroup: "mail",
  });
  assert.equal(queried.get(".emoji-import-path")?.textContent, "@lewismoten/emoji/all");
  assert.equal(queried.get(".emoji-popular-import")?.hidden, false);
  assert.equal(
    queried.get(".emoji-category-import-path")?.textContent,
    "@lewismoten/emoji/categories/objects",
  );
  assert.equal(
    queried.get(".emoji-subgroup-import-path")?.textContent,
    "@lewismoten/emoji/categories/objects/mail",
  );

  queried.clear();
  assert.doesNotThrow(() =>
    renderImportExamples(manifest as any, {
      key: "missing",
      group: "Other",
      unicodeSubGroup: "none",
    }),
  );

  const blankDialog = new FakeNode("dialog");
  assert.doesNotThrow(() => ensureImportExamples(blankDialog as any));

  let currentManifest: any = { packs: [], categories: [] };
  let currentPromise: Promise<unknown> | undefined;
  const warnings: any[][] = [];
  console.warn = (...args: any[]) => warnings.push(args);
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: false,
      async json() {
        return {};
      },
    }),
  });

  const promise = loadPackageManifest({
    getManifest: () => currentManifest,
    getPromise: () => currentPromise,
    setManifest: (manifestValue) => {
      currentManifest = manifestValue;
    },
    setPromise: (promiseValue) => {
      currentPromise = promiseValue;
    },
  });
  const loaded = await promise;
  assert.deepEqual(loaded, { packs: [], categories: [] });
  assert.equal(warnings.length, 1);
  assert.equal(
    loadPackageManifest({
      getManifest: () => currentManifest,
      getPromise: () => currentPromise,
      setManifest: (manifestValue) => {
        currentManifest = manifestValue;
      },
      setPromise: (promiseValue) => {
        currentPromise = promiseValue;
      },
    }),
    promise,
  );

  currentManifest = { packs: [], categories: [] };
  currentPromise = undefined;
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: true,
      async json() {
        return manifest;
      },
    }),
  });
  const loadedManifest = await loadPackageManifest({
    getManifest: () => currentManifest,
    getPromise: () => currentPromise,
    setManifest: (manifestValue) => {
      currentManifest = manifestValue;
    },
    setPromise: (promiseValue) => {
      currentPromise = promiseValue;
    },
  });
  assert.deepEqual(loadedManifest, manifest);
  assert.deepEqual(currentManifest, manifest);
} finally {
  console.warn = originalWarn;
  if (originalDocument)
    Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
  if (originalFetch) Object.defineProperty(globalThis, "fetch", originalFetch);
  else Reflect.deleteProperty(globalThis, "fetch");
}

assert.deepEqual(
  resolveImportExamples(
    {
      packs: [{ id: "popular", importPath: "@lewismoten/emoji/popular" }],
      categories: [],
    } as any,
    {
      key: "wave",
      group: "Objects",
      unicodeSubGroup: "mail",
    },
  ),
  {
    allPath: "@lewismoten/emoji/all",
    popularPath: "",
    showPopular: false,
    categoryPath: "",
    showCategory: false,
    subgroupPath: "",
    showSubgroup: false,
  },
);

assert.deepEqual(
  resolveImportExamples(
    {
      packs: [{ id: "all", importPath: "@lewismoten/emoji/all-custom" }],
      categories: [
        {
          label: "Objects",
          importPath: "@lewismoten/emoji/categories/objects",
          subcategories: [],
        },
      ],
    } as any,
    {
      key: "abacus",
      group: "Objects",
      unicodeSubGroup: "tool",
    },
  ),
  {
    allPath: "@lewismoten/emoji/all-custom",
    popularPath: "",
    showPopular: false,
    categoryPath: "@lewismoten/emoji/categories/objects",
    showCategory: true,
    subgroupPath: "",
    showSubgroup: false,
  },
);
