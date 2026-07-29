import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { cropRgba, decodeRgbaPng } from "../pixel-font/scripts/png.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generatedSmileyStart = "<!-- GENERATED_SMILEY_START -->";
const generatedSmileyEnd = "<!-- GENERATED_SMILEY_END -->";

const smileySources = [
  {
    key: "grinningFace",
    mapping: path.join(
      root,
      "pixel-font",
      "atlases",
      "smileys-and-emotion",
      "face-smiling.json",
    ),
  },
  {
    key: "smilingFace",
    mapping: path.join(
      root,
      "pixel-font",
      "atlases",
      "smileys-and-emotion",
      "face-affection.json",
    ),
  },
  {
    key: "smilingFaceWithSmilingEyes",
    mapping: path.join(
      root,
      "pixel-font",
      "atlases",
      "smileys-and-emotion",
      "face-smiling.json",
    ),
  },
];

const smileyTargets = [
  path.join(root, "src", "site", "favicon.svg"),
  path.join(root, "src", "site", "pwa", "icon-maskable.svg"),
  path.join(root, "docs", "assets", "social-preview.svg"),
];

export const defaultTasks = [
  {
    input: path.join(root, "docs", "assets", "social-preview.svg"),
    output: path.join(root, "docs", "assets", "social-preview.png"),
  },
];

export const defaultDiscoveryRoots = [path.join(root, "docs", "assets")];

export const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(entryPath);
    return entry.isFile() ? [entryPath] : [];
  });
};

export const discoverSiblingSvgTasks = (directories) =>
  directories.flatMap((directory) =>
    walkFiles(directory)
      .filter((file) => file.toLowerCase().endsWith(".svg"))
      .map((input) => ({ input, output: input.replace(/\.svg$/i, ".png") })),
  );

export const dedupeTasks = (tasks) => {
  const seen = new Set();
  return tasks.filter((task) => {
    const output = path.resolve(task.output ?? task.input.replace(/\.svg$/i, ".png"));
    if (seen.has(output)) return false;
    seen.add(output);
    return true;
  });
};

export const parseDimensions = (svg) => {
  const widthMatch = svg.match(/\bwidth="(\d+(?:\.\d+)?)"/i);
  const heightMatch = svg.match(/\bheight="(\d+(?:\.\d+)?)"/i);
  if (widthMatch && heightMatch) {
    return {
      width: Math.round(Number(widthMatch[1])),
      height: Math.round(Number(heightMatch[1])),
    };
  }
  const viewBoxMatch = svg.match(
    /\bviewBox="(?:[-\d.]+\s+){2}([-\d.]+)\s+([-\d.]+)"/i,
  );
  if (viewBoxMatch) {
    return {
      width: Math.round(Number(viewBoxMatch[1])),
      height: Math.round(Number(viewBoxMatch[2])),
    };
  }
  throw new Error("SVG is missing width/height and viewBox dimensions");
};

