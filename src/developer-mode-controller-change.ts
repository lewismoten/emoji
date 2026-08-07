import { DeveloperModeControllerOptions } from "./developer-mode-controller-options.js";
import * as preferences from "./preferences.js";
import { renderThemeToggle } from "./render-theme-toggle.js";
import * as doc from "./utils/document.js";
import * as state from "./state.js";

const buildHandler = (
  options: DeveloperModeControllerOptions,
  render: () => void,
) => {
  const handler = (event: any) => {
    const currentTarget =
      event.currentTarget?.closest?.(".mode-choice") ??
      event.target?.closest?.(".mode-choice") ??
      event.currentTarget;
    const hasChoices = doc.all("mode-choice").length !== 0;
    const requestedMode =
      currentTarget?.dataset?.mode ??
      event.target?.value ??
      currentTarget?.querySelector?.('input[type="radio"]')?.value ??
      (hasChoices
        ? "standard"
        : currentTarget?.checked
          ? "developer"
          : "standard");
    const nextMode = ["standard", "advanced", "developer"].includes(
      requestedMode,
    )
      ? requestedMode
      : "standard";
    state.developerModeUrlDismissed.set(nextMode === "standard");
    state.explorerModeFromUrl.set(nextMode);
    state.developerModeFromUrl.set(false);
    preferences.setString("mode", nextMode);
    if (nextMode !== "developer" && preferences.getString("theme") === "base") {
      preferences.setString("theme", "dark");
    }
    render();
    renderThemeToggle();
    if (nextMode !== "standard") void options.loadVersionData();
    if (
      nextMode !== "developer" &&
      options.dialog()?.classList?.contains?.("is-editor-view")
    ) {
      options.setDialogView("details");
    }
    if (nextMode === "standard" && options.dialog()?.open) {
      options.setDialogView("details");
    }
    if (nextMode === "standard") options.disableDeveloperFeatures();
    options.syncUrlState();
  };
  return handler;
};

export default buildHandler;
