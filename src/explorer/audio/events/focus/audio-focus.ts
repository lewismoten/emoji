import type { AudioEventDependencies } from "../audio-event-dependencies.js";
import buildIn from "./audio-focus-in.js";
import buildOut from "./audio-focus-out.js";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  in: buildIn(dependences),
  out: buildOut(dependences)
});

export default buildHandlers;
