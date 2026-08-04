export type EngineProps = {
  audioContext: AudioContext | undefined;
   masterGain: GainNode | undefined;
   musicTimer: number | undefined;
   musicBeat: number;
   musicGain: GainNode | undefined;

    stopMusic: () => void;
    getAudioContext: () => AudioContext | undefined;
    resumeAudioContext: () => Promise<AudioContext | undefined>;
    scheduleMusic: () => Promise<void>;
    resetMusicPlayback: () => void;
}