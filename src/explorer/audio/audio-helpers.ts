import {
  canThemeSupportAudio,
} from "../../utils/themes.js";
import * as preferences from '../../preferences.js';
import {
  querySelector,
  selectAll,
} from "../../utils/document.js";

const isEnabled = (name: keyof typeof preferences.preferences) => 
    canThemeSupportAudio() && preferences.getBoolean(name);
export const isSoundEffectsEnabled = () => isEnabled("soundEffects");
export const isMusicEnabled = () => isEnabled("music");
export const isAudioEnabled = () => isSoundEffectsEnabled() || isMusicEnabled();

const toggleInput = (name:string) => 
  querySelector<HTMLInputElement>(
    `.audio-choice-input[value="${name}"]`
  ) ?? null;

export const soundEffectsToggle = () => toggleInput('soundEffects');
export const musicToggle = () => toggleInput('music');
export const isMusicalDialogOpen = () =>
  Array.from(selectAll<HTMLDialogElement>(".dialog.musical")).some(
    (dialog) => dialog.open,
  );
