// @ts-nocheck -- Transitional TypeScript migration.
import { drawBitmapText } from "./pixel-editor/canvas/pixel-editor-canvas-helpers.js";
import { createPixelEditorControllers } from "./pixel-editor/controllers/pixel-editor-controllers.js";
import {
  createPixelEditorElements,
  createPixelEditorState,
} from "./pixel-editor/canvas/pixel-editor-elements.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
} from "./pixel-editor/palette/pixel-editor-skin-tone.js";

export {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  drawBitmapText,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
  compareSkinToneHelpers,
};

export function createPixelEditor({
  dialog,
  translate,
  formatNumber = String,
  formatPercent = (value) => `${Math.round(value * 100)}%`,
}) {
  const elements = createPixelEditorElements(dialog, translate);
  const state = createPixelEditorState();
  return {
    element: elements.view,
    ...createPixelEditorControllers({
      dialog,
      elements,
      formatNumber,
      formatPercent,
      state,
      translate,
    }),
  };
}
