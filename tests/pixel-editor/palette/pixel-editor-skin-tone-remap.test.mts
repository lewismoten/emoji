import assert from "node:assert/strict";
import {
  dark,
  EGA_COLORS,
  hexToRgba,
  light,
  medium,
  mediumDark,
  mediumLight,
  remapSkinTonePixelsAny,
} from "./pixel-editor-skin-tone-fixture.mjs";

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
  Array.from(helperRemapped.slice(4, 8)),
  hexToRgba(medium.color),
);
assert.deepEqual(
  Array.from(helperRemapped.slice(8, 12)),
  hexToRgba(mediumLight.color),
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

assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([...hexToRgba(light.color)]),
      [light.codePoint],
      [dark.codePoint],
      {},
    ),
  ),
  hexToRgba(dark.color),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([...hexToRgba(light.color)]),
      [light.codePoint],
      [dark.codePoint],
      {
        ownership: new Int8Array([0]),
        ownershipWidth: 1,
        width: 1,
      },
    ),
  ),
  hexToRgba(dark.color),
);
assert.deepEqual(
  Array.from(
    remapSkinTonePixelsAny(
      new Uint8ClampedArray([0, 0, 0, 0]),
      [light.codePoint],
      [dark.codePoint],
    ),
  ),
  [0, 0, 0, 0],
);
