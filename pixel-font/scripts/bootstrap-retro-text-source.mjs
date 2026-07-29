import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import {
  BITMAP_FONT_5X7,
  BITMAP_FONT_5X7_CHARACTERS,
} from "../retro-text-bitmap.mjs";

const rows = (...values) => values.join("");
const splitRows = (bitmap) =>
  Array.from({ length: 7 }, (_, index) => bitmap.slice(index * 5, index * 5 + 5));
const joinRows = (bitmapRows) => bitmapRows.join("");

function overlayRows(bitmap, overlays, startRow = 0) {
  const result = splitRows(bitmap);
  overlays.forEach((overlay, index) => {
    result[startRow + index] = overlay;
  });
  return joinRows(result);
}

const accentRows = {
  acute: ["00010"],
  grave: ["01000"],
  diaeresis: ["01010"],
  circumflex: ["00100", "01010"],
  caron: ["01010", "00100"],
  macron: ["11111"],
  breve: ["01110"],
  dotAbove: ["00100"],
  doubleAcute: ["01010"],
  ring: ["00100", "01010"],
  tilde: ["01100", "00011"],
};

function replaceBottomRow(bitmap, row) {
  const rows = splitRows(bitmap);
  rows[rows.length - 1] = row;
  return joinRows(rows);
}

function appendBottomMark(bitmap, row) {
  const rows = splitRows(bitmap);
  rows.shift();
  rows.push(row);
  return joinRows(rows);
}

const accentedUBase = rows(
  "00000",
  "00000",
  "10001",
  "10001",
  "10001",
  "10011",
  "01101",
);

const accentedNBase = rows(
  "00000",
  "00000",
  "00000",
  "10110",
  "11001",
  "10001",
  "10001",
  "10000",
);

const roundedABase = rows(
  "00000",
  "00000",
  "01101",
  "10011",
  "10001",
  "10011",
  "01101",
);

const ringABase = rows(
  "00100",
  "01010",
  "00000",
  "01101",
  "10011",
  "10001",
  "10011",
);

const extraLatinGlyphs = [
  {
    character: '"',
    bitmap: rows("01010", "01010", "00100", "00000", "00000", "00000", "00000"),
  },
  {
    character: "±",
    bitmap: rows("00000", "00100", "11111", "00100", "11111", "00000", "00000"),
  },
];
const extraLatinGlyphMap = new Map(
  extraLatinGlyphs.map((glyph) => [glyph.character, glyph.bitmap]),
);

