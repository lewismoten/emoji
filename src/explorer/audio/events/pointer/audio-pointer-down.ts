import * as audioHelpers from "../../audio-helpers.js";
import { AudioEventDependencies } from "../audio-event-dependencies.js";

 const buildHandler = (dependencies: AudioEventDependencies) => {
    const handler = async () => {
      const enabled = await audioHelpers.isAudioEnabled();
      return enabled && dependencies.audio.resumeAudioContext();
    };
    return handler;
  }

  export default buildHandler;