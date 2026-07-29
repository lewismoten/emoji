import type {
  ExplorerSoundEffectDefinition,
  ExplorerSoundEffectId,
} from "./explorer-audio-sfx-types.js";

export const lightExplorerSoundEffects: Record<
  ExplorerSoundEffectId,
  ExplorerSoundEffectDefinition
> = {
  "dialog-close": {
    tones: [
      { duration: 0.09, frequency: 988, type: "triangle", volume: 0.045, waveform: "light-bell" },
      {
        duration: 0.11,
        endFrequency: 784,
        frequency: 880,
        offset: 0.02,
        type: "sine",
        volume: 0.04,
        waveform: "light-pad",
      },
    ],
  },
  "dialog-open": {
    tones: [
      { duration: 0.08, frequency: 784, type: "triangle", volume: 0.045, waveform: "light-bell" },
      {
        duration: 0.1,
        frequency: 988,
        offset: 0.02,
        type: "triangle",
        volume: 0.05,
        waveform: "light-bell",
      },
      {
        duration: 0.13,
        endFrequency: 1175,
        frequency: 1047,
        offset: 0.035,
        type: "sine",
        volume: 0.03,
        waveform: "light-pad",
      },
    ],
  },
  "focus-soft": {
    tones: [
      { duration: 0.05, frequency: 659, type: "triangle", volume: 0.02, waveform: "light-pad" },
    ],
  },
  "hover-soft": {
    tones: [
      {
        duration: 0.075,
        endFrequency: 988,
        frequency: 784,
        type: "triangle",
        volume: 0.03,
        waveform: "light-bell",
      },
    ],
  },
  "keypress-soft": {
    tones: [
      {
        duration: 0.04,
        endFrequency: 698,
        frequency: 784,
        type: "triangle",
        volume: 0.025,
        waveform: "light-bell",
      },
    ],
  },
  "toggle-off": {
    tones: [
      { duration: 0.045, frequency: 659, type: "triangle", volume: 0.03, waveform: "light-bell" },
      {
        duration: 0.06,
        endFrequency: 523,
        frequency: 587,
        offset: 0.02,
        type: "sine",
        volume: 0.025,
        waveform: "light-pad",
      },
    ],
  },
  "toggle-on": {
    tones: [
      { duration: 0.045, frequency: 659, type: "triangle", volume: 0.03, waveform: "light-bell" },
      {
        duration: 0.07,
        endFrequency: 988,
        frequency: 784,
        offset: 0.018,
        type: "triangle",
        volume: 0.035,
        waveform: "light-bell",
      },
    ],
  },
  "ui-click": {
    tones: [
      {
        duration: 0.05,
        endFrequency: 659,
        frequency: 784,
        type: "triangle",
        volume: 0.04,
        waveform: "light-bell",
      },
      {
        duration: 0.06,
        endFrequency: 523,
        frequency: 587,
        offset: 0.012,
        type: "sine",
        volume: 0.025,
        waveform: "light-pad",
      },
    ],
  },
};
