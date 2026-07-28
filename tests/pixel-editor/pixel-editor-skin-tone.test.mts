import assert from "node:assert/strict";
import {
  CELL_SIZE,
  EGA_COLORS,
  SKIN_TONE_COLORS,
} from "../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  findSkinTone,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
} from "../../src/pixel-editor/palette/pixel-editor-skin-tone.js";

const findSkinToneAny = findSkinTone as any;
const skinToneCycleAny = skinToneCycle as any;
const skinToneSequenceAny = skinToneSequence as any;
const skinToneBaseSequenceAny = skinToneBaseSequence as any;
const remapSkinTonePixelsAny = remapSkinTonePixels as any;
const buildSkinToneOwnershipAny = buildSkinToneOwnership as any;
const buildTwoPersonOwnershipAny = buildTwoPersonOwnership as any;
const compareSkinToneHelpersAny = compareSkinToneHelpers as any;

function hexToRgba(hex: string) {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ];
}

const light = SKIN_TONE_COLORS[0];
const mediumLight = SKIN_TONE_COLORS[1];
const medium = SKIN_TONE_COLORS[2];
const mediumDark = SKIN_TONE_COLORS[3];
const dark = SKIN_TONE_COLORS[4];

assert.deepEqual(findSkinToneAny(light.codePoint), light);
assert.equal(findSkinToneAny("missing"), undefined);

assert.deepEqual(skinToneCycleAny("missing"), []);
assert.deepEqual(skinToneCycleAny(light.codePoint), [
  { kind: "normal", color: light.color },
  { kind: "darker", color: mediumLight.color },
]);
assert.deepEqual(skinToneCycleAny(medium.codePoint), [
  { kind: "normal", color: medium.color },
  { kind: "lighter", color: mediumLight.color },
  { kind: "darker", color: mediumDark.color },
]);
assert.deepEqual(skinToneCycleAny(dark.codePoint), [
  { kind: "normal", color: dark.color },
  { kind: "lighter", color: mediumDark.color },
]);

assert.deepEqual(
  skinToneSequenceAny([light.codePoint.toLowerCase(), "1f600", dark.codePoint]),
  [light.codePoint, dark.codePoint],
);
assert.deepEqual(skinToneSequenceAny([]), []);

assert.equal(
  skinToneBaseSequenceAny([light.codePoint, "1f469", "200d", dark.codePoint, "1f52c"]),
  "1F469 200D 1F52C",
);
assert.equal(skinToneBaseSequenceAny([]), "");

const unchangedPixels = new Uint8ClampedArray([
  ...hexToRgba(light.color),
  ...hexToRgba(dark.color),
]);
assert.deepEqual(
  Array.from(remapSkinTonePixelsAny(unchangedPixels, [], [dark.codePoint])),
  Array.from(unchangedPixels),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      unchangedPixels,
      [light.codePoint],
      [],
    ),
  ),
  Array.from(unchangedPixels),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      unchangedPixels,
      [light.codePoint, dark.codePoint],
      [light.codePoint, dark.codePoint],
    ),
  ),
  Array.from(unchangedPixels),
);

const remappedNormal = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(light.color)]),
  [light.codePoint],
  [dark.codePoint],
);
assert.deepEqual(Array.from(remappedNormal), hexToRgba(dark.color));

const remappedFallbackShade = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(mediumLight.color)]),
  [medium.codePoint],
  [dark.codePoint],
);
assert.deepEqual(Array.from(remappedFallbackShade), hexToRgba(mediumDark.color));

const remappedEndpointLight = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(mediumLight.color)]),
  [medium.codePoint],
  [light.codePoint],
);
assert.deepEqual(Array.from(remappedEndpointLight), hexToRgba(EGA_COLORS.at(-1)!));

const remappedEndpointDark = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(mediumDark.color)]),
  [medium.codePoint],
  [dark.codePoint],
);
assert.deepEqual(Array.from(remappedEndpointDark), hexToRgba(EGA_COLORS[0]));

const helperPixels = new Uint8ClampedArray([
  ...hexToRgba(light.color),
  ...hexToRgba(light.color),
  ...hexToRgba(dark.color),
  ...hexToRgba(dark.color),
]);
const helperOwnership = new Int8Array([0, 0, 1, 1]);
const helperRemapped = remapSkinTonePixelsAny(
  helperPixels,
  [light.codePoint, dark.codePoint],
  [medium.codePoint, mediumLight.codePoint],
  {
    ownership: helperOwnership,
    ownershipWidth: 2,
    width: 2,
    offsetX: 0,
    offsetY: 0,
  },
);
assert.deepEqual(Array.from(helperRemapped.slice(0, 4)), hexToRgba(medium.color));
assert.deepEqual(Array.from(helperRemapped.slice(8, 12)), hexToRgba(mediumLight.color));

const transparentPixels = new Uint8ClampedArray([0, 0, 0, 0]);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      transparentPixels,
      [light.codePoint],
      [dark.codePoint],
    ),
  ),
  [0, 0, 0, 0],
);

const ownershipPixels = new Uint8ClampedArray([
  ...hexToRgba(light.color),
  ...hexToRgba(dark.color),
  0, 0, 0, 0,
  0, 0, 0, 0,
]);
const ownership = buildSkinToneOwnershipAny(
  ownershipPixels,
  [light.codePoint, dark.codePoint],
  2,
  2,
)!;
assert.equal(ownership.length, 4);
assert.equal(ownership[0], 0);
assert.equal(ownership[1], 1);
assert.ok([0, 1].includes(ownership[2]));
assert.ok([0, 1].includes(ownership[3]));

const tiedOwnership = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    ...hexToRgba(light.color),
    0, 0, 0, 0,
    ...hexToRgba(dark.color),
  ]),
  [dark.codePoint, light.codePoint],
  3,
  1,
)!;
assert.equal(tiedOwnership[1], 0);

assert.equal(
  buildSkinToneOwnershipAny(
    ownershipPixels,
    [light.codePoint, light.codePoint],
    2,
    2,
  ),
  undefined,
);
assert.equal(
  buildSkinToneOwnershipAny(ownershipPixels, [light.codePoint], 2, 2),
  undefined,
);
assert.equal(
  buildSkinToneOwnershipAny(
    new Uint8ClampedArray([...hexToRgba(light.color), 0, 0, 0, 0]),
    [light.codePoint, dark.codePoint],
    2,
    1,
  ),
  undefined,
);

const twoPerson = buildTwoPersonOwnershipAny(5, 2);
assert.deepEqual(Array.from(twoPerson), [
  0, 0, 0, 1, 1,
  0, 0, 0, 1, 1,
]);
assert.equal(buildTwoPersonOwnershipAny().length, CELL_SIZE * CELL_SIZE);

assert.equal(
  compareSkinToneHelpersAny(
    {
      key: "b",
      codePoints: [light.codePoint, dark.codePoint],
    },
    {
      key: "a",
      codePoints: [medium.codePoint, dark.codePoint],
    },
  ) > 0,
  true,
);
assert.equal(
  compareSkinToneHelpersAny(
    {
      key: "a",
      codePoints: [medium.codePoint],
    },
    {
      key: "b",
      codePoints: [medium.codePoint],
    },
  ) < 0,
  true,
);
