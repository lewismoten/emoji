export const CELL_SIZE = 12;
export const DISPLAY_SIZE = 384;
export const ROTATION_ALPHA_THRESHOLD = 128;
export const IS_VITE_DEVELOPMENT =
  typeof import.meta.env !== "undefined" && import.meta.env.DEV === true;
export const TOOLS = [
  "pencil",
  "line",
  "rectangle",
  "ellipse",
  "bucket",
  "eyedropper",
  "select",
];
export const EGA_COLORS = [
  "#000000",
  "#0000aa",
  "#00aa00",
  "#00aaaa",
  "#aa0000",
  "#aa00aa",
  "#aa5500",
  "#aaaaaa",
  "#555555",
  "#5555ff",
  "#55ff55",
  "#55ffff",
  "#ff5555",
  "#ff55ff",
  "#ffff55",
  "#ffffff",
];
export const SKIN_TONE_COLORS = [
  {
    codePoint: "1F3FB",
    color: "#f2d2b6",
    translationKey: "light",
    fallback: "Light skin tone",
  },
  {
    codePoint: "1F3FC",
    color: "#d5a078",
    translationKey: "mediumLight",
    fallback: "Medium-light skin tone",
  },
  {
    codePoint: "1F3FD",
    color: "#a66a45",
    translationKey: "medium",
    fallback: "Medium skin tone",
  },
  {
    codePoint: "1F3FE",
    color: "#70452f",
    translationKey: "mediumDark",
    fallback: "Medium-dark skin tone",
  },
  {
    codePoint: "1F3FF",
    color: "#3b271d",
    translationKey: "dark",
    fallback: "Dark skin tone",
  },
];
