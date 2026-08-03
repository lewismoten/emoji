import { classifyElement } from "../../../../utils/element.js";
import { AudioEventDependencies } from "../audio-event-dependencies.js";

 const buildHandler = (dependencies: AudioEventDependencies) => {
          
const handler = (event: Event) => {
 if (dependencies.document.hidden) dependencies.audio.stopMusic();
      else dependencies.audio.syncHelpMusic();
  }
      return handler;
    }
export default buildHandler;