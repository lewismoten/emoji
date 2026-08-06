import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it } from "vitest";

// Pairing source: ../src/explorer-app.js

describe("explorer-app", () => {
  it("re-exports lifecycle, events, and startup helpers", async () => {
    const sourceModuleSpecifier = "build/src/explorer-app.js";
    const root = process.cwd();
    const sourcePath = path.join(root, "build/src/explorer-app.js");
    const source = await fs.readFile(sourcePath, "utf8");

    const transformedSource = source
      .replace(
        'from "./app/explorer-app-lifecycle.js";',
        'from "./explorer-app-lifecycle-stub.mjs";',
      )
      .replace(
        'from "./app/explorer-app-events.js";',
        'from "./explorer-app-events-stub.mjs";',
      )
      .replace(
        'from "./explorer/control-startup.js";',
        'from "./control-startup-stub.mjs";',
      )
      .replace(/^\/\/# sourceMappingURL=.*$/m, "");

    const tempRoot = path.join(root, "build/tests/.tmp");
    await fs.mkdir(tempRoot, { recursive: true });
    const tempDirectory = await fs.mkdtemp(
      path.join(tempRoot, "explorer-app-"),
    );

    await fs.writeFile(
      path.join(tempDirectory, "explorer-app-lifecycle-stub.mjs"),
      [
        "export const createExplorerAppCalls = [];",
        "export function createExplorerApp(options) {",
        "  createExplorerAppCalls.push(options);",
        "  return { lifecycle: true, options };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "explorer-app-events-stub.mjs"),
      [
        "export const bindExplorerEventsCalls = [];",
        "export function bindExplorerEvents(options) {",
        "  bindExplorerEventsCalls.push(options);",
        "  return { events: true, options };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "control-startup-stub.mjs"),
      [
        "export const finalizeCalls = [];",
        "export const initializeCalls = [];",
        "export function initializeExplorerControls(options) {",
        "  initializeCalls.push(options);",
        "  return { initialized: true, options };",
        "}",
        "export async function finalizeExplorerStartup(options) {",
        "  finalizeCalls.push(options);",
        "  return { finalized: true, options };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "explorer-app.mjs"),
      transformedSource,
    );

    const module = await import(
      pathToFileURL(path.join(tempDirectory, "explorer-app.mjs")).href
    );
    const lifecycleStub = await import(
      pathToFileURL(path.join(tempDirectory, "explorer-app-lifecycle-stub.mjs"))
        .href
    );
    const eventsStub = await import(
      pathToFileURL(path.join(tempDirectory, "explorer-app-events-stub.mjs"))
        .href
    );
    const controlStub = await import(
      pathToFileURL(path.join(tempDirectory, "control-startup-stub.mjs")).href
    );

    const lifecycleResult = module.createExplorerApp({ id: "lifecycle" });
    assert.deepEqual(lifecycleResult, {
      lifecycle: true,
      options: { id: "lifecycle" },
    });
    assert.deepEqual(lifecycleStub.createExplorerAppCalls, [
      { id: "lifecycle" },
    ]);

    const eventsResult = module.bindExplorerEvents({ id: "events" });
    assert.deepEqual(eventsResult, {
      events: true,
      options: { id: "events" },
    });
    assert.deepEqual(eventsStub.bindExplorerEventsCalls, [{ id: "events" }]);

    const initialized = module.initializeExplorerControls({ id: "controls" });
    assert.deepEqual(initialized, {
      initialized: true,
      options: { id: "controls" },
    });
    assert.deepEqual(controlStub.initializeCalls, [{ id: "controls" }]);

    await module.finalizeExplorerStartup({ id: "startup" });
    assert.deepEqual(controlStub.finalizeCalls, [{ id: "startup" }]);
    assert.equal(sourceModuleSpecifier, "build/src/explorer-app.js");
  });
});
