import type { AudioEventDependencies } from "../audio-event-dependencies.js";
import buildDown from "./audio-pointer-down.js";
import buildClick from "./audio-pointer-click.js";
import buildOut from "./audio-pointer-out.js";
import buildOver from "./audio-pointer-over.js";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  down: buildDown(dependences),
  click: buildClick(dependences),
  out: buildOut(dependences),
  over: buildOver(dependences),
});

export default buildHandlers;
