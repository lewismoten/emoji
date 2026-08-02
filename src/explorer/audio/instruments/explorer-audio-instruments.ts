import type { ExplorerWaveformId } from "../explorer-audio-types.js";

export type ExplorerInstrumentId =
  | "bass-chip"
  | "bass-round"
  | "bass-warm"
  | "bell-bright"
  | "drum-chip"
  | "lead-chip"
  | "lead-mellow"
  | "pad-soft"
  | "pad-warm";

export type ExplorerInstrument = {
  attack?: number;
  releaseRatio: number;
  type: OscillatorType;
  volume: number;
  waveform?: ExplorerWaveformId;
};

const explorerInstruments: Record<ExplorerInstrumentId, ExplorerInstrument> = {
  "bass-chip": {
    attack: 0.01,
    releaseRatio: 0.95,
    type: "triangle",
    volume: 0.16,
  },
  "bass-round": {
    attack: 0.01,
    releaseRatio: 0.9,
    type: "triangle",
    volume: 0.1,
    waveform: "bass-round",
  },
  "bass-warm": {
    attack: 0.012,
    releaseRatio: 0.95,
    type: "triangle",
    volume: 0.085,
    waveform: "bass-warm",
  },
  "bell-bright": {
    attack: 0.006,
    releaseRatio: 0.8,
    type: "triangle",
    volume: 0.15,
    waveform: "bell-bright",
  },
  "drum-chip": {
    attack: 0.006,
    releaseRatio: 0.22,
    type: "square",
    volume: 0.055,
  },
  "lead-chip": {
    attack: 0.01,
    releaseRatio: 0.9,
    type: "square",
    volume: 0.24,
  },
  "lead-mellow": {
    attack: 0.018,
    releaseRatio: 0.92,
    type: "sine",
    volume: 0.09,
    waveform: "lead-mellow",
  },
  "pad-soft": {
    attack: 0.03,
    releaseRatio: 0.95,
    type: "sine",
    volume: 0.06,
    waveform: "pad-soft",
  },
  "pad-warm": {
    attack: 0.04,
    releaseRatio: 0.98,
    type: "sawtooth",
    volume: 0.045,
    waveform: "pad-warm",
  },
};

export function getExplorerInstrument(instrumentId: ExplorerInstrumentId) {
  return explorerInstruments[instrumentId];
}
