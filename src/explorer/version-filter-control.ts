import { VersionModeToggleControl } from "../controls/filters/version/version-mode-toggle.js";

export function ensureSequenceTypeFilterField(documentRef: any) {
  const existing = documentRef.getElementsByClassName("select-sequence-type")[0];
  if (existing) return existing;
  const field = documentRef.createElement("div");
  field.className = "filter-field sequence-filter-field";
  field.hidden = true;
  field.innerHTML = `
    <div class="filter-heading">
      <span id="sequence-filter-label" data-i18n="sequenceType">Sequence type</span>
      <span class="compact-sequence-label"></span>
    </div>
    <select class="select-sequence-type" aria-labelledby="sequence-filter-label"><option>Not loaded</option></select>
    <div class="compact-choices compact-sequence-choices" role="radiogroup" aria-labelledby="sequence-filter-label"></div>
  `;
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
  const wrapper = options.document.createElement("div");
  wrapper.className = "compact-version";
  const range = options.document.createElement("input");
  range.id = "version-range";
  range.className = "version-range";
  range.type = "range";
  range.min = "0";
  range.max = "0";
  range.step = "1";
  range.value = "0";
  range.disabled = true;
  range.setAttribute("aria-labelledby", label?.id || "version-filter-label");
  range.setAttribute("aria-describedby", "version-range-value");
  const output = options.document.createElement("output");
  output.id = "version-range-value";
  output.className = "version-range-value";
  output.setAttribute("for", "version-range");
  output.setAttribute("aria-live", "polite");
  output.value = "—";
  wrapper.append(range, output);
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
