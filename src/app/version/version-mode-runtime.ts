import { createVersionModeController } from "./version-mode-controller.js";

export function createVersionModeRuntime(options: any) {
  return createVersionModeController({
    definitions: options.definitions,
    drawList: () => options.drawList(),
    renderCategoryFilters: () => options.renderCategoryFilters(),
    selector: () => options.selector(),
    syncUrlState: (...args: any[]) => options.syncUrlState?.(...args),
    toggle: () => options.toggle(),
    translate: options.translate,
  });
}
