import assert from "node:assert/strict";
import { describe, it } from "vitest";

describe("pixel-editor-controller-visual", () => {
  it("builds visual controllers through the transformed module harness", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const { pathToFileURL } = await import("node:url");
    // Pairing source: ../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-visual.js

    const sourceModuleSpecifier =
      "../../../../src/pixel-editor/controllers/setup/pixel-editor-controller-visual.ts";
    void sourceModuleSpecifier;
    const root = process.cwd();
    const source = await fs.readFile(
      path.join(
        root,
        "src/pixel-editor/controllers/setup/pixel-editor-controller-visual.ts",
      ),
      "utf8",
    );

    const replacements: Array<[string, string]> = [
      [
        'from "../../canvas/pixel-editor-canvas-helpers.js";',
        'from "./pixel-editor-canvas-helpers-stub.mjs";',
      ],
      [
        'from "../../canvas/pixel-editor-layer-canvas-controller.js";',
        'from "./pixel-editor-layer-canvas-controller-stub.mjs";',
      ],
      [
        'from "../../core/pixel-editor-constants.js";',
        'from "./pixel-editor-constants-stub.mjs";',
      ],
      [
        'from "../../core/pixel-editor-geometry-helpers.js";',
        'from "./pixel-editor-geometry-helpers-stub.mjs";',
      ],
      [
        'from "../../data/pixel-editor-atlas-io.js";',
        'from "./pixel-editor-atlas-io-stub.mjs";',
      ],
      [
        'from "../../layers/pixel-editor-layer-helpers.js";',
        'from "./pixel-editor-layer-helpers-stub.mjs";',
      ],
      [
        'from "../../palette/pixel-editor-palette.js";',
        'from "./pixel-editor-palette-stub.mjs";',
      ],
      [
        'from "../pixel-editor-mode.js";',
        'from "./pixel-editor-mode-stub.mjs";',
      ],
      [
        'from "../pixel-editor-runtime.js";',
        'from "./pixel-editor-runtime-stub.mjs";',
      ],
      [
        'from "../pixel-editor-tools.js";',
        'from "./pixel-editor-tools-stub.mjs";',
      ],
      [
        'from "../pixel-editor-transfer.js";',
        'from "./pixel-editor-transfer-stub.mjs";',
      ],
    ];
    let transformedSource = source;
    for (const [from, to] of replacements)
      transformedSource = transformedSource.replace(from, to);

    const tempRoot = path.join(root, "build/tests/.tmp");
    await fs.mkdir(tempRoot, { recursive: true });
    const tempDirectory = await fs.mkdtemp(
      path.join(tempRoot, "pixel-editor-controller-visual-"),
    );

    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs"),
      [
        "export const canvasIsBlackSilhouette = 'black-silhouette';",
        "export const drawCenteredEmoji = 'draw-centered-emoji';",
        "export const drawCheckerboard = 'checkerboard';",
        "export const imageDataCanvas = 'image-data-canvas';",
        "export const recolorVisibleCanvasPixels = 'recolor-visible';",
        "export const previewCalls = [];",
        "export function createPixelEditorPreviewController(options) {",
        "  previewCalls.push(options);",
        "  return { drawArtworkPreview: 'draw-artwork-preview', drawFontPreview() {}, renderTrace() {} };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-layer-canvas-controller-stub.mjs"),
      [
        "export const canvasCalls = [];",
        "export function createPixelEditorCanvasController(options) {",
        "  canvasCalls.push(options);",
        "  return { draw() {}, kind: 'render-controller' };",
        "}",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-constants-stub.mjs"),
      [
        "export const CELL_SIZE = 12;",
        "export const DISPLAY_SIZE = 240;",
        "export const IS_VITE_DEVELOPMENT = true;",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-geometry-helpers-stub.mjs"),
      [
        "export const cloneFloatingLayer = 'clone-floating-layer';",
        "export const pixelOffset = 'pixel-offset';",
        "export const trimVisiblePixels = 'trim-visible-pixels';",
      ].join("\n"),
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-atlas-io-stub.mjs"),
      "export const extractCell = 'extract-cell';\n",
    );
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-layer-helpers-stub.mjs"),
      [
        "export const effectiveLayerPixels = 'effective-layer-pixels';",
        "export const nearestPaletteColor = 'nearest-palette-color';",
      ].join("\n"),
    );
    for (const [name, exportName] of [
      ["pixel-editor-palette-stub.mjs", "createPixelEditorPaletteController"],
      ["pixel-editor-mode-stub.mjs", "createPixelEditorModeController"],
      ["pixel-editor-runtime-stub.mjs", "createPixelEditorRuntimeController"],
      ["pixel-editor-tools-stub.mjs", "createPixelEditorToolController"],
      ["pixel-editor-transfer-stub.mjs", "createPixelEditorTransferController"],
    ]) {
      await fs.writeFile(
        path.join(tempDirectory, name),
        [
          "export const calls = [];",
          `export function ${exportName}(options) {`,
          "  calls.push(options);",
          exportName === "createPixelEditorModeController"
            ? "  return { kind: 'mode-controller', updateEditorModePanels() {}, updateTransferButtons() {} };"
            : exportName === "createPixelEditorRuntimeController"
              ? "  return { kind: 'runtime-controller', loadManifest() {}, redo() {}, refreshFontBuild() {}, refreshTranslations() {}, renderLocationText() { return 'loc'; }, undo() {} };"
              : exportName === "createPixelEditorToolController"
                ? "  return { kind: 'tool-controller', drawLine() {}, drawShape() {}, floodFill() {}, updateShapeToolButtons() {} };"
                : exportName === "createPixelEditorTransferController"
                  ? "  return { kind: 'transfer-controller', bakeFloatingLayer() {}, cancelFloatingLayer() {}, copyPixelArt() {}, copySelection() {}, moveFloatingLayer() {}, pastePixelArt() {}, transformFloatingLayer() {} };"
                  : "  return { kind: 'palette-controller' };",
          "}",
        ].join("\n"),
      );
    }
    await fs.writeFile(
      path.join(tempDirectory, "pixel-editor-controller-visual.mjs"),
      transformedSource,
    );

    const module = await import(
      pathToFileURL(
        path.join(tempDirectory, "pixel-editor-controller-visual.mjs"),
      ).href
    );
    const previewStub = await import(
      pathToFileURL(
        path.join(tempDirectory, "pixel-editor-canvas-helpers-stub.mjs"),
      ).href
    );
    const renderStub = await import(
      pathToFileURL(
        path.join(
          tempDirectory,
          "pixel-editor-layer-canvas-controller-stub.mjs",
        ),
      ).href
    );
    const paletteStub = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-palette-stub.mjs"))
        .href
    );
    const modeStub = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-mode-stub.mjs")).href
    );
    const runtimeStub = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-runtime-stub.mjs"))
        .href
    );
    const toolStub = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-tools-stub.mjs"))
        .href
    );
    const transferStub = await import(
      pathToFileURL(path.join(tempDirectory, "pixel-editor-transfer-stub.mjs"))
        .href
    );

    const state: any = {
      artworkClipboard: "clipboard",
      artworkDrafts: new Map(),
      cellLoaded: true,
      currentEmoji: "😀",
      currentEntry: { key: "smile" },
      fillShapesEnabled: false,
      floatingLayer: { id: 1 },
      manifestPromise: "manifest-promise",
      pastePending: false,
      persistedArtwork: new Map(),
      pixels: new Uint8ClampedArray([1]),
      selectedColor: "#ffffff",
      selectedSkinTone: "1F3FB",
      selection: { x: 1 },
      selectionDashOffset: 2,
      tool: "pencil",
      traceOffsetX: 3,
      traceOffsetY: 4,
    };

    const elements: any = {
      artworkPreview: "artwork-preview",
      canvas: { getContext: () => "context" },
      copyArtButton: "copy-art",
      copyFontButton: "copy-font",
      copySelectionButton: "copy-selection",
      dirtyIndicator: "dirty",
      downloadButton: "download",
      downloadEmojiButton: "download-emoji",
      downloadPreview: "download-preview",
      drawingPanel: "drawing-panel",
      filePanel: "file-panel",
      fontPreview: "font-preview",
      historyPanel: "history-panel",
      invertLayerButton: "invert-layer",
      layerHelp: "layer-help",
      layerNudgeButtons: ["layer-nudge"],
      layerPanel: "layer-panel",
      layerTransformButtons: ["layer-transform"],
      paletteButtons: ["palette-button"],
      paletteGrid: "palette-grid",
      previewActionButtons: ["preview-action"],
      previewPanel: "preview-panel",
      saveButton: "save",
      status: "status",
      toolButtons: ["tool-button"],
      traceAlpha: "trace-alpha",
      traceNudgeButtons: ["trace-nudge"],
      tracePanel: "trace-panel",
    };

    const translate = "translate";
    const visual = module.createPixelEditorVisualControllers({
      elements,
      state,
      translate,
    });

    assert.equal(visual.paletteController.kind, "palette-controller");
    assert.equal(visual.modeController.kind, "mode-controller");
    assert.equal(visual.runtimeController.kind, "runtime-controller");
    assert.equal(visual.toolController.kind, "tool-controller");
    assert.equal(visual.transferController.kind, "transfer-controller");
    assert.equal(visual.renderController.kind, "render-controller");
    assert.equal(previewStub.previewCalls.length, 1);
    assert.equal(renderStub.canvasCalls.length, 1);
    assert.equal(paletteStub.calls.length, 1);
    assert.equal(modeStub.calls.length, 1);
    assert.equal(runtimeStub.calls.length, 1);
    assert.equal(toolStub.calls.length, 1);
    assert.equal(transferStub.calls.length, 1);
  });
});
