import { scheduleExplorerTone } from "./explorer-audio-tone.js";
import type { ExplorerAudioTheme } from "./explorer-audio-types.js";
import { getExplorerInstrument } from "./instruments/explorer-audio-instruments.js";
import type {
  ExplorerMusicSong,
  ExplorerSongEvent,
} from "./music/explorer-audio-song-types.js";
import { darkExplorerSong } from "./music/themes/dark/dark-audio-song.js";
import { lightExplorerSong } from "./music/themes/light/light-audio-song.js";
import { retroExplorerSong } from "./music/themes/retro/retro-audio-song.js";
import * as themes from '../../utils/themes.js';

type ScheduledMusicOptions = {
  context: AudioContext;
  createGain: () => GainNode;
  masterGain: GainNode;
  musicBeat: number;
  musicGain?: GainNode;
  scheduleNext: (callback: () => void, timeout: number) => number;
  schedulePlayback: () => void;
};

export function getExplorerMusicConfig() {
  const theme = themes.getTheme();
  if (theme === "light") return lightExplorerSong;
  if (theme === "dark") return darkExplorerSong;
  return retroExplorerSong;
}

export function scheduleExplorerMusic({
  context,
  createGain,
  masterGain,
  musicBeat,
  musicGain,
  scheduleNext,
  schedulePlayback
}: ScheduledMusicOptions) {
  const config = getExplorerMusicConfig();
  const output = musicGain ?? createGain();
  if (!musicGain) {
    output.gain.value = config.gain;
    output.connect(masterGain);
  }

  const start = context.currentTime + 0.02;
  const songLength = scheduleSongVoices(context, output, config, start);

  return {
    musicBeat: musicBeat + songLength,
    musicGain: output,
    musicTimer: scheduleNext(
      schedulePlayback,
      config.beatLength * songLength * 1000 - 60,
    ),
  };
}

function scheduleSongVoices(
  context: AudioContext,
  output: GainNode,
  song: ExplorerMusicSong,
  start: number,
) {
  let longestBeat = 0;
  for (const voice of song.voices) {
    let beat = 0;
    for (const event of voice.events) {
      scheduleSongEvent(context, output, song.beatLength, start, beat, voice, event);
      beat += event[1];
    }
    longestBeat = Math.max(longestBeat, beat);
  }
  return longestBeat;
}

export function scheduleExplorerSongEventForTest(
  context: AudioContext,
  output: GainNode,
  beatLength: number,
  start: number,
  beat: number,
  voice: ExplorerMusicSong["voices"][number],
  event: ExplorerSongEvent,
) {
  const [frequency, length, options] = event;
  const duration = beatLength * length;
  if (options?.rest) return;
  const instrument = getExplorerInstrument(voice.instrument);
  scheduleExplorerTone({
    context,
    output,
    start: start + beat * beatLength,
    tone: {
      attack: instrument.attack,
      duration,
      endFrequency: options?.endFrequency,
      frequency,
      releaseAt:
        duration *
        (options?.sustain
          ? 0.98
          : (options?.releaseRatio ?? instrument.releaseRatio)),
      type: instrument.type,
      volume: instrument.volume,
      waveform: instrument.waveform,
    },
  });
}

function scheduleSongEvent(
  context: AudioContext,
  output: GainNode,
  beatLength: number,
  start: number,
  beat: number,
  voice: ExplorerMusicSong["voices"][number],
  event: ExplorerSongEvent,
) {
  return scheduleExplorerSongEventForTest(
    context,
    output,
    beatLength,
    start,
    beat,
    voice,
    event,
  );
}
