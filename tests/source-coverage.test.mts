import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const walk = (directory: string, extensions: string[]) => {
  let files: string[] = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".DS_Store") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(absolute, extensions));
      continue;
    }
    if (extensions.some((extension) => absolute.endsWith(extension))) {
      files.push(absolute);
    }
  }
  return files;
};

const srcFiles = walk(path.join(root, "src"), [".ts"])
  .filter((file) => !file.endsWith(".d.ts"))
  .map((file) => path.relative(root, file).replaceAll(path.sep, "/"))
  .sort();
const testFiles = walk(path.join(root, "tests"), [".mts", ".mjs", ".ts", ".js"]);
const testCorpus = testFiles
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

const importExpression =
  /from\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
const sourceGraph = new Map<string, string[]>();

for (const sourceFile of srcFiles) {
  const source = fs.readFileSync(path.join(root, sourceFile), "utf8");
  const dependencies: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importExpression.exec(source))) {
    const specifier = match[1] ?? match[2];
    if (!specifier?.startsWith(".")) continue;
    const baseDirectory = path.posix.dirname(sourceFile);
    let resolved = path.posix.normalize(
      path.posix.join(baseDirectory, specifier),
    );
    if (resolved.endsWith(".js")) resolved = `${resolved.slice(0, -3)}.ts`;
    else if (!path.posix.extname(resolved)) resolved = `${resolved}.ts`;
    if (srcFiles.includes(resolved)) dependencies.push(resolved);
  }
  sourceGraph.set(sourceFile, dependencies);
}

const seedFiles = new Set<string>();
const legacyDirectCoverageAllowlist = new Set<string>([
  "src/app/browser-runtime-config.ts",
  "src/app/explorer-bootstrap-runtime.ts",
  "src/app/explorer-bootstrap-session-runtime.ts",
  "src/app/list-orchestration.ts",
  "src/app/navigation-runtime.ts",
  "src/app/pixel-editor-loader-runtime.ts",
  "src/app/startup-runtime.ts",
  "src/app/ui-binding-runtime.ts",
  "src/app/version-controller.ts",
  "src/app/version-mode-runtime.ts",
  "src/app/version-runtime.ts",
  "src/controls/dialog/dialog-navigate-button.ts",
  "src/controls/filters/pickers/filter-picker-trigger.ts",
  "src/controls/pickers/language-picker.ts",
  "src/explorer-audio.ts",
  "src/explorer-composition-controller.ts",
  "src/explorer-runtime.ts",
  "src/explorer-state.ts",
  "src/explorer/advanced-filter-dialog-control.ts",
  "src/explorer/audio/explorer-audio-engine.ts",
  "src/explorer/control-startup.ts",
  "src/explorer/dialog/dialog-title-controls.ts",
  "src/explorer/event-accessibility.ts",
  "src/explorer/explorer-dom.ts",
  "src/explorer/explorer-navigation.ts",
  "src/explorer/filter-summary.ts",
  "src/explorer/popular-keys.ts",
  "src/explorer/toolbar/help-settings-control.ts",
  "src/explorer/toolbar/theme-choice-control.ts",
  "src/explorer/toolbar/toolbar-trigger-controls.ts",
  "src/explorer/utility-control-markup.ts",
  "src/explorer/utility-picker-controls.ts",
  "src/pixel-editor/canvas/pixel-editor-layer-canvas-controller.ts",
  "src/pixel-editor/canvas/pixel-editor-template.ts",
  "src/pixel-editor/controllers/pixel-editor-atlas.ts",
  "src/pixel-editor/controllers/pixel-editor-controllers.ts",
  "src/pixel-editor/controllers/pixel-editor-mode.ts",
  "src/pixel-editor/controllers/pixel-editor-transfer-skin-tone.ts",
  "src/pixel-editor/controllers/pixel-editor-transfer.ts",
  "src/pixel-editor/controllers/setup/pixel-editor-controller-session.ts",
  "src/pixel-editor/controllers/setup/pixel-editor-controller-visual.ts",
  "src/pixel-editor/core/pixel-editor-constants.ts",
  "src/pixel-editor/core/pixel-editor-geometry-helpers.ts",
  "src/pixel-editor/core/pixel-editor-grid-navigation.ts",
  "src/pixel-editor/data/pixel-editor-atlas-io.ts",
  "src/pixel-editor/layers/pixel-editor-layer-helpers.ts",
  "src/pixel-editor/palette/pixel-editor-palette.ts",
  "src/pixel-editor/palette/pixel-editor-skin-tone.ts",
]);
for (const sourceFile of srcFiles) {
  const jsFile = sourceFile.replace(/\.ts$/, ".js");
  const withoutRoot = sourceFile.replace(/^src\//, "");
  const withoutExtension = withoutRoot.replace(/\.ts$/, "");
  if (
    testCorpus.includes(sourceFile) ||
    testCorpus.includes(jsFile) ||
    testCorpus.includes(withoutRoot) ||
    testCorpus.includes(withoutExtension)
  ) {
    seedFiles.add(sourceFile);
  }
}

const directlyCoveredFiles = [...seedFiles].sort();
const directCoverageProblems: string[] = [];

for (const sourceFile of srcFiles) {
  if (!seedFiles.has(sourceFile) && !legacyDirectCoverageAllowlist.has(sourceFile)) {
    directCoverageProblems.push(
      `${sourceFile} is not directly referenced by tests; add a direct test or explicitly allowlist it as legacy coverage debt`,
    );
  }
}

for (const sourceFile of directlyCoveredFiles) {
  if (legacyDirectCoverageAllowlist.has(sourceFile)) {
    directCoverageProblems.push(
      `${sourceFile} is now directly test-covered; remove it from legacyDirectCoverageAllowlist`,
    );
  }
}

const visited = new Set<string>();
const stack = [...seedFiles];
while (stack.length > 0) {
  const current = stack.pop();
  if (!current || visited.has(current)) continue;
  visited.add(current);
  for (const dependency of sourceGraph.get(current) ?? []) {
    if (!visited.has(dependency)) stack.push(dependency);
  }
}

const uncovered = srcFiles.filter((sourceFile) => !visited.has(sourceFile));

assert.deepEqual(
  uncovered,
  [],
  `Every TypeScript file under src must be covered by at least one test root or transitive dependency.\nUncovered files:\n${uncovered.join("\n")}`,
);

assert.deepEqual(
  directCoverageProblems,
  [],
  `Every new TypeScript file under src must be directly referenced by tests unless explicitly allowlisted as legacy direct-coverage debt.\n${directCoverageProblems.join("\n")}`,
);
