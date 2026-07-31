import assert from "node:assert/strict";
import {
  CELL_SIZE,
  EGA_COLORS,
  SKIN_TONE_COLORS,
} from "../../../src/pixel-editor/core/pixel-editor-constants.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  endpointSkinToneShade,
  findShadeByKind,
  firstNonNormalShade,
  findSkinTone,
  remapSkinTonePixels,
  rgbHex,
  selectNearestOwner,
  skinToneColorMap,
  squaredDistance,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
} from "../../../src/pixel-editor/palette/pixel-editor-skin-tone.js";

const findSkinToneAny = findSkinTone as any;
const skinToneCycleAny = skinToneCycle as any;
const skinToneSequenceAny = skinToneSequence as any;
const skinToneBaseSequenceAny = skinToneBaseSequence as any;
const remapSkinTonePixelsAny = remapSkinTonePixels as any;
const buildSkinToneOwnershipAny = buildSkinToneOwnership as any;
const buildTwoPersonOwnershipAny = buildTwoPersonOwnership as any;
const compareSkinToneHelpersAny = compareSkinToneHelpers as any;
const endpointSkinToneShadeAny = endpointSkinToneShade as any;
const findShadeByKindAny = findShadeByKind as any;
const firstNonNormalShadeAny = firstNonNormalShade as any;
const rgbHexAny = rgbHex as any;
const selectNearestOwnerAny = selectNearestOwner as any;
const skinToneColorMapAny = skinToneColorMap as any;
const squaredDistanceAny = squaredDistance as any;

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
assert.deepEqual(
  skinToneSequenceAny([123, light.codePoint.toLowerCase(), null]),
  [light.codePoint],
);

assert.equal(
  skinToneBaseSequenceAny([
    light.codePoint,
    "1f469",
    "200d",
    dark.codePoint,
    "1f52c",
  ]),
  "1F469 200D 1F52C",
);
assert.equal(skinToneBaseSequenceAny([]), "");
assert.equal(
  skinToneBaseSequenceAny([123, light.codePoint.toLowerCase(), null, "1f600"]),
  "123 NULL 1F600",
);

const unchangedPixels = new Uint8ClampedArray([
  ...hexToRgba(light.color),
  ...hexToRgba(dark.color),
]);
assert.deepEqual(
  Array.from(remapSkinTonePixelsAny(unchangedPixels, [], [dark.codePoint])),
  Array.from(unchangedPixels),
);
assert.deepEqual(
  Array.from(remapSkinTonePixelsAny(unchangedPixels, [light.codePoint], [])),
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
assert.deepEqual(
  Array.from(remappedFallbackShade),
  hexToRgba(mediumDark.color),
);

const remappedEndpointLight = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(mediumLight.color)]),
  [medium.codePoint],
  [light.codePoint],
);
assert.deepEqual(
  Array.from(remappedEndpointLight),
  hexToRgba(EGA_COLORS.at(-1)!),
);

