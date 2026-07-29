import type {
  ExplorerSoundEffectDefinition,
  ExplorerSoundEffectId,
} from "./explorer-audio-sfx-types.js";

export const darkExplorerSoundEffects: Record<
  ExplorerSoundEffectId,
  ExplorerSoundEffectDefinition
> = {
  "dialog-close": {
    tones: [
      { duration: 0.11, frequency: 330, type: "sine", volume: 0.05, waveform: "pad-warm" },
      {
        duration: 0.12,
        endFrequency: 196,
        frequency: 262,
        offset: 0.028,
        type: "triangle",
        volume: 0.045,
        waveform: "bass-warm",
      },
    ],
  },
  "dialog-open": {
    tones: [
      { duration: 0.12, frequency: 262, type: "sine", volume: 0.05, waveform: "pad-warm" },
      {
        duration: 0.14,
        endFrequency: 330,
        frequency: 220,
        offset: 0.025,
        type: "sine",
        volume: 0.055,
        waveform: "lead-mellow",
      },
    ],
  },
  "focus-soft": {
    tones: [
      { duration: 0.06, frequency: 220, type: "sine", volume: 0.025, waveform: "pad-warm" },
    ],
  },
  "hover-soft": {
    tones: [
      {
        duration: 0.08,
        endFrequency: 294,
        frequency: 247,
        type: "sine",
        volume: 0.035,
        waveform: "lead-mellow",
      },
    ],
  },
  "keypress-soft": {
    tones: [
      {
        duration: 0.045,
        endFrequency: 208,
        frequency: 220,
        type: "triangle",
        volume: 0.03,
        waveform: "bass-warm",
      },
    ],
  },
  "toggle-off": {
    tones: [
      { duration: 0.055, frequency: 220, type: "triangle", volume: 0.04, waveform: "bass-warm" },
      {
        duration: 0.075,
        endFrequency: 196,
        frequency: 247,
        offset: 0.018,
        type: "sine",
        volume: 0.035,
        waveform: "pad-warm",
      },
    ],
  },
  "toggle-on": {
    tones: [
      { duration: 0.055, frequency: 247, type: "triangle", volume: 0.04, waveform: "bass-warm" },
      {
        duration: 0.08,
        endFrequency: 330,
        frequency: 262,
        offset: 0.018,
        type: "sine",
        volume: 0.04,
        waveform: "lead-mellow",
      },
    ],
  },
  "ui-click": {
    tones: [
      {
        duration: 0.06,
        endFrequency: 220,
        frequency: 262,
        type: "triangle",
        volume: 0.05,
        waveform: "bass-warm",
      },
      {
        duration: 0.07,
        endFrequency: 247,
        frequency: 294,
        offset: 0.012,
        type: "sine",
        volume: 0.035,
        waveform: "lead-mellow",
      },
    ],
  },
};
