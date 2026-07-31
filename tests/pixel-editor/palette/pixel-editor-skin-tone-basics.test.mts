import assert from "node:assert/strict";
import {
  compareSkinToneHelpersAny,
  dark,
  EGA_COLORS,
  endpointSkinToneShadeAny,
  findShadeByKindAny,
  findSkinToneAny,
  firstNonNormalShadeAny,
  light,
  medium,
  mediumDark,
  mediumLight,
  rgbHexAny,
  selectNearestOwnerAny,
  skinToneBaseSequenceAny,
  skinToneColorMapAny,
  skinToneCycleAny,
  skinToneSequenceAny,
  squaredDistanceAny,
} from "./pixel-editor-skin-tone-fixture.mjs";

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
assert.deepEqual(
  Array.from(skinToneColorMapAny("MISSING", medium.codePoint).entries()),
  [],
);
assert.deepEqual(
  Array.from(skinToneColorMapAny(light.codePoint, "MISSING").entries()),
  [],
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

assert.equal(rgbHexAny(0, 0, 0), "#000000");
assert.equal(rgbHexAny(255, 255, 255), "#ffffff");
assert.equal(squaredDistanceAny(0, 0, 0, 0), 0);
assert.equal(squaredDistanceAny(3, 4, 0, 0), 25);
assert.equal(squaredDistanceAny(0, 0, 3, 4), 25);

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

assert.equal(
  compareSkinToneHelpersAny(
    { key: "a", codePoints: [medium.codePoint] },
    { key: "b", codePoints: [light.codePoint, dark.codePoint] },
  ) < 0,
  true,
);
assert.equal(
  compareSkinToneHelpersAny(
    { key: "b", codePoints: [light.codePoint, dark.codePoint] },
    { key: "a", codePoints: [medium.codePoint, dark.codePoint] },
  ) > 0,
  true,
);
assert.equal(
  compareSkinToneHelpersAny(
    { key: "a", codePoints: [medium.codePoint] },
    { key: "b", codePoints: [medium.codePoint] },
  ) < 0,
  true,
);
assert.equal(
  compareSkinToneHelpersAny(
    { key: "a", codePoints: [light.codePoint] },
    { key: "a", codePoints: [light.codePoint] },
  ),
  0,
);
