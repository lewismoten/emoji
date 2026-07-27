import { drawBitmapText } from "./pixel-editor/pixel-editor-canvas-helpers.js";
import { createPixelEditorControllers } from "./pixel-editor/pixel-editor-controllers.js";
import {
  createPixelEditorElements,
  createPixelEditorState,
} from "./pixel-editor/pixel-editor-elements.js";
import {
  buildSkinToneOwnership,
  buildTwoPersonOwnership,
  compareSkinToneHelpers,
  remapSkinTonePixels,
  skinToneBaseSequence,
  skinToneCycle,
  skinToneSequence,
} from "./pixel-editor/pixel-editor-skin-tone.js";

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
  const elements = createPixelEditorElements(dialog);
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