const rgbaToHex = (red, green, blue) =>
  `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

const buildSmileyMarkup = (image, indent = "    ") => {
  const runsByColor = new Map();
  for (let y = 0; y < image.height; y += 1) {
    let x = 0;
    while (x < image.width) {
      const offset = (y * image.width + x) * 4;
      const alpha = image.pixels[offset + 3];
      if (alpha === 0) {
        x += 1;
        continue;
      }
      const color = rgbaToHex(
        image.pixels[offset],
        image.pixels[offset + 1],
        image.pixels[offset + 2],
      );
      let width = 1;
      while (x + width < image.width) {
        const next = (y * image.width + x + width) * 4;
        if (
          image.pixels[next + 3] !== alpha ||
          image.pixels[next] !== image.pixels[offset] ||
          image.pixels[next + 1] !== image.pixels[offset + 1] ||
          image.pixels[next + 2] !== image.pixels[offset + 2]
        ) {
          break;
        }
        width += 1;
      }
      const rect = `${indent}  <rect x="${x}" y="${y}" width="${width}" height="1"/>`;
      const existing = runsByColor.get(color) ?? [];
      existing.push(rect);
      runsByColor.set(color, existing);
      x += width;
    }
  }

  return Array.from(runsByColor.entries())
    .map(
      ([color, rects]) =>
        `${indent}<g fill="${color}">\n${rects.join("\n")}\n${indent}</g>`,
    )
    .join("\n");
};

const resolveSmileyImage = () => {
  const unavailable = [];
  for (const source of smileySources) {
    const sidecar = JSON.parse(fs.readFileSync(source.mapping, "utf8"));
    const entry = sidecar.entries.find((item) => item.key === source.key);
    if (!entry) {
      unavailable.push(
        `${source.key} missing from ${path.relative(root, source.mapping)}`,
      );
      continue;
    }
    const imageFile = path.join(root, "pixel-font", "atlases", sidecar.image);
    if (!fs.existsSync(imageFile)) {
      unavailable.push(path.relative(root, imageFile));
      continue;
    }
    const atlas = decodeRgbaPng(fs.readFileSync(imageFile));
    return cropRgba(atlas, entry.x, entry.y, entry.width, entry.height);
  }
  throw new Error(
    `Unable to resolve a smiley atlas source. Missing assets: ${unavailable.join(", ")}`,
  );
};

export const syncSvgSmileysFromAtlas = () => {
  const smileyMarkup = buildSmileyMarkup(resolveSmileyImage());
  for (const target of smileyTargets) {
    const source = fs.readFileSync(target, "utf8");
    const startIndex = source.indexOf(generatedSmileyStart);
    const endIndex = source.indexOf(generatedSmileyEnd);
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      throw new Error(
        `Missing generated smiley markers in ${path.relative(root, target)}`,
      );
    }
    const replacement = `${generatedSmileyStart}\n${smileyMarkup}\n      ${generatedSmileyEnd}`;
    const updated =
      source.slice(0, startIndex) +
      replacement +
      source.slice(endIndex + generatedSmileyEnd.length);
    fs.writeFileSync(target, updated);
  }
};

export const renderSvgAsset = ({
  input,
  output = input.replace(/\.svg$/i, ".png"),
  width,
  height,
}) => {
  const svg = fs.readFileSync(input, "utf8");
  const dimensions =
    width && height ? { width, height } : parseDimensions(svg);
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: dimensions.width,
    },
  });
  const image = resvg.render();
  const png = image.asPng();
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, png);
  return { input, output, ...dimensions };
};

export const parseCliTasks = (args) => {
  if (args.length === 0) {
    return dedupeTasks([
      ...defaultTasks,
      ...discoverSiblingSvgTasks(defaultDiscoveryRoots),
    ]);
  }
  const tasks = [];
  for (let index = 0; index < args.length; ) {
    const input = path.resolve(args[index++]);
    if (fs.existsSync(input) && fs.statSync(input).isDirectory()) {
      tasks.push(...discoverSiblingSvgTasks([input]));
      continue;
    }
    const next = args[index];
    const output =
      next && !/^\d+$/.test(next) ? path.resolve(args[index++]) : undefined;
    const widthArg = args[index];
    const heightArg = args[index + 1];
    const width = widthArg && /^\d+$/.test(widthArg) ? Number(widthArg) : undefined;
    const height =
      heightArg && /^\d+$/.test(heightArg) ? Number(heightArg) : undefined;
    if (width !== undefined) index += 1;
    if (height !== undefined) index += 1;
    tasks.push({ input, output, width, height });
  }
  return dedupeTasks(tasks);
};


export const renderSvgAssets = (tasks = parseCliTasks([])) => tasks.map(renderSvgAsset);

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  syncSvgSmileysFromAtlas();
  const tasks = parseCliTasks(process.argv.slice(2));
  const results = renderSvgAssets(tasks);
  for (const result of results) {
    console.info(
      `Rendered ${path.relative(root, result.input)} -> ${path.relative(root, result.output)} (${result.width}x${result.height})`,
    );
  }
}
