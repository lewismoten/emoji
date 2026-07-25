export function createExplorerUiController(options: any) {
  const translate = (key: string, fallback: string) =>
    options.state().uiStrings[key] ?? fallback;

  function updateOnlineStatus() {
    const status = options.offlineStatus();
    if (!status) return;
    status.textContent = translate('offlineStatus', 'Offline — showing saved data');
    status.hidden = navigator.onLine;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((element: any) => {
      element.textContent = translate(element.dataset.i18n, element.textContent);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element: any) => {
      element.placeholder = translate(element.dataset.i18nPlaceholder, element.placeholder);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((element: any) => {
      element.setAttribute('aria-label', translate(
        element.dataset.i18nAriaLabel,
        element.getAttribute('aria-label')
      ));
    });
    updateOnlineStatus();
    options.renderPixelFontToggle();
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
      renderInstallAppButton
    });
    options.setDeferredInstallPrompt(result.deferredInstallPrompt);
  }

  async function loadUiTranslations(locale: string, rtl = false) {
    const base = locale.split('-')[0];
    try {
      const codes = locale === base ? [base] : [base, locale];
      const packs = await Promise.all(codes.map(async code => {
        const response = await fetch(`demo-locales/${code}.json`);
        if (!response.ok) throw new Error(`No demo locale for ${code}`);
        return response.json();
      }));
      options.state().uiStrings = Object.assign({}, ...packs);
      document.documentElement.lang = locale;
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    } catch {
      options.state().uiStrings = {};
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
    const name = translate('title', 'Emoji Explorer');
    document.title = `${name} – Unicode Emoji`;
    for (const metaName of ['application-name', 'apple-mobile-web-app-title']) {
      const meta = document.querySelector(`meta[name="${metaName}"]`) as HTMLMetaElement | null;
      if (meta) meta.content = name;
    }
    applyTranslations();
    options.renderVersionModeToggle();
    options.renderSearchLanguages();
  }

  return { applyTranslations, installApp, loadUiTranslations, renderInstallAppButton, updateOnlineStatus };
}

export function renderPixelFontToggle(options: any) {
  const enabled = options.state().explorerPreferences.pixelFont !== false;
  document.documentElement.toggleAttribute('data-pixel-font', enabled);
  if (enabled) delete document.documentElement.dataset.emojiFont;
  else document.documentElement.dataset.emojiFont = 'system';
  options.choices().forEach((choice: any) => {
    const selected = choice.dataset.emojiFont === (enabled ? 'pixel' : 'system');
    choice.setAttribute('aria-pressed', String(selected));
  });
  options.refreshRenderedPixelEmoji();
}

export function selectEmojiFont(options: any, event: any) {
  const pixelFont = event.currentTarget.dataset.emojiFont === 'pixel';
  options.savePreference('pixelFont', pixelFont);
  options.renderPixelFontToggle();
  if (event?.detail > 0) event.currentTarget.blur();
}
