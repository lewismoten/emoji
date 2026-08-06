import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";

import { createAudioChoiceGroupControl } from "../../../src/explorer/toolbar/audio-choice-control.js";

const browserGlobal = globalThis as any;
const originalDocument = browserGlobal.document;

function installDocument() {
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
}

afterEach(() => {
  if (originalDocument) browserGlobal.document = originalDocument;
  else delete browserGlobal.document;
});

describe("audio-choice-control", () => {
  it("creates the audio choice group control", () => {
    installDocument();
    const control = createAudioChoiceGroupControl();
    assert.ok(control);
    assert.equal(control.tagName, "DIV");
  });
});
