import type { ExplorerToneShape } from "./explorer-audio-types.js";
import { applyExplorerWaveform } from "./instruments/explorer-audio-waveforms.js";

type ScheduleToneOptions = {
  context: AudioContext;
  output: GainNode;
  start: number;
  tone: ExplorerToneShape;
};

export function scheduleExplorerTone({
  context,
  output,
  start,
  tone,
}: ScheduleToneOptions) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = tone.attack ?? 0.01;
  const releaseAt = tone.releaseAt ?? tone.duration * 0.9;
  const rampAt = tone.frequencyRampAt ?? tone.duration;

  oscillator.type = tone.type ?? "square";
  applyExplorerWaveform(context, oscillator, tone.waveform);
  oscillator.frequency.setValueAtTime(tone.frequency, start + (tone.offset ?? 0));
  if (tone.endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(tone.endFrequency, 1),
      start + (tone.offset ?? 0) + rampAt,
    );
  }

  gain.gain.setValueAtTime(0.0001, start + (tone.offset ?? 0));
  gain.gain.exponentialRampToValueAtTime(
    tone.volume,
    start + (tone.offset ?? 0) + attack,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    start + (tone.offset ?? 0) + releaseAt,
  );

  oscillator.connect(gain);
  gain.connect(output);
  oscillator.start(start + (tone.offset ?? 0));
  oscillator.stop(start + (tone.offset ?? 0) + tone.duration + 0.02);
}
