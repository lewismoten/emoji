import fs from "node:fs";
import path from "node:path";

const sourceDirectory = path.join("build", "library");
const declarationFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? declarationFiles(file)
      : file.endsWith(".d.ts")
        ? [file]
        : [];
  });
const esmImports = (contents) =>
  contents.replace(
    /(from\s+["'])(\.[^"']+)(["'])/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${specifier}.d.mts${suffix}`,
  );
const writeDeclarations = (
  directory,
  extension,
  transform = (value) => value,
) => {
  for (const sourceFile of declarationFiles(sourceDirectory)) {
    const relativeFile = path.relative(sourceDirectory, sourceFile);
    const outputFile = path.join(
      directory,
      relativeFile.replace(/\.d\.ts$/, extension),
    );
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(
      outputFile,
      transform(fs.readFileSync(sourceFile, "utf8")),
    );
  }
};

writeDeclarations(path.join("dist", "esm", "types"), ".d.mts", esmImports);
writeDeclarations(path.join("dist", "commonjs", "types"), ".d.ts");
