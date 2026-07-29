import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const sourceDirectory = "src";

export const compileTypeScriptSources = () => {
  const outputDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "emoji-typescript-"),
  );
  const sourceFiles = fs
    .readdirSync(sourceDirectory, { recursive: true })
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.join(sourceDirectory, file));
  const result = spawnSync(
    process.execPath,
    [
      path.join("node_modules", "typescript", "bin", "tsc"),
      "--ignoreConfig",
      "--target",
      "ESNext",
      "--module",
      "ESNext",
      "--moduleResolution",
      "Bundler",
      "--lib",
      "ESNext,DOM,DOM.Iterable",
      "--types",
      "vite/client",
      "--skipLibCheck",
      "--strict",
      "--outDir",
      outputDirectory,
      "--rootDir",
      sourceDirectory,
      ...sourceFiles,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    throw new Error(
      result.stderr || result.stdout || "TypeScript emission failed.",
    );
  }
  return {
    read(sourceFile) {
      const relativeFile = path.relative(sourceDirectory, sourceFile);
      const outputFile = path.join(
        outputDirectory,
        relativeFile.replace(/\.ts$/, ".js"),
      );
      return fs.readFileSync(outputFile, "utf8");
    },
    dispose() {
      fs.rmSync(outputDirectory, { recursive: true, force: true });
    },
  };
};