const remappedEndpointDark = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(mediumDark.color)]),
  [medium.codePoint],
  [dark.codePoint],
);
assert.deepEqual(Array.from(remappedEndpointDark), hexToRgba(EGA_COLORS[0]));
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([...hexToRgba(light.color)]),
      ["MISSING"],
      [dark.codePoint],
    ),
  ),
  hexToRgba(light.color),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([...hexToRgba(light.color)]),
      [light.codePoint],
      ["MISSING"],
    ),
  ),
  hexToRgba(light.color),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([
        ...hexToRgba(light.color),
        ...hexToRgba(dark.color),
      ]),
      [light.codePoint, dark.codePoint],
      [medium.codePoint],
    ),
  ),
  [...hexToRgba(medium.color), ...hexToRgba(medium.color)],
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([
        ...hexToRgba(light.color),
        ...hexToRgba(dark.color),
      ]),
      [light.codePoint, dark.codePoint],
      [light.codePoint, medium.codePoint],
    ),
  ),
  [...hexToRgba(light.color), ...hexToRgba(medium.color)],
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([...hexToRgba(light.color)]),
      [light.codePoint, dark.codePoint],
      [light.codePoint, medium.codePoint],
    ),
  ),
  hexToRgba(light.color),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([
        ...hexToRgba(light.color),
        ...hexToRgba(mediumLight.color),
      ]),
      [light.codePoint, light.codePoint],
      [medium.codePoint, dark.codePoint],
    ),
  ),
  [...hexToRgba(medium.color), ...hexToRgba(mediumDark.color)],
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([1, 2, 3, 255]),
      [light.codePoint],
      [dark.codePoint],
    ),
  ),
  [1, 2, 3, 255],
);

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
assert.deepEqual(
  Array.from(helperRemapped.slice(0, 4)),
  hexToRgba(medium.color),
);
assert.deepEqual(
  Array.from(helperRemapped.slice(8, 12)),
  hexToRgba(mediumLight.color),
);
assert.deepEqual(
  Array.from(helperRemapped.slice(4, 8)),
  hexToRgba(medium.color),
);
const helperOutOfRangeRemapped = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(light.color)]),
  [light.codePoint],
  [dark.codePoint],
  {
    ownership: new Int8Array([3]),
    ownershipWidth: 1,
    width: 1,
    offsetX: 0,
    offsetY: 0,
  },
);
assert.deepEqual(Array.from(helperOutOfRangeRemapped), hexToRgba(light.color));
const helperOffsetFallbackRemapped = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(light.color)]),
  [light.codePoint],
  [dark.codePoint],
  {
    ownership: new Int8Array([0, 0, 0, 0]),
    ownershipWidth: 2,
    width: 1,
    offsetX: 5,
    offsetY: 5,
  },
);
assert.deepEqual(
  Array.from(helperOffsetFallbackRemapped),
  hexToRgba(dark.color),
);
const helperUnknownOpaqueRemapped = remapSkinTonePixelsAny(
  new Uint8ClampedArray([1, 2, 3, 255]),
  [light.codePoint],
  [dark.codePoint],
  {
    ownership: new Int8Array([0]),
    ownershipWidth: 1,
    width: 1,
    offsetX: 0,
    offsetY: 0,
  },
);
assert.deepEqual(Array.from(helperUnknownOpaqueRemapped), [1, 2, 3, 255]);
const helperWithoutOwnershipRemapped = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(light.color)]),
  [light.codePoint],
  [dark.codePoint],
  {},
);
assert.deepEqual(
  Array.from(helperWithoutOwnershipRemapped),
  hexToRgba(dark.color),
);
const helperWithDefaultOffsetsRemapped = remapSkinTonePixelsAny(
  new Uint8ClampedArray([...hexToRgba(light.color)]),
  [light.codePoint],
  [dark.codePoint],
  {
    ownership: new Int8Array([0]),
    ownershipWidth: 1,
    width: 1,
  },
);
assert.deepEqual(
  Array.from(helperWithDefaultOffsetsRemapped),
  hexToRgba(dark.color),
);

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
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
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
const ownershipWithUnknownOpaque = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    1,
    2,
    3,
    255,
    ...hexToRgba(light.color),
    ...hexToRgba(dark.color),
    0,
    0,
    0,
    0,
  ]),
  [light.codePoint, dark.codePoint],
  2,
  2,
)!;
assert.equal(ownershipWithUnknownOpaque.length, 4);
assert.equal(ownershipWithUnknownOpaque[1], 0);
assert.equal(ownershipWithUnknownOpaque[2], 1);

const tiedOwnership = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    ...hexToRgba(light.color),
    0,
    0,
    0,
    0,
    ...hexToRgba(dark.color),
  ]),
  [dark.codePoint, light.codePoint],
  3,
  1,
)!;
assert.equal(tiedOwnership[1], 0);

const tiedOwnershipReversed = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    ...hexToRgba(dark.color),
    0,
    0,
    0,
    0,
    ...hexToRgba(light.color),
  ]),
  [dark.codePoint, light.codePoint],
  3,
  1,
)!;
assert.equal(tiedOwnershipReversed[1], 0);

const tieBreaksEarlierOwnership = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    ...hexToRgba(dark.color),
    0,
    0,
    0,
    0,
    ...hexToRgba(light.color),
  ]),
  [light.codePoint, dark.codePoint],
  3,
  1,
)!;
assert.equal(tieBreaksEarlierOwnership[1], 0);

const diagonalOwnership = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([
    ...hexToRgba(light.color),
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    ...hexToRgba(dark.color),
  ]),
  [light.codePoint, dark.codePoint],
  2,
  2,
)!;
assert.ok([0, 1].includes(diagonalOwnership[1]));
assert.ok([0, 1].includes(diagonalOwnership[2]));

