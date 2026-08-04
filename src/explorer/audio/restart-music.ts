import * as audioHelpers from './audio-helpers.js';

export type RestartProps = {
  resetMusicPlayback: () => void;
  musicTimer: number | undefined;
  resumeAudioContext: () => Promise<AudioContext | undefined>;
  scheduleMusic: () => Promise<void>;
}
const buildRestart = (props: RestartProps) => {
  const restartMusic = async () => {
    props.resetMusicPlayback();
    const enabled = await audioHelpers.shouldPlayMusic();
    if (!enabled) return;
    const context = await props.resumeAudioContext();
    if (!context) return;
    if (await audioHelpers.shouldPlayMusic() && !props.musicTimer) {
      await props.scheduleMusic();
    }
  };
  return restartMusic;
}

export default buildRestart;