import type {
  ExplorerSoundEffectDefinition,
  ExplorerSoundEffectId,
} from "./explorer-audio-sfx-types.js";

export const retroExplorerSoundEffects: Record<
  ExplorerSoundEffectId,
  ExplorerSoundEffectDefinition
> = {
  "dialog-close": {
    tones: [
      { duration: 0.08, frequency: 392, type: "square", volume: 0.08 },
      {
        duration: 0.08,
        frequency: 294,
        offset: 0.04,
        type: "square",
        volume: 0.07,
      },
      {
        duration: 0.1,
        frequency: 196,
        offset: 0.08,
        type: "square",
        volume: 0.07,
      },
    ],
  },
  "dialog-open": {
    tones: [
      { duration: 0.08, frequency: 262, type: "square", volume: 0.08 },
      {
        duration: 0.08,
        frequency: 330,
        offset: 0.035,
        type: "square",
        volume: 0.08,
      },
      {
        duration: 0.1,
        frequency: 392,
        offset: 0.07,
        type: "square",
        volume: 0.09,
      },
    ],
  },
  "focus-soft": {
    tones: [{ duration: 0.05, frequency: 260, type: "square", volume: 0.04 }],
  },
  "hover-soft": {
    tones: [
      {
        duration: 0.08,
        endFrequency: 620,
        frequency: 320,
        type: "square",
        volume: 0.05,
      },
    ],
  },
  "keypress-soft": {
    tones: [
      {
        duration: 0.04,
        endFrequency: 210,
        frequency: 240,
        type: "square",
        volume: 0.04,
      },
    ],
  },
  "toggle-off": {
    tones: [
      { duration: 0.04, frequency: 220, type: "square", volume: 0.08 },
      {
        duration: 0.05,
        frequency: 165,
        offset: 0.02,
        type: "square",
        volume: 0.07,
      },
    ],
  },
  "toggle-on": {
    tones: [
      { duration: 0.04, frequency: 262, type: "square", volume: 0.08 },
      {
        duration: 0.05,
        frequency: 392,
        offset: 0.02,
        type: "square",
        volume: 0.08,
      },
    ],
  },
  "ui-click": {
    tones: [
      {
        duration: 0.05,
        endFrequency: 180,
        frequency: 220,
        type: "square",
        volume: 0.16,
      },
      {
        duration: 0.06,
        endFrequency: 92,
        frequency: 110,
        offset: 0.018,
        type: "square",
        volume: 0.08,
      },
    ],
  },
};
