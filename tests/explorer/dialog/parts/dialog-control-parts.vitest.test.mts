import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  appendToDialogPart,
  createDialogControlParts,
} from "../../../../src/explorer/dialog/parts/dialog-control-parts.js";

class FakeElement {
  children: FakeElement[] = [];

  constructor(
    readonly className: string,
    private readonly selectorMap: Record<string, FakeElement | null> = {},
  ) {}

  append(child: FakeElement) {
    this.children.push(child);
  }

  querySelector(selector: string) {
    return this.selectorMap[selector] ?? null;
  }
}

describe("dialog-control-parts", () => {
  it("creates dialog control parts and appends into discovered slots", () => {
    const list = new FakeElement("language-list");
    const slot = new FakeElement("help-language-control");
    const dialog = new FakeElement("dialog", {
      ".help-language-control": slot,
      ".language-list": list,
    }) as unknown as HTMLDialogElement;

    const parts = createDialogControlParts(dialog, {
      languageControl: ".help-language-control",
      list: ".language-list",
    });

    assert.equal(parts.dialog, dialog);
    assert.equal(parts.element, dialog);
    assert.equal(parts.languageControl, slot);
    assert.equal(parts.list, list);

    const child = new FakeElement("language-picker") as unknown as Node;
    assert.equal(appendToDialogPart(slot as unknown as Element, child), true);
    assert.equal(slot.children[0], child);
    assert.equal(appendToDialogPart(null, child), false);
    assert.equal(appendToDialogPart(slot as unknown as Element, null), false);

    assert.throws(
      () =>
        createDialogControlParts(dialog, {
          missing: ".missing",
        }),
      /Dialog selector ".missing" was not found\./,
    );
  });
});
