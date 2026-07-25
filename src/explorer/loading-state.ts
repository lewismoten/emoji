export function finishExplorerLoading(options: {
  applyPixelArtworkClass: (element: HTMLElement, emojiKey: string) => void;
  emojiByKey: Record<string, string>;
  emojiList: HTMLElement;
  matchCount: HTMLElement;
  revealExplorer: () => void;
}) {
  if (options.emojiList.dataset.rendering !== 'true') options.revealExplorer();
  options.matchCount.closest<HTMLElement>('.result-count')!.hidden = false;
  const comparison = document.querySelector<HTMLElement>('.pixel-comparison-custom');
  if (comparison) {
    comparison.textContent = options.emojiByKey.grinningFace ?? '😀';
    options.applyPixelArtworkClass(comparison, 'grinningFace');
  }
}

export function revealExplorer(emojiList: HTMLElement, matchCount: HTMLElement) {
  document.documentElement.classList.remove('app-loading');
  emojiList.classList.remove('is-loading');
  emojiList.setAttribute('aria-busy', 'false');
  matchCount.closest<HTMLElement>('.result-count')!.hidden = false;
}
