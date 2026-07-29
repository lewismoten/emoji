import type { ExplorerInstrument } from "../../explorer-audio-instruments.js";

export const lightExplorerInstruments = {
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
} as const satisfies Record<string, ExplorerInstrument>;
