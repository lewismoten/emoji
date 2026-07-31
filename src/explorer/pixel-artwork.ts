export function createPixelArtworkManager(options: any) {
  let paintedKeys = new Set<string>();
  let proposedKeys = new Set<string>();
  let privateUseByKey = new Map<string, number>();
  let measureContext: CanvasRenderingContext2D | null | undefined;
  let referenceWidth: number | undefined;
  const modifierEmojiKeys: Record<string, string> = {
    male: "man",
    female: "woman",
    neutral: "person",
    "1F9B0": "personRedHair",
    "1F9B1": "personCurlyHair",
    "1F9B2": "personBald",
    "1F9B3": "personWhiteHair",
  };

  const systemEmojiAppearsSplit = (value: string) => {
    measureContext ??= document.createElement("canvas").getContext("2d");
    if (!measureContext) return false;
    measureContext.font =
      '32px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
    referenceWidth ??= measureContext.measureText("😀").width;
    return (
      referenceWidth > 0 &&
      measureContext.measureText(value).width > referenceWidth * 1.45
    );
  };

  const renderedPixelEmoji = (emojiKey: string) => {
    const value =
      options.emojiByKey()[emojiKey] ?? options.byId()[emojiKey]?.emoji ?? "";
    const privateUsePoint = privateUseByKey.get(emojiKey);
    if (!value || !privateUsePoint) return value;
    if (
      options.pixelFontPreferred() ||
      proposedKeys.has(emojiKey) ||
      systemEmojiAppearsSplit(value)
    ) {
      return String.fromCodePoint(privateUsePoint);
    }
    return value;
  };

  const applyPixelArtworkClass = (
    element: HTMLElement | undefined,
    emojiKey: string,
  ) => {
    if (!element) return;
    const painted = Boolean(emojiKey && paintedKeys.has(emojiKey));
    element.classList.toggle("has-pixel-art", painted);
    element.classList.toggle(
      "has-proposed-pixel-art",
      Boolean(emojiKey && proposedKeys.has(emojiKey)),
    );
    if (painted) {
      element.dataset.pixelEmojiKey = emojiKey;
      element.textContent = renderedPixelEmoji(emojiKey);
    } else {
      delete element.dataset.pixelEmojiKey;
    }
  };

  const updatePixelArtworkManifest = (manifest: any) => {
    const glyphs = manifest.fields
      ? (manifest.glyphs ?? []).map((row: any[]) =>
          Object.fromEntries(
            manifest.fields.map((field: string, index: number) => [
              field,
              row[index],
            ]),
          ),
        )
      : (manifest.glyphs ?? []);
    paintedKeys = new Set(glyphs.map((glyph: any) => glyph.key));
    privateUseByKey = new Map(
      glyphs
        .filter((glyph: any) => glyph.privateUseCodePoint)
        .map((glyph: any) => [
          glyph.key,
          Number.parseInt(glyph.privateUseCodePoint, 16),
        ]),
    );
    proposedKeys = new Set(
      glyphs
        .filter((glyph: any) => glyph.releaseStatus === "proposed")
        .map((glyph: any) => glyph.key),
    );
    const comparison = document.querySelector<HTMLElement>(
      ".pixel-comparison-custom",
    );
    if (comparison) applyPixelArtworkClass(comparison, "grinningFace");
  };

  const updateRenderingDiagnostic = (emojiKey: string, value: string) =>
    options.updateRenderingDiagnostic({
      applyPixelArtworkClass,
      emojiKey,
      emojiValue: value,
      painted: paintedKeys.has(emojiKey),
      privateUsePoint: privateUseByKey.get(emojiKey),
      systemEmojiAppearsSplit,
    });

  const refreshRenderedPixelEmoji = () => {
    document
      .querySelectorAll<HTMLElement>("[data-pixel-emoji-key]")
      .forEach((element) => {
        applyPixelArtworkClass(element, element.dataset.pixelEmojiKey ?? "");
      });
    options.refreshEditor();
  };

  const resolveModifierEmojiKey = (value: string) => {
    const semanticKey = modifierEmojiKeys[value];
    if (semanticKey) return semanticKey;
    const normalized = options.normalizeCodePoints(value);
    return (
      options.emojiKeyByCodePoints().get(normalized) ??
      options.emojiKeyByCodePoints().get(`${normalized} FE0F`) ??
      options.emojiKeyByCodePoints().get(normalized.replace(/ FE0F$/u, "")) ??
      ""
    );
  };

  const updateModifierPixelArtwork = () => {
    [
      ...options.skinToneCheckboxes(),
      ...options.hairCheckboxes(),
      ...options.genderCheckboxes(),
    ].forEach((checkbox: HTMLInputElement) => {
      const emojiKey = resolveModifierEmojiKey(checkbox.value);
      applyPixelArtworkClass(
        checkbox
          .closest("label")
          ?.querySelector<HTMLElement>(".modifier-emoji") ?? undefined,
        emojiKey ?? "",
      );
    });
  };

  return {
    applyPixelArtworkClass,
    refreshRenderedPixelEmoji,
    renderedPixelEmoji,
    systemEmojiAppearsSplit,
    updateModifierPixelArtwork,
    updatePixelArtworkManifest,
    updateRenderingDiagnostic,
  };
}
