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
  const translate = (key: string, fallback: string) =>
    options.state().uiStrings[key] ?? fallback;

  function updateOnlineStatus() {
    const status = options.offlineStatus();
    if (!status) return;
    status.textContent = translate(
      "offlineStatus",
      "Offline — showing saved data",
    );
    status.hidden = navigator.onLine;
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((element: any) => {
      element.textContent = translate(
        element.dataset.i18n,
        element.textContent,
      );
    });
    document
      .querySelectorAll("[data-i18n-placeholder]")
      .forEach((element: any) => {
        element.placeholder = translate(
          element.dataset.i18nPlaceholder,
          element.placeholder,
        );
      });
    document
      .querySelectorAll("[data-i18n-aria-label]")
      .forEach((element: any) => {
        element.setAttribute(
          "aria-label",
          translate(
            element.dataset.i18nAriaLabel,
            element.getAttribute("aria-label"),
          ),
        );
      });
    updateOnlineStatus();
    options.renderPixelFontToggle();
    options.renderSoundEffectsToggle();
    options.renderMusicToggle();
    options.renderDeveloperMode();
    options.pixelEditor()?.refreshTranslations();
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
      options.state().uiStrings = Object.assign({}, ...packs);
      document.documentElement.lang = locale;
      document.documentElement.dir = rtl ? "rtl" : "ltr";
    } catch {
      options.state().uiStrings = {};
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
    const name = translate("title", "Emoji Explorer");
    document.title = `${name} – Unicode Emoji`;
    for (const metaName of ["application-name", "apple-mobile-web-app-title"]) {
      const meta = document.querySelector(
        `meta[name="${metaName}"]`,
      ) as HTMLMetaElement | null;
      if (meta) meta.content = name;
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

function updateThemeColor() {
  const meta = document.querySelector(
    'meta[name="theme-color"]',
  ) as HTMLMetaElement | null;
  if (!meta) return;
  meta.content =
    document.documentElement.dataset.theme === "light"
      ? "#f6efe4"
      : document.documentElement.dataset.theme === "retro"
        ? "#0000aa"
        : "#160622";
}

function syncChoiceInputSelection(input: HTMLInputElement | null, selected: boolean) {
  if (!input) return;
  input.checked = selected;
  input.defaultChecked = selected;
  input.tabIndex = -1;
  if (selected) {
    input.setAttribute("checked", "checked");
  } else {
    input.removeAttribute("checked");
  }
}

function resolveExplorerMode(state: any) {
  if (state.explorerModeFromUrl && !state.developerModeUrlDismissed) {
    return state.explorerModeFromUrl;
  }
  return ["standard", "advanced", "developer"].includes(
    state.explorerPreferences.mode,
  )
    ? state.explorerPreferences.mode
    : state.explorerPreferences.developerMode === true
      ? "developer"
      : "standard";
}

function resolveThemePreference(
  preferredTheme: string | undefined,
  fullDeveloperMode: boolean,
): "base" | "dark" | "light" | "retro" {
  if (preferredTheme === "base") return fullDeveloperMode ? "base" : "dark";
  return ["light", "retro"].includes(preferredTheme ?? "")
    ? (preferredTheme as "light" | "retro")
    : "dark";
}

function resolveChoiceElements(
  choices: (() => any[] | undefined) | undefined,
  selector: string,
) {
  const supplied = (choices?.() ?? []).filter(
    (choice) => choice && typeof choice === "object" && choice.isConnected,
  );
  if (Array.isArray(supplied) && supplied.length > 0) return supplied;
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll(selector));
}

export function renderThemeToggle(options: any) {
  const fullDeveloperMode = resolveExplorerMode(options.state()) === "developer";
  const theme = resolveThemePreference(
    options.state().explorerPreferences.theme,
    fullDeveloperMode,
  );
  void ensureThemeStyles(theme);
  document.documentElement.dataset.theme = theme;
  resolveChoiceElements(options.choices, ".theme-choice").forEach((choice: any) => {
    const selected = choice.dataset.theme === theme;
    choice.classList.toggle("is-active", selected);
    choice.setAttribute("aria-pressed", String(selected));
    choice.setAttribute("aria-checked", String(selected));
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    syncChoiceInputSelection(input, selected);
  });
  updateThemeColor();
}

export async function selectTheme(options: any, event: any) {
  const requestedTheme = event.currentTarget.dataset.theme;
  const theme =
    requestedTheme === "base" || ["light", "retro"].includes(requestedTheme)
      ? requestedTheme
      : "dark";
  await ensureThemeStyles(theme);
  options.savePreference("theme", theme);
  options.renderThemeToggle();
}

export function renderPixelFontToggle(options: any) {
  const enabled = options.state().explorerPreferences.pixelFont !== false;
  document.documentElement.toggleAttribute("data-pixel-font", enabled);
  if (enabled) delete document.documentElement.dataset.emojiFont;
  else document.documentElement.dataset.emojiFont = "system";
  resolveChoiceElements(options.choices, ".emoji-font-choice").forEach((choice: any) => {
    const selected =
      choice.dataset.emojiFont === (enabled ? "pixel" : "system");
    choice.classList.toggle("is-active", selected);
    choice.setAttribute("aria-checked", String(selected));
    choice.setAttribute("aria-pressed", String(selected));
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
  options.savePreference("pixelFont", pixelFont);
  options.renderPixelFontToggle();
  if (event?.detail > 0) event.currentTarget.blur();
}

export function createDeveloperModeController(options: any) {
  const mode = () => resolveExplorerMode(options.state());
  const enabled = () => mode() !== "standard";
  const fullEnabled = () => mode() === "developer";
  function render() {
    const active = enabled();
    const full = fullEnabled();
    document.documentElement.dataset.explorerMode = mode();
    document.documentElement.toggleAttribute("data-developer-mode", active);
    document.documentElement.toggleAttribute("data-full-developer-mode", full);
    const choices = resolveChoiceElements(options.choices, ".mode-choice");
    if (choices.length > 0) {
      choices.forEach((choice: any) => {
        const selected = choice.dataset.mode === mode();
        choice.classList.toggle("is-active", selected);
        choice.setAttribute("aria-pressed", String(selected));
        choice.setAttribute("aria-checked", String(selected));
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
        toggle.setAttribute("aria-checked", String(active));
      }
    }
  }
  function change(event: any) {
    const currentTarget =
      event.currentTarget?.closest?.(".mode-choice") ?? event.currentTarget;
    const hasChoices = (options.choices?.() ?? []).length > 0;
    const requestedMode =
      currentTarget?.dataset?.mode ??
      event.target?.value ??
      currentTarget?.querySelector?.('input[type="radio"]')?.value ??
      (hasChoices
        ? "standard"
        : currentTarget?.checked
          ? "developer"
          : "standard");
    const nextMode = ["standard", "advanced", "developer"].includes(
      requestedMode,
    )
      ? requestedMode
      : "standard";
    options.state().developerModeUrlDismissed = nextMode === "standard";
    options.state().explorerModeFromUrl = "";
    options.state().developerModeFromUrl = false;
    options.savePreference("mode", nextMode);
    options.savePreference("developerMode", nextMode === "developer");
    if (
      nextMode !== "developer" &&
      options.state().explorerPreferences.theme === "base"
    ) {
      options.savePreference("theme", "dark");
    }
    render();
    options.renderThemeToggle?.();
    if (nextMode !== "standard") void options.loadVersionData();
    if (
      nextMode !== "developer" &&
      options.dialog()?.classList?.contains?.("is-editor-view")
    ) {
      options.setDialogView("details");
    }
    if (nextMode === "standard" && options.dialog()?.open) {
      options.setDialogView("details");
    }
    if (nextMode === "standard") options.disableDeveloperFeatures();
    options.syncUrlState();
  }
  return { enabled, fullEnabled, render, change, mode };
}
import { ensureThemeStyles } from "./explorer/theme/theme-styles.js";
