import { SequenceFilterFieldControl } from "../controls/filters/sequence/sequence-filter-field.js";
import { VersionModeToggleControl } from "../controls/filters/version/version-mode-toggle.js";
import { VersionRangeControl } from "../controls/filters/version/version-range-control.js";

export function ensureSequenceTypeFilterField(documentRef: any) {
  const existing = documentRef.getElementsByClassName("select-sequence-type")[0];
  if (existing) return existing;
  const field = SequenceFilterFieldControl.createWithDocument(documentRef) as any;
  documentRef.querySelector(".filter-grid .version-field")?.before(field);
  return field.querySelector(".select-sequence-type");
}

export function ensureVersionSliderControl(options: {
  document: any;
  versionSelector: any & {
    setAttribute(name: string, value: string): void;
    closest(selector: string): any;
  };
}) {
  const existingRange = options.document.getElementsByClassName("version-range")[0];
  const existingOutput = options.document.getElementsByClassName(
    "version-range-value",
  )[0];
  const existingField = existingRange?.closest?.(".version-field");
  existingField?.classList.add("developer-only");
  if (existingRange && existingOutput) {
    return { range: existingRange, output: existingOutput };
  }
  let field = options.versionSelector.closest(".filter-field");
  field?.classList.add("developer-only");
  if (field?.tagName === "LABEL") {
    const replacement = options.document.createElement("div");
    replacement.className = `${field.className} version-field`;
    replacement.append(...field.childNodes);
    field.replaceWith(replacement);
    field = replacement;
  }
  const label = field?.querySelector("span");
  if (label && !label.id) label.id = "version-filter-label";
  options.versionSelector.setAttribute(
    "aria-labelledby",
    label?.id || "version-filter-label",
  );
  const wrapper = VersionRangeControl.createWithDocument(options.document, {
    labelId: label?.id || "version-filter-label",
  }) as any;
  const range = wrapper.querySelector(".version-range");
  const output = wrapper.querySelector(".version-range-value");
  if (output) output.value = "—";
  field?.appendChild(wrapper);
  return { range, output };
}

export function ensureVersionModeToggleControl(options: {
  document: any;
  versionModeSelector: any & {
    hidden: boolean;
    closest(selector: string): any;
  };
  versionRange: () => any;
  versionSelector: any & { closest(selector: string): any };
}) {
  const versionField = options.versionSelector.closest(".filter-field");
  const oldModeField = options.versionModeSelector.closest(".filter-field");
  if (oldModeField && oldModeField !== versionField) oldModeField.hidden = true;
  options.versionModeSelector.hidden = true;
  const existing = options.document.getElementsByClassName("version-mode-toggle")[0];
  if (existing) return existing;
  const button = VersionModeToggleControl.create({
    emoji: "🎯",
    pressed: false,
  });
  options.versionRange()?.closest?.(".compact-version")?.prepend(button);
  return button;
}
