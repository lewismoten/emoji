import assert from "node:assert/strict";
import {
  CELL_SIZE,
  DISPLAY_SIZE,
  EGA_COLORS,
  IS_VITE_DEVELOPMENT,
  ROTATION_ALPHA_THRESHOLD,
  SKIN_TONE_COLORS,
  TOOLS,
} from "../../src/pixel-editor/core/pixel-editor-constants.js";

assert.equal(CELL_SIZE, 12);
assert.equal(DISPLAY_SIZE, 384);
assert.equal(DISPLAY_SIZE / CELL_SIZE, 32);
assert.equal(ROTATION_ALPHA_THRESHOLD, 128);
assert.equal(IS_VITE_DEVELOPMENT, false);

assert.deepEqual(TOOLS, [
  "pencil",
  "line",
  "rectangle",
  "ellipse",
  "bucket",
  "eyedropper",
  "select",
]);

assert.equal(new Set(TOOLS).size, TOOLS.length);

assert.equal(EGA_COLORS.length, 16);
assert.deepEqual(EGA_COLORS.slice(0, 4), [
  "#000000",
  "#0000aa",
  "#00aa00",
  "#00aaaa",
]);
assert.deepEqual(EGA_COLORS.slice(-4), [
  "#ff5555",
  "#ff55ff",
  "#ffff55",
  "#ffffff",
]);
assert.equal(
  EGA_COLORS.every((color) => /^#[0-9a-f]{6}$/.test(color)),
  true,
);

assert.equal(SKIN_TONE_COLORS.length, 5);
assert.deepEqual(
  SKIN_TONE_COLORS.map((tone) => tone.codePoint),
  ["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"],
);
assert.deepEqual(
  SKIN_TONE_COLORS.map((tone) => tone.translationKey),
  ["light", "mediumLight", "medium", "mediumDark", "dark"],
);
assert.deepEqual(
  SKIN_TONE_COLORS.map((tone) => tone.fallback),
  [
    "Light skin tone",
    "Medium-light skin tone",
    "Medium skin tone",
    "Medium-dark skin tone",
    "Dark skin tone",
  ],
);
assert.equal(
  SKIN_TONE_COLORS.every((tone) => /^#[0-9a-f]{6}$/.test(tone.color)),
  true,
);
