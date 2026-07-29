import type { ExplorerMusicSong } from "./explorer-audio-song-types.js";
import { NOTE_LENGTHS, PITCHES } from "./explorer-audio-notes.js";

export const darkExplorerSong: ExplorerMusicSong = {
  beatLength: 0.36,
  gain: 0.08,
  voices: [
    {
      instrument: "dark-lead",
      events: [
        [PITCHES.A3, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.C4, NOTE_LENGTHS.QUARTER],
        [PITCHES.D4, NOTE_LENGTHS.QUARTER],
        [PITCHES.C4, NOTE_LENGTHS.QUARTER],
        [PITCHES.G3, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.A3, NOTE_LENGTHS.QUARTER],
        [PITCHES.B3, NOTE_LENGTHS.QUARTER],
        [PITCHES.A3, NOTE_LENGTHS.QUARTER],
        [PITCHES.F3, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.G3, NOTE_LENGTHS.QUARTER],
        [PITCHES.A3, NOTE_LENGTHS.QUARTER],
        [PITCHES.G3, NOTE_LENGTHS.QUARTER],
      ],
    },
    {
      instrument: "dark-pad",
      events: [
        [PITCHES.E4, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.G4, NOTE_LENGTHS.QUARTER],
        [PITCHES.A4, NOTE_LENGTHS.QUARTER],
        [PITCHES.G4, NOTE_LENGTHS.QUARTER],
        [PITCHES.D4, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.FS4, NOTE_LENGTHS.QUARTER],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.C4, NOTE_LENGTHS.QUARTER, { sustain: true }],
        [PITCHES.D4, NOTE_LENGTHS.QUARTER],
        [PITCHES.E4, NOTE_LENGTHS.QUARTER],
        [PITCHES.D4, NOTE_LENGTHS.QUARTER],
      ],
    },
    {
      instrument: "dark-bass",
      events: [
        [PITCHES.A1, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.C2, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.D2, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.E2, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.D2, NOTE_LENGTHS.HALF, { sustain: true }],
        [PITCHES.C2, NOTE_LENGTHS.HALF, { sustain: true }],
      ],
    },
  ],
};
