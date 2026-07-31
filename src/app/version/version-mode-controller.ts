/** Manage the compact toggle for the two version filtering modes. */
export function createVersionModeController(options: any) {
  function populateOptions() {
    const selector = options.selector();
    const previousValue = options.definitions.some(
      (mode: any) => mode.value === selector.value,
    )
      ? selector.value
      : "through";
    selector.replaceChildren(
      ...options.definitions.map((mode: any) => {
        const option = document.createElement("option");
        option.value = mode.value;
        option.textContent = options.translate(mode.key, mode.fallback);
        return option;
      }),
    );
    selector.value = previousValue;
  }

  function render() {
    const toggle = options.toggle();
    if (!toggle) return;
    populateOptions();
    const selected = options.selector().value === "selected";
    const label = options.translate(
      "selectedVersionOnly",
      "Selected version only",
    );
    toggle.setAttribute("aria-pressed", String(selected));
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    const input = toggle.querySelector?.(
      'input[type="checkbox"]',
    ) as HTMLInputElement | null;
    if (input) {
      input.checked = selected;
      input.tabIndex = -1;
    }
  }

  function toggleVersionMode(event: any) {
    event?.preventDefault?.();
    const selector = options.selector();
    selector.value = selector.value === "selected" ? "through" : "selected";
    render();
    options.renderCategoryFilters();
    options.drawList();
    if (event?.detail > 0) event.currentTarget.blur();
  }

  return { populateOptions, render, toggle: toggleVersionMode };
}
