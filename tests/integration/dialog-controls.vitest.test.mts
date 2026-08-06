import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { demoHtml } from "../shared/unit-fixtures.mjs";

describe("dialog-controls integration", () => {
  it("keeps every dialog close button inside a dialog form", () => {
    const closeButtons = Array.from(
      demoHtml.matchAll(
        /<button[\s\S]*?class="dialog-close(?: [^"]*)?"[\s\S]*?<\/button>/g,
      ),
    );
    const wrappedCloseButtons = Array.from(
      demoHtml.matchAll(
        /<form method="dialog">[\s\S]*?<button[\s\S]*?class="dialog-close(?: [^"]*)?"[\s\S]*?<\/button>[\s\S]*?<\/form>/g,
      ),
    );

    assert.ok(
      closeButtons.length >= 5,
      "dialog close controls should use one consistent form+button structure in the static page",
    );
    assert.equal(
      wrappedCloseButtons.length,
      closeButtons.length,
      "every static dialog close button should be wrapped by a dialog form",
    );
    closeButtons.forEach((match) => {
      assert.match(match[0], /type="submit"/);
      assert.match(match[0], /data-i18n-aria-label="close"/);
      assert.match(match[0], /aria-label="Close"/);
      assert.match(match[0], />\s*×\s*</);
    });
  });
});
