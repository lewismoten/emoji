export type ExplorerWaveformId =
  | "bell-bright"
  | "lead-mellow"
  | "pad-soft"
  | "pad-warm"
  | "bass-round"
  | "bass-warm";

export type ExplorerAudioElementType =
  | "button"
  | "checkbox"
  | "dialog"
  | "dropdown"
  | "generic"
  | "link"
  | "radio";

export type ExplorerAudioAction =
  | "blur"
  | "check"
  | "click"
  | "close"
  | "focus"
  | "hover"
  | "keydown"
  | "open"
  | "uncheck";

export type ExplorerToneShape = {
  attack?: number;
  duration: number;
  endFrequency?: number;
  frequency: number;
  frequencyRampAt?: number;
  offset?: number;
  releaseAt?: number;
  type?: OscillatorType;
  volume: number;
  waveform?: ExplorerWaveformId;
};
