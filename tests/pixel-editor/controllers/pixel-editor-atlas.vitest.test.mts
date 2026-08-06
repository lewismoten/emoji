import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pixel-editor-atlas", () => {
  it("handles atlas rendering, saving, and downloads", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const { pathToFileURL } = await import("node:url");
    // Pairing source: ../../../src/pixel-editor/controllers/pixel-editor-atlas.js

    const sourceModuleSpecifier =
      "../../../src/pixel-editor/controllers/pixel-editor-atlas.ts";
    const root = process.cwd();
    const source = await fs.readFile(
      path.join(root, "src/pixel-editor/controllers/pixel-editor-atlas.ts"),
      "utf8",
    );

    const transformedSource = source
      .replace(
        'from "../core/pixel-editor-constants.js";',
        'from "./pixel-editor-constants-stub.mjs";',
      )
      .replace(
        'from "../canvas/pixel-editor-canvas-helpers.js";',
        'from "./pixel-editor-canvas-helpers-stub.mjs";',
      );

    const tempRoot = path.join(root, "build/tests/.tmp");
    await fs.mkdir(tempRoot, { recursive: true });
    const tempDirectory = await fs.mkdtemp(
      path.join(tempRoot, "pixel-editor-atlas-"),
    );

    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-constants-stub.mjs"),
      "export const CELL_SIZE = 12;\n",
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs"),
      [
        "export const helperCalls = [];",
        "export async function canvasToPng(canvas) {",
        "  helperCalls.push(['canvasToPng', canvas]);",
        "  return { kind: 'png-blob' };",
        "}",
        "export function downloadBlob(blob, filename) {",
        "  helperCalls.push(['downloadBlob', blob, filename]);",
        "}",
        "export function imageDataCanvas(pixels, width, height) {",
        "  helperCalls.push(['imageDataCanvas', Array.from(pixels), width, height]);",
        "  return { kind: 'image-data-canvas' };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-atlas.mjs"),
      transformedSource,
    );

    const module = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-atlas.mjs")).href
    );
    const helperStub = await import(
      pathToFileURL(
        path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs"),
      ).href
    );

    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    const originalDocument = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
    const originalImageData = Object.getOwnPropertyDescriptor(
      globalThis,
      "ImageData",
    );
    const originalWarn = console.warn;

    try {
      const statuses: string[] = [];
      const calls: string[] = [];
      let directoryHandle: any = undefined;
      let atlasBlob: any = { kind: "atlas-blob" };
      let atlasExists = false;
      const currentEntry = {
        atlas: "group/file.png",
        key: "thumbsUp",
      };

      const atlasContext = {
        drawImage() {
          calls.push("draw-image");
        },
        putImageData() {
          calls.push("put-image-data");
        },
      };
      const atlasCanvas = {
        height: 0,
        width: 0,
        getContext: () => atlasContext,
        toBlob(callback: Function) {
          callback({ kind: "updated-blob" });
        },
      };

      Object.defineProperty(globalThis, "ImageData", {
        configurable: true,
        value: class FakeImageData {
          constructor(
            public data: Uint8ClampedArray,
            public width: number,
            public height: number,
          ) {}
        },
      });
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: {
          createElement(tag: string) {
            assert.equal(tag, "canvas");
            return atlasCanvas;
          },
        },
      });
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
          async showDirectoryPicker() {
            calls.push("show-directory-picker");
            return { kind: "directory" };
          },
        },
      });

      const controller = module.createPixelEditorAtlasController({
        currentEntry: () => currentEntry,
        draftController: {
          artworkDrafts: () =>
            new Map([
              [
                "thumbsUp",
                {
                  entry: { atlas: "group/file.png", x: 1, y: 2 },
                  pixels: new Uint8ClampedArray([1, 2, 3, 4]),
                },
              ],
              [
                "wave",
                {
                  entry: { atlas: "other.png", x: 0, y: 0 },
                  pixels: new Uint8ClampedArray([9]),
                },
              ],
            ]),
          markAtlasClean(atlas: string) {
            calls.push(`mark-clean:${atlas}`);
          },
          rememberCurrentDraft() {
            calls.push("remember-draft");
          },
          updateFileButtons() {
            calls.push("update-file-buttons");
          },
        },
        downloadButton: { disabled: false },
        downloadEmojiButton: { disabled: false },
        getAtlasBlob: () => atlasBlob,
        getAtlasDimensions: () => ({ width: 10, height: 20 }),
        getDirectoryHandle: () => directoryHandle,
        getNestedFileHandle: async (_dir: unknown, nested: string) => ({
          async createWritable() {
            return {
              async close() {
                calls.push("writable-close");
              },
              async write(blob: unknown) {
                calls.push(`writable-write:${(blob as any).kind}`);
              },
            };
          },
          nested,
        }),
        getPixels: () => new Uint8ClampedArray([3, 4, 5, 255]),
        imageBitmapFactory: async () => ({
          close() {
            calls.push("image-close");
          },
          height: 20,
          width: 10,
        }),
        setAtlasBlob(value: unknown) {
          atlasBlob = value;
        },
        setAtlasExists(value: boolean) {
          atlasExists = value;
        },
        setDirectoryHandle(value: unknown) {
          directoryHandle = value;
        },
        translate: (_key: string, fallback: string) => fallback,
        writeStatus(value: string) {
          statuses.push(value);
        },
      });

      const updated = await controller.renderUpdatedAtlas({
        kind: "source-blob",
      });
      assert.equal(
        sourceModuleSpecifier,
        "../../../src/pixel-editor/controllers/pixel-editor-atlas.ts",
      );
      assert.deepEqual(updated, { kind: "updated-blob" });
      assert.equal(calls.includes("remember-draft"), true);
      assert.equal(calls.includes("draw-image"), true);
      assert.equal(calls.includes("put-image-data"), true);

      await controller.downloadAtlas();
      assert.equal(atlasExists, true);
      assert.equal(statuses.at(-1), "Updated atlas PNG downloaded.");
      assert.equal(
        helperStub.helperCalls.some(
          (entry: any[]) =>
            entry[0] === "downloadBlob" && entry[2] === "file.png",
        ),
        true,
      );

      await controller.saveAtlas();
      assert.equal(statuses.at(-1), "Atlas PNG saved.");
      assert.equal(directoryHandle.kind, "directory");
      assert.equal(calls.includes("show-directory-picker"), true);
      assert.equal(calls.includes("writable-write:updated-blob"), true);
      assert.equal(calls.includes("writable-close"), true);

      await controller.downloadEmojiPng();
      assert.equal(statuses.at(-1), "12 by 12 emoji PNG downloaded.");
      assert.equal(
        helperStub.helperCalls.some(
          (entry: any[]) =>
            entry[0] === "downloadBlob" && entry[2] === "thumbsUp.png",
        ),
        true,
      );

      const fallbackStatuses: string[] = [];
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {},
      });
      const fallbackController = module.createPixelEditorAtlasController({
        currentEntry: () => currentEntry,
        draftController: {
          artworkDrafts: () => new Map(),
          markAtlasClean() {},
          rememberCurrentDraft() {},
          updateFileButtons() {},
        },
        downloadButton: { disabled: false },
        downloadEmojiButton: { disabled: false },
        getAtlasBlob: () => ({ kind: "atlas-blob" }),
        getAtlasDimensions: () => ({ width: 10, height: 20 }),
        getDirectoryHandle: () => undefined,
        getNestedFileHandle: async () => undefined,
        getPixels: () => new Uint8ClampedArray([1, 2, 3, 4]),
        imageBitmapFactory: async () => ({
          close() {},
          height: 20,
          width: 10,
        }),
        setAtlasBlob() {},
        setAtlasExists() {},
        setDirectoryHandle() {},
        translate: (_key: string, fallback: string) => fallback,
        writeStatus(value: string) {
          fallbackStatuses.push(value);
        },
      });
      await fallbackController.saveAtlas();
      assert.equal(
        fallbackStatuses[0],
        "Direct folder access is unavailable; downloading the atlas instead.",
      );

      const warningStatuses: string[] = [];
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
          async showDirectoryPicker() {
            return { kind: "warning-directory" };
          },
        },
      });
      const warnings: unknown[][] = [];
      console.warn = (...args: unknown[]) => warnings.push(args);
      const warningController = module.createPixelEditorAtlasController({
        currentEntry: () => currentEntry,
        draftController: {
          artworkDrafts: () => new Map(),
          markAtlasClean() {},
          rememberCurrentDraft() {},
          updateFileButtons() {},
        },
        downloadButton: { disabled: false },
        downloadEmojiButton: { disabled: false },
        getAtlasBlob: () => ({ kind: "atlas-blob" }),
        getAtlasDimensions: () => ({ width: 10, height: 20 }),
        getDirectoryHandle: () => ({ kind: "dir" }),
        getNestedFileHandle: async () => {
          throw Object.assign(new Error("fail"), { name: "NopeError" });
        },
        getPixels: () => new Uint8ClampedArray([1, 2, 3, 4]),
        imageBitmapFactory: async () => ({
          close() {},
          height: 20,
          width: 10,
        }),
        setAtlasBlob() {},
        setAtlasExists() {},
        setDirectoryHandle(value: unknown) {
          calls.push(`set-directory:${String(value)}`);
        },
        translate: (_key: string, fallback: string) => fallback,
        writeStatus(value: string) {
          warningStatuses.push(value);
        },
      });
      await warningController.saveAtlas();
      assert.equal(warnings.length, 1);
      assert.equal(
        warningStatuses.at(-1),
        "Could not save group/file.png. Choose the pixel-font/atlases directory.",
      );
    } finally {
      console.warn = originalWarn;
      if (originalWindow)
        Object.defineProperty(globalThis, "window", originalWindow);
      else Reflect.deleteProperty(globalThis, "window");
      if (originalDocument) {
        Object.defineProperty(globalThis, "document", originalDocument);
      } else Reflect.deleteProperty(globalThis, "document");
      if (originalImageData) {
        Object.defineProperty(globalThis, "ImageData", originalImageData);
      } else Reflect.deleteProperty(globalThis, "ImageData");
    }
  });
});
