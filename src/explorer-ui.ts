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

function resolveThemePreference(preferredTheme: string | undefined, developerMode: boolean) {
  if (preferredTheme === "base") return developerMode ? "base" : "dark";
  return ["light", "retro"].includes(preferredTheme ?? "")
    ? preferredTheme
    : "dark";
}

export function renderThemeToggle(options: any) {
  const developerMode = document.documentElement.hasAttribute("data-developer-mode");
  const theme = resolveThemePreference(
    options.state().explorerPreferences.theme,
    developerMode,
  );
  document.documentElement.dataset.theme = theme;
  options.choices().forEach((choice: any) => {
    const selected = choice.dataset.theme === theme;
    choice.classList.toggle("is-active", selected);
    choice.setAttribute("aria-pressed", String(selected));
    choice.setAttribute("aria-checked", String(selected));
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector('input[type="radio"]') as HTMLInputElement | null;
    if (input) {
      input.checked = selected;
      input.tabIndex = -1;
    }
  });
  updateThemeColor();
}

export function selectTheme(options: any, event: any) {
  const requestedTheme = event.currentTarget.dataset.theme;
  const theme =
    requestedTheme === "base" ||
    ["light", "retro"].includes(requestedTheme)
      ? requestedTheme
      : "dark";
  options.savePreference("theme", theme);
  options.renderThemeToggle();
}

export function renderPixelFontToggle(options: any) {
  const enabled = options.state().explorerPreferences.pixelFont !== false;
  document.documentElement.toggleAttribute("data-pixel-font", enabled);
  if (enabled) delete document.documentElement.dataset.emojiFont;
  else document.documentElement.dataset.emojiFont = "system";
  options.choices().forEach((choice: any) => {
    const selected =
      choice.dataset.emojiFont === (enabled ? "pixel" : "system");
    choice.classList.toggle("is-active", selected);
    choice.setAttribute("aria-checked", String(selected));
    choice.setAttribute("aria-pressed", String(selected));
    choice.tabIndex = selected ? 0 : -1;
    const input = choice.querySelector('input[type="radio"]') as HTMLInputElement | null;
    if (input) {
      input.checked = selected;
      input.tabIndex = -1;
    }
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
  const enabled = () =>
    (options.state().developerModeFromUrl &&
      !options.state().developerModeUrlDismissed) ||
    options.state().explorerPreferences.developerMode === true;
  function render() {
    const active = enabled();
    document.documentElement.toggleAttribute("data-developer-mode", active);
    const toggle = options.toggle();
    if (toggle) {
      toggle.checked = active;
      toggle.setAttribute("aria-checked", String(active));
    }
  }
  function change(event: any) {
    const active = event.currentTarget.checked;
    options.state().developerModeUrlDismissed = !active;
    options.state().developerModeFromUrl = false;
    options.savePreference("developerMode", active);
    if (!active && options.state().explorerPreferences.theme === "base") {
      options.savePreference("theme", "dark");
    }
    render();
    options.renderThemeToggle?.();
    if (active) void options.loadVersionData();
    if (!active && options.dialog()?.open) options.setDialogView("details");
    if (!active) options.disableDeveloperFeatures();
    options.syncUrlState();
  }
  return { enabled, render, change };
}
