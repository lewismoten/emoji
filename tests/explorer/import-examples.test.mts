import assert from "node:assert/strict";
import { resolveImportExamples } from "../../src/explorer/import-examples.js";

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
