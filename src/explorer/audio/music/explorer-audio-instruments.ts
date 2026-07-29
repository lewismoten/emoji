import type { ExplorerWaveformId } from "../explorer-audio-types.js";
import { darkExplorerInstruments } from "./themes/dark/dark-audio-instruments.js";
import { lightExplorerInstruments } from "./themes/light/light-audio-instruments.js";
import { retroExplorerInstruments } from "./themes/retro/retro-audio-instruments.js";

export type ExplorerInstrumentId =
  | keyof typeof darkExplorerInstruments
  | keyof typeof lightExplorerInstruments
  | keyof typeof retroExplorerInstruments;

export type ExplorerInstrument = {
  attack?: number;
  releaseRatio?: number;
  type: OscillatorType;
  volume: number;
  waveform?: ExplorerWaveformId;
};

const explorerInstruments = {
  ...darkExplorerInstruments,
  ...lightExplorerInstruments,
  ...retroExplorerInstruments,
} as const satisfies Record<ExplorerInstrumentId, ExplorerInstrument>;

export function getExplorerInstrument(instrumentId: ExplorerInstrumentId) {
  return explorerInstruments[instrumentId] as ExplorerInstrument;
}
