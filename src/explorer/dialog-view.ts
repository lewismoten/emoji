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

export function createEmojiDialogViewController(options: {
  currentEmojiKey: () => string;
  developerModeEnabled: () => boolean;
  dialog: () => any;
  emojiByKey: () => Record<string, string>;
  emojiParent: () => HTMLElement | undefined;
  ensurePixelEditor: () => Promise<unknown>;
  getPixelEditor: () => any;
  loadPackageManifest: () => Promise<unknown>;
  syncUrlState: () => void;
  translate: (key: string, fallback: string) => string;
  updateCompositionBackButton: () => void;
  updateImportExamples: (item: unknown) => void;
  byId: () => Record<string, unknown>;
}) {
  function setView(requestedMode: unknown, updateUrl = true) {
    const dialog = options.dialog();
    const { mode, showDetails } = applyDialogView({
      developerMode: options.developerModeEnabled(),
      dialog,
      requestedMode,
      translate: options.translate
    });
    const key = options.currentEmojiKey();
    if (mode === 'code' && key) {
      options.updateImportExamples(options.byId()[key] ?? {});
      void options.loadPackageManifest().then(() => {
        if (
          options.currentEmojiKey() &&
          dialog.classList.contains('is-code-view')
        ) {
          options.updateImportExamples(options.byId()[options.currentEmojiKey()] ?? {});
        }
      });
    }
    const modeBack = dialog.querySelector('.dialog-mode-back') as HTMLElement | null;
    if (modeBack) modeBack.hidden = showDetails;
    const parent = options.emojiParent();
    if (!showDetails && parent) parent.hidden = true;
    else if (showDetails) options.updateCompositionBackButton();
    const editor = options.getPixelEditor();
    if (editor) {
      editor.element.hidden = mode !== 'editor';
      if (mode === 'editor' && key) editor.open(key, options.emojiByKey()[key]);
    } else if (mode === 'editor') {
      void options.ensurePixelEditor();
    }
    if (updateUrl && dialog.open) options.syncUrlState();
  }

  function focusInitialAction() {
    const dialog = options.dialog();
    const target = dialog.classList.contains('is-code-view')
      ? dialog.querySelector('[data-copy="code"]')
      : dialog.querySelector('.emoji-preview');
    target?.focus({ preventScroll: true });
  }

  return { focusInitialAction, setView };
}
