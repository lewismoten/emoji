/** Manage the compact toggle for the two version filtering modes. */
export function createVersionModeController(options: any) {
  const selector = () =>
    options.selector?.() ??
    ((typeof document === "undefined"
      ? undefined
      : document.querySelector?.(".select-version-mode")) as
      HTMLSelectElement | undefined);
  const toggle = () =>
    options.toggle?.() ??
    ((typeof document === "undefined"
      ? undefined
      : document.querySelector?.(".version-mode-toggle")) as
      HTMLElement | undefined);

  function populateOptions() {
    const modeSelector = selector();
    if (!modeSelector) return;
    const previousValue = options.definitions.some(
      (mode: any) => mode.value === modeSelector.value,
    )
      ? modeSelector.value
      : "through";
    modeSelector.replaceChildren(
      ...options.definitions.map((mode: any) => {
        const option = document.createElement("option");
        option.value = mode.value;
        option.textContent = options.translate(mode.key, mode.fallback);
        return option;
      }),
    );
    modeSelector.value = previousValue;
  }

  function render() {
    const toggleButton = toggle();
    const modeSelector = selector();
    if (!toggleButton || !modeSelector) return;
    populateOptions();
    const selected = modeSelector.value === "selected";
    const label = options.translate(
      "selectedVersionOnly",
      "Selected version only",
    );
    toggleButton.setAttribute("aria-pressed", String(selected));
    toggleButton.setAttribute("aria-label", label);
    toggleButton.title = label;
    const input = toggleButton.querySelector?.(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    if (input) {
      input.checked = selected;
      input.tabIndex = -1;
    }
  }

  function toggleVersionMode(event: any) {
    event?.preventDefault?.();
    const modeSelector = selector();
    if (!modeSelector) return;
    modeSelector.value =
      modeSelector.value === "selected" ? "through" : "selected";
    options.syncUrlState?.();
    render();
    options.renderCategoryFilters();
    options.drawList();
    if (event?.detail > 0) event.currentTarget.blur();
  }

  return { populateOptions, render, toggle: toggleVersionMode };
}
