import {
  canThemeSupportAudio,
} from "../../utils/themes.js";
import * as preferences from '../../preferences.js';

const isEnabled = (name: keyof typeof preferences.preferences) => 
    canThemeSupportAudio() && preferences.getBoolean(name);
export const isSoundEffectsEnabled = () => isEnabled("soundEffects");
export const isMusicEnabled = () => isEnabled("music");
export const isAudioEnabled = () => isSoundEffectsEnabled() || isMusicEnabled();
