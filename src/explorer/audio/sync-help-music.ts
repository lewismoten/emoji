import * as audioHelpers from './audio-helpers.js';

export type SyncProps = {
  stopMusic: () => void;
  musicTimer: number | undefined;
  resumeAudioContext: () => Promise<AudioContext | undefined>;
  scheduleMusic: () => Promise<void>;
}

const buildSyncMusic = (props: SyncProps) => {
  const syncHelpMusic = async () => {
    const enabled = await audioHelpers.shouldPlayMusic();
    if (!enabled) {
      props.stopMusic();
      return;
    }
    if (!props.musicTimer) {
      const context = await props.resumeAudioContext();
      if (!context) return;
      if (await audioHelpers.shouldPlayMusic()) {
        await props.scheduleMusic();
      }
      return;
    }
    await props.resumeAudioContext();
  };
  return syncHelpMusic;
}

export default buildSyncMusic;