/** Create the dynamic filter controls after the static page has loaded. */
export function initializeExplorerControls(options: any) {
  const controls = options.createFilterControlSetup({
    document,
    versionModeSelector: options.versionModeSelector,
    versionRange: options.versionRange,
    versionSelector: options.versionSelector,
  });
  options.renderDeveloperMode();
  const compactGroupChoices = controls.ensureChoiceContainer(
    options.groupSelector,
    "compact-group-choices",
    "group-filter-label",
  );
  const compactSubGroupChoices = controls.ensureChoiceContainer(
    options.subGroupSelector,
    "compact-subgroup-choices",
    "subgroup-filter-label",
  );
  const sequenceTypeSelector = controls.ensureSequenceTypeFilter();
  const compactSequenceChoices = controls.ensureChoiceContainer(
    sequenceTypeSelector,
    "compact-sequence-choices",
    "sequence-filter-label",
  );
  [compactGroupChoices, compactSubGroupChoices, compactSequenceChoices].forEach(
    (choice) =>
      choice.addEventListener("keydown", options.onCompactChoiceKeyDown),
  );
  options.groupPickerTrigger?.addEventListener("click", () =>
    options.openFilterPicker(options.groupFilterDialog, compactGroupChoices),
  );
  options.subGroupPickerTrigger?.addEventListener("click", () =>
    options.openFilterPicker(
      options.subGroupFilterDialog,
      compactSubGroupChoices,
    ),
  );
  const compactGroupLabel = controls.ensureSelectionLabel(
    options.groupSelector,
    "compact-group-label",
    "group-filter-label",
  );
  const compactSubGroupLabel = controls.ensureSelectionLabel(
    options.subGroupSelector,
    "compact-subgroup-label",
    "subgroup-filter-label",
  );
  const compactSequenceLabel = controls.ensureSelectionLabel(
    sequenceTypeSelector,
    "compact-sequence-label",
    "sequence-filter-label",
  );
  const { range: versionRange, output: versionRangeValue } =
    controls.ensureVersionSlider();
  options.populateVersionModeOptions();
  const versionModeToggle = controls.ensureVersionModeToggle();
  options.versionSelector
    .closest(".filter-field")
    ?.classList.toggle(
      "has-version-slider",
      Boolean(versionRange && versionRangeValue),
    );
  const { summary, text, clear } = controls.ensureActiveFilterSummary();
  return {
    activeFilterSummary: summary,
    activeFilterText: text,
    clearFiltersButton: clear,
    compactGroupChoices,
    compactGroupLabel,
    compactSequenceChoices,
    compactSequenceLabel,
    compactSubGroupChoices,
    compactSubGroupLabel,
    sequenceTypeSelector,
    versionModeToggle,
    versionRange,
    versionRangeValue,
  };
}

/** Complete the asynchronous page startup once controls and events exist. */
export async function finalizeExplorerStartup(options: any) {
  options.renderVersionModeToggle();
  options.renderThemeToggle();
  options.renderPixelFontToggle();
  options.observeToolbarHeight(options.toolbar);
  const routeLocale = window.location.pathname.match(
    /index\.([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\.html$/,
  )?.[1];
  const initialUiLocale =
    routeLocale ?? document.documentElement.dataset.locale ?? "en";
  const initialSearchLocale =
    routeLocale ??
    (Object.hasOwn(options.preferences, "locale")
      ? options.preferences.locale
      : initialUiLocale);
  await options.loadUiTranslations(
    initialUiLocale,
    document.documentElement.dir === "rtl",
  );
  await options.loadSearchLanguages(initialSearchLocale);
  await Promise.all([
    options.loadData(),
    options.loadPackageManifest?.() ?? Promise.resolve(),
  ]);
  options.drawList();
  options.finishExplorerLoading();
  await options.applyDialogUrlState();
  options.setUrlStateReady(true);
  options.syncUrlState();
}
