import { AudioEventDependencies } from "../audio-event-dependencies";
import buildIn from "./audio-focus-in";
import buildOut from "./audio-focus-out";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  in: buildIn(dependences),
  out: buildOut(dependences)
});

export default buildHandlers;