const compactOwnership = buildSkinToneOwnershipAny(
  new Uint8ClampedArray([...hexToRgba(light.color), ...hexToRgba(dark.color)]),
  [light.codePoint, dark.codePoint],
  2,
  1,
)!;
assert.deepEqual(Array.from(compactOwnership), [0, 1]);

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
assert.deepEqual(Array.from(twoPerson), [0, 0, 0, 1, 1, 0, 0, 0, 1, 1]);
assert.equal(buildTwoPersonOwnershipAny().length, CELL_SIZE * CELL_SIZE);
assert.deepEqual(endpointSkinToneShadeAny(dark.codePoint, "darker"), {
  kind: "darker",
  color: EGA_COLORS[0],
});
assert.deepEqual(endpointSkinToneShadeAny(light.codePoint, "lighter"), {
  kind: "lighter",
  color: EGA_COLORS.at(-1),
});
assert.equal(endpointSkinToneShadeAny(medium.codePoint, "lighter"), undefined);
assert.equal(endpointSkinToneShadeAny(dark.codePoint, "lighter"), undefined);
assert.equal(endpointSkinToneShadeAny(light.codePoint, "darker"), undefined);
assert.deepEqual(
  Array.from(skinToneColorMapAny(light.codePoint, medium.codePoint).entries()),
  [
    [light.color, medium.color],
    [mediumLight.color, mediumDark.color],
  ],
);
assert.deepEqual(
  Array.from(skinToneColorMapAny(dark.codePoint, light.codePoint).entries()),
  [
    [dark.color, light.color],
    [mediumDark.color, EGA_COLORS.at(-1)!],
  ],
);
assert.equal(
  findShadeByKindAny(skinToneCycleAny(medium.codePoint), "lighter")?.color,
  mediumLight.color,
);
assert.equal(findShadeByKindAny([], "lighter"), undefined);
assert.equal(
  findShadeByKindAny(skinToneCycleAny(medium.codePoint), "missing"),
  undefined,
);
assert.equal(
  firstNonNormalShadeAny(skinToneCycleAny(light.codePoint))?.color,
  mediumLight.color,
);
assert.equal(
  firstNonNormalShadeAny([{ kind: "normal", color: light.color }]),
  undefined,
);
assert.equal(firstNonNormalShadeAny([]), undefined);
assert.deepEqual(
  Array.from(skinToneColorMapAny("MISSING", medium.codePoint).entries()),
  [],
);
assert.deepEqual(
  Array.from(skinToneColorMapAny(light.codePoint, "MISSING").entries()),
  [],
);
assert.equal(rgbHexAny(0, 0, 0), "#000000");
assert.equal(rgbHexAny(255, 255, 255), "#ffffff");

assert.deepEqual(selectNearestOwnerAny(undefined, { owner: 1 }, 5), {
  distance: 5,
  owner: 1,
});
assert.deepEqual(
  selectNearestOwnerAny({ distance: 6, owner: 1 }, { owner: 0 }, 5),
  { distance: 5, owner: 0 },
);
assert.deepEqual(
  selectNearestOwnerAny({ distance: 5, owner: 1 }, { owner: 0 }, 5),
  { distance: 5, owner: 0 },
);
const unchangedNearest = { distance: 4, owner: 0 };
assert.equal(
  selectNearestOwnerAny(unchangedNearest, { owner: 1 }, 5),
  unchangedNearest,
);
assert.equal(
  selectNearestOwnerAny(unchangedNearest, { owner: 1 }, 4),
  unchangedNearest,
);
assert.equal(squaredDistanceAny(0, 0, 0, 0), 0);
assert.equal(squaredDistanceAny(3, 4, 0, 0), 25);
assert.equal(squaredDistanceAny(0, 0, 3, 4), 25);

assert.equal(
  compareSkinToneHelpersAny(
    {
      key: "a",
      codePoints: [medium.codePoint],
    },
    {
      key: "b",
      codePoints: [light.codePoint, dark.codePoint],
    },
  ) < 0,
  true,
);
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
assert.equal(
  compareSkinToneHelpersAny(
    {
      key: "a",
      codePoints: [light.codePoint],
    },
    {
      key: "a",
      codePoints: [light.codePoint],
    },
  ),
  0,
);
