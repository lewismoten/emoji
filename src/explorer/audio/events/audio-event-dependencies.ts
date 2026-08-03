import type { ExplorerAudioEngine } from "../explorer-audio-engine.js";

export type AudioEventDependencies = {
  getInteractiveTarget: (target: EventTarget|null) => HTMLElement|null, 
  audio: ExplorerAudioEngine,
  getHoverTarget: () => HTMLElement | null,
  setHoverTarget: (target: HTMLElement | null) => void,
  document: Document
}
