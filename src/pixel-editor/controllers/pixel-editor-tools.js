import { TOOLS } from "../pixel-editor-constants.js";
import { currentColorValue, drawLineOnPixels, drawShapeOnPixels, floodFillPixels, paintPixelInto } from "../pixel-editor-geometry-helpers.js";
import { syncRovingGrid } from "../pixel-editor-grid-navigation.js";

export function createPixelEditorToolController(options) {
  const {
    fillShapesEnabled,
    getPixels,
    getSelectedColor,
    getTool,
    renderController,
    selection,
    setFillShapesEnabled,
    setTool,
    toolButtons,
    translate,
  } = options;

  function currentColor() {
    return currentColorValue(getSelectedColor());
  }

  function paintPixel(point, color = currentColor()) {
    paintPixelInto(getPixels(), point, color);
  }

  function drawLine(start, end) {
    drawLineOnPixels(getPixels(), start, end, currentColor());
  }

  function drawShape(start, end, shape) {
    drawShapeOnPixels(
      getPixels(),
      start,
      end,
      shape,
      currentColor(),
      fillShapesEnabled(),
    );
  }

  function floodFill(start) {
    floodFillPixels(getPixels(), start, currentColor());
  }

  function updateShapeToolButtons() {
    for (const shape of ["rectangle", "ellipse"]) {
      const button = toolButtons.find(
        (candidate) => candidate.dataset.tool === shape,
      );
      const filled = fillShapesEnabled();
      button.querySelector("[aria-hidden]").textContent =
        shape === "rectangle" ? (filled ? "⬛" : "🔲") : filled ? "🔴" : "⭕";
      const key =
        shape === "rectangle"
          ? filled
            ? "filledRectangle"
            : "outlineRectangle"
          : filled
            ? "filledEllipse"
            : "outlineEllipse";
      const fallback =
        shape === "rectangle"
          ? filled
            ? "Filled rectangle"
            : "Outline rectangle"
          : filled
            ? "Filled ellipse"
            : "Outline ellipse";
      const label = translate(key, fallback);
      button.setAttribute("aria-label", label);
      button.title = label;
    }
  }

  function selectTool(nextTool) {
    if (!TOOLS.includes(nextTool) || options.hasFloatingLayer()) return;
    if (
      nextTool === getTool() &&
      (nextTool === "rectangle" || nextTool === "ellipse")
    ) {
      setFillShapesEnabled(!fillShapesEnabled());
      updateShapeToolButtons();
      renderController.draw();
      return;
    }
    if (nextTool !== "select") selection(undefined);
    setTool(nextTool);
    toolButtons.forEach((button) => {
      const selected = button.dataset.tool === getTool();
      button.setAttribute("aria-pressed", String(selected));
      button.classList.toggle("is-active", selected);
    });
    syncRovingGrid(
      toolButtons,
      toolButtons.find((button) => button.dataset.tool === getTool()),
    );
    updateShapeToolButtons();
    renderController.draw();
  }

  return {
    currentColor,
    drawLine,
    drawShape,
    floodFill,
    paintPixel,
    selectTool,
    updateShapeToolButtons,
  };
}
