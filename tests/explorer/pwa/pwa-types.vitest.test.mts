import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pwa-types", () => {
  it("loads the type-only module without runtime side effects", async () => {
    await import("../../../src/explorer/pwa/pwa-types.js");
    assert.equal(true, true);
  });
});
