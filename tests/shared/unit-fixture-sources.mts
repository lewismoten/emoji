import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { root } from "./unit-fixture-data.mjs";

export const demoScript = await fs.readFile(
  path.join(root, "src/index.ts"),
  "utf8",
);
export const explorerApp = await fs.readFile(
  path.join(root, "src/explorer-app.ts"),
  "utf8",
);
export const pixelFontHotReload = await fs.readFile(
  path.join(root, "src/pixel-font-hot-reload.ts"),
  "utf8",
);
export const emojiListRenderHelper = await fs.readFile(
  path.join(root, "src/explorer/emoji-list-render.ts"),
  "utf8",
);
export const emojiListInteractionHelper = await fs.readFile(
  path.join(root, "src/explorer/emoji-list-interaction.ts"),
  "utf8",
);
export const emojiFilterHelper = await fs.readFile(
  path.join(root, "src/explorer/emoji-filter.ts"),
  "utf8",
);
export const dialogUpgradeHelper = await fs.readFile(
  path.join(root, "src/explorer/dialog/dialog-upgrade.ts"),
  "utf8",
);
export const catalogLoader = await fs.readFile(
  path.join(root, "src/explorer/catalog-loader.ts"),
  "utf8",
);
export const pixelArtwork = await fs.readFile(
  path.join(root, "src/explorer/pixel-artwork.ts"),
  "utf8",
);
export const versionData = await fs.readFile(
  path.join(root, "src/explorer/version-data.ts"),
  "utf8",
);
export const explorerDataController = await fs.readFile(
  path.join(root, "src/explorer-data-controller.ts"),
  "utf8",
);
export const searchLanguageLifecycle = await fs.readFile(
  path.join(root, "src/explorer/language/search-language-lifecycle.ts"),
  "utf8",
);
export const explorerUi = await fs.readFile(
  path.join(root, "src/explorer-ui.ts"),
  "utf8",
);
export const explorerPreferencesSource = await fs.readFile(
  path.join(root, "src/app/explorer-preferences.ts"),
  "utf8",
);
export const versionModeController = await fs.readFile(
  path.join(root, "src/app/version-mode-controller.ts"),
  "utf8",
);
export const explorerBootstrapSessionSource = await fs.readFile(
  path.join(root, "src/app/bootstrap/explorer-bootstrap-session.ts"),
  "utf8",
);
export const explorerBootstrapShellSource = await fs.readFile(
  path.join(root, "src/app/bootstrap/explorer-bootstrap-shell.ts"),
  "utf8",
);
export const emojiDialogEvents = await fs.readFile(
  path.join(root, "src/explorer/dialog/emoji-dialog-events.ts"),
  "utf8",
);
export const savedEmojiHelper = await fs.readFile(
  path.join(root, "src/explorer/saved-emoji.ts"),
  "utf8",
);
export const loadingState = await fs.readFile(
  path.join(root, "src/explorer/loading-state.ts"),
  "utf8",
);
export const listController = await fs.readFile(
  path.join(root, "src/explorer/list-controller.ts"),
  "utf8",
);
export const emojiListSources = `${demoScript}\n${loadingState}\n${emojiListInteractionHelper}`;
export const utilityControlsHelper = await fs.readFile(
  path.join(root, "src/explorer/utility-controls.ts"),
  "utf8",
);
export const languageDialogControlSource = await fs.readFile(
  path.join(root, "src/controls/dialog/content/language-dialog.ts"),
  "utf8",
);
export const helpSettingsDialogControlSource = await fs.readFile(
  path.join(root, "src/controls/dialog/content/help-settings-dialog.ts"),
  "utf8",
);
export const emojiCompositionSectionControlSource = await fs.readFile(
  path.join(root, "src/controls/dialog/content/emoji-composition-section.ts"),
  "utf8",
);
export const savedDialogControlSource = await fs.readFile(
  path.join(root, "src/controls/dialog/content/saved-dialog.ts"),
  "utf8",
);
export const filterPickerHelper = await fs.readFile(
  path.join(root, "src/explorer/filter-picker.ts"),
  "utf8",
);
export const versionFilterControl = await fs.readFile(
  path.join(root, "src/explorer/version-filter-control.ts"),
  "utf8",
);
export const categoryVersionHelper = await fs.readFile(
  path.join(root, "src/explorer/category-version.ts"),
  "utf8",
);
export const filterControlsHelper = await fs.readFile(
  path.join(root, "src/explorer/filter-controls.ts"),
  "utf8",
);
export const dialogRenderHelper = await fs.readFile(
  path.join(root, "src/explorer/dialog/dialog-render.ts"),
  "utf8",
);
export const dialogRuntimeHelper = await fs.readFile(
  path.join(root, "src/explorer/dialog/dialog-runtime-helpers.ts"),
  "utf8",
);
export const dialogViewHelper = await fs.readFile(
  path.join(root, "src/explorer/dialog/dialog-view.ts"),
  "utf8",
);
export const pwaPanelsHelper = await fs.readFile(
  path.join(root, "src/explorer/pwa-panels.ts"),
  "utf8",
);
export const explorerGeneratorScript = await fs.readFile(
  path.join(root, "scripts/generate-library.mjs"),
  "utf8",
);
const listFiles = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries
        .filter((entry) => entry.name !== ".DS_Store")
        .sort((left, right) => left.name.localeCompare(right.name, "en"))
        .map((entry) =>
          entry.isDirectory()
            ? listFiles(path.join(directory, entry.name))
            : [path.join(directory, entry.name)],
        ),
    )
  ).flat();
};
const pixelEditorHelperFiles = await listFiles(
  path.join(root, "src/pixel-editor"),
);
const pixelEditorTemplateFile = pixelEditorHelperFiles.find((file) =>
  file.endsWith("pixel-editor-template.ts"),
);
const pixelEditorOtherHelperFiles = pixelEditorHelperFiles.filter(
  (file) => file !== pixelEditorTemplateFile,
);
const pixelEditorSourceFiles = [
  ...(pixelEditorTemplateFile ? [pixelEditorTemplateFile] : []),
  path.join(root, "src", "pixel-editor-entry.ts"),
  ...pixelEditorOtherHelperFiles,
];
export const pixelEditorScript = (
  await Promise.all(
    pixelEditorSourceFiles.map((file) => fs.readFile(file, "utf8")),
  )
).join("\n");
export const {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneSequence,
} = (await import(
  pathToFileURL(path.join(root, "build", "demo-pages", "pixel-editor.js")).href
)) as {
  buildSkinToneOwnership: (
    pixels: Uint8ClampedArray,
    tones: string[],
    width?: number,
    height?: number,
  ) => Int8Array | undefined;
  buildTwoPersonOwnership: (width?: number, height?: number) => Int8Array;
  remapSkinTonePixels: (
    pixels: Uint8ClampedArray,
    sourceTones: string[],
    targetTones: string[],
    helper?: {
      ownership: Int8Array;
      ownershipWidth: number;
      width: number;
      offsetX: number;
      offsetY: number;
    },
  ) => Uint8ClampedArray;
  skinToneBaseSequence: (codePoints: string[]) => string;
  skinToneSequence: (codePoints: string[]) => string[];
};
export const pixelAtlasGeneratorScript = await fs.readFile(
  path.join(root, "pixel-font/scripts/generate-atlases.mjs"),
  "utf8",
);
export const pixelFontBuildScript = await fs.readFile(
  path.join(root, "pixel-font/scripts/build-assets.mjs"),
  "utf8",
);
export const pixelFontBuildCache = await fs.readFile(
  path.join(root, "pixel-font/scripts/font-build-cache.mjs"),
  "utf8",
);
export const testBundleCache = await fs.readFile(
  path.join(root, "scripts/ensure-test-bundle.mjs"),
  "utf8",
);
export const pixelFontCompiler = await fs.readFile(
  path.join(root, "pixel-font/scripts/compile-font.py"),
  "utf8",
);
export const pixelFontPackager = await fs.readFile(
  path.join(root, "pixel-font/scripts/package-font.mjs"),
  "utf8",
);
export const pixelFontVersionScript = await fs.readFile(
  path.join(root, "pixel-font/scripts/version-font.mjs"),
  "utf8",
);
export const pagesWorkflow = await fs.readFile(
  path.join(root, ".github/workflows/pages.yml"),
  "utf8",
);
export const pagesValidator = await fs.readFile(
  path.join(root, "scripts/validate-pages-site.mjs"),
  "utf8",
);
export const websitePublisher = await fs.readFile(
  path.join(root, "scripts/publish-website.mjs"),
  "utf8",
);
export const renderingDiagnosticHelper = await fs.readFile(
  path.join(root, "src/explorer/rendering-diagnostic.ts"),
  "utf8",
);
export const pixelEditorLoaderSource = await fs.readFile(
  path.join(root, "src/explorer/pixel-editor-loader.ts"),
  "utf8",
);
export const emojiCompositionHelper = await fs.readFile(
  path.join(root, "src/explorer/emoji-composition.ts"),
  "utf8",
);
export const compositionHelpers = await fs.readFile(
  path.join(root, "src/explorer/composition-helpers.ts"),
  "utf8",
);
export const urlStateHelper = await fs.readFile(
  path.join(root, "src/explorer/url-state.ts"),
  "utf8",
);
export const emojiFormatHelper = await fs.readFile(
  path.join(root, "src/explorer/emoji-format.ts"),
  "utf8",
);
export const fontPublishWorkflow = await fs.readFile(
  path.join(root, ".github/workflows/publish-font.yml"),
  "utf8",
);
export const pixelAtlasReadme = await fs.readFile(
  path.join(root, "pixel-font/ATLASES.md"),
  "utf8",
);
export const viteConfig = await fs.readFile(
  path.join(root, "config", "vite.config.js"),
  "utf8",
);
