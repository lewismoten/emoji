import * as audioHelpers from './audio-helpers.js';
import { EngineProps } from './engine-props.js';

const buildRestart = (props: EngineProps) => {
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