import { ExplorerAudioEngine } from "../explorer-audio-engine"

export type AudioEventDependencies = {
  getInteractiveTarget: (target: EventTarget|null) => HTMLElement|null, 
  audio: ExplorerAudioEngine,
  getHoverTarget: () => HTMLElement | null,
  setHoverTarget: (target: HTMLElement | null) => void,
  document: Document
}