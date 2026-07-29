import type { ExplorerMusicSong } from "../../explorer-audio-song-types.js";
import { NOTE_LENGTHS, PITCHES } from "../../explorer-audio-notes.js";

const Q = NOTE_LENGTHS.QUARTER;
const H = NOTE_LENGTHS.HALF;

const A3Q = [PITCHES.A3, Q] as const;
const A3QS = [PITCHES.A3, Q, { sustain: true }] as const;
const B3Q = [PITCHES.B3, Q] as const;
const C4Q = [PITCHES.C4, Q] as const;
const D4Q = [PITCHES.D4, Q] as const;
const E4Q = [PITCHES.E4, Q] as const;
const E4QS = [PITCHES.E4, Q, { sustain: true }] as const;
const FS4Q = [PITCHES.FS4, Q] as const;
const G3Q = [PITCHES.G3, Q] as const;
const G3QS = [PITCHES.G3, Q, { sustain: true }] as const;
const G4Q = [PITCHES.G4, Q] as const;
const A4Q = [PITCHES.A4, Q] as const;
const D4QS = [PITCHES.D4, Q, { sustain: true }] as const;
const C4QS = [PITCHES.C4, Q, { sustain: true }] as const;
const F3QS = [PITCHES.F3, Q, { sustain: true }] as const;

const A1HS = [PITCHES.A1, H, { sustain: true }] as const;
const C2HS = [PITCHES.C2, H, { sustain: true }] as const;
const D2HS = [PITCHES.D2, H, { sustain: true }] as const;
const E2HS = [PITCHES.E2, H, { sustain: true }] as const;

export const darkExplorerSong: ExplorerMusicSong = {
  beatLength: 0.36,
  gain: 0.08,
  voices: [
    {
      instrument: "dark-lead",
      events: [A3QS, C4Q, D4Q, C4Q, G3QS, A3Q, B3Q, A3Q, F3QS, G3Q, A3Q, G3Q],
    },
    {
      instrument: "dark-pad",
      events: [E4QS, G4Q, A4Q, G4Q, D4QS, E4Q, FS4Q, E4Q, C4QS, D4Q, E4Q, D4Q],
    },
    {
      instrument: "dark-bass",
      events: [A1HS, C2HS, D2HS, E2HS, D2HS, C2HS],
    },
  ],
};