const glyphOverrides = new Map(
  [
    ["a", roundedABase],
    ["á", overlayRows(roundedABase, accentRows.acute)],
    ["à", overlayRows(roundedABase, accentRows.grave)],
    ["â", overlayRows(roundedABase, accentRows.circumflex)],
    ["ã", overlayRows(roundedABase, accentRows.tilde)],
    ["ä", overlayRows(roundedABase, accentRows.diaeresis)],
    ["ā", overlayRows(roundedABase, accentRows.macron)],
    ["ă", overlayRows(roundedABase, accentRows.breve)],
    ["ą", replaceBottomRow(roundedABase, "00011")],
    ["å", ringABase],
    ["ć", overlayRows(BITMAP_FONT_5X7.c, accentRows.acute)],
    ["č", overlayRows(BITMAP_FONT_5X7.c, accentRows.caron)],
    ["ď", overlayRows(BITMAP_FONT_5X7.d, accentRows.caron)],
    ["đ", rows("00010", "00110", "00111", "01010", "01010", "01010", "00111")],
    ["é", overlayRows(BITMAP_FONT_5X7.e, accentRows.acute)],
    ["è", overlayRows(BITMAP_FONT_5X7.e, accentRows.grave)],
    ["ê", overlayRows(BITMAP_FONT_5X7.e, accentRows.circumflex)],
    ["ë", overlayRows(BITMAP_FONT_5X7.e, accentRows.diaeresis)],
    ["ē", overlayRows(BITMAP_FONT_5X7.e, accentRows.macron)],
    ["ę", replaceBottomRow(BITMAP_FONT_5X7.e, "00011")],
    ["ě", overlayRows(BITMAP_FONT_5X7.e, accentRows.caron)],
    ["ģ", appendBottomMark(BITMAP_FONT_5X7.g, "00100")],
    ["í", overlayRows(BITMAP_FONT_5X7.i, accentRows.acute)],
    ["ì", overlayRows(BITMAP_FONT_5X7.i, accentRows.grave)],
    ["î", overlayRows(BITMAP_FONT_5X7.i, accentRows.circumflex)],
    ["ï", overlayRows(BITMAP_FONT_5X7.i, accentRows.diaeresis)],
    ["ī", overlayRows(BITMAP_FONT_5X7.i, accentRows.macron)],
    ["ǐ", overlayRows(BITMAP_FONT_5X7.i, accentRows.caron)],
    ["ķ", appendBottomMark(BITMAP_FONT_5X7.k, "00100")],
    ["ĺ", overlayRows(BITMAP_FONT_5X7.l, accentRows.acute)],
    ["ļ", appendBottomMark(BITMAP_FONT_5X7.l, "00100")],
    ["ľ", overlayRows(BITMAP_FONT_5X7.l, accentRows.caron)],
    ["ł", rows("00110", "00100", "01110", "00100", "00100", "00100", "01110")],
    ["ń", overlayRows(BITMAP_FONT_5X7.n, accentRows.acute)],
    ["ņ", appendBottomMark(BITMAP_FONT_5X7.n, "00100")],
    ["ň", overlayRows(BITMAP_FONT_5X7.n, accentRows.caron)],
    ["ñ", overlayRows(accentedNBase, accentRows.tilde)],
    ["ó", overlayRows(BITMAP_FONT_5X7.o, accentRows.acute)],
    ["ò", overlayRows(BITMAP_FONT_5X7.o, accentRows.grave)],
    ["ô", overlayRows(BITMAP_FONT_5X7.o, accentRows.circumflex)],
    ["õ", overlayRows(BITMAP_FONT_5X7.o, accentRows.tilde)],
    ["ö", overlayRows(BITMAP_FONT_5X7.o, accentRows.diaeresis)],
    ["ō", overlayRows(BITMAP_FONT_5X7.o, accentRows.macron)],
    ["ő", overlayRows(BITMAP_FONT_5X7.o, accentRows.doubleAcute)],
    ["ŕ", overlayRows(BITMAP_FONT_5X7.r, accentRows.acute)],
    ["ř", overlayRows(BITMAP_FONT_5X7.r, accentRows.caron)],
    ["ś", overlayRows(BITMAP_FONT_5X7.s, accentRows.acute)],
    ["ș", appendBottomMark(BITMAP_FONT_5X7.s, "00010")],
    ["š", overlayRows(BITMAP_FONT_5X7.s, accentRows.caron)],
    ["ť", overlayRows(BITMAP_FONT_5X7.t, accentRows.caron)],
    ["ț", appendBottomMark(BITMAP_FONT_5X7.t, "00010")],
    ["ú", overlayRows(accentedUBase, accentRows.acute)],
    ["ù", overlayRows(accentedUBase, accentRows.grave)],
    ["û", overlayRows(accentedUBase, accentRows.circumflex)],
    ["ü", overlayRows(accentedUBase, accentRows.diaeresis)],
    ["ū", overlayRows(accentedUBase, accentRows.macron)],
    ["ů", overlayRows(accentedUBase, accentRows.ring)],
    ["ű", overlayRows(accentedUBase, accentRows.doubleAcute)],
    ["ý", overlayRows(BITMAP_FONT_5X7.y, accentRows.acute)],
    ["ÿ", overlayRows(BITMAP_FONT_5X7.y, accentRows.diaeresis)],
    ["ź", overlayRows(BITMAP_FONT_5X7.z, accentRows.acute)],
    ["ż", overlayRows(BITMAP_FONT_5X7.z, accentRows.dotAbove)],
    ["ž", overlayRows(BITMAP_FONT_5X7.z, accentRows.caron)],
    ["Ă", overlayRows(BITMAP_FONT_5X7.A, accentRows.breve)],
    ["Ą", replaceBottomRow(BITMAP_FONT_5X7.A, "00011")],
    ["Ć", overlayRows(BITMAP_FONT_5X7.C, accentRows.acute)],
    ["Č", overlayRows(BITMAP_FONT_5X7.C, accentRows.caron)],
    ["Ď", overlayRows(BITMAP_FONT_5X7.D, accentRows.caron)],
    ["Đ", rows("11110", "10011", "11110", "10011", "10001", "10001", "11110")],
    ["Ē", overlayRows(BITMAP_FONT_5X7.E, accentRows.macron)],
    ["Ę", replaceBottomRow(BITMAP_FONT_5X7.E, "00011")],
    ["Ě", overlayRows(BITMAP_FONT_5X7.E, accentRows.caron)],
    ["Ģ", appendBottomMark(BITMAP_FONT_5X7.G, "00100")],
    ["Ī", overlayRows(BITMAP_FONT_5X7.I, accentRows.macron)],
    ["Ķ", appendBottomMark(BITMAP_FONT_5X7.K, "00100")],
    ["Ĺ", overlayRows(BITMAP_FONT_5X7.L, accentRows.acute)],
    ["Ļ", appendBottomMark(BITMAP_FONT_5X7.L, "00100")],
    ["Ľ", overlayRows(BITMAP_FONT_5X7.L, accentRows.caron)],
    ["Ł", rows("10010", "10010", "10110", "11010", "10010", "10010", "11111")],
    ["Ń", overlayRows(BITMAP_FONT_5X7.N, accentRows.acute)],
    ["Ņ", appendBottomMark(BITMAP_FONT_5X7.N, "00100")],
    ["Ň", overlayRows(BITMAP_FONT_5X7.N, accentRows.caron)],
    ["Ő", overlayRows(BITMAP_FONT_5X7.O, accentRows.doubleAcute)],
    ["Ŕ", overlayRows(BITMAP_FONT_5X7.R, accentRows.acute)],
    ["Ř", overlayRows(BITMAP_FONT_5X7.R, accentRows.caron)],
    ["Ś", overlayRows(BITMAP_FONT_5X7.S, accentRows.acute)],
    ["Ș", appendBottomMark(BITMAP_FONT_5X7.S, "00010")],
    ["Š", overlayRows(BITMAP_FONT_5X7.S, accentRows.caron)],
    ["Ť", overlayRows(BITMAP_FONT_5X7.T, accentRows.caron)],
    ["Ț", appendBottomMark(BITMAP_FONT_5X7.T, "00010")],
    ["Ū", overlayRows(BITMAP_FONT_5X7.U, accentRows.macron)],
    ["Ů", overlayRows(BITMAP_FONT_5X7.U, accentRows.ring)],
    ["Ű", overlayRows(BITMAP_FONT_5X7.U, accentRows.doubleAcute)],
    ["Ź", overlayRows(BITMAP_FONT_5X7.Z, accentRows.acute)],
    ["Ż", overlayRows(BITMAP_FONT_5X7.Z, accentRows.dotAbove)],
    ["Ž", overlayRows(BITMAP_FONT_5X7.Z, accentRows.caron)],
    ["Ā", overlayRows(BITMAP_FONT_5X7.A, accentRows.macron)],
  ].filter(([, bitmap]) => typeof bitmap === "string"),
);

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(workspace, "retro-text");
const manifestFile = path.join(sourceDirectory, "manifest.json");
const latinPageFile = path.join(sourceDirectory, "latin-1.json");
const symbolsPageFile = path.join(sourceDirectory, "symbols-and-punctuation.json");
const sourceFile = path.join(sourceDirectory, "retro-text-source.json");

