import type { ExplorerWaveformId } from "../explorer-audio-types.js";

type ExplorerWaveformDefinition = {
  imag: number[];
  real: number[];
};

const explorerWaveforms: Record<ExplorerWaveformId, ExplorerWaveformDefinition> = {
  "bass-round": {
    imag: [0, 0.82, 0.28, 0.1, 0.04],
    real: [0, 0.1, 0.04, 0.02, 0],
  },
  "bass-warm": {
    imag: [0, 0.95, 0.42, 0.18, 0.08],
    real: [0, 0.18, 0.05, 0.02, 0.01],
  },
  "bell-bright": {
    imag: [0, 1, 0.72, 0.41, 0.24, 0.12, 0.06],
    real: [0, 0.12, 0.08, 0.05, 0.02, 0.01, 0],
  },
  "lead-mellow": {
    imag: [0, 1, 0.36, 0.2, 0.08, 0.03],
    real: [0, 0.08, 0.02, 0.01, 0, 0],
  },
  "pad-soft": {
    imag: [0, 0.68, 0.52, 0.28, 0.14, 0.07],
    real: [0, 0.18, 0.09, 0.04, 0.02, 0.01],
  },
  "pad-warm": {
    imag: [0, 0.55, 0.44, 0.24, 0.12, 0.05],
    real: [0, 0.12, 0.08, 0.03, 0.01, 0],
  },
};

export function applyExplorerWaveform(
  context: AudioContext,
  oscillator: OscillatorNode,
  waveformId?: ExplorerWaveformId,
) {
  if (!waveformId) return;
  const waveform = explorerWaveforms[waveformId];
  const periodicWave = context.createPeriodicWave(
    new Float32Array(waveform.real),
    new Float32Array(waveform.imag),
  );
  oscillator.setPeriodicWave(periodicWave);
}
