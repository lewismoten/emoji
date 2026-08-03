import type { ExplorerMusicSong } from "./explorer-audio-song-types.js";
import { NOTE_LENGTHS, PITCHES } from "./explorer-audio-notes.js";

const Q = NOTE_LENGTHS.QUARTER;
const H = NOTE_LENGTHS.HALF;

const C4Q = [PITCHES.C4, Q] as const;
const D4QS = [PITCHES.D4, Q, { sustain: true }] as const;
const E4Q = [PITCHES.E4, Q] as const;
const G4Q = [PITCHES.G4, Q] as const;

const C3HS = [PITCHES.C3, H, { sustain: true }] as const;
const D3HS = [PITCHES.D3, H, { sustain: true }] as const;
const E3HS = [PITCHES.E3, H, { sustain: true }] as const;

const song:ExplorerMusicSong = {
  beatLength: 0.18,
  gain: 0.09,
  voices: [
    {
      instrument: "lead-chip",
      events: [C4Q, E4Q, G4Q, E4Q, C4Q, G4Q, E4Q, D4QS],
    },
    {
      instrument: "bass-chip",
      events: [C3HS, D3HS, E3HS, D3HS],
    },
  ],
};
export default song;