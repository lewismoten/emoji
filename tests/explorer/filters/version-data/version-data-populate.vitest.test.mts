import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { populateVersionSelector } from "../../../../src/explorer/filters/version-data.js";
import {
  FakeSelect,
  installOptionDocument,
} from "./version-data-fixture.mjs";

describe("version-data-populate", () => {
  it("populates version options across released, proposed, and empty states", () => {
    const restoreDocument = installOptionDocument();
    let syncCalls = 0;

    try {
      const released = [
        { version: "15.0", file: "15.0.json", released: "2022-09-13" },
        { version: "16.0", file: "16.0.json", released: "2024-09-10" },
      ];
      const proposed = [
        {
          version: "18.0",
          file: "proposed/18.0.json",
          stage: "beta",
          expectedRelease: "2026-09",
        },
      ];

      const selector = new FakeSelect();
      selector.value = "15.0";
      populateVersionSelector({
        proposed,
        released,
        selectedLocale: "en-US",
        selector: selector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (key: string, fallback: string) =>
          ({ expected: "expected", updated: "updated", released: "released" })[
            key
          ] ?? fallback,
      });
      assert.equal(selector.options.length, 3);
      assert.equal(selector.options[0]?.value, "15.0");
      assert.equal(
        selector.options[0]?.text,
        "Emoji 15.0 (released 2022-09-13)",
      );
      assert.equal(
        selector.options[2]?.text,
        "Emoji 18.0 (beta · expected 2026-09)",
      );
      assert.equal(selector.value, "15.0");
      assert.equal(selector.disabled, false);
      assert.equal(syncCalls, 1);

      const updatedSelector = new FakeSelect();
      populateVersionSelector({
        proposed: [
          {
            version: "19.0",
            file: "proposed/19.0.json",
            retrieved: "2026-07-01T00:00:00.000Z",
          },
        ],
        released: [],
        selectedLocale: "en-US",
        selector: updatedSelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (key: string, fallback: string) =>
          ({ expected: "expected", updated: "updated", released: "released" })[
            key
          ] ?? fallback,
      });
      assert.match(
        updatedSelector.options[0]?.text ?? "",
        /^Emoji 19.0 \(draft · updated /,
      );
      assert.equal(updatedSelector.value, "19.0");

      const statusSelector = new FakeSelect();
      populateVersionSelector({
        proposed: [
          {
            version: "20.0",
            file: "proposed/20.0.json",
            status: "preview",
            retrieved: "2026-08-01T00:00:00.000Z",
          },
        ],
        released: [],
        selectedLocale: "en-US",
        selector: statusSelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (key: string, fallback: string) =>
          ({ expected: "expected", updated: "updated", released: "released" })[
            key
          ] ?? fallback,
      });
      assert.match(
        statusSelector.options[0]?.text ?? "",
        /^Emoji 20.0 \(preview · updated /,
      );

      const fallbackSelector = new FakeSelect();
      fallbackSelector.value = "missing";
      populateVersionSelector({
        proposed: [],
        released,
        selectedLocale: "en-US",
        selector: fallbackSelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (_key: string, fallback: string) => fallback,
      });
      assert.equal(fallbackSelector.value, "16.0");

      const emptySelector = new FakeSelect();
      populateVersionSelector({
        proposed: [],
        released: [],
        selectedLocale: "en-US",
        selector: emptySelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (_key: string, fallback: string) => fallback,
      });
      assert.equal(emptySelector.value, "");
      assert.equal(emptySelector.disabled, true);

      const noDocumentSelector = new FakeSelect();
      const originalDocument = Object.getOwnPropertyDescriptor(
        globalThis,
        "document",
      );
      Reflect.deleteProperty(globalThis, "document");
      populateVersionSelector({
        proposed: [],
        released: [{ version: "21.0", released: "2026-09-01" }],
        selectedLocale: "en-US",
        selector: noDocumentSelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (_key: string, fallback: string) => fallback,
      });
      assert.equal(
        noDocumentSelector.options[0]?.text,
        "Emoji 21.0 (released 2026-09-01)",
      );
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      }

      const arraySelector = {
        disabled: false,
        options: [] as Array<{ value: string; text: string }>,
        value: "",
      };
      populateVersionSelector({
        proposed: [{ version: "22.0", status: "draft" }],
        released: [],
        selectedLocale: "en-US",
        selector: arraySelector as any,
        syncRange: () => {
          syncCalls += 1;
        },
        translate: (_key: string, fallback: string) => fallback,
      });
      assert.equal(arraySelector.options.length, 1);
      assert.equal(arraySelector.options[0]?.value, "22.0");
    } finally {
      restoreDocument();
    }
  });
});