const latinRows = Array.from({ length: 16 }, () => Array(16).fill(null));
for (let codePoint = 0; codePoint <= 0xff; codePoint += 1) {
  const character = String.fromCodePoint(codePoint);
  if (!BITMAP_FONT_5X7[character] && !extraLatinGlyphMap.get(character)) continue;
  latinRows[Math.floor(codePoint / 16)][codePoint % 16] = character;
}

const glyphs = [
  ...new Set([
    ...BITMAP_FONT_5X7_CHARACTERS.filter((character) => character.codePointAt(0) <= 0xff),
    ...extraLatinGlyphs.map((glyph) => glyph.character),
  ]),
]
  .sort((left, right) => left.codePointAt(0) - right.codePointAt(0))
  .map((character) => ({
    bitmap:
      glyphOverrides.get(character) ??
      extraLatinGlyphMap.get(character) ??
      BITMAP_FONT_5X7[character],
    character,
    codePoint: character.codePointAt(0),
  }));

const supplementaryGlyphs = [
  {
    character: "€",
    bitmap: rows("00110", "01000", "11110", "01000", "11110", "01000", "00110"),
  },
  {
    character: "№",
    bitmap: rows("10001", "11011", "10101", "11011", "10001", "01110", "10001"),
  },
  {
    character: "Ÿ",
    bitmap: rows("01010", "00000", "10001", "10001", "01010", "00100", "00100"),
  },
  {
    character: "ẞ",
    bitmap: rows("01110", "10001", "10010", "11100", "10010", "10001", "11110"),
  },
  {
    character: "ā",
    bitmap: glyphOverrides.get("ā"),
  },
  {
    character: "ō",
    bitmap: glyphOverrides.get("ō"),
  },
  {
    character: "ǐ",
    bitmap: glyphOverrides.get("ǐ"),
  },
  {
    character: "Œ",
    bitmap: rows("01111", "10010", "10111", "10100", "10111", "10010", "01111"),
  },
  {
    character: "œ",
    bitmap: rows("00000", "00000", "01101", "10011", "10111", "10000", "01110"),
  },
  {
    character: "–",
    bitmap: rows("00000", "00000", "00000", "11111", "00000", "00000", "00000"),
  },
  {
    character: "—",
    bitmap: rows("00000", "00000", "11111", "11111", "00000", "00000", "00000"),
  },
  {
    character: "‘",
    bitmap: rows("00010", "00100", "00100", "00000", "00000", "00000", "00000"),
  },
  {
    character: "’",
    bitmap: rows("00100", "00100", "00010", "00000", "00000", "00000", "00000"),
  },
  {
    character: "“",
    bitmap: rows("01010", "10100", "10100", "00000", "00000", "00000", "00000"),
  },
  {
    character: "”",
    bitmap: rows("01010", "00101", "00101", "00000", "00000", "00000", "00000"),
  },
  {
    character: "…",
    bitmap: rows("00000", "00000", "00000", "00000", "00000", "00000", "10101"),
  },
  {
    character: "†",
    bitmap: rows("00100", "00100", "11111", "00100", "00100", "00100", "00100"),
  },
  {
    character: "‡",
    bitmap: rows("00100", "11111", "00100", "11111", "00100", "00100", "00100"),
  },
  {
    character: "•",
    bitmap: rows("00000", "00000", "00100", "01110", "00100", "00000", "00000"),
  },
  {
    character: "−",
    bitmap: rows("00000", "00000", "00000", "11111", "00000", "00000", "00000"),
  },
  {
    character: "™",
    bitmap: rows("10101", "10101", "01110", "01110", "01010", "01010", "11011"),
  },
  {
    character: "♪",
    bitmap: rows("00010", "00011", "00010", "00010", "00110", "01110", "00100"),
  },
  {
    character: "⚠",
    bitmap: rows("00100", "00100", "01110", "01110", "11111", "00000", "00100"),
  },
  {
    character: "✓",
    bitmap: rows("00000", "00001", "00010", "10100", "01000", "00000", "00000"),
  },
  {
    character: "〒",
    bitmap: rows("11111", "00100", "11111", "00100", "00100", "00100", "01010"),
  },
  {
    character: "←",
    bitmap: rows("00000", "00100", "01000", "11111", "01000", "00100", "00000"),
  },
  {
    character: "↑",
    bitmap: rows("00100", "01110", "10101", "00100", "00100", "00100", "00000"),
  },
  {
    character: "→",
    bitmap: rows("00000", "00100", "00010", "11111", "00010", "00100", "00000"),
  },
  {
    character: "↓",
    bitmap: rows("00000", "00100", "00100", "00100", "10101", "01110", "00100"),
  },
  {
    character: "↩",
    bitmap: rows("00001", "00001", "00101", "01001", "11111", "01000", "00100"),
  },
];

