import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const structureLimits = {
  linesPerScriptOrStylesheet: 300,
  filesPerDirectory: 10,
  directoriesPerDirectory: 10,
};
const markdownVisualWidth = 80;

// Existing files are expected to meet the same line limits as new files.
const legacyLineBudgets: Record<string, number> = {
  "src/controls/dialog/content/help-settings-dialog.ts": 312,
  "src/site/themes/retro/retro-buttons.css": 301,
  "src/site/themes/retro/retro-forms.css": 362,
  "tests/app/bootstrap/explorer-bootstrap-controllers-runtime.test.mts": 536,
  "tests/app/browser/browser-runtime-service-worker.test.mts": 489,
  "tests/app/bootstrap/explorer-bootstrap-session-runtime.test.mts": 547,
  "tests/app/bootstrap/explorer-bootstrap-session-runtime.vitest.test.mts": 445,
  "tests/app/bootstrap/controllers/explorer-bootstrap-controllers-fixture.ts": 340,
  "tests/app/bootstrap/explorer-bootstrap-controllers.vitest.test.mts": 486,
  "tests/app/bootstrap/explorer-bootstrap-runtime.vitest.test.mts": 365,
  "tests/app/bootstrap/options/explorer-bootstrap-options.vitest.test.mts": 377,
  "tests/app/bootstrap/session/explorer-bootstrap-session-entry.vitest.test.mts": 402,
  "tests/app/browser/browser-runtime.vitest.test.mts": 312,
  "tests/app/emoji/emoji-runtime.vitest.test.mts": 317,
  "tests/app/emoji/explorer-app-events-runtime.vitest.test.mts": 778,
  "tests/app/shell/explorer-shell-direct.vitest.test.mts": 306,
  "tests/app/shell/explorer-shell.vitest.test.mts": 479,
  "tests/app/version/version-controller.vitest.test.mts": 558,
  "tests/app/version/version-mode-runtime.vitest.test.mts": 306,
  "tests/explorer/ui/explorer-ui-branches.vitest.test.mts": 329,
  "tests/explorer/audio/explorer-audio-engine.vitest.test.mts": 563,
  "tests/explorer/audio/direct/explorer-audio-direct-interactions.test.mts": 304,
  "tests/explorer/audio/direct/explorer-audio-direct-fixture.mts": 302,
  "tests/explorer/audio/module/explorer-audio-module-fixture.mts": 614,
  "tests/explorer/category/category-filter-render.vitest.test.mts": 520,
  "tests/explorer/control-startup.vitest.test.mts": 614,
  "tests/explorer/dialog/dialog-render.test.mts": 466,
  "tests/explorer/dialog/dialog-upgrade.test.mts": 431,
  "tests/explorer/language/language-dialog-control.test.mts": 441,
  "tests/explorer/language/search-language-lifecycle.vitest.test.mts": 520,
  "tests/explorer/navigation/explorer-navigation-direct.vitest.test.mts": 555,
  "tests/explorer/navigation/url-state.test.mts": 423,
  "tests/explorer/pwa-panels.test.mts": 590,
  "tests/explorer/utility/runtime/utility-controls-fixture.mts": 305,
  "tests/pixel-editor/controllers/pixel-editor-atlas.test.mts": 346,
  "tests/pixel-editor/controllers/pixel-editor-transfer.test.mts": 405,
  "tests/pixel-editor/controllers/setup/pixel-editor-controller-visual.test.mts": 325,
  "tests/pixel-editor/data/pixel-editor-atlas-io.test.mts": 470,
  "tests/pixel-font-hot-reload.test.mts": 546,
  "tests/shared/meta/project-structure.vitest.test.mts": 315,
};

const legacyFileCountBudgets: Record<string, number> = {
  ".": 11,
  src: 19,
};

const legacyDirectoryCountBudgets: Record<string, number> = {
  "src/explorer": 11,
  "tests/explorer": 11,
};

