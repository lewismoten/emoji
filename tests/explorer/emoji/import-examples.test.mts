import assert from "node:assert/strict";
import {
  ensureImportExamples,
  getCodeExampleText,
  renderImportExamples,
  resolveImportExamples,
} from "../../../src/explorer/emoji/import-examples.js";
import {
  FakeNode,
  importExamplesManifest as manifest,
  installImportExamplesFixture,
} from "./imports/import-examples-fixture.mjs";

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
  resolveImportExamples({ packs: [], categories: [] } as any, {
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
      packs: [{ id: "all", importPath: "@lewismoten/emoji/all-custom" }],
      categories: [
        {
          label: "Objects",
          importPath: "@lewismoten/emoji/categories/objects",
          subcategories: [],
        },
      ],
    } as any,
    { key: "abacus", group: "Objects", unicodeSubGroup: "tool" },
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

const fixture = installImportExamplesFixture();

try {
  const dialog = new FakeNode("dialog");
  const code = new FakeNode("code");
  const line = new FakeNode("line");
  const stringNode = new FakeNode("string");
  line.append(stringNode);
  code.append(line);
  dialog.append(code);

  [
    "emoji-import-path",
    "emoji-popular-import",
    "emoji-popular-import-path",
    "emoji-category-import",
    "emoji-category-import-path",
    "emoji-subgroup-import",
    "emoji-subgroup-import-path",
  ].forEach((name) => fixture.queried.set(`.${name}`, new FakeNode(name)));

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
  assert.equal(
    fixture.queried.get(".emoji-import-path")?.textContent,
    "@lewismoten/emoji/all",
  );
  assert.equal(fixture.queried.get(".emoji-popular-import")?.hidden, false);
  assert.equal(
    fixture.queried.get(".emoji-category-import-path")?.textContent,
    "@lewismoten/emoji/categories/objects",
  );

  fixture.queried.clear();
  assert.doesNotThrow(() =>
    renderImportExamples(manifest as any, {
      key: "missing",
      group: "Other",
      unicodeSubGroup: "none",
    }),
  );
  assert.doesNotThrow(() => ensureImportExamples(new FakeNode("dialog") as any));
} finally {
  fixture.restore();
}
