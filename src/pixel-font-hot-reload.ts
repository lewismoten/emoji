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

export async function refreshExplorerPixelFont(options: any, revision: string) {
  try {
    const response = await fetch(`./pixel-font/build/manifest.json?v=${revision}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Pixel font manifest is unavailable');
    options.updateManifest(await response.json(), revision);
    document.querySelectorAll('[data-emoji-key]').forEach((cell: any) =>
      options.applyArtwork(cell.querySelector('.emoji-glyph'), cell.dataset.emojiKey)
    );
    options.applyArtwork(
      options.dialog()?.querySelector('.emoji-preview-glyph'),
      options.currentEmojiKey()
    );
    options.applyArtwork(
      options.dialog()?.querySelector('.emoji-composition-result .emoji-composition-glyph'),
      options.currentEmojiKey()
    );
    options.dialog()?.querySelectorAll('[data-composition-emoji]').forEach((part: any) =>
      options.applyArtwork(part.querySelector('.emoji-composition-glyph'), part.dataset.compositionEmoji)
    );
    options.dialog()?.querySelectorAll('[data-composition-artwork]').forEach((part: any) =>
      options.applyStandaloneArtwork(
        part.querySelector('.emoji-composition-glyph'),
        part.dataset.compositionArtwork,
        Number(part.dataset.compositionPoint)
      )
    );
    options.updateModifierArtwork();
  } catch (error) {
    console.warn('Pixel font result refresh unavailable', error);
  }
}
