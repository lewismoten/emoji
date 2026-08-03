import { scheduleExplorerMusic } from "./explorer-audio-music.js";
import {
  getThemedExplorerSoundEffect,
  resolveExplorerSoundEffect,
} from "./explorer-audio-sfx.js";
import { scheduleExplorerTone } from "./explorer-audio-tone.js";
import type {
  ExplorerAudioAction,
  ExplorerAudioElementType,
} from "./explorer-audio-types.js";
import type { ExplorerSoundEffectId } from "./sfx/explorer-audio-sfx-types.js";
import * as audioHelpers from './audio-helpers.js';

export interface ExplorerAudioEngine {
    playClick: () => Promise<void>,
    playDialogClose: () => Promise<void>,
    playDialogOpen: () => Promise<void>,
    playHover: () => Promise<void>,
    playInteraction: (elementType: ExplorerAudioElementType,
    action: ExplorerAudioAction,) => Promise<void>,
    playSoundEffect: (effectId: ExplorerSoundEffectId) => Promise<void>,
    restartMusic: () => Promise<void>,
    resumeAudioContext: () => Promise<AudioContext | undefined>,
    stopMusic: () => void,
    syncHelpMusic: () => Promise<void>,
}
export const createExplorerAudioEngine = (): ExplorerAudioEngine => {
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

  const playSoundEffect = async (effectId: ExplorerSoundEffectId) => {
    const isEnabled = await audioHelpers.isSoundEffectsEnabled();
    if (!isEnabled) return;
    const effect = getThemedExplorerSoundEffect(effectId);
    if (!effect) return;
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    const start = context.currentTime;
    effect.tones.forEach((tone) => {
      scheduleExplorerTone({ context, output: masterGain!, start, tone });
    });
  }

  const playInteraction = async (
    elementType: ExplorerAudioElementType,
    action: ExplorerAudioAction,
  ) => {
    const effectId = resolveExplorerSoundEffect(elementType, action);
    if (!effectId) return;
    await playSoundEffect(effectId);
  }

  const shouldPlayMusic = async (): Promise<boolean> => {
    if(!audioHelpers.isMusicalDialogOpen()) return false;
    return audioHelpers.isMusicEnabled();
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

  const scheduleMusic = async () => {
    const enabled = await shouldPlayMusic();
    if (!enabled) {
      stopMusic();
      return;
    }
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    const scheduled = await scheduleExplorerMusic({
      context,
      createGain: () => context.createGain(),
      masterGain,
      musicBeat,
      musicGain,
      scheduleNext: (callback, timeout) => window.setTimeout(callback, timeout),
      schedulePlayback: scheduleMusic
    });
    if(!scheduled) return;
    musicBeat = scheduled.musicBeat;
    musicGain = scheduled.musicGain;
    musicTimer = scheduled.musicTimer;
  };

  const syncHelpMusic = async () => {
    const enabled = await shouldPlayMusic();
    if (!enabled) {
      stopMusic();
      return;
    }
    if (!musicTimer) {
      const context = await resumeAudioContext();
      if (!context) return;
      if (await shouldPlayMusic()) {
        await scheduleMusic();
      }
      return;
    }
    await resumeAudioContext();
  };

  const restartMusic = async () => {
    resetMusicPlayback();
    const enabled = await shouldPlayMusic();
    if (!enabled) return;
    const context = await resumeAudioContext();
    if (!context) return;
    if (await shouldPlayMusic() && !musicTimer) {
      await scheduleMusic();
    }
  };

  return {
    playClick: () => playInteraction("button", "click"),
    playDialogClose: () => playInteraction("dialog", "close"),
    playDialogOpen: () => playInteraction("dialog", "open"),
    playHover: () => playInteraction("button", "hover"),
    playInteraction,
    playSoundEffect,
    restartMusic,
    resumeAudioContext,
    stopMusic,
    syncHelpMusic,
  };
}
