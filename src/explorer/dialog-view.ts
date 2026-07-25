export function applyDialogView(options: {
  developerMode: boolean;
  dialog: HTMLElement;
  requestedMode: unknown;
  translate: (key: string, fallback: string) => string;
}) {
  const requested =
    options.requestedMode === true
      ? 'code'
      : options.requestedMode === false
        ? 'details'
        : ['details', 'code', 'editor'].includes(options.requestedMode as string)
          ? (options.requestedMode as string)
          : 'details';
  const mode = options.developerMode || requested === 'details' ? requested : 'details';
  const details = mode === 'details';
  options.dialog.classList.toggle('is-code-view', mode === 'code');
  options.dialog.classList.toggle('is-editor-view', mode === 'editor');
  const setHidden = (selector: string, hidden: boolean) => {
    const element = options.dialog.querySelector<HTMLElement>(selector);
    if (element) element.hidden = hidden;
  };
  setHidden('.emoji-dialog-details', !details);
  setHidden('.emoji-metadata', !details);
  setHidden('.emoji-copy-actions', !details);
  setHidden('.emoji-code-view', mode !== 'code');
  for (const selector of [
    '.emoji-composition',
    '.rendering-diagnostic',
    '.pixel-design-invitation'
  ]) {
    const element = options.dialog.querySelector<HTMLElement>(selector);
    if (element) {
      element.hidden =
        !details || !options.developerMode || element.dataset.available !== 'true';
    }
  }
  const eyebrow = options.dialog.querySelector<HTMLElement>('.emoji-dialog-eyebrow');
  const [key, fallback] =
    mode === 'code'
      ? ['codeExample', 'Code example']
      : mode === 'editor'
        ? ['pixelEditor', 'Pixel editor']
        : ['emojiDetails', 'Emoji details'];
  if (eyebrow) {
    eyebrow.dataset.i18n = key;
    eyebrow.textContent = options.translate(key, fallback);
  }
  return { mode, showDetails: details };
}

export function loadStylesheet(href: string, id: string) {
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) {
    return existing.sheet
      ? Promise.resolve(existing)
      : new Promise(resolve =>
          existing.addEventListener('load', () => resolve(existing), {
            once: true
          })
        );
  }
  const stylesheet = document.createElement('link');
  stylesheet.id = id;
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
  return new Promise((resolve, reject) => {
    stylesheet.addEventListener('load', () => resolve(stylesheet), {
      once: true
    });
    stylesheet.addEventListener('error', reject, { once: true });
  });
}
