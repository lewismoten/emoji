/**
 * Runtime-only Explorer dependencies. Persistent data belongs in ExplorerState;
 * resolved DOM references belong here.
 */
export function createExplorerRuntime(options: {
  ensureUtilityControls: () => void;
  getElements: () => Record<string, any>;
}) {
  let elements: Record<string, any> | undefined;

  function resolveElements() {
    options.ensureUtilityControls();
    elements = options.getElements();
    const label = elements.languagePickerLabel;
    if (label) {
      label.id ||= 'language-picker-current-label';
      elements.languagePicker.setAttribute(
        'aria-labelledby',
        `language-picker-accessible-label ${label.id}`
      );
    }
    return elements;
  }

  function get(name: string) {
    return elements?.[name];
  }

  function all() {
    if (!elements) throw new Error('Explorer runtime has not been initialized');
    return elements;
  }

  return { all, get, resolveElements };
}
