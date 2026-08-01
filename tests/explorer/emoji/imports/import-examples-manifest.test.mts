import assert from "node:assert/strict";
import { loadPackageManifest } from "../../../../src/explorer/emoji/import-examples.js";
import {
  importExamplesManifest as manifest,
  installImportExamplesFixture,
} from "./import-examples-fixture.mjs";

const fixture = installImportExamplesFixture();

try {
  let currentManifest: any = { packs: [], categories: [] };
  let currentPromise: Promise<unknown> | undefined;

  fixture.setFetch(async () => ({
    ok: false,
    async json() {
      return {};
    },
  }));

  const promise = loadPackageManifest({
    getManifest: () => currentManifest,
    getPromise: () => currentPromise,
    setManifest: (manifestValue) => {
      currentManifest = manifestValue;
    },
    setPromise: (promiseValue) => {
      currentPromise = promiseValue;
    },
  });
  assert.deepEqual(await promise, { packs: [], categories: [] });
  assert.equal(fixture.warnings.length, 0);
  assert.equal(
    loadPackageManifest({
      getManifest: () => currentManifest,
      getPromise: () => currentPromise,
      setManifest: (manifestValue) => {
        currentManifest = manifestValue;
      },
      setPromise: (promiseValue) => {
        currentPromise = promiseValue;
      },
    }),
    promise,
  );

  currentManifest = { packs: [], categories: [] };
  currentPromise = undefined;
  fixture.setFetch(async () => ({
    ok: true,
    async json() {
      return manifest;
    },
  }));
  assert.deepEqual(
    await loadPackageManifest({
      getManifest: () => currentManifest,
      getPromise: () => currentPromise,
      setManifest: (manifestValue) => {
        currentManifest = manifestValue;
      },
      setPromise: (promiseValue) => {
        currentPromise = promiseValue;
      },
    }),
    manifest,
  );
  assert.deepEqual(currentManifest, manifest);

  currentManifest = {} as any;
  currentPromise = undefined;
  fixture.setFetch(async () => ({
    ok: false,
    async json() {
      return {};
    },
  }));
  assert.deepEqual(
    await loadPackageManifest({
      getManifest: () => currentManifest,
      getPromise: () => currentPromise,
      setManifest: (manifestValue) => {
        currentManifest = manifestValue;
      },
      setPromise: (promiseValue) => {
        currentPromise = promiseValue;
      },
    }),
    {},
  );
  assert.equal(fixture.warnings.length, 1);
} finally {
  fixture.restore();
}
