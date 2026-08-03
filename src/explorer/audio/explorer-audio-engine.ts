import {
  getExplorerMusicConfig,
  scheduleExplorerMusic,
} from "./explorer-audio-music.js";
import {
  getThemedExplorerSoundEffect,
  resolveExplorerSoundEffect,
} from "./explorer-audio-sfx.js";
import { scheduleExplorerTone } from "./explorer-audio-tone.js";
import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
  ExplorerAudioTheme,
} from "./explorer-audio-types.js";
import type { ExplorerSoundEffectId } from "./sfx/explorer-audio-sfx-types.js";

type ExplorerAudioEngineOptions = {
  isMusicalDialogOpen: () => boolean;
  musicEnabled: () => boolean;
  retroMode: () => boolean;
  soundEffectsEnabled: () => boolean;
  theme: () => ExplorerAudioTheme;
};

export function createExplorerAudioEngine(
  options: ExplorerAudioEngineOptions,
) {
  let audioContext: AudioContext | undefined;
  let masterGain: GainNode | undefined;
  let musicTimer: number | undefined;
  let musicBeat = 0;
  let musicGain: GainNode | undefined;

  function getAudioContext() {
    if (audioContext) return audioContext;
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) return undefined;
    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(audioContext.destination);
    return audioContext;
  }

  async function resumeAudioContext() {
    const context = getAudioContext();
    if (!context) return undefined;
    if (context.state === "running") return context;
    if (context.state === "suspended") {
      try {
        await context.resume();
        return context;
      } catch {
        return undefined;
      }
    }
    return context;
  }

  function playSoundEffect(effectId: ExplorerSoundEffectId) {
    if (!options.soundEffectsEnabled()) return;
    const effect = getThemedExplorerSoundEffect(effectId, options.theme());
    if (!effect) return;
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    const start = context.currentTime;
    effect.tones.forEach((tone) => {
      scheduleExplorerTone({ context, output: masterGain!, start, tone });
    });
  }

  function playInteraction(
    elementType: ExplorerAudioElementType,
    action: ExplorerAudioAction,
  ) {
    const effectId = resolveExplorerSoundEffect(elementType, action);
    if (!effectId) return;
    playSoundEffect(effectId);
  }

  function shouldPlayMusic() {
    return (
      options.musicEnabled() &&
      options.theme() !== "base" &&
      options.isMusicalDialogOpen()
    );
  }

  function stopMusic() {
    if (musicTimer) {
      window.clearTimeout(musicTimer);
      musicTimer = undefined;
    }
    if (musicGain && audioContext) {
      musicGain.gain.cancelScheduledValues(audioContext.currentTime);
      musicGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.04);
      window.setTimeout(() => {
        musicGain?.disconnect();
        musicGain = undefined;
      }, 120);
    }
    musicBeat = 0;
  }

  function resetMusicPlayback() {
    if (musicTimer) {
      window.clearTimeout(musicTimer);
      musicTimer = undefined;
    }
    if (musicGain) {
      musicGain.disconnect();
      musicGain = undefined;
    }
    musicBeat = 0;
  }

  function scheduleMusic() {
    if (!shouldPlayMusic()) {
      stopMusic();
      return;
    }
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    const scheduled = scheduleExplorerMusic({
      context,
      createGain: () => context.createGain(),
      masterGain,
      musicBeat,
      musicGain,
      scheduleNext: (callback, timeout) => window.setTimeout(callback, timeout),
      schedulePlayback: scheduleMusic,
      theme: options.theme(),
    });
    musicBeat = scheduled.musicBeat;
    musicGain = scheduled.musicGain;
    musicTimer = scheduled.musicTimer;
  }

  function syncHelpMusic() {
    if (shouldPlayMusic()) {
      if (!musicTimer) {
        void resumeAudioContext().then(() => {
          if (shouldPlayMusic() && !musicTimer) scheduleMusic();
        });
      } else {
        void resumeAudioContext();
      }
    } else {
      stopMusic();
    }
  }

  function restartMusic() {
    resetMusicPlayback();
    if (!shouldPlayMusic()) return;
    void resumeAudioContext().then(() => {
      if (shouldPlayMusic() && !musicTimer) scheduleMusic();
    });
  }

  return {
    musicEnabled: options.musicEnabled,
    playClick: () => playInteraction("button", "click"),
    playDialogClose: () => playInteraction("dialog", "close"),
    playDialogOpen: () => playInteraction("dialog", "open"),
    playHover: () => playInteraction("button", "hover"),
    playInteraction,
    playSoundEffect,
    restartMusic,
    resumeAudioContext,
    soundEffectsEnabled: options.soundEffectsEnabled,
    stopMusic,
    syncHelpMusic,
    theme: () => getExplorerMusicConfig(options.theme()),
  };
}
