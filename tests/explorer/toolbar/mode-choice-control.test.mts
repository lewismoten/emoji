import assert from "node:assert/strict";

import { createModeChoiceGroupControl } from "../../../src/explorer/toolbar/mode-choice-control.js";

const browserGlobal = globalThis as any;
const originalDocument = browserGlobal.document;
browserGlobal.document = {
  createElement(tag: string) {
    return {
      tagName: tag.toUpperCase(),
      className: "",
      dataset: {},
      children: [] as any[],
      append(...children: any[]) {
        this.children.push(...children);
      },
      setAttribute() {},
    };
  },
  getElementById() {
    return null;
  },
  head: {
    appendChild() {},
  },
};

try {
  const control = createModeChoiceGroupControl();
  assert.ok(control);
  assert.equal(control.tagName, "DIV");
} finally {
  if (originalDocument) browserGlobal.document = originalDocument;
  else delete browserGlobal.document;
}
