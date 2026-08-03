import type { AudioEventDependencies } from "../audio-event-dependencies.js";
import buildDown from "./audio-keyboard-down.js";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  down: buildDown(dependences),
});

export default buildHandlers;
