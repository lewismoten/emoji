import * as aria from "./utils/aria.js";
import { translate, applyTranslations, setTranslations } from "./utils/i18n.js";
import * as preferences from "./preferences.js";
import buildDeveloperModeControllerChange from "./developer-mode-controller-change.js";
import { DeveloperModeControllerOptions } from "./developer-mode-controller-options.js";
import syncChoiceInputSelection from "./sync-choice-input-selection.js";
import * as doc from "./utils/document.js";
import * as state from "./state.js";
import * as auth from "./auth.js";

export function createExplorerUiController(options: any) {
  const fetchJsonWithFallback = async (primary: string, fallback: string) => {
    const response = await fetch(primary);
    if (response.ok) return response.json();
    const secondary = await fetch(fallback);
    if (!secondary.ok) {
      throw new Error(`Unable to load ${primary} or ${fallback}`);
    }
    return secondary.json();
  };

  function updateOnlineStatus() {
    const status = options.offlineStatus();
    if (!status) return;
    status.textContent = translate(
      "offlineStatus",
      "Offline — showing saved data",
    );
    status.hidden = navigator.onLine;
  }

  function renderInstallAppButton() {
    options.renderInstallAppButton(options.installAppButton());
  }

  async function installApp(event: Event) {
    const result = await options.installWebApp({
      deferredInstallPrompt: options.deferredInstallPrompt(),
      event,
      installDialog: options.installDialog(),
      renderInstallAppButton,
    });
    options.setDeferredInstallPrompt(result.deferredInstallPrompt);
  }

  async function loadUiTranslations(locale: string, rtl = false) {
    const base = locale.split("-")[0];
    try {
      const codes = locale === base ? [base] : [base, locale];
      const packs = await Promise.all(
        codes.map(async (code) => {
          return fetchJsonWithFallback(
            `demo-locales/ui.${code}.json`,
            `src/demo-locales/ui.${code}.json`,
          );
        }),
      );
      setTranslations(locale, rtl, packs);
    } catch {
      setTranslations("en", false);
    }
    applyTranslations();
    options.renderVersionModeToggle();
    options.renderSearchLanguages();
  }

  return {
    applyTranslations,
    installApp,
    loadUiTranslations,
    renderInstallAppButton,
    updateOnlineStatus,
  };
}

export function renderPixelFontToggle(options: any) {
  const enabled = !preferences.getBoolean("pixelFont");
  document.documentElement.toggleAttribute("data-pixel-font", enabled);
  if (enabled) delete document.documentElement.dataset.emojiFont;
  else document.documentElement.dataset.emojiFont = "system";
  doc.all("emoji-font-choice").forEach((choice: any) => {
    const selected =
      choice.dataset.emojiFont === (enabled ? "pixel" : "system");
    choice.classList.toggle("is-active", selected);
    aria.setPressed(choice, selected);
    aria.setChecked(choice, selected);
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    syncChoiceInputSelection(input, selected);
  });
  options.refreshRenderedPixelEmoji();
}

export function selectEmojiFont(options: any, event: any) {
  const pixelFont = event.currentTarget.dataset.emojiFont === "pixel";
  preferences.setBoolean("pixelFont", pixelFont);
  options.renderPixelFontToggle();
  if (event?.detail > 0) event.currentTarget.blur();
}

export function createDeveloperModeController(
  options: DeveloperModeControllerOptions,
) {
  const mode = () => state.getExplorerMode();
  const enabled = auth.canAccessAdvanced;
  const fullEnabled = auth.canAccessDeveloper;
  function render() {
    const active = enabled();
    const full = fullEnabled();
    document.documentElement.dataset.explorerMode = mode();
    document.documentElement.toggleAttribute("data-developer-mode", active);
    document.documentElement.toggleAttribute("data-full-developer-mode", full);
    const choices = doc.all("mode-choice");
    if (choices.length > 0) {
      choices.forEach((choice: any) => {
        const selected = choice.dataset.mode === mode();
        choice.classList.toggle("is-active", selected);
        aria.setPressed(choice, selected);
        aria.setChecked(choice, selected);
        choice.tabIndex = selected ? 0 : -1;
        const input = choice.querySelector?.(
          'input[type="radio"]',
        ) as HTMLInputElement | null;
        syncChoiceInputSelection(input, selected);
      });
    } else {
      const toggle = options.toggle?.();
      if (toggle) {
        toggle.checked = active;
        aria.setPressed(toggle as any, active);
      }
    }
  }
  const change = buildDeveloperModeControllerChange(options, render);

  return { enabled, fullEnabled, render, change, mode };
}
