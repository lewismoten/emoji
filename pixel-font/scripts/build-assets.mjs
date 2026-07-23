import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { cropRgba, decodeRgbaPng, encodeRgbaPng, hasVisiblePixels } from './png.mjs';

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasDirectory = path.join(workspace, 'atlases');
const buildDirectory = path.join(workspace, 'build');
const pngDirectory = path.join(buildDirectory, 'png');
const svgDirectory = path.join(buildDirectory, 'svg');
const fontDirectory = path.join(buildDirectory, 'font');
const manifest = JSON.parse(await fs.readFile(path.join(atlasDirectory, 'manifest.json'), 'utf8'));
const glyphs = [];
const editorGlyphs = {};

await fs.rm(buildDirectory, { recursive: true, force: true });
await Promise.all([
  fs.mkdir(pngDirectory, { recursive: true }),
  fs.mkdir(svgDirectory, { recursive: true }),
  fs.mkdir(fontDirectory, { recursive: true })
]);

for (const sheet of manifest.sheets) {
  const mapping = JSON.parse(await fs.readFile(path.join(atlasDirectory, sheet.mapping), 'utf8'));
  const atlas = decodeRgbaPng(await fs.readFile(path.join(atlasDirectory, sheet.image)));
  for (const entry of mapping.entries.filter(item => item.active)) {
    const cell = cropRgba(atlas, entry.x, entry.y, entry.width, entry.height);
    const painted = hasVisiblePixels(cell);
    editorGlyphs[entry.key] = {
      key: entry.key,
      name: entry.name,
      emoji: entry.emoji,
      atlas: sheet.image,
      index: entry.index,
      row: entry.row,
      column: entry.column,
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height,
      codePoints: entry.codePoints,
      sequenceType: entry.sequenceType,
      painted
    };
    if (!painted) continue;

    const png = `${entry.key}.png`;
    const svg = `${entry.key}.svg`;
    await fs.writeFile(path.join(pngDirectory, png), encodeRgbaPng(cell));
    await fs.writeFile(path.join(svgDirectory, svg), renderSvg(cell, entry));
    glyphs.push({
      key: entry.key,
      name: entry.name,
      emoji: entry.emoji,
      codePoints: entry.codePoints,
      sequenceType: entry.sequenceType,
      atlas: sheet.id,
      index: entry.index,
      row: entry.row,
      column: entry.column,
      png: `png/${png}`,
      svg: `svg/${svg}`,
      pixels: [...cell.pixels]
    });
  }
}

const buildManifest = {
  schemaVersion: 1,
  familyName: manifest.familyName,
  cellSize: manifest.cellSize,
  glyphCount: glyphs.length,
  sequenceGlyphCount: glyphs.filter(glyph => glyph.sequenceType !== 'single').length,
  sequenceTypeCounts: countBySequenceType(glyphs),
  glyphs: glyphs.map(({ pixels, ...glyph }) => glyph)
};
if (Object.keys(editorGlyphs).length !== manifest.activeGlyphCount) {
  throw new Error('Pixel editor manifest does not cover every active base-atlas assignment');
}
await writeJson(path.join(buildDirectory, 'manifest.json'), buildManifest);
await writeJson(path.join(buildDirectory, 'editor-manifest.json'), {
  schemaVersion: 1,
  cellSize: manifest.cellSize,
  atlasWidth: manifest.columns * manifest.cellSize,
  atlasHeight: manifest.rows * manifest.cellSize,
  glyphCount: Object.keys(editorGlyphs).length,
  glyphs: editorGlyphs
});
await writeJson(path.join(buildDirectory, 'font-source.json'), {
  familyName: manifest.familyName,
  cellSize: manifest.cellSize,
  glyphs
});

if (glyphs.length > 0) {
  const python = await pythonCommand();
  await run(python, [
    path.join(workspace, 'scripts', 'test-font-sequences.py')
  ]);
  await run(python, [
    path.join(workspace, 'scripts', 'compile-font.py'),
    path.join(buildDirectory, 'font-source.json'),
    fontDirectory
  ]);
}
await fs.rm(path.join(buildDirectory, 'font-source.json'), { force: true });
await fs.writeFile(path.join(buildDirectory, 'index.html'), renderPreview(buildManifest));