const generatedStructurePrefixes = ["dist/", "explorer/", "library/"];
generatedStructurePrefixes.push("pixel-font/build-retro-text/");
const generatedStructureFiles = new Set([
  "emoji.ts",
  "favicon.svg",
  "index.css",
  "index.html",
  "index.js",
  "offline.html",
  "pixel-editor.js",
  "pixel-font/ATLASES.md",
  "robots.txt",
  "social-preview.png",
  "social-preview.svg",
  "sitemap.xml",
]);
const generatedFilenamePrefixes = [
  ...generatedStructurePrefixes,
  "pwa/",
  "orders/",
  "pixel-font/atlases/",
  "proposed/",
  "src/data/locales/",
  "../src/data/orders",
  "../src/data/proposed",
  "../src/data/versions",
  "src/data/orders/",
  "src/data/proposed/",
  "src/data/versions/",
  "src/site/pwa/icons/",
  "../src/site/pwa/icons",
  "versions/",
];
const ignoredRoots = new Set([
  ".git",
  "build",
  "cache",
  "coverage",
  "dist",
  "node_modules",
  ".venv",
]);

const isAuditedSourceFile = (file: string) =>
  !file.includes("/") || file.startsWith("src/") || file.startsWith("tests/");

const walkDirectory = (directory: string, files: string[]) => {
  for (const entry of readdirSync(path.join(root, directory), {
    withFileTypes: true,
  })) {
    if (entry.name === ".DS_Store") continue;
    const relative =
      directory === "." ? entry.name : `${directory}/${entry.name}`;
    if (entry.isDirectory()) {
      if (ignoredRoots.has(relative) || ignoredRoots.has(entry.name)) continue;
      walkDirectory(relative, files);
      continue;
    }
    files.push(relative);
  }
};

const gitFiles = () => {
  const files: string[] = [];
  walkDirectory("src", files);
  walkDirectory("tests", files);
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.name === ".DS_Store" || entry.name === "src") continue;
    if (
      entry.isDirectory() ||
      ignoredRoots.has(entry.name) ||
      generatedFilenamePrefixes.some((prefix) =>
        prefix.startsWith(`${entry.name}/`),
      )
    ) {
      continue;
    }
    files.push(entry.name);
  }
  return files.filter(
    (file) =>
      !generatedStructurePrefixes.some((prefix) => file.startsWith(prefix)) &&
      !generatedFilenamePrefixes.some((prefix) => file.startsWith(prefix)),
  );
};

const countLines = (text: string) => {
  let lines = 1;
  for (let index = 0; index < text.length; index += 1) {
    if (text.charCodeAt(index) === 10) lines += 1;
  }
  return lines;
};

const countMarkdownVirtualLines = (text: string) =>
  (text.split(/\r?\n/).length === 0 ? [""] : text.split(/\r?\n/)).reduce(
    (total, line) =>
      total + Math.max(1, Math.ceil(line.length / markdownVisualWidth)),
    0,
  );

