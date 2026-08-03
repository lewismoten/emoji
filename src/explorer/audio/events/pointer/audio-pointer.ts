import { AudioEventDependencies } from "../audio-event-dependencies";
import buildDown from "./audio-pointer-down";
import buildClick from "./audio-pointer-click";
import buildOut from "./audio-pointer-out";
import buildOver from "./audio-pointer-over";

const buildHandlers = (dependences: AudioEventDependencies) => ({
  down: buildDown(dependences),
  click: buildClick(dependences),
  out: buildOut(dependences),
  over: buildOver(dependences)
})

export default buildHandlers;