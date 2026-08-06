import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { VersionModeToggleControl } from "../../../../src/controls/filters/version/version-mode-toggle.js";
import { FakeElement, installFakeDocument } from "../../fake-dom.mjs";

describe("version-mode-toggle", () => {
  it("renders accessible toggle markup", () => {
    const markup = VersionModeToggleControl.toMarkup({
      emoji: "🎯",
      pressed: true,
    });

    assert.match(markup, /^<button class="version-mode-toggle"/);
    assert.match(markup, /aria-label="Toggle selected version mode"/);
    assert.match(markup, /aria-pressed="true"/);
    assert.match(markup, /title="Toggle selected version mode"/);
    assert.match(markup, /aria-hidden="true">🎯<\/span>/);
  });

  it("injects its stylesheet only once when created", () => {
    const restore = installFakeDocument();
    try {
      const globals = globalThis as typeof globalThis & {
        document: { head: FakeElement };
      };
      VersionModeToggleControl.create({ emoji: "✨", pressed: false });
      assert.equal(globals.document.head.children.length, 1);
      assert.equal(
        (globals.document.head.children[0] as FakeElement).id,
        "version-mode-toggle-control-style",
      );
    } finally {
      restore();
    }
  });
});
