import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join("src", "site", "index.css"), "utf8");
const outputDirectory = "explorer";

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

const { core, developer } = splitCss(source);
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(
  path.join(outputDirectory, "index.css"),
  `${minifyCss(core)}\n`,
);
fs.writeFileSync(
  path.join(outputDirectory, "pixel-editor.css"),
  `${minifyCss(developer)}\n`,
);
console.info(
  `Generated ${Buffer.byteLength(minifyCss(core)).toLocaleString()} bytes of core CSS and ${Buffer.byteLength(minifyCss(developer)).toLocaleString()} bytes of on-demand editor CSS.`,
);
