export function installPixelFontHotReload(options: any) {
  if (!import.meta.hot) return;
  let revision: string | undefined;
  let refreshInFlight = false;
  let refreshQueued = false;
  const refresh = async (refreshInitial = false) => {
    if (refreshInFlight) {
      refreshQueued = true;
      return;
    }
    if (document.hidden && !refreshInitial) return;
    refreshInFlight = true;
    try {
      const response = await fetch(
        `./pixel-font/font-build.revision?cache=${Date.now()}`,
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const nextRevision = (await response.text()).trim();
      if (!nextRevision || nextRevision === revision) return;
      const initial = revision === undefined;
      revision = nextRevision;
      if (!initial || refreshInitial) options.refreshStylesheet(nextRevision);
    } catch {
      // The revision file exists only while developing the pixel font.
    } finally {
      refreshInFlight = false;
      if (refreshQueued) {
        refreshQueued = false;
        void refresh();
      }
    }
  };
  import.meta.hot.on("pixel-font:updated", () => void refresh(true));
  void refresh(true);
  window.setInterval(refresh, 5000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void refresh();
  });
}

export function refreshPixelFontStylesheet(options: any, revision: string) {
  const stylesheet = document.querySelector<HTMLLinkElement>(
    "#pixel-font-stylesheet",
  );
  if (!stylesheet || stylesheet.dataset.revision === revision) return;
  const replacement = stylesheet.cloneNode() as HTMLLinkElement;
  const url = new URL(stylesheet.href);
  url.searchParams.set("v", revision);
  replacement.href = url.href;
  replacement.dataset.revision = revision;
  stylesheet.removeAttribute("id");
  stylesheet.after(replacement);
  replacement.addEventListener(
    "load",
    () => {
      stylesheet.remove();
      options.onStylesheetLoaded(revision);
    },
    { once: true },
  );
}

export async function refreshExplorerPixelFont(options: any, revision: string) {
  try {
    const response = await fetch(
      `./pixel-font/build/manifest.json?v=${revision}`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Pixel font manifest is unavailable");
    options.updateManifest(await response.json(), revision);
    const jobs: Array<() => void> = [];
    document.querySelectorAll("[data-emoji-key]").forEach((cell: any) => {
      jobs.push(() =>
        options.applyArtwork(
          cell.querySelector(".emoji-glyph"),
          cell.dataset.emojiKey,
        ),
      );
    });
    options
      .dialog()
      ?.querySelectorAll("[data-composition-emoji]")
      .forEach((part: any) => {
        jobs.push(() =>
          options.applyArtwork(
            part.querySelector(".emoji-composition-glyph"),
            part.dataset.compositionEmoji,
          ),
        );
      });
    options
      .dialog()
      ?.querySelectorAll("[data-composition-artwork]")
      .forEach((part: any) => {
        jobs.push(() =>
          options.applyStandaloneArtwork(
            part.querySelector(".emoji-composition-glyph"),
            part.dataset.compositionArtwork,
            Number(part.dataset.compositionPoint),
          ),
        );
      });
    await runPixelFontJobs(jobs);
    options.applyArtwork(
      options.dialog()?.querySelector(".emoji-preview-glyph"),
      options.currentEmojiKey(),
    );
    options.applyArtwork(
      options
        .dialog()
        ?.querySelector(".emoji-composition-result .emoji-composition-glyph"),
      options.currentEmojiKey(),
    );
    options.updateModifierArtwork();
  } catch (error) {
    console.warn("Pixel font result refresh unavailable", error);
  }
}

async function runPixelFontJobs(jobs: Array<() => void>) {
  const batchSize = 120;
  for (let index = 0; index < jobs.length; index += batchSize) {
    jobs.slice(index, index + batchSize).forEach((job) => job());
    if (index + batchSize < jobs.length) {
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );
    }
  }
}
