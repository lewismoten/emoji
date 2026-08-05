import * as state from "./state.js";

const mode = () => state.getExplorerMode();

export const isStandard = () => mode() === "standard";
export const isAdvanced = () => mode() === "advanced";
export const isDeveloper = () => mode() === "developer";
export const canAccessAdvanced = () => !isStandard();
export const canAccessDeveloper = () => isDeveloper();
