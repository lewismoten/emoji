import type { ExplorerInstrument } from "../../explorer-audio-instruments.js";

export const darkExplorerInstruments = {
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
} as const satisfies Record<string, ExplorerInstrument>;
