import { describe, it } from "vitest";

import { verifyVersionContract } from "./version-exports-shared.mjs";

describe("version-exports-v11.0-13.1", () => {
  it("keeps mid-version export contracts stable", async () => {
    for (const version of ["11.0", "12.0", "12.1", "13.0", "13.1"]) {
      await verifyVersionContract(version);
    }
  });
});
