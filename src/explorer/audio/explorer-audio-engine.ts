type ExplorerAudioEngineOptions = {
  musicEnabled: () => boolean;
  retroMode: () => boolean;
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
      options.retroMode() &&
      options.musicEnabled() &&
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

  function scheduleMusic() {
    if (!shouldPlayMusic()) {
      stopMusic();
      return;
    }
    const context = getAudioContext();
    if (!context || context.state !== "running" || !masterGain) return;
    if (!musicGain) {
      musicGain = context.createGain();
      musicGain.gain.value = 0.09;
      musicGain.connect(masterGain);
    }

    const beatLength = 0.18;
    const pattern = [262, 330, 392, 330, 262, 392, 330, 294];
    const bass = [131, 147, 165, 147];
    const start = context.currentTime + 0.02;

    for (let step = 0; step < pattern.length; step += 1) {
      const beat = musicBeat + step;
      const noteStart = start + step * beatLength;
      const lead = context.createOscillator();
      const leadGain = context.createGain();
      lead.type = "square";
      lead.frequency.setValueAtTime(pattern[beat % pattern.length], noteStart);
      leadGain.gain.setValueAtTime(0.0001, noteStart);
      leadGain.gain.exponentialRampToValueAtTime(0.24, noteStart + 0.01);
      leadGain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + beatLength * 0.75,
      );
      lead.connect(leadGain);
      leadGain.connect(musicGain);
      lead.start(noteStart);
      lead.stop(noteStart + beatLength * 0.85);

      if (step % 2 === 0) {
        const bassOscillator = context.createOscillator();
        const bassGain = context.createGain();
        bassOscillator.type = "triangle";
        bassOscillator.frequency.setValueAtTime(
          bass[(beat / 2) % bass.length],
          noteStart,
        );
        bassGain.gain.setValueAtTime(0.0001, noteStart);
        bassGain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.01);
        bassGain.gain.exponentialRampToValueAtTime(
          0.0001,
          noteStart + beatLength * 1.6,
        );
        bassOscillator.connect(bassGain);
        bassGain.connect(musicGain);
        bassOscillator.start(noteStart);
        bassOscillator.stop(noteStart + beatLength * 1.7);
      }
    }

    musicBeat += pattern.length;
    musicTimer = window.setTimeout(
      scheduleMusic,
      beatLength * pattern.length * 1000 - 60,
    );
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

  return {
    musicEnabled: options.musicEnabled,
    playClick,
    playDialogClose,
    playDialogOpen,
    playHover,
    resumeAudioContext,
    soundEffectsEnabled: options.soundEffectsEnabled,
    stopMusic,
    syncHelpMusic,
  };
}
