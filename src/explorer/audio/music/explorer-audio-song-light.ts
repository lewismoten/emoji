import type { ExplorerMusicSong } from "./explorer-audio-song-types.js";
import { NOTE_LENGTHS, PITCHES } from "./explorer-audio-notes.js";

const Q = NOTE_LENGTHS.QUARTER;
const H = NOTE_LENGTHS.HALF;

const C5Q = [PITCHES.C5, Q] as const;
const D5Q = [PITCHES.D5, Q] as const;
const E5Q = [PITCHES.E5, Q] as const;
const F5Q = [PITCHES.F5, Q] as const;
const G5Q = [PITCHES.G5, Q] as const;
const A5Q = [PITCHES.A5, Q] as const;
const B5Q = [PITCHES.B5, Q] as const;
const A5QS = [PITCHES.A5, Q, { sustain: true }] as const;
const B5QS = [PITCHES.B5, Q, { sustain: true }] as const;

const C6Q = [PITCHES.C6, Q] as const;
const D6Q = [PITCHES.D6, Q] as const;
const E6Q = [PITCHES.E6, Q] as const;
const FS6QS = [PITCHES.FS6, Q, { sustain: true }] as const;
const G5QS = [PITCHES.G5, Q, { sustain: true }] as const;
const E6QS = [PITCHES.E6, Q, { sustain: true }] as const;

const C3HS = [PITCHES.C3, H, { sustain: true }] as const;
const D3HS = [PITCHES.D3, H, { sustain: true }] as const;
const E3H = [PITCHES.E3, H] as const;
const G3H = [PITCHES.G3, H] as const;
const G3HS = [PITCHES.G3, H, { sustain: true }] as const;
const A3HS = [PITCHES.A3, H, { sustain: true }] as const;

const KICK = [96, Q, { endFrequency: 40, releaseRatio: 0.22 }] as const;
const HAT = [280, Q, { endFrequency: 126, releaseRatio: 0.22 }] as const;
const SNARE = [150, Q, { endFrequency: 67, releaseRatio: 0.22 }] as const;
const HAT_ALT = [300, Q, { endFrequency: 135, releaseRatio: 0.22 }] as const;
const HAT_RISE = [320, Q, { endFrequency: 144, releaseRatio: 0.22 }] as const;
const HAT_PEAK = [340, Q, { endFrequency: 153, releaseRatio: 0.22 }] as const;

export const lightExplorerSong: ExplorerMusicSong = {
  beatLength: 0.21,
  gain: 0.1,
  voices: [
    {
      instrument: "light-bell",
      events: [
        C5Q,
        E5Q,
        G5Q,
        A5QS,
        G5Q,
        E5Q,
        F5Q,
        G5Q,
        E5Q,
        C5Q,
        D5Q,
        E5Q,
        F5Q,
        G5Q,
        A5Q,
        B5QS,
      ],
    },
    {
      instrument: "light-pad",
      events: [
        G5QS,
        B5Q,
        D6Q,
        E6QS,
        D6Q,
        B5Q,
        C6Q,
        D6Q,
        B5Q,
        G5Q,
        A5Q,
        B5Q,
        C6Q,
        D6Q,
        E6Q,
        FS6QS,
      ],
    },
    {
      instrument: "light-bass",
      events: [
        C3HS,
        E3H,
        G3HS,
        E3H,
        D3HS,
        G3H,
        A3HS,
        G3H,
      ],
    },
    {
      instrument: "light-drums",
      events: [
        KICK,
        HAT,
        SNARE,
        HAT,
        KICK,
        HAT,
        SNARE,
        HAT,
        KICK,
        HAT_ALT,
        SNARE,
        HAT_ALT,
        KICK,
        HAT_RISE,
        SNARE,
        HAT_PEAK,
      ],
    },
  ],
};
