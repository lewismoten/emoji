export type ExplorerAudioTheme = "base" | "dark" | "light" | "retro";

export type ExplorerMusicConfig = {
  beatLength: number;
  gain: number;
  leadType: OscillatorType;
  padType: OscillatorType;
  bassType: OscillatorType;
  drumType: OscillatorType;
  leadVolume: number;
  padVolume: number;
  bassVolume: number;
  drumVolume: number;
  pattern: number[];
  harmony: number[];
  bass: number[];
  drums: number[];
};

type ScheduledMusicOptions = {
  context: AudioContext;
  createGain: () => GainNode;
  masterGain: GainNode;
  musicBeat: number;
  musicGain?: GainNode;
  scheduleNext: (callback: () => void, timeout: number) => number;
  schedulePlayback: () => void;
  theme: ExplorerAudioTheme;
};

const lightMusicConfig: ExplorerMusicConfig = {
  bass: [131, 165, 196, 165, 147, 196, 220, 196],
  bassType: "triangle",
  bassVolume: 0.1,
  beatLength: 0.18,
  drumType: "square",
  drumVolume: 0.055,
  drums: [96, 280, 150, 280, 96, 280, 150, 280, 96, 300, 150, 300, 96, 320, 150, 340],
  gain: 0.1,
  harmony: [
    784, 988, 1175, 1319, 1175, 988, 1047, 1175, 988, 784, 880, 988, 1047,
    1175, 1319, 1480,
  ],
  leadType: "triangle",
  leadVolume: 0.15,
  padType: "sine",
  padVolume: 0.06,
  pattern: [
    523, 659, 784, 880, 784, 659, 698, 784, 659, 523, 587, 659, 698, 784, 880,
    988,
  ],
};

const darkMusicConfig: ExplorerMusicConfig = {
  bass: [55, 65, 73, 82, 73, 65],
  bassType: "triangle",
  bassVolume: 0.085,
  beatLength: 0.36,
  drumType: "triangle",
  drumVolume: 0,
  drums: [],
  gain: 0.08,
  harmony: [330, 392, 440, 392, 294, 330, 370, 330, 262, 294, 330, 294],
  leadType: "sine",
  leadVolume: 0.09,
  padType: "sawtooth",
  padVolume: 0.045,
  pattern: [220, 262, 294, 262, 196, 220, 247, 220, 175, 196, 220, 196],
};

const retroMusicConfig: ExplorerMusicConfig = {
  bass: [131, 147, 165, 147],
  bassType: "triangle",
  bassVolume: 0.16,
  beatLength: 0.18,
  drumType: "square",
  drumVolume: 0,
  drums: [],
  gain: 0.09,
  harmony: [],
  leadType: "square",
  leadVolume: 0.24,
  padType: "square",
  padVolume: 0,
  pattern: [262, 330, 392, 330, 262, 392, 330, 294],
};

export function getExplorerMusicConfig(
  theme: ExplorerAudioTheme,
): ExplorerMusicConfig {
  if (theme === "light") return lightMusicConfig;
  if (theme === "dark") return darkMusicConfig;
  return retroMusicConfig;
}

export function scheduleExplorerMusic({
  context,
  createGain,
  masterGain,
  musicBeat,
  musicGain,
  scheduleNext,
  schedulePlayback,
  theme,
}: ScheduledMusicOptions) {
  const config = getExplorerMusicConfig(theme);
  const output = musicGain ?? createGain();
  if (!musicGain) {
    output.gain.value = config.gain;
    output.connect(masterGain);
  }

  const start = context.currentTime + 0.02;
  for (let step = 0; step < config.pattern.length; step += 1) {
    const beat = musicBeat + step;
    const noteStart = start + step * config.beatLength;
    scheduleVoice(context, output, config.pattern[beat % config.pattern.length], noteStart, config.beatLength * 0.85, config.leadVolume, config.leadType);
    if (config.harmony.length > 0) {
      scheduleVoice(
        context,
        output,
        config.harmony[beat % config.harmony.length],
        noteStart,
        config.beatLength * 1.95,
        config.padVolume,
        config.padType,
        0.03,
        config.beatLength * 1.85,
      );
    }
    if (step % 2 === 0) {
      scheduleVoice(
        context,
        output,
        config.bass[(beat / 2) % config.bass.length],
        noteStart,
        config.beatLength * 1.7,
        config.bassVolume,
        config.bassType,
        0.01,
        config.beatLength * 1.6,
      );
    }
    if (config.drums.length > 0) {
      const drumFrequency = config.drums[beat % config.drums.length];
      scheduleVoice(
        context,
        output,
        drumFrequency,
        noteStart,
        config.beatLength * 0.32,
        config.drumVolume,
        config.drumType,
        0.006,
        config.beatLength * 0.28,
        Math.max(drumFrequency * 0.45, 40),
        config.beatLength * 0.22,
      );
    }
  }

  return {
    musicBeat: musicBeat + config.pattern.length,
    musicGain: output,
    musicTimer: scheduleNext(
      schedulePlayback,
      config.beatLength * config.pattern.length * 1000 - 60,
    ),
  };
}

function scheduleVoice(
  context: AudioContext,
  output: GainNode,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  attack = 0.01,
  decayAt = duration * 0.9,
  endFrequency?: number,
  frequencyRampAt = duration,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(endFrequency, 1),
      start + frequencyRampAt,
    );
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decayAt);
  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start);
  oscillator.stop(start + duration);
}
