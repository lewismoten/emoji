import assert from "node:assert/strict";
import {
  buildSkinToneOwnershipAny,
  buildTwoPersonOwnershipAny,
  CELL_SIZE,
  dark,
  hexToRgba,
  light,
} from "./pixel-editor-skin-tone-fixture.mjs";

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
