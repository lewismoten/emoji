import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  ensureImportExamples,
  getCodeExampleText,
  loadPackageManifest,
  renderImportExamples,
  resolveImportExamples,
} from "../../../../src/explorer/emoji/import-examples.js";

type FakeNode = ReturnType<typeof createNode>;

type NodeLike = {
  className: string;
  hidden: boolean;
  textContent: string | null;
  children: Array<NodeLike | string>;
  appendedAfter: NodeLike[];
  append(...nodes: Array<NodeLike | string>): void;
  after(...nodes: NodeLike[]): void;
  replaceChildren(...nodes: Array<NodeLike | string>): void;
  querySelector(selector: string): NodeLike | null;
  querySelectorAll(selector: string): NodeLike[];
};

function createNode(className = "", textContent = ""): NodeLike {
  return {
    className,
    hidden: false,
    textContent,
    children: [] as Array<FakeNode | string>,
    appendedAfter: [] as FakeNode[],
    append(...nodes: Array<FakeNode | string>) {
      this.children.push(...nodes);
    },
    after(...nodes: FakeNode[]) {
      this.appendedAfter.push(...nodes);
    },
    replaceChildren(...nodes: Array<FakeNode | string>) {
      this.children = [...nodes];
      this.textContent = nodes.filter((node) => typeof node === "string").join("");
    },
    querySelector(selector: string) {
      if (selector.includes(" ")) {
        const [first, second] = selector.split(/\s+/, 2);
        return this.querySelector(first)?.querySelector(second) ?? null;
      }
      const className = selector.replace(/^\./, "");
      return (
        this.children.find(
          (child): child is FakeNode =>
            typeof child !== "string" &&
            child.className.split(/\s+/).includes(className),
        ) ?? null
      );
    },
    querySelectorAll(selector: string) {
      if (selector.includes(" ")) {
        const [first, second] = selector.split(/\s+/, 2);
        return this.querySelector(first)?.querySelectorAll(second) ?? [];
      }
      const className = selector.replace(/^\./, "");
      return this.children.filter(
        (child): child is FakeNode =>
          typeof child !== "string" &&
          child.className.split(/\s+/).includes(className),
      );
    },
  };
}

