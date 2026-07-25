export function installPixelFontHotReload(options: any) {
  if (!import.meta.hot) return;
  let revision: string | undefined;
  const refresh = async (refreshInitial = false) => {
    try {
      const response = await fetch(
        `./pixel-font/font-build.revision?cache=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (!response.ok) return;
      const nextRevision = (await response.text()).trim();
      if (!nextRevision || nextRevision === revision) return;
      const initial = revision === undefined;
      revision = nextRevision;
      if (!initial || refreshInitial) options.refreshStylesheet(nextRevision);
    } catch {
      // The revision file exists only while developing the pixel font.
    }
  };
  import.meta.hot.on('pixel-font:updated', () => void refresh(true));
  void refresh(true);
  window.setInterval(refresh, 1500);
}

export function refreshPixelFontStylesheet(options: any, revision: string) {
  const stylesheet = document.querySelector<HTMLLinkElement>('#pixel-font-stylesheet');
  if (!stylesheet || stylesheet.dataset.revision === revision) return;
  const replacement = stylesheet.cloneNode() as HTMLLinkElement;
  const url = new URL(stylesheet.href);
  url.searchParams.set('v', revision);
  replacement.href = url.href;
  replacement.dataset.revision = revision;
  stylesheet.removeAttribute('id');
  stylesheet.after(replacement);
  replacement.addEventListener('load', () => {
    stylesheet.remove();
    options.onStylesheetLoaded(revision);
  }, { once: true });
}
