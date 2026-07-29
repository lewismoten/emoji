import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const defaults = [
  {
    input: path.join(root, "docs", "assets", "social-preview.svg"),
    output: path.join(root, "docs", "assets", "social-preview.png"),
  },
];

const parseDimensions = (svg) => {
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

const renderSvgAsset = ({
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

const parseCliTasks = (args) => {
  if (args.length === 0) return defaults;
  const tasks = [];
  for (let index = 0; index < args.length; ) {
    const input = path.resolve(args[index++]);
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
  return tasks;
};

const tasks = parseCliTasks(process.argv.slice(2));
const results = tasks.map(renderSvgAsset);
for (const result of results) {
  console.info(
    `Rendered ${path.relative(root, result.input)} -> ${path.relative(root, result.output)} (${result.width}x${result.height})`,
  );
}
