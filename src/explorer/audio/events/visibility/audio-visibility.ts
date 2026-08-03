import type { AudioEventDependencies } from "../audio-event-dependencies.js";
import buildChange from "./audio-visibility-change.js";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  change: buildChange(dependences),
});

export default buildHandlers;
