import type { ExplorerInstrumentId } from "../instruments/explorer-audio-instruments.js";
import type { ExplorerNoteLength } from "./explorer-audio-notes.js";

export type ExplorerSongEventOptions = {
  endFrequency?: number;
  releaseRatio?: number;
  rest?: boolean;
  sustain?: boolean;
};

export type ExplorerSongEvent = readonly [
  frequency: number,
  length: ExplorerNoteLength,
  options?: ExplorerSongEventOptions,
];

export type ExplorerSongVoice = {
  events: ExplorerSongEvent[];
  instrument: ExplorerInstrumentId;
};

export type ExplorerMusicSong = {
  beatLength: number;
  gain: number;
  voices: ExplorerSongVoice[];
};
