// @ts-nocheck -- Transitional TypeScript migration.
import { CELL_SIZE, EGA_COLORS } from "../core/pixel-editor-constants.js";
import { syncRovingGrid } from "../core/pixel-editor-grid-navigation.js";
import { findSkinTone, skinToneCycle } from "./pixel-editor-skin-tone.js";

export function createPixelEditorPaletteController(options) {
  const {
    getPixels,
    getSelectedColor,
    getSelectedSkinTone,
    getTraceAlpha,
    getTraceCanvas,
    nearestPaletteColor,
    paletteButtons,
    setSelectedColor,
    setSelectedSkinTone,
    translate,
    view,
  } = options;

  function pickColor(point) {
    const offset = options.pixelOffset(point.x, point.y);
    let [red, green, blue, alpha] = getPixels().slice(offset, offset + 4);
    if (alpha === 0 && Number(getTraceAlpha().value) > 0) {
      [red, green, blue, alpha] = getTraceCanvas()
        .getContext("2d")
        .getImageData(point.x, point.y, 1, 1).data;
    }
    setSelectedColor(
      alpha === 0
        ? "transparent"
        : nearestPaletteColor(red, green, blue, activePaletteColors()),
    );
    setSelectedSkinTone("");
    if (getSelectedColor() !== "transparent") {
      const activeToneButtons = paletteButtons.filter(
        (button) => button.dataset.skinTone && !button.hidden,
      );
      const matchingButton =
        activeToneButtons.find((button) => {
          const tone = findSkinTone(button.dataset.skinTone);
          return tone?.color === getSelectedColor();
        }) ??
        activeToneButtons.find((button) =>
          skinToneCycle(button.dataset.skinTone).some(
            (shade) => shade.color === getSelectedColor(),
          ),
        );
      if (matchingButton) {
        const cycle = skinToneCycle(matchingButton.dataset.skinTone);
        const cycleIndex = cycle.findIndex(
          (shade) => shade.color === getSelectedColor(),
        );
        setSelectedSkinTone(matchingButton.dataset.skinTone);
        setSkinToneShade(matchingButton, Math.max(0, cycleIndex));
      }
    }
    updatePaletteSelection();
  }

  function activePaletteColors() {
    return [
      ...EGA_COLORS,
      ...paletteButtons
        .filter((button) => button.dataset.skinTone && !button.hidden)
        .flatMap((button) =>
          skinToneCycle(button.dataset.skinTone).map((shade) => shade.color),
        ),
    ];
  }

  function updateSkinTonePalette(codePoints = []) {
    const previousSkinTone = getSelectedSkinTone();
    const previousButton = paletteButtons.find(
      (button) => button.dataset.skinTone === previousSkinTone,
    );
    const previousCycleIndex = Number(previousButton?.dataset.cycleIndex ?? 0);
    const activeCodePoints = new Set(
      codePoints.map((codePoint) => codePoint.toUpperCase()),
    );
    const activeButtons = paletteButtons.filter((button) => {
      if (!button.dataset.skinTone) return false;
      button.hidden = !activeCodePoints.has(button.dataset.skinTone);
      button.style.removeProperty("grid-column"); delete button.dataset.gridColumn; delete button.dataset.gridRow;
      if (button.hidden) setSkinToneShade(button, 0);
      else updateSkinToneShadeLabel(button);
      return !button.hidden;
    });
    const palette = view.querySelector(".pixel-editor-palette");
    palette.classList.toggle("has-one-skin-tone", activeButtons.length === 1);
    palette.classList.toggle(
      "has-multiple-skin-tones",
      activeButtons.length > 1,
    );
    if (activeButtons.length > 1) {
      const firstColumn = Math.floor((9 - activeButtons.length) / 2) + 1;
      activeButtons.forEach((button, index) => {
        button.style.gridColumn = String(firstColumn + index);
        button.dataset.gridColumn = String(firstColumn + index);
        button.dataset.gridRow = "3";
      });
    } else if (activeButtons.length === 1) {
      activeButtons[0].dataset.gridColumn = "9";
      activeButtons[0].dataset.gridRow = "2";
    }
    if (previousSkinTone) {
      const nextButton =
        activeButtons.find(
          (button) => button.dataset.skinTone === previousSkinTone,
        ) ?? activeButtons[0];
      if (nextButton) {
        setSelectedSkinTone(nextButton.dataset.skinTone);
        const nextCycleIndex =
          nextButton.dataset.skinTone === previousSkinTone
            ? Math.min(
                previousCycleIndex,
                skinToneCycle(nextButton.dataset.skinTone).length - 1,
              )
            : 0;
        setSkinToneShade(nextButton, nextCycleIndex);
        setSelectedColor(
          skinToneCycle(nextButton.dataset.skinTone)[nextCycleIndex].color,
        );
      } else {
        setSelectedColor("transparent");
      }
    } else if (
      getSelectedColor() !== "transparent" &&
      !activePaletteColors().includes(getSelectedColor())
    ) {
      setSelectedColor("transparent");
    }
    updatePaletteSelection();
  }

  function selectPaletteColor(button) {
    if (button.dataset.transparent === "true") {
      setSelectedColor("transparent");
      setSelectedSkinTone("");
    } else if (button.dataset.skinTone) {
      const cycle = skinToneCycle(button.dataset.skinTone);
      const currentIndex = Number(button.dataset.cycleIndex ?? 0);
      const nextIndex =
        getSelectedSkinTone() === button.dataset.skinTone
          ? (currentIndex + 1) % cycle.length
          : 0;
      setSelectedSkinTone(button.dataset.skinTone);
      setSkinToneShade(button, nextIndex);
      setSelectedColor(cycle[nextIndex].color);
    } else {
      setSelectedColor(button.dataset.color);
      setSelectedSkinTone("");
    }
    updatePaletteSelection();
  }

  function updatePaletteSelection() {
    paletteButtons.forEach((button) => {
      const selected = button.dataset.skinTone
        ? getSelectedSkinTone() === button.dataset.skinTone
        : button.dataset.transparent === "true"
          ? getSelectedColor() === "transparent"
          : button.dataset.color === getSelectedColor();
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    syncRovingGrid(
      paletteButtons,
      paletteButtons.find(
        (button) => button.getAttribute("aria-pressed") === "true",
      ),
    );
  }

  function setSkinToneShade(button, cycleIndex) {
    const cycle = skinToneCycle(button.dataset.skinTone);
    const shade = cycle[cycleIndex] ?? cycle[0];
    button.dataset.cycleIndex = String(cycleIndex);
    button.dataset.shade = shade.kind;
    button.dataset.color = shade.color;
    button.style.setProperty("--swatch", shade.color);
    updateSkinToneShadeLabel(button);
  }

  function updateSkinToneShadeLabel(button) {
    const tone = findSkinTone(button.dataset.skinTone);
    const cycle = skinToneCycle(button.dataset.skinTone);
    const shade = cycle[Number(button.dataset.cycleIndex ?? 0)] ?? cycle[0];
    if (!tone || !shade) return;
    const toneLabel = translate(tone.translationKey, tone.fallback);
    const shadeLabels = {
      normal: translate("normalColor", "Normal color"),
      lighter: translate("lighterColor", "Lighter color"),
      darker: translate("darkerColor", "Darker color"),
    };
    const label = `${toneLabel} — ${shadeLabels[shade.kind]}`;
    button.setAttribute("aria-label", label);
    button.title = label;
  }

  return {
    activePaletteColors,
    pickColor,
    selectPaletteColor,
    updatePaletteSelection,
    updateSkinTonePalette,
  };
}
