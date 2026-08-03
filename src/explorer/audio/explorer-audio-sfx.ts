import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
} from "./explorer-audio-types.js";
import { darkExplorerSoundEffects } from "./sfx/explorer-audio-sfx-dark.js";
import { lightExplorerSoundEffects } from "./sfx/explorer-audio-sfx-light.js";
import { retroExplorerSoundEffects } from "./sfx/explorer-audio-sfx-retro.js";
import type {
  ExplorerSoundEffectDefinition,
  ExplorerSoundEffectId,
} from "./sfx/explorer-audio-sfx-types.js";
import * as themes from '../../utils/themes.js';

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

const themeSoundEffects: Record<
  string,
  Record<ExplorerSoundEffectId, ExplorerSoundEffectDefinition>
> = {
  base: lightExplorerSoundEffects,
  dark: darkExplorerSoundEffects,
  light: lightExplorerSoundEffects,
  retro: retroExplorerSoundEffects,
};

export function getExplorerSoundEffect(
  id: ExplorerSoundEffectId
) {
  return themeSoundEffects[themes.getTheme()][id];
}

export function getThemedExplorerSoundEffect(
  id: ExplorerSoundEffectId,
) {
  return getExplorerSoundEffect(id);
}

export function resolveExplorerSoundEffect(
  elementType: ExplorerAudioElementType,
  action: ExplorerAudioAction,
) {
  return elementActionEffects[elementType]?.[action] ?? defaultActionEffects[action];
}
