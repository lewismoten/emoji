import { canThemeSupportAudio } from "../../utils/themes.js";
import * as aria from "../../utils/aria.js";
import * as audioHelpers from "../../explorer/audio/audio-helpers.js";
import * as preferences from "../../preferences.js";

const renderAudioToggle = async (
  toggle: HTMLInputElement | null,
  enabled: Promise<boolean>,
) => {
  if (!toggle) return;
  const disabled = !(await canThemeSupportAudio());
  const isEnabled = await enabled;
  toggle.checked = isEnabled;
  toggle.disabled = disabled;
  aria.setChecked(toggle, isEnabled);
  aria.setDisabled(toggle, disabled);
  if (!toggle.parentElement) return;
  aria.setPressed(toggle.parentElement, isEnabled);
  aria.setDisabled(toggle.parentElement, disabled);
};

export const renderSoundEffects = async () =>
  renderAudioToggle(
    audioHelpers.soundEffectsToggle(),
    audioHelpers.isSoundEffectsEnabled(),
  );
export const renderMusic = async () =>
  renderAudioToggle(audioHelpers.musicToggle(), audioHelpers.isMusicEnabled());

export const render = async () => {
  return Promise.all([renderSoundEffects(), renderMusic()]);
};

export const enableSoundEffects = async (enabled: boolean) => {
  const disabled = !(await canThemeSupportAudio());
  if (disabled) {
    await renderSoundEffects();
    return false;
  }
  preferences.setBoolean("soundEffects", enabled);
  await renderSoundEffects();
  return enabled;
};

export const enableMusic = async (enabled: boolean) => {
  const disabled = !(await canThemeSupportAudio());
  if (disabled) {
    await renderMusic();
    return false;
  }
  preferences.setBoolean("music", enabled);
  await renderMusic();
  return enabled;
};
