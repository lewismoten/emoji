import * as audioHelpers from './audio-helpers.js';
import { EngineProps } from './engine-props.js';

const buildSyncMusic = (props: EngineProps) => {
  const syncHelpMusic = async () => {
    const enabled = await audioHelpers.shouldPlayMusic();
    if (!enabled) return void props.stopMusic();
    const context = await props.resumeAudioContext();
    if (props.musicTimer || !context) return;
    if (await audioHelpers.shouldPlayMusic())
      await props.scheduleMusic();
  };
  return syncHelpMusic;
}

export default buildSyncMusic;