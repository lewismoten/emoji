import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
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
  requiresRetro?: boolean;
  tones: ExplorerToneShape[];
};

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
  ExplorerSoundEffectId,
  ExplorerSoundEffectDefinition
> = {
  "dialog-close": {
    requiresRetro: true,
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
    requiresRetro: true,
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
    requiresRetro: true,
    tones: [{ duration: 0.05, frequency: 260, type: "square", volume: 0.04 }],
  },
  "hover-soft": {
    requiresRetro: true,
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
    requiresRetro: true,
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
    requiresRetro: true,
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
    requiresRetro: true,
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
    requiresRetro: true,
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

export function getExplorerSoundEffect(id: ExplorerSoundEffectId) {
  return soundEffects[id];
}

export function resolveExplorerSoundEffect(
  elementType: ExplorerAudioElementType,
  action: ExplorerAudioAction,
) {
  return elementActionEffects[elementType]?.[action] ?? defaultActionEffects[action];
}
