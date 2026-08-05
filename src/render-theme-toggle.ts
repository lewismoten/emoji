import * as preferences from "./preferences.js";
import * as aria from "./utils/aria.js";
import { ensureThemeStyles } from "./explorer/theme/theme-styles.js";
import syncChoiceInputSelection from "./sync-choice-input-selection.js";
import * as themes from "./utils/themes.js";
import * as audioToggle from "./controls/audio/audio-toggle.js";
import audio from "./explorer/audio/explorer-audio-engine.js";
import { all } from "./utils/document.js";
import * as auth from "./auth.js";

type Themes = "base" | "dark" | "light" | "retro";
const THEME_DEFAULT: Themes = "dark";
const THEME_NON_DEV: Themes[] = ["light", "retro", "dark"];
const resolveTheme = (theme: Themes): Themes => {
  if (theme === "base") {
    return auth.isDeveloper() ? theme : THEME_DEFAULT;
  }
  return THEME_NON_DEV.includes(theme) ? theme : THEME_DEFAULT;
};

function updateThemeColor() {
  const meta = document.querySelector(
    'meta[name="theme-color"]',
  ) as HTMLMetaElement | null;
  if (!meta) return;
  meta.content = themes.getColor();
}

export function renderThemeToggle() {
  if (typeof document === "undefined" || !document.documentElement) return;
  const theme = resolveTheme(preferences.getString<Themes>("theme"));
  void ensureThemeStyles(theme);
  document.documentElement.dataset.theme = theme;
  all<HTMLElement>("theme-choice").forEach((choice) => {
    const selected = choice.dataset.theme === theme;
    choice.classList.toggle("is-active", selected);
    aria.setPressed(choice, selected);
    aria.setChecked(choice, selected);
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    syncChoiceInputSelection(input, selected);
  });
  updateThemeColor();
  audioToggle.render();
  audio().syncHelpMusic();
}
