import type { ExplorerWaveformId } from "../explorer-audio-types.js";

export type ExplorerInstrumentId =
  | "dark-bass"
  | "dark-lead"
  | "dark-pad"
  | "light-bass"
  | "light-bell"
  | "light-drums"
  | "light-pad"
  | "retro-bass"
  | "retro-lead";

export type ExplorerInstrument = {
  attack?: number;
  releaseRatio?: number;
  type: OscillatorType;
  volume: number;
  waveform?: ExplorerWaveformId;
};

const explorerInstruments: Record<ExplorerInstrumentId, ExplorerInstrument> = {
  "dark-bass": {
    attack: 0.012,
    releaseRatio: 0.95,
    type: "triangle",
    volume: 0.085,
    waveform: "dark-bass",
  },
  "dark-lead": {
    attack: 0.018,
    releaseRatio: 0.92,
    type: "sine",
    volume: 0.09,
    waveform: "dark-lead",
  },
  "dark-pad": {
    attack: 0.04,
    releaseRatio: 0.98,
    type: "sawtooth",
    volume: 0.045,
    waveform: "dark-pad",
  },
  "light-bass": {
    attack: 0.01,
    releaseRatio: 0.9,
    type: "triangle",
    volume: 0.1,
    waveform: "light-bass",
  },
  "light-bell": {
    attack: 0.006,
    releaseRatio: 0.8,
    type: "triangle",
    volume: 0.15,
    waveform: "light-bell",
  },
  "light-drums": {
    attack: 0.006,
    releaseRatio: 0.22,
    type: "square",
    volume: 0.055,
  },
  "light-pad": {
    attack: 0.03,
    releaseRatio: 0.95,
    type: "sine",
    volume: 0.06,
    waveform: "light-pad",
  },
  "retro-bass": {
    attack: 0.01,
    releaseRatio: 0.95,
    type: "triangle",
    volume: 0.16,
  },
  "retro-lead": {
    attack: 0.01,
    releaseRatio: 0.9,
    type: "square",
    volume: 0.24,
  },
};

export function getExplorerInstrument(instrumentId: ExplorerInstrumentId) {
  return explorerInstruments[instrumentId];
}
