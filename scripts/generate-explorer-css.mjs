import fs from "node:fs";
import path from "node:path";

const outputDirectory = "explorer";
const sourceFiles = [
  {
    source: path.join("src", "site", "themes", "base-theme.css"),
    output: path.join("themes", "base-theme.css"),
  },
  {
    source: path.join("src", "site", "themes", "dark.css"),
    output: path.join("themes", "dark.css"),
  },
  {
    source: path.join("src", "site", "themes", "light", "light.css"),
    output: path.join("themes", "light", "light.css"),
  },
  {
    source: path.join("src", "site", "themes", "ega.css"),
    output: path.join("themes", "ega.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro.css"),
    output: path.join("themes", "retro", "retro.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-foundation.css"),
    output: path.join("themes", "retro", "retro-foundation.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-dialogs.css"),
    output: path.join("themes", "retro", "retro-dialogs.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-example-dialogs.css"),
    output: path.join("themes", "retro", "retro-example-dialogs.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-buttons.css"),
    output: path.join("themes", "retro", "retro-buttons.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-forms.css"),
    output: path.join("themes", "retro", "retro-forms.css"),
  },
  {
    source: path.join("src", "site", "themes", "retro", "retro-focus.css"),
    output: path.join("themes", "retro", "retro-focus.css"),
  },
  {
    source: path.join("src", "site", "styles", "toolbar-controls.css"),
    output: "toolbar-controls.css",
  },
  {
    source: path.join("src", "site", "styles", "dialog-controls.css"),
    output: "dialog-controls.css",
  },
  {
    source: path.join("src", "controls", "dialog", "dialog-close-button.css"),
    output: path.join("controls", "dialog", "dialog-close-button.css"),
  },
  {
    source: path.join("src", "controls", "dialog", "dialog-heading.css"),
    output: path.join("controls", "dialog", "dialog-heading.css"),
  },
  {
    source: path.join("src", "controls", "dialog", "dialog-navigate-button.css"),
    output: path.join("controls", "dialog", "dialog-navigate-button.css"),
  },
  {
    source: path.join("src", "controls", "dialog", "dialog-mode-back-button.css"),
    output: path.join("controls", "dialog", "dialog-mode-back-button.css"),
  },
  {
    source: path.join("src", "controls", "pickers", "language-picker.css"),
    output: path.join("controls", "pickers", "language-picker.css"),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "pickers",
      "compact-choice-button.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "pickers",
      "compact-choice-button.css",
    ),
  },
  {
    source: path.join("src", "controls", "toolbar", "theme-choice-group.css"),
    output: path.join("controls", "toolbar", "theme-choice-group.css"),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "pickers",
      "filter-picker-trigger.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "pickers",
      "filter-picker-trigger.css",
    ),
  },
  {
    source: path.join("src", "controls", "toolbar", "toolbar-trigger-button.css"),
    output: path.join("controls", "toolbar", "toolbar-trigger-button.css"),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "pickers",
      "advanced-filters-trigger.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "pickers",
      "advanced-filters-trigger.css",
    ),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "modifiers",
      "modifier-filter-control.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "modifiers",
      "modifier-filter-control.css",
    ),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "version",
      "version-mode-toggle.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "version",
      "version-mode-toggle.css",
    ),
  },
  {
    source: path.join(
      "src",
      "controls",
      "filters",
      "version",
      "version-step-button.css",
    ),
    output: path.join(
      "controls",
      "filters",
      "version",
      "version-step-button.css",
    ),
  },
];
function readCssWithImports(file, seen = new Set()) {
  const normalized = path.resolve(file);
  if (seen.has(normalized)) {
    throw new Error(`Circular CSS import detected: ${normalized}`);
  }
  seen.add(normalized);
  const source = fs.readFileSync(normalized, "utf8");
  const directory = path.dirname(normalized);
  const expanded = source.replace(
    /@import\s+["'](.+?)["'];/g,
    (_match, importPath) => {
      const importedFile = path.resolve(directory, importPath);
      return readCssWithImports(importedFile, seen);
    },
  );
  seen.delete(normalized);
  return expanded;
}

const mainSource = readCssWithImports(path.join("src", "site", "index.css"));

function matchingBrace(source, opening) {
  let depth = 0;
  let quote = "";
  let comment = false;
  for (let index = opening; index < source.length; index++) {
    const character = source[index];
    const next = source[index + 1];
    if (comment) {
      if (character === "*" && next === "/") {
        comment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (character === "\\") {
        index++;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === "/" && next === "*") {
      comment = true;
      index++;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "{") {
      depth++;
    } else if (character === "}" && --depth === 0) {
      return index;
    }
  }
  throw new Error("Unbalanced CSS block");
}

function splitCss(source) {
  let core = "";
  let developer = "";
  let cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf("{", cursor);
    if (opening === -1) {
      core += source.slice(cursor);
      break;
    }
    const closing = matchingBrace(source, opening);
    const header = source.slice(cursor, opening);
    const body = source.slice(opening + 1, closing);
    const trimmedHeader = header.trim();
    if (/^@(media|supports|container|layer)\b/.test(trimmedHeader)) {
      const nested = splitCss(body);
      if (nested.core.trim()) core += `${header}{${nested.core}}`;
      if (nested.developer.trim())
        developer += `${header}{${nested.developer}}`;
    } else {
      const selectors = trimmedHeader
        .replace(/^\/\*[\s\S]*?\*\//, "")
        .split(",");
      const developerOnly =
        selectors.length > 0 &&
        selectors.every((selector) => selector.includes(".pixel-editor"));
      if (developerOnly) {
        developer += `${header}{${body}}`;
      } else {
        core += `${header}{${body}}`;
      }
    }
    cursor = closing + 1;
  }
  return { core, developer };
}

function minifyCss(source) {
  const strings = [];
  let protectedSource = "";
  for (let index = 0; index < source.length; index++) {
    const character = source[index];
    if (character === "/" && source[index + 1] === "*") {
      const closing = source.indexOf("*/", index + 2);
      index = closing === -1 ? source.length : closing + 1;
      continue;
    }
    if (character !== '"' && character !== "'") {
      protectedSource += character;
      continue;
    }
    const quote = character;
    let value = quote;
    while (++index < source.length) {
      value += source[index];
      if (source[index] === "\\") {
        value += source[++index] ?? "";
      } else if (source[index] === quote) {
        break;
      }
    }
    const token = `___CSS_STRING_${strings.length}___`;
    strings.push(value);
    protectedSource += token;
  }
  return protectedSource
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")
    .trim()
    .replace(/___CSS_STRING_(\d+)___/g, (match, index) => strings[index]);
}

fs.mkdirSync(outputDirectory, { recursive: true });
const generated = [];

for (const entry of sourceFiles) {
  const source = fs.readFileSync(entry.source, "utf8");
  const minified = minifyCss(source);
  const outputFile = path.join(outputDirectory, entry.output);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${minified}\n`);
  generated.push({
    bytes: Buffer.byteLength(minified),
    label: entry.output,
  });
}

const { core, developer } = splitCss(mainSource);
const coreCss = minifyCss(core);
const developerCss = minifyCss(developer);
fs.writeFileSync(path.join(outputDirectory, "index.css"), `${coreCss}\n`);
fs.writeFileSync(
  path.join(outputDirectory, "pixel-editor.css"),
  `${developerCss}\n`,
);
generated.push({ bytes: Buffer.byteLength(coreCss), label: "index.css" });
generated.push({
  bytes: Buffer.byteLength(developerCss),
  label: "pixel-editor.css",
});

console.info(
  `Generated ${generated
    .map(
      ({ bytes, label }) => `${bytes.toLocaleString()} bytes of ${label}`,
    )
    .join(", ")}.`,
);