for (const [character, bitmap] of glyphOverrides) {
  if (character.codePointAt(0) <= 0xff) continue;
  if (supplementaryGlyphs.some((glyph) => glyph.character === character)) continue;
  supplementaryGlyphs.push({ character, bitmap });
}

const symbolRows = Array.from({ length: 16 }, () => Array(16).fill(null));
for (const [index, glyph] of supplementaryGlyphs.entries()) {
  symbolRows[Math.floor(index / 16)][index % 16] = glyph.character;
  glyphs.push({
    ...glyph,
    codePoint: glyph.character.codePointAt(0),
  });
}

const manifest = {
  familyName: "Pixel Latin Retro",
  styleName: "Regular",
  fontVersion: "1.0.0",
  copyright: "Copyright (c) 2026, Lewis Moten",
  designer: "Lewis Moten",
  url: "https://lewismoten.com",
  pixelSize: 128,
  advanceWidth: 768,
  lineGap: 128,
  glyphBox: { width: 5, height: 7 },
  samplePhrases: [
    {
      id: "english",
      label: "English example",
      text: "A fuzzy wizard quietly vexes Jack by throwing six emoji pompoms.",
    },
    {
      id: "latin",
      label: "Latin example",
      text: 'À fuzzy wizard named Zoë quietly vexes Jack with six emoji: café, piñata, jalapeño, crème brûlée, smörgåsbord, Æsir, œuvre, Straße, £10, €20 — “Voilà!”',
    },
  ],
  sampleScale: 4,
  sampleWrap: 28,
  pages: [
    {
      id: "latin-1",
      image: "latin-1.png",
      map: "latin-1.json",
      label: "Latin-1",
      cellSize: 16,
      glyphBox: { x: 5, y: 4, width: 5, height: 7 },
      rangeStart: 0,
      rangeEnd: 255,
    },
    {
      id: "symbols-and-punctuation",
      image: "symbols-and-punctuation.png",
      map: "symbols-and-punctuation.json",
      label: "Symbols & punctuation",
      cellSize: 16,
      glyphBox: { x: 5, y: 4, width: 5, height: 7 },
      rangeStart: 8192,
      rangeEnd: 8703,
    },
  ],
};

