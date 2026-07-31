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

export const findSkinToneAny = findSkinTone as any;
export const skinToneCycleAny = skinToneCycle as any;
export const skinToneSequenceAny = skinToneSequence as any;
export const skinToneBaseSequenceAny = skinToneBaseSequence as any;
export const remapSkinTonePixelsAny = remapSkinTonePixels as any;
export const buildSkinToneOwnershipAny = buildSkinToneOwnership as any;
export const buildTwoPersonOwnershipAny = buildTwoPersonOwnership as any;
export const compareSkinToneHelpersAny = compareSkinToneHelpers as any;
export const endpointSkinToneShadeAny = endpointSkinToneShade as any;
export const findShadeByKindAny = findShadeByKind as any;
export const firstNonNormalShadeAny = firstNonNormalShade as any;
export const rgbHexAny = rgbHex as any;
export const selectNearestOwnerAny = selectNearestOwner as any;
export const skinToneColorMapAny = skinToneColorMap as any;
export const squaredDistanceAny = squaredDistance as any;

export const light = SKIN_TONE_COLORS[0];
export const mediumLight = SKIN_TONE_COLORS[1];
export const medium = SKIN_TONE_COLORS[2];
export const mediumDark = SKIN_TONE_COLORS[3];
export const dark = SKIN_TONE_COLORS[4];

export function hexToRgba(hex: string) {
  const value = hex.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ];
}

export { CELL_SIZE, EGA_COLORS, SKIN_TONE_COLORS };
