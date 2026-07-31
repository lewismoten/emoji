import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
// Direct source under test: ../../src/explorer/advanced-filter-dialog-control.js

const root = process.cwd();
const sourcePath = path.join(root, "src/explorer/advanced-filter-dialog-control.ts");
const source = await fs.readFile(sourcePath, "utf8");

const transformedSource = source
  .replace(
    'import { AdvancedFiltersTriggerControl } from "../controls/filters/pickers/advanced-filters-trigger.js";',
    'import { AdvancedFiltersTriggerControl } from "./advanced-filters-trigger-stub.mjs";',
  )
  .replace(
    'import { GenderFilterControl } from "../controls/filters/modifiers/gender-filter.js";',
    'import { GenderFilterControl } from "./gender-filter-stub.mjs";',
  )
  .replace(
    'import { HairFilterControl } from "../controls/filters/modifiers/hair-filter.js";',
    'import { HairFilterControl } from "./hair-filter-stub.mjs";',
  )
  .replace(
    'import { SkinToneFilterControl } from "../controls/filters/modifiers/skin-tone-filter.js";',
    'import { SkinToneFilterControl } from "./skin-tone-filter-stub.mjs";',
  )
  .replace(
    'import { DialogControl } from "../controls/dialog/dialog-control.js";',
    'import { DialogControl } from "./dialog-control-stub.mjs";',
  );

const tempRoot = path.join(root, "build/tests/.tmp");
await fs.mkdir(tempRoot, { recursive: true });
const tempDirectory = await fs.mkdtemp(path.join(tempRoot, "advanced-filters-"));

await fs.writeFile(
  path.join(tempDirectory, "advanced-filters-trigger-stub.mjs"),
  `export const AdvancedFiltersTriggerControl = {
  create() {
    return { kind: "advanced-trigger" };
  }
};`,
);
await fs.writeFile(
  path.join(tempDirectory, "gender-filter-stub.mjs"),
  `export const GenderFilterControl = {
  create() {
    return { kind: "gender-filter" };
  }
};`,
);
await fs.writeFile(
  path.join(tempDirectory, "hair-filter-stub.mjs"),
  `export const HairFilterControl = {
  create() {
    return { kind: "hair-filter" };
  }
};`,
);
await fs.writeFile(
  path.join(tempDirectory, "skin-tone-filter-stub.mjs"),
  `export const SkinToneFilterControl = {
  create() {
    return { kind: "skin-tone-filter" };
  }
};`,
);
await fs.writeFile(
  path.join(tempDirectory, "dialog-control-stub.mjs"),
  `export const DialogControl = {
  create(options) {
    return {
      className: options.className,
      id: options.dialogId,
      querySelector(selector) {
        if (selector === ".advanced-filters-dialog-body") {
          return {
            className: "advanced-filters-dialog-body",
            childNodes: [],
            append(...nodes) {
              this.childNodes.push(...nodes);
            }
          };
        }
        return null;
      }
    };
  }
};`,
);
await fs.writeFile(
  path.join(tempDirectory, "advanced-filter-dialog-control.mjs"),
  transformedSource,
);

const module = await import(
  pathToFileURL(path.join(tempDirectory, "advanced-filter-dialog-control.mjs")).href
);

class FakeElement {
  className = "";
  hidden = false;
  id = "";
  childNodes: any[] = [];
  attributes = new Map<string, string>();
  dataset: Record<string, string> = {};

  constructor(readonly tagName: string) {}

  append(...nodes: any[]) {
    this.childNodes.push(...nodes);
  }

  prepend(...nodes: any[]) {
    this.childNodes.unshift(...nodes);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  querySelector(selector: string) {
    return this.childNodes.find((node) => node?.className === selector.replace(/^\./, "")) ?? null;
  }
}

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
try {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement(tagName: string) {
        return new FakeElement(tagName);
      },
      createTextNode(text: string) {
        return { textContent: text };
      },
      querySelector(selector: string) {
        if (selector === ".filter-options") return filterOptions;
        if (selector === "main") return main;
        if (selector === ".advanced-filters-dialog") return null;
        return null;
      },
    },
  });

  const filterOptions = {
    prepended: [] as any[],
    querySelector() {
      return null;
    },
    prepend(node: any) {
      this.prepended.push(node);
    },
  };
  const main = {
    appended: [] as any[],
    append(node: any) {
      this.appended.push(node);
    },
  };

  assert.deepEqual(module.createAdvancedFiltersTriggerControl(), {
    kind: "advanced-trigger",
  });

  const created = module.createAdvancedFiltersDialogControl();
  assert.equal(created.dialog.className, "advanced-filters-dialog");
  assert.equal(created.dialog.id, "advanced-filters-dialog");
  assert.equal(created.grid.className, "filter-grid");
  assert.equal(created.modifiers.className, "modifier-filters");
  assert.deepEqual(created.modifiers.childNodes, [
    { kind: "gender-filter" },
    { kind: "skin-tone-filter" },
    { kind: "hair-filter" },
  ]);

  module.ensureAdvancedFilterControls();
  assert.deepEqual(filterOptions.prepended, [{ kind: "advanced-trigger" }]);
  assert.equal(main.appended.length, 1);
  assert.equal(main.appended[0]?.id, "advanced-filters-dialog");
} finally {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
}
