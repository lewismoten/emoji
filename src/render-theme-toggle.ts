import resolveExplorerMode from "./resolve-explorer-mode.js";
import * as preferences from "./preferences.js";
import { DeveloperModeControllerOptions } from "./developer-mode-controller-options.js";
import * as aria from "./utils/aria.js";
import { ensureThemeStyles } from "./explorer/theme/theme-styles.js";
import resolveChoiceElements from "./resolve-choice-elements.js";
import syncChoiceInputSelection from "./sync-choice-input-selection.js";
import * as themes from "./utils/themes.js";

function resolveThemePreference(
  preferredTheme: string | undefined,
  fullDeveloperMode: boolean,
): "base" | "dark" | "light" | "retro" {
  if (preferredTheme === "base") return fullDeveloperMode ? "base" : "dark";
  return ["light", "retro"].includes(preferredTheme ?? "")
    ? (preferredTheme as "light" | "retro")
    : "dark";
}

function updateThemeColor() {
  const meta = document.querySelector(
    'meta[name="theme-color"]',
  ) as HTMLMetaElement | null;
  if (!meta) return;
  meta.content = themes.getColor();
}

export function renderThemeToggle(options: DeveloperModeControllerOptions) {
  if (typeof document === "undefined" || !document.documentElement) return;
  const fullDeveloperMode =
    resolveExplorerMode(options.state()) === "developer";
  const theme = resolveThemePreference(
    preferences.getString("theme"),
    fullDeveloperMode,
  );
  void ensureThemeStyles(theme);
  document.documentElement.dataset.theme = theme;
  resolveChoiceElements(options.choices, ".theme-choice").forEach(
    (choice: any) => {
      const selected = choice.dataset.theme === theme;
      choice.classList.toggle("is-active", selected);
      aria.setPressed(choice, selected);
      aria.setChecked(choice, selected);
      choice.tabIndex = selected ? 0 : -1;
      const input = choice.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement | null;
      syncChoiceInputSelection(input, selected);
    },
  );
  updateThemeColor();
}