await fs.mkdir(sourceDirectory, { recursive: true });
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(
  latinPageFile,
  `${JSON.stringify(
    {
      id: "latin-1",
      label: "Latin-1",
      rangeStart: 0,
      rangeEnd: 255,
      rows: latinRows,
    },
    null,
    2,
  )}\n`,
);
await fs.writeFile(
  symbolsPageFile,
  `${JSON.stringify(
    {
      id: "symbols-and-punctuation",
      label: "Symbols & punctuation",
      rangeStart: 8192,
      rangeEnd: 8703,
      rows: symbolRows,
    },
    null,
    2,
  )}\n`,
);
await fs.writeFile(sourceFile, `${JSON.stringify({ glyphs }, null, 2)}\n`);

const atlasPython = await pythonCommand(["PIL"]);

await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "render-pages",
  manifestFile,
  sourceFile,
]);
await run(atlasPython, [
  path.join(workspace, "scripts", "retro-text-atlas.py"),
  "render-sample",
  manifestFile,
  sourceFile,
  path.join(sourceDirectory, "example-phrase.png"),
]);

await fs.rm(sourceFile, { force: true });
console.info(`Bootstrapped retro text source assets in ${sourceDirectory}.`);

async function pythonCommand(requiredModules = []) {
  const virtualEnvironmentPython =
    process.platform === "win32"
      ? path.join(workspace, ".venv", "Scripts", "python.exe")
      : path.join(workspace, ".venv", "bin", "python");
  try {
    await fs.access(virtualEnvironmentPython);
    if (await supportsModules(virtualEnvironmentPython, requiredModules))
      return virtualEnvironmentPython;
  } catch {
    // Fall through to the system interpreter.
  }
  const systemPython = process.platform === "win32" ? "python" : "python3";
  if (await supportsModules(systemPython, requiredModules)) return systemPython;
  throw new Error(
    `Unable to find a Python interpreter with: ${requiredModules.join(", ") || "no extra modules"}`,
  );
}

function supportsModules(command, modules) {
  return new Promise((resolve) => {
    const script = modules.length
      ? modules.map((moduleName) => `import ${moduleName}`).join("; ")
      : "pass";
    const handle = spawn(command, ["-c", script], { stdio: "ignore" });
    handle.on("error", () => resolve(false));
    handle.on("close", (code) => resolve(code === 0));
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const handle = spawn(command, args, { stdio: "inherit" });
    handle.on("error", reject);
    handle.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${command} exited with status ${code}`)),
    );
  });
}