describe("import-examples-runtime", () => {
  it("exercises import example helpers with a minimal runtime DOM and fetch", async () => {
    const packageManifest = {
      packs: [
        { id: "all", importPath: "@lewismoten/emoji/all" },
        {
          id: "popular",
          importPath: "@lewismoten/emoji/popular",
          keys: ["grinningFace"],
        },
      ],
      categories: [
        {
          label: "Smileys & Emotion",
          importPath: "@lewismoten/emoji/categories/smileys-and-emotion",
          subcategories: [
            {
              unicodeSubgroup: "face-smiling",
              importPath:
                "@lewismoten/emoji/categories/smileys-and-emotion/face-smiling",
            },
          ],
        },
      ],
    };

    assert.deepEqual(
      resolveImportExamples(packageManifest, {
        key: "grinningFace",
        group: "Smileys & Emotion",
        unicodeSubGroup: "face-smiling",
      }),
      {
        allPath: "@lewismoten/emoji/all",
        popularPath: "@lewismoten/emoji/popular",
        showPopular: true,
        categoryPath: "@lewismoten/emoji/categories/smileys-and-emotion",
        showCategory: true,
        subgroupPath:
          "@lewismoten/emoji/categories/smileys-and-emotion/face-smiling",
        showSubgroup: true,
      },
    );

    const lineOne = createNode("line", 'import emoji from "a";');
    const lineTwo = createNode("line", 'import emoji from "b";');
    lineTwo.hidden = true;
    const dialog = createNode("dialog");
    const code = createNode("code");
    code.children.push(lineOne, lineTwo);
    dialog.children.push(code);
    assert.equal(getCodeExampleText(dialog), 'import emoji from "a";');

    assert.deepEqual(
      resolveImportExamples(
        {
          packs: [{ id: "all", importPath: "@lewismoten/emoji/all-custom" }],
          categories: [
            {
              label: "Smileys & Emotion",
              importPath: "@lewismoten/emoji/categories/smileys-and-emotion",
              subcategories: [],
            },
          ],
        } as any,
        {
          key: "rocket",
          group: "Smileys & Emotion",
          unicodeSubGroup: "face-negative",
        },
      ),
      {
        allPath: "@lewismoten/emoji/all-custom",
        popularPath: "",
        showPopular: false,
        categoryPath: "@lewismoten/emoji/categories/smileys-and-emotion",
        showCategory: true,
        subgroupPath: "",
        showSubgroup: false,
      },
    );

    const allPath = createNode("emoji-import-path");
    const popularLine = createNode("emoji-popular-import");
    const popularPath = createNode("emoji-popular-import-path");
    const categoryLine = createNode("emoji-category-import");
    const categoryPath = createNode("emoji-category-import-path");
    const subgroupLine = createNode("emoji-subgroup-import");
    const subgroupPath = createNode("emoji-subgroup-import-path");
    const queryMap = new Map<string, FakeNode>([
      [".emoji-import-path", allPath],
      [".emoji-popular-import", popularLine],
      [".emoji-popular-import-path", popularPath],
      [".emoji-category-import", categoryLine],
      [".emoji-category-import-path", categoryPath],
      [".emoji-subgroup-import", subgroupLine],
      [".emoji-subgroup-import-path", subgroupPath],
    ]);
    const globals = globalThis as typeof globalThis & {
      document?: any;
      fetch?: typeof fetch;
    };
    const originalDocument = globals.document;
    Object.defineProperty(globals, "document", {
      configurable: true,
      value: {
        createElement: (tagName: string) => createNode(tagName),
        querySelector: (selector: string) => queryMap.get(selector) ?? null,
      },
    });

    renderImportExamples(packageManifest, {
      key: "grinningFace",
      group: "Smileys & Emotion",
      unicodeSubGroup: "face-smiling",
    });
    assert.equal(allPath.textContent, "@lewismoten/emoji/all");
    assert.equal(popularLine.hidden, false);
    assert.equal(subgroupPath.textContent?.includes("face-smiling"), true);

    renderImportExamples(
      {
        packs: [{ id: "all", importPath: "@lewismoten/emoji/all-custom" }],
        categories: [],
      } as any,
      {
        key: "unknown",
        group: "Objects",
        unicodeSubGroup: "tool",
      },
    );
    assert.equal(allPath.textContent, "@lewismoten/emoji/all-custom");
    assert.equal(popularLine.hidden, true);
    assert.equal(categoryLine.hidden, true);
    assert.equal(subgroupLine.hidden, true);

    let currentManifest = { packs: [], categories: [] };
    let currentPromise: Promise<unknown> | undefined;
    const originalFetch = globals.fetch;
    globals.fetch = (async () =>
      ({
        ok: true,
        async json() {
          return packageManifest;
        },
      }) as Response) as typeof fetch;
    const loaded = await loadPackageManifest({
      getManifest: () => currentManifest as never,
      getPromise: () => currentPromise,
      setManifest: (manifest) => {
        currentManifest = manifest as never;
      },
      setPromise: (promise) => {
        currentPromise = promise;
      },
    });
    assert.equal(loaded, packageManifest);
    assert.equal(currentManifest, packageManifest);

    const importPath = createNode("emoji-import-path");
    const importString = createNode("string");
    importString.children.push(importPath);
    const importLine = createNode("line");
    importLine.children.push(importString);
    const codeBlock = createNode("code");
    codeBlock.children.push(importLine);
    const exampleDialog = createNode("example-dialog");
    exampleDialog.children.push(codeBlock);
    ensureImportExamples(exampleDialog);
    assert.equal(importPath.textContent, "@lewismoten/emoji/all");
    assert.equal(importLine.appendedAfter.length, 1);

    if (originalDocument === undefined) {
      delete globals.document;
    } else {
      Object.defineProperty(globals, "document", {
        configurable: true,
        value: originalDocument,
      });
    }
    globals.fetch = originalFetch;
  });
});
