export function observeToolbarHeight(toolbar: HTMLElement) {
  const setHeight = (height: number) =>
    document.documentElement.style.setProperty('--toolbar-height', `${height}px`);
  if (window.ResizeObserver) {
    new window.ResizeObserver(([entry]) => {
      const borderBox = Array.isArray(entry.borderBoxSize)
        ? entry.borderBoxSize[0]
        : entry.borderBoxSize;
      setHeight(borderBox?.blockSize ?? entry.contentRect.height);
    }).observe(toolbar);
    return;
  }
  const measure = () =>
    window.requestAnimationFrame(() => setHeight(toolbar.offsetHeight));
  measure();
  window.addEventListener('resize', measure);
}
