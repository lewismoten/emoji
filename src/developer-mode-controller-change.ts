import { DeveloperModeControllerOptions } from "./developer-mode-controller-options.js";
import * as preferences from "./preferences.js";

const buildHandler = (
  options: DeveloperModeControllerOptions,
  render: () => void,
) => {
  const handler = (event: any) => {
    const currentTarget =
      event.currentTarget?.closest?.(".mode-choice") ?? event.currentTarget;
    const hasChoices = (options.choices?.() ?? []).length > 0;
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
    options.state().developerModeUrlDismissed = nextMode === "standard";
    options.state().explorerModeFromUrl = nextMode;
    options.state().developerModeFromUrl = false;
    preferences.setString("mode", nextMode);
    if (nextMode !== "developer" && preferences.getString("theme") === "base") {
      preferences.setString("theme", "dark");
    }
    render();
    options.renderThemeToggle?.();
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
