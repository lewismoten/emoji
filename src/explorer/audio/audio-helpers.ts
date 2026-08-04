import {
  canThemeSupportAudio,
} from "../../utils/themes.js";
import * as preferences from '../../preferences.js';
import {
  querySelector,
  selectAll,
} from "../../utils/document.js";

const isEnabled = async (name: keyof typeof preferences.preferences) => {
  const enabled = await canThemeSupportAudio();
  if(!enabled) return false;
  return preferences.getBoolean(name);
}
export const isSoundEffectsEnabled = async () => isEnabled("soundEffects");
export const isMusicEnabled = async () => isEnabled("music");
export const isAudioEnabled = async () => Promise.all([
    isSoundEffectsEnabled(),
    isMusicEnabled()
  ]).then(status => status.some(Boolean));

export const shouldPlayMusic = async (): Promise<boolean> => {
    if(!isMusicalDialogOpen()) return false;
    return isMusicEnabled();
}

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
