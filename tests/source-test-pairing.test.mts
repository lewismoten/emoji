import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const legacyMissingTestPairs = new Set([
  "src/app/dialog-runtime-config.ts",
  "src/app/dialog-runtime.ts",
  "src/app/dialog-view-runtime.ts",
  "src/app/emoji-actions.ts",
  "src/app/emoji-dialog-click-runtime.ts",
  "src/app/emoji-session-controller.ts",
  "src/app/explorer-bootstrap-bindings.ts",
  "src/app/explorer-bootstrap-controllers.ts",
  "src/app/explorer-bootstrap-options.ts",
  "src/app/explorer-bootstrap-runtime-options.ts",
  "src/app/explorer-bootstrap-runtime.ts",
  "src/app/explorer-bootstrap-session-runtime.ts",
  "src/app/explorer-bootstrap-session.ts",
  "src/app/explorer-bootstrap-shell.ts",
  "src/app/explorer-preferences.ts",
  "src/app/explorer-shell.ts",
  "src/app/list-orchestration.ts",
  "src/app/navigation-runtime.ts",
  "src/app/pixel-editor-loader-runtime.ts",
  "src/app/startup-orchestrator.ts",
  "src/app/startup-runtime.ts",
  "src/app/ui-binding-runtime.ts",
  "src/app/version-controller.ts",
  "src/app/version-mode-controller.ts",
  "src/app/version-mode-runtime.ts",
  "src/app/version-runtime.ts",
  "src/controls/dialog/dialog-navigate-button.ts",
  "src/controls/filters/pickers/advanced-filters-trigger.ts",
  "src/controls/filters/pickers/compact-choice-button.ts",
  "src/controls/filters/pickers/filter-picker-trigger.ts",
  "src/controls/pickers/language-picker.ts",
  "src/explorer-app.ts",
  "src/explorer-audio.ts",
  "src/explorer-bootstrap.ts",
  "src/explorer-composition-controller.ts",
  "src/explorer-data-controller.ts",
  "src/explorer-entry.ts",
  "src/explorer-runtime.ts",
  "src/explorer-state.ts",
  "src/explorer-ui.ts",
  "src/explorer/advanced-filter-dialog-control.ts",
  "src/explorer/audio/explorer-audio-engine.ts",
  "src/explorer/catalog-loader.ts",
  "src/explorer/control-startup.ts",
  "src/explorer/copy-feedback.ts",
  "src/explorer/dialog/dialog-control-helpers.ts",
  "src/explorer/dialog/dialog-navigation-controller.ts",
  "src/explorer/dialog/dialog-render.ts",
  "src/explorer/dialog/dialog-runtime-helpers.ts",
  "src/explorer/dialog/dialog-title-controls.ts",
  "src/explorer/dialog/dialog-upgrade.ts",
  "src/explorer/dialog/dialog-view.ts",
  "src/explorer/dialog/emoji-dialog-events.ts",
  "src/explorer/dialog/emoji-session.ts",
  "src/explorer/emoji-list-interaction.ts",
  "src/explorer/emoji-list-render.ts",
  "src/explorer/event-accessibility.ts",
  "src/explorer/explorer-dom.ts",
  "src/explorer/explorer-labels.ts",
  "src/explorer/explorer-navigation.ts",
  "src/explorer/favorite-button.ts",
  "src/explorer/filter-summary.ts",
  "src/explorer/list-controller.ts",
  "src/explorer/loading-state.ts",
  "src/explorer/pixel-artwork.ts",
  "src/explorer/pixel-editor-loader.ts",
  "src/explorer/popular-keys.ts",
  "src/explorer/toolbar/help-settings-control.ts",
  "src/explorer/toolbar/theme-choice-control.ts",
  "src/explorer/toolbar/toolbar-layout.ts",
  "src/explorer/toolbar/toolbar-trigger-controls.ts",
  "src/explorer/utility-control-markup.ts",
  "src/explorer/utility-controls.ts",
  "src/explorer/utility-picker-controls.ts",
  "src/explorer/version-data.ts",
  "src/explorer/version-filter-control.ts",
  "src/index.ts",
  "src/pixel-editor-entry.ts",
  "src/pixel-editor/canvas/pixel-editor-layer-canvas-controller.ts",
  "src/pixel-editor/canvas/pixel-editor-template.ts",
  "src/pixel-editor/controllers/pixel-editor-atlas.ts",
  "src/pixel-editor/controllers/pixel-editor-controllers.ts",
  "src/pixel-editor/controllers/pixel-editor-mode.ts",
  "src/pixel-editor/controllers/pixel-editor-runtime.ts",
  "src/pixel-editor/controllers/pixel-editor-session.ts",
  "src/pixel-editor/controllers/pixel-editor-startup.ts",
  "src/pixel-editor/controllers/pixel-editor-tools.ts",
  "src/pixel-editor/controllers/pixel-editor-transfer.ts",
  "src/pixel-editor/controllers/setup/pixel-editor-controller-session.ts",
  "src/pixel-editor/controllers/setup/pixel-editor-controller-visual.ts",
  "src/pixel-editor/data/pixel-editor-atlas-io.ts",
  "src/pixel-editor/data/pixel-editor-drafts.ts",
]);

