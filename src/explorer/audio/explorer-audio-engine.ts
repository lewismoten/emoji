import {
  getExplorerMusicConfig,
  scheduleExplorerMusic,
  type ExplorerAudioTheme,
} from "./explorer-audio-music.js";

type ExplorerAudioEngineOptions = {
  musicEnabled: () => boolean;
  retroMode: () => boolean;
  theme: () => ExplorerAudioTheme;
  savedDialogOpen: () => boolean;
  soundEffectsEnabled: () => boolean;
  helpDialogOpen: () => boolean;
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

  function createTone(
    frequency: number,
    start: number,
    duration: number,
    volume: number,
    type: OscillatorType = "square",
    endFrequency?: number,
  ) {
    const context = getAudioContext();
    if (!context || !masterGain) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(endFrequency, 1),
        start + duration,
      );
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function playEffect(
    runner: (context: AudioContext) => void,
    requiresRetro = true,
  ) {
    if (!options.soundEffectsEnabled()) return;
    if (requiresRetro && !options.retroMode()) return;
    const context = getAudioContext();
    if (!context || context.state !== "running") return;
    runner(context);
  }

  function playClick() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(220, start, 0.05, 0.16, "square", 180);
      createTone(110, start + 0.018, 0.06, 0.08, "square", 92);
    });
  }

  function playHover() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(320, start, 0.08, 0.05, "square", 620);
    });
  }

  function playDialogOpen() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(262, start, 0.08, 0.08, "square");
      createTone(330, start + 0.035, 0.08, 0.08, "square");
      createTone(392, start + 0.07, 0.1, 0.09, "square");
    });
  }

  function playDialogClose() {
    playEffect((context) => {
      const start = context.currentTime;
      createTone(392, start, 0.08, 0.08, "square");
      createTone(294, start + 0.04, 0.08, 0.07, "square");
      createTone(196, start + 0.08, 0.1, 0.07, "square");
    });
  }

  function shouldPlayMusic() {
    return (
      options.musicEnabled() &&
      options.theme() !== "base" &&
      (options.helpDialogOpen() || options.savedDialogOpen())
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
    playClick,
    playDialogClose,
    playDialogOpen,
    playHover,
    restartMusic,
    resumeAudioContext,
    soundEffectsEnabled: options.soundEffectsEnabled,
    stopMusic,
    syncHelpMusic,
  };
}