console.log(
  `Built ${glyphs.length.toLocaleString()} painted glyph${glyphs.length === 1 ? '' : 's'} `
    + `from ${manifest.sheets.length} atlases.`
);

function renderSvg(image, entry) {
  const rectangles = pixelRuns(image)
    .map(run => {
      const opacity = run.alpha === 255 ? '' : ` fill-opacity="${trimNumber(run.alpha / 255)}"`;
      return `  <rect x="${run.x}" y="${run.y}" width="${run.width}" height="1" fill="${run.color}"${opacity}/>`;
    })
    .join('\n');
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">',
    `  <title>${escapeXml(entry.name)}</title>`,
    rectangles,
    '</svg>',
    ''
  ].join('\n');
}

function pixelRuns(image) {
  const runs = [];
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; ) {
      const offset = (y * image.width + x) * 4;
      const [red, green, blue, alpha] = image.pixels.subarray(offset, offset + 4);
      if (alpha === 0) {
        x += 1;
        continue;
      }
      let width = 1;
      while (x + width < image.width) {
        const next = (y * image.width + x + width) * 4;
        if (
          image.pixels[next] !== red
          || image.pixels[next + 1] !== green
          || image.pixels[next + 2] !== blue
          || image.pixels[next + 3] !== alpha
        ) break;
        width += 1;
      }
      runs.push({
        x,
        y,
        width,
        color: `#${hex(red)}${hex(green)}${hex(blue)}`,
        alpha
      });
      x += width;
    }
  }
  return runs;
}

function renderPreview(build) {
  const cards = build.glyphs
    .map(
      glyph => `<article>
  <h2>${escapeXml(glyph.emoji)} ${escapeXml(glyph.name)}</h2>
  <div class="samples">
    <figure><img src="${glyph.png}" alt=""><figcaption>PNG</figcaption></figure>
    <figure><img src="${glyph.svg}" alt=""><figcaption>SVG</figcaption></figure>
    <figure><span class="font">${escapeXml(glyph.emoji)}</span><figcaption>Font</figcaption></figure>
  </div>
  <code>${glyph.codePoints.map(point => `U+${point}`).join(' ')}</code>
</article>`
    )
    .join('\n');
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${escapeXml(build.familyName)} preview</title>
<style>
  @font-face {
    font-family: "${escapeCss(build.familyName)}";
    src: url("./font/pixel-emoji.woff2") format("woff2"),
         url("./font/pixel-emoji.woff") format("woff"),
         url("./font/pixel-emoji.ttf") format("truetype");
  }
  :root { color-scheme: dark; font-family: system-ui, sans-serif; }
  body { margin: 0 auto; max-width: 70rem; padding: 1rem; background: #17111d; color: #fff; }
  main { display: grid; grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr)); gap: 1rem; }
  article { padding: 1rem; border: 1px solid #70458b; border-radius: .75rem; background: #25142f; }
  h1, h2 { margin-top: 0; }
  h2 { font-size: 1rem; }
  .samples { display: flex; gap: 1rem; }
  figure { margin: 0; text-align: center; }
  img, .font { display: block; width: 8rem; height: 8rem; object-fit: contain; image-rendering: pixelated; }
  .font { font: 8rem/1 "${escapeCss(build.familyName)}"; }
  figcaption { margin-top: .5rem; }
</style>
<h1>${escapeXml(build.familyName)} build</h1>
<p>${build.glyphCount.toLocaleString()} painted glyph${build.glyphCount === 1 ? '' : 's'}</p>
<main>${cards}</main>
</html>
`;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with status ${code}`))
    );
  });
}

async function pythonCommand() {
  const virtualEnvironmentPython =
    process.platform === 'win32'
      ? path.join(workspace, '.venv', 'Scripts', 'python.exe')
      : path.join(workspace, '.venv', 'bin', 'python');
  try {
    await fs.access(virtualEnvironmentPython);
    return virtualEnvironmentPython;
  } catch {
    return process.platform === 'win32' ? 'python' : 'python3';
  }
}

async function writeJson(file, value) {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function hex(value) {
  return value.toString(16).padStart(2, '0');
}

function trimNumber(value) {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

function countBySequenceType(entries) {
  return Object.fromEntries(
    [...new Set(entries.map(entry => entry.sequenceType))]
      .sort()
      .map(type => [type, entries.filter(entry => entry.sequenceType === type).length])
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeCss(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