function walk(directory: string, extension: string) {
  let files: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(relative, extension));
    } else if (relative.endsWith(extension)) {
      files.push(relative);
    }
  }
  return files;
}

const sourceFiles = walk("src", ".ts")
  .filter((file) => !file.endsWith(".d.ts"))
  .sort();
const testFiles = new Set(
  [
    ...walk("tests", ".test.mts"),
    ...walk("tests", ".test.ts"),
  ].sort(),
);

function expectedTestFiles(sourceFile: string) {
  const relative = sourceFile.replace(/^src\//, "").replace(/\.ts$/, "");
  const [topLevel] = relative.split("/");
  const basename = path.posix.basename(relative);
  return [
    `tests/${relative}.test.mts`,
    `tests/${relative}.test.ts`,
    `tests/${topLevel}/${basename}.test.mts`,
    `tests/${topLevel}/${basename}.test.ts`,
  ];
}

const missingTests = sourceFiles.filter(
  (sourceFile) =>
    !expectedTestFiles(sourceFile).some((candidate) => testFiles.has(candidate)),
);

function expectedImportSpecifiers(sourceFile: string, testFile: string) {
  const relative = path.posix.relative(
    path.posix.dirname(testFile),
    sourceFile,
  );
  const jsSpecifier = relative.replace(/\.ts$/, ".js");
  return [jsSpecifier.startsWith(".") ? jsSpecifier : `./${jsSpecifier}`];
}

const pairingProblems: string[] = [];

for (const sourceFile of missingTests) {
  if (!legacyMissingTestPairs.has(sourceFile)) {
    pairingProblems.push(
      `${sourceFile} is missing a matching test file under tests/ (expected one of: ${expectedTestFiles(sourceFile).join(", ")})`,
    );
  }
}

for (const sourceFile of legacyMissingTestPairs) {
  if (!missingTests.includes(sourceFile)) {
    pairingProblems.push(
      `${sourceFile} now has a matching test file; remove it from legacyMissingTestPairs`,
    );
  }
}

for (const sourceFile of sourceFiles) {
  const matchingTests = expectedTestFiles(sourceFile).filter((candidate) =>
    testFiles.has(candidate),
  );
  if (matchingTests.length === 0) continue;
  const importsSource = matchingTests.some((testFile) => {
    const contents = fs.readFileSync(path.join(root, testFile), "utf8");
    return expectedImportSpecifiers(sourceFile, testFile).some((specifier) =>
      contents.includes(specifier),
    );
  });
  if (!importsSource) {
    pairingProblems.push(
      `${sourceFile} has a matching test file, but none of ${matchingTests.join(", ")} reference its source module`,
    );
  }
}

assert.deepEqual(
  pairingProblems,
  [],
  `Every src TypeScript file should have a matching test file under tests/.\n${pairingProblems.join("\n")}`,
);
