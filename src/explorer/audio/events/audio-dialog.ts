import { AudioEventDependencies } from "./audio-event-dependencies.js";

 const buildHandler = (
    dependencies:AudioEventDependencies
) => {

const handler = (action: "open" | "close", dialog: HTMLDialogElement) => {
      dependencies.audio.playInteraction("dialog", action);
      if (dialog.classList.contains("musical")) dependencies.audio.syncHelpMusic();
    }
    return handler;
  }
  export default buildHandler;