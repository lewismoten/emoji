import type { ExplorerToneShape } from "../explorer-audio-types.js";

export type ExplorerSoundEffectId =
  | "dialog-close"
  | "dialog-open"
  | "focus-soft"
  | "hover-soft"
  | "keypress-soft"
  | "toggle-off"
  | "toggle-on"
  | "ui-click";

export type ExplorerSoundEffectDefinition = {
  tones: ExplorerToneShape[];
};
