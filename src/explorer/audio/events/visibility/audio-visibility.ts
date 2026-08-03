import { AudioEventDependencies } from "../audio-event-dependencies";
import buildChange from "./audio-visibility-change.js";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  change: buildChange(dependences),
})

export default buildHandlers;