describe("project-structure", () => {
  it("enforces file, folder, and line-count limits", () => {
    expect(
      Object.entries(legacyLineBudgets).filter(
        ([, value]) => value < structureLimits.linesPerScriptOrStylesheet,
      ),
      "Files specified below 300 line limits.",
    ).toEqual([]);

    expect(
      Object.entries(legacyFileCountBudgets).filter(
        ([, value]) => value < structureLimits.filesPerDirectory,
      ),
      "Files in directory specified below limits.",
    ).toEqual([]);

    expect(
      Object.entries(legacyDirectoryCountBudgets).filter(
        ([, value]) => value < structureLimits.directoriesPerDirectory,
      ),
      "Directories in directory specified below limits.",
    ).toEqual([]);

    const maintainedFiles = gitFiles();
    const auditedFiles = maintainedFiles.filter(isAuditedSourceFile);
    const projectFiles = auditedFiles.filter(
      (file) =>
        !generatedStructureFiles.has(file) &&
        !generatedStructurePrefixes.some((prefix) => file.startsWith(prefix)),
    );
    const structureDirectories = new Map<
      string,
      { files: Set<string>; directories: Set<string> }
    >();
    const structureDirectory = (directory: string) => {
      const existing = structureDirectories.get(directory);
      if (existing) return existing;
      const created = {
        files: new Set<string>(),
        directories: new Set<string>(),
      };
      structureDirectories.set(directory, created);
      return created;
    };

    for (const file of projectFiles) {
      let directory = path.posix.dirname(file);
      structureDirectory(directory).files.add(path.posix.basename(file));
      while (directory !== ".") {
        const parent = path.posix.dirname(directory);
        structureDirectory(parent).directories.add(
          path.posix.basename(directory),
        );
        directory = parent;
      }
    }

    const structureProblems: string[] = [];
    const sourceJavaScriptFiles = projectFiles.filter(
      (file) => file.startsWith("src/") && file.endsWith(".js"),
    );
    if (sourceJavaScriptFiles.length > 0) {
      structureProblems.push(
        `TypeScript source only under src; found JavaScript files: ${sourceJavaScriptFiles.join(", ")}`,
      );
    }
    const measuredFiles = projectFiles.filter((file) =>
      /\.(?:js|jsx|mjs|cjs|ts|tsx|mts|cts|css|md|mdx)$/i.test(file),
    );

    for (const file of measuredFiles) {
      const text = readFileSync(path.join(root, file), "utf8");
      const lines = /\.mdx?$/i.test(file)
        ? countMarkdownVirtualLines(text)
        : countLines(text);
      const budget =
        legacyLineBudgets[file] ?? structureLimits.linesPerScriptOrStylesheet;
      if (lines > budget) {
        structureProblems.push(
          `${file} has ${lines} lines; its limit is ${budget}`,
        );
      } else if (legacyLineBudgets[file] !== undefined && lines < budget) {
        structureProblems.push(
          `${file} improved to ${lines} lines; lower its legacy budget from ${budget}`,
        );
      }
    }

    for (const [directory, contents] of structureDirectories) {
      const fileCount = contents.files.size;
      const fileBudget =
        legacyFileCountBudgets[directory] ?? structureLimits.filesPerDirectory;
      if (fileCount > fileBudget) {
        structureProblems.push(
          `${directory} contains ${fileCount} files; its limit is ${fileBudget}`,
        );
      } else if (legacyFileCountBudgets[directory] !== undefined) {
        if (fileCount !== fileBudget) {
          structureProblems.push(
            `${directory} legacy file-count budget is ${fileBudget}, but the filesystem currently has ${fileCount} files`,
          );
        }
      }

      const directoryCount = contents.directories.size;
      const directoryBudget =
        legacyDirectoryCountBudgets[directory] ??
        structureLimits.directoriesPerDirectory;
      if (directoryCount > directoryBudget) {
        structureProblems.push(
          `${directory} contains ${directoryCount} folders; its limit is ${directoryBudget}`,
        );
      } else if (
        legacyDirectoryCountBudgets[directory] !== undefined &&
        directoryCount < directoryBudget
      ) {
        structureProblems.push(
          `${directory} now contains ${directoryCount} folders; lower its legacy budget from ${directoryBudget}`,
        );
      }
    }

    const uniqueFilenameFiles = auditedFiles.filter(
      (file) =>
        !generatedStructureFiles.has(file) &&
        !generatedFilenamePrefixes.some((prefix) => file.startsWith(prefix)),
    );
    const filesByName = new Map<string, string[]>();
    for (const file of uniqueFilenameFiles) {
      const filename = path.posix.basename(file);
      if (!path.posix.extname(filename)) continue;
      if (filename.toLocaleLowerCase("en") === "tsconfig.json") continue;
      const normalizedFilename = filename.toLocaleLowerCase("en");
      const matches = filesByName.get(normalizedFilename) ?? [];
      matches.push(file);
      filesByName.set(normalizedFilename, matches);
    }
    for (const [filename, matches] of filesByName) {
      if (matches.length > 1) {
        structureProblems.push(
          `${filename} is not unique: ${matches.join(", ")}`,
        );
      }
    }

    expect(
      structureProblems,
      `Project structure limits failed:\n${structureProblems.join("\n")}`,
    ).toEqual([]);
  });
});
