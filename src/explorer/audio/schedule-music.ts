import * as audioHelpers from './audio-helpers.js';
import { scheduleExplorerMusic } from "./explorer-audio-music.js";
import * as win from '../../utils/window.js';
import { EngineProps } from './engine-props.js';

type SchedulableAudio = {
  context: AudioContext;
  masterGain: GainNode;
};

export const canSchedule = (
  value: Partial<SchedulableAudio>,
): value is SchedulableAudio =>
  value.context !== undefined &&
  value.context.state === "running" &&
  value.masterGain !== undefined;

export const schedule = async (props: EngineProps, {context, masterGain}: SchedulableAudio, schedulePlayback: () => Promise<void>) => {
  const { musicBeat, musicGain} = props;
  const scheduled = await scheduleExplorerMusic({
      context,
      createGain: () => context.createGain(),
      masterGain,
      musicBeat,
      musicGain,
      scheduleNext: win.setTimeout,
      schedulePlayback
    });
    if(!scheduled) return;
    props.musicBeat = scheduled.musicBeat;
    props.musicGain = scheduled.musicGain;
    props.musicTimer = scheduled.musicTimer;
}
const buildScheduler = (props: EngineProps) => {
  const schedulePlayback = async () => {
    const { stopMusic, getAudioContext, masterGain} = props;
    const enabled = await audioHelpers.shouldPlayMusic();
    if (!enabled) {
      stopMusic();
      return;
    }
    const audio = { context: getAudioContext(), masterGain };
    if (!canSchedule(audio)) return;
    await schedule(props, audio, schedulePlayback);
  }
  return schedulePlayback;
}
export default buildScheduler;
