import { AudioEventDependencies } from "../audio-event-dependencies";
import buildDown from "./audio-keyboard-down";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  down: buildDown(dependences),
})

export default buildHandlers;