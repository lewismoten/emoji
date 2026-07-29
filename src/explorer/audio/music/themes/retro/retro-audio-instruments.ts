import type { ExplorerInstrument } from "../../explorer-audio-instruments.js";

export const retroExplorerInstruments = {
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
} as const satisfies Record<string, ExplorerInstrument>;
