import * as audioHelpers from './audio-helpers.js';
import { scheduleExplorerMusic } from "./explorer-audio-music.js";
import * as win from '../../utils/window.js';

export type SchedulerProps = {
  stopMusic: () => void;
  getAudioContext: () => AudioContext | undefined;
  masterGain: GainNode | undefined;
  musicGain: GainNode | undefined;
  musicBeat: number;
  musicTimer: number | undefined
}
const buildScheduler = (props: SchedulerProps) => {

  const scheduleMusic = async () => {
    const enabled = await audioHelpers.shouldPlayMusic();
    if (!enabled) {
      props.stopMusic();
      return;
    }
    const context = props.getAudioContext();
    if (!context || context.state !== "running" || !props.masterGain) return;
    const scheduled = await scheduleExplorerMusic({
      context,
      createGain: () => context.createGain(),
      masterGain: props.masterGain,
      musicBeat: props.musicBeat,
      musicGain: props.musicGain,
      scheduleNext: (callback, timeout) => win.setTimeout(callback, timeout),
      schedulePlayback: scheduleMusic
    });
    if(!scheduled) return;
    props.musicBeat = scheduled.musicBeat;
    props.musicGain = scheduled.musicGain;
    props.musicTimer = scheduled.musicTimer;
  };
  return scheduleMusic;
}

export default buildScheduler;