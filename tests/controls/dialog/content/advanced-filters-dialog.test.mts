import assert from "node:assert/strict";

import { AdvancedFiltersDialogControl } from "../../../../src/controls/dialog/content/advanced-filters-dialog.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

const restore = installFakeDocument();
const documentRef = (
  globalThis as typeof globalThis & {
    document: { head: FakeElement & { children: FakeElement[] } };
  }
).document;

const dialog = AdvancedFiltersDialogControl.create() as unknown as FakeElement;
const styleBlocks = documentRef.head.children.filter(
  (child: FakeElement) =>
    child instanceof FakeElement && child.tagName === "STYLE",
) as FakeElement[];

assert.equal(dialog.className, "advanced-filters-dialog");
assert.equal(dialog.getAttribute("id"), "advanced-filters-dialog");
assert.equal(styleBlocks.length >= 3, true);
assert.equal(
  styleBlocks.some(
    (item) => item.id === "dialog-heading-control-style",
  ),
  true,
);
assert.equal(
  styleBlocks.some(
    (item) => item.id === "dialog-close-button-control-style",
  ),
  true,
);
assert.equal(
  styleBlocks.some(
    (item) => item.id === "modifier-filter-control-style",
  ),
  true,
);
const body = (dialog as any).querySelector(
  ".advanced-filters-dialog-body",
) as FakeElement;
assert.ok(body);
const grid = (dialog as any).querySelector(".filter-grid") as FakeElement;
const modifiers = (dialog as any).querySelector(
  ".modifier-filters",
) as FakeElement;
assert.ok(grid);
assert.ok(modifiers);
assert.equal(grid.children.length, 1);
assert.equal(modifiers.children.length, 3);

const markup = AdvancedFiltersDialogControl.toMarkup();
assert.match(markup, /class="advanced-filters-dialog"/);
assert.match(markup, /class="filter-grid"/);
assert.match(markup, /class="modifier-filters"/);
assert.match(markup, /data-i18n="advancedFilters"/);

restore();
