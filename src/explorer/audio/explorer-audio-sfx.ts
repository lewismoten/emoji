import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
  ExplorerAudioTheme,
  ExplorerToneShape,
} from "./explorer-audio-types.js";

export type ExplorerSoundEffectId =
  | "dialog-close"
  | "dialog-open"
  | "focus-soft"
  | "hover-soft"
  | "keypress-soft"
  | "toggle-off"
  | "toggle-on"
  | "ui-click";

type ExplorerSoundEffectDefinition = {
  tones: ExplorerToneShape[];
};

type ExplorerThemeSoundEffectId =
  | ExplorerSoundEffectId
  | "dark-dialog-close"
  | "dark-dialog-open"
  | "dark-focus-soft"
  | "dark-hover-soft"
  | "dark-keypress-soft"
  | "dark-toggle-off"
  | "dark-toggle-on"
  | "dark-ui-click"
  | "light-dialog-close"
  | "light-dialog-open"
  | "light-focus-soft"
  | "light-hover-soft"
  | "light-keypress-soft"
  | "light-toggle-off"
  | "light-toggle-on"
  | "light-ui-click";

const defaultActionEffects: Partial<
  Record<ExplorerAudioAction, ExplorerSoundEffectId>
> = {
  blur: "focus-soft",
  click: "ui-click",
  close: "dialog-close",
  focus: "focus-soft",
  hover: "hover-soft",
  keydown: "keypress-soft",
  open: "dialog-open",
};

const elementActionEffects: Partial<
  Record<
    ExplorerAudioElementType,
    Partial<Record<ExplorerAudioAction, ExplorerSoundEffectId>>
  >
> = {
  checkbox: {
    check: "toggle-on",
    uncheck: "toggle-off",
  },
  dialog: {
    close: "dialog-close",
    open: "dialog-open",
  },
  dropdown: {
    click: "ui-click",
    open: "dialog-open",
  },
  radio: {
    check: "toggle-on",
    uncheck: "toggle-off",
  },
};

const soundEffects: Record<
  ExplorerThemeSoundEffectId,
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
  "dark-dialog-close": {
    tones: [
      { duration: 0.11, frequency: 330, type: "sine", volume: 0.05, waveform: "dark-pad" },
      {
        duration: 0.12,
        endFrequency: 196,
        frequency: 262,
        offset: 0.028,
        type: "triangle",
        volume: 0.045,
        waveform: "dark-bass",
      },
    ],
  },
  "dark-dialog-open": {
    tones: [
      { duration: 0.12, frequency: 262, type: "sine", volume: 0.05, waveform: "dark-pad" },
      {
        duration: 0.14,
        endFrequency: 330,
        frequency: 220,
        offset: 0.025,
        type: "sine",
        volume: 0.055,
        waveform: "dark-lead",
      },
    ],
  },
  "dark-focus-soft": {
    tones: [
      { duration: 0.06, frequency: 220, type: "sine", volume: 0.025, waveform: "dark-pad" },
    ],
  },
  "dark-hover-soft": {
    tones: [
      {
        duration: 0.08,
        endFrequency: 294,
        frequency: 247,
        type: "sine",
        volume: 0.035,
        waveform: "dark-lead",
      },
    ],
  },
  "dark-keypress-soft": {
    tones: [
      {
        duration: 0.045,
        endFrequency: 208,
        frequency: 220,
        type: "triangle",
        volume: 0.03,
        waveform: "dark-bass",
      },
    ],
  },
  "dark-toggle-off": {
    tones: [
      { duration: 0.055, frequency: 220, type: "triangle", volume: 0.04, waveform: "dark-bass" },
      {
        duration: 0.075,
        endFrequency: 196,
        frequency: 247,
        offset: 0.018,
        type: "sine",
        volume: 0.035,
        waveform: "dark-pad",
      },
    ],
  },
  "dark-toggle-on": {
    tones: [
      { duration: 0.055, frequency: 247, type: "triangle", volume: 0.04, waveform: "dark-bass" },
      {
        duration: 0.08,
        endFrequency: 330,
        frequency: 262,
        offset: 0.018,
        type: "sine",
        volume: 0.04,
        waveform: "dark-lead",
      },
    ],
  },
  "dark-ui-click": {
    tones: [
      {
        duration: 0.06,
        endFrequency: 220,
        frequency: 262,
        type: "triangle",
        volume: 0.05,
        waveform: "dark-bass",
      },
      {
        duration: 0.07,
        endFrequency: 247,
        frequency: 294,
        offset: 0.012,
        type: "sine",
        volume: 0.035,
        waveform: "dark-lead",
      },
    ],
  },
  "light-dialog-close": {
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
  "light-dialog-open": {
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
  "light-focus-soft": {
    tones: [
      { duration: 0.05, frequency: 659, type: "triangle", volume: 0.02, waveform: "light-pad" },
    ],
  },
  "light-hover-soft": {
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
  "light-keypress-soft": {
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
  "light-toggle-off": {
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
  "light-toggle-on": {
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
  "light-ui-click": {
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

export function getExplorerSoundEffect(id: ExplorerSoundEffectId) {
  return soundEffects[id];
}

const themeEffectMap: Partial<
  Record<ExplorerAudioTheme, Partial<Record<ExplorerSoundEffectId, ExplorerThemeSoundEffectId>>>
> = {
  dark: {
    "dialog-close": "dark-dialog-close",
    "dialog-open": "dark-dialog-open",
    "focus-soft": "dark-focus-soft",
    "hover-soft": "dark-hover-soft",
    "keypress-soft": "dark-keypress-soft",
    "toggle-off": "dark-toggle-off",
    "toggle-on": "dark-toggle-on",
    "ui-click": "dark-ui-click",
  },
  light: {
    "dialog-close": "light-dialog-close",
    "dialog-open": "light-dialog-open",
    "focus-soft": "light-focus-soft",
    "hover-soft": "light-hover-soft",
    "keypress-soft": "light-keypress-soft",
    "toggle-off": "light-toggle-off",
    "toggle-on": "light-toggle-on",
    "ui-click": "light-ui-click",
  },
};

export function getThemedExplorerSoundEffect(
  id: ExplorerSoundEffectId,
  theme: ExplorerAudioTheme,
) {
  const themedId = themeEffectMap[theme]?.[id] ?? id;
  return soundEffects[themedId];
}

export function resolveExplorerSoundEffect(
  elementType: ExplorerAudioElementType,
  action: ExplorerAudioAction,
) {
  return elementActionEffects[elementType]?.[action] ?? defaultActionEffects[action];
}
