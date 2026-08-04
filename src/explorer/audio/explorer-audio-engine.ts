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
import * as win from '../../utils/window.js';
import buildScheduler from "./schedule-music.js";
import buildRestart from "./restart-music.js";
import buildSyncMusic from "./sync-help-music.js";
import { EngineProps } from "./engine-props.js";

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
  const props = {
    audioContext: undefined,
    masterGain: undefined,
    musicTimer: undefined,
    musicBeat: 0,
    musicGain: undefined,
  } as EngineProps;

  props.getAudioContext = () => {
    if (props.audioContext) return props.audioContext;
    const AudioContextConstructor = win.getAudioContext();
    if (!AudioContextConstructor) return undefined;
    props.audioContext = new AudioContextConstructor();
    props.masterGain = props.audioContext.createGain();
    props.masterGain.gain.value = 0.08;
    props.masterGain.connect(props.audioContext.destination);
    return props.audioContext;
  }

  props.resumeAudioContext = async () => {
    const context = props.getAudioContext();
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
    const context = props.getAudioContext();
    const { masterGain } = props;
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

  props.stopMusic = () => {
    const {musicTimer,musicGain,audioContext} = props;
    if (musicTimer) {
      win.clearTimeout(musicTimer);
      props.musicTimer = undefined;
    }
    if (musicGain && audioContext) {
      const {gain} = musicGain;
      const {currentTime} = audioContext;
      gain.cancelScheduledValues(currentTime);
      gain.setTargetAtTime(0.0001, currentTime, 0.04);
      win.setTimeout(() => {
        musicGain?.disconnect();
        props.musicGain = undefined;
      }, 120);
    }
    props.musicBeat = 0;
  }

  props.resetMusicPlayback = () => {
    const {musicTimer, musicGain} = props;
    if (musicTimer) {
      win.clearTimeout(musicTimer);
      props.musicTimer = undefined;
    }
    if (musicGain) {
      musicGain.disconnect();
      props.musicGain = undefined;
    }
    props.musicBeat = 0;
  }

  props.scheduleMusic = buildScheduler(props);

  const syncHelpMusic = buildSyncMusic(props);
  const restartMusic = buildRestart(props);

  return {
    playClick: () => playInteraction("button", "click"),
    playDialogClose: () => playInteraction("dialog", "close"),
    playDialogOpen: () => playInteraction("dialog", "open"),
    playHover: () => playInteraction("button", "hover"),
    playInteraction,
    playSoundEffect,
    restartMusic,
    resumeAudioContext: props.resumeAudioContext,
    stopMusic: props.stopMusic,
    syncHelpMusic,
  };
}
