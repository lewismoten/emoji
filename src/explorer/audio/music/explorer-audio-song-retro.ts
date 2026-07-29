import type { ExplorerMusicSong } from "./explorer-audio-song-types.js";
import { NOTE_LENGTHS, PITCHES } from "./explorer-audio-notes.js";

export const retroExplorerSong: ExplorerMusicSong = {
  beatLength: 0.18,
  gain: 0.09,
  voices: [
    {
      instrument: "retro-lead",
      events: [
        [PITCHES.C4, NOTE_LENGTHS.QUARTER],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.G4, NOTE_LENGTHS.QUARTER],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.C4, NOTE_LENGTHS.QUARTER],
        [PITCHES.G4, NOTE_LENGTHS.QUARTER],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.D4, NOTE_LENGTHS.QUARTER, { sustain: true }],
      ],
    },
    {
      instrument: "retro-bass",
      events: [
        [PITCHES.C3, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.D3, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.E3, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.D3, NOTE_LENGTHS.HALF, { sustain: true }],
      ],
    },
  ],
};
