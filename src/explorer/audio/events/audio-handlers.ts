import buildFocus from "./focus/audio-focus.js";
import buildKeyboard from "./keyboard/audio-keyboard.js";
import buildPointer from "./pointer/audio-pointer.js";
import buildChange from "./explorer-audio-change.js";
import buildVisibility from "./visibility/audio-visibility.js";
import buildDialog from "./audio-dialog.js";
import getInteractiveTarget from "./audio-target.js";

import type { AudioEventDependencies } from "./audio-event-dependencies.js";


const buildHandlers = (
  dependences: Omit<AudioEventDependencies, "getInteractiveTarget">,
) => {
  const complete = { ...dependences, getInteractiveTarget };

  return {
    focus: buildFocus(complete),
    keyboard: buildKeyboard(complete),
    pointer: buildPointer(complete),
    visibility: buildVisibility(complete),
    change: buildChange(complete),
    dialog: buildDialog(complete),
  };
};

export default buildHandlers;
