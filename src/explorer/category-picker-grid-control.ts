import {
  closeFilterPicker,
  focusCompactChoice,
  makeCompactChoice,
  renderFilterPickerTrigger,
} from "./filter-picker.js";

function replaceChoices(
  container: HTMLElement | undefined,
  choices: HTMLButtonElement[],
) {
  if (!container) return;
  container.replaceChildren(...choices);
}

export function renderGroupPickerGrid(options: {
  availableGroups: string[];
  compactGroupChoices: HTMLElement | undefined;
  compactGroupLabel?: HTMLElement | null;
  displayGroupName: (name: string) => string;
  drawList: () => void;
  getGroupRepresentativeEmoji: (group: string) => string;
  groupFilterDialog: HTMLDialogElement | undefined;
  groupPickerTrigger: HTMLElement | undefined;
  selectedGroup: string;
  setSelectedGroup: (value: string) => void;
  setSelectedSubGroup: (value: string) => void;
  translate: (key: string, fallback: string) => string;
  rerender: () => void;
}) {
  const selectedLabel = options.selectedGroup
    ? options.displayGroupName(options.selectedGroup)
    : options.translate("all", "All");
  if (options.compactGroupLabel) {
    options.compactGroupLabel.textContent = selectedLabel;
  }
  renderFilterPickerTrigger(
    options.groupPickerTrigger,
    options.translate("group", "Group"),
    options.selectedGroup
      ? options.getGroupRepresentativeEmoji(options.selectedGroup)
      : "🌐",
    selectedLabel,
  );
  replaceChoices(options.compactGroupChoices, [
    makeCompactChoice({
      value: "",
      emoji: "🌐",
      label: options.translate("all", "All"),
      selected: options.selectedGroup === "",
      onSelect() {
        options.setSelectedGroup("");
        options.setSelectedSubGroup("");
        options.rerender();
        options.drawList();
        closeFilterPicker(options.groupFilterDialog, options.groupPickerTrigger);
      },
    }),
    ...options.availableGroups.map((name) =>
      makeCompactChoice({
        value: name,
        emoji: options.getGroupRepresentativeEmoji(name),
        label: options.displayGroupName(name),
        selected: options.selectedGroup === name,
        onSelect() {
          options.setSelectedGroup(name);
          options.setSelectedSubGroup("");
          options.rerender();
          options.drawList();
          closeFilterPicker(
            options.groupFilterDialog,
            options.groupPickerTrigger,
          );
        },
      }),
    ),
  ]);
}

export function renderSubGroupPickerGrid(options: {
  availableSubGroupParents: string[];
  availableSubGroups: Record<string, string[]>;
  compactSubGroupChoices: HTMLElement | undefined;
  compactSubGroupLabel?: HTMLElement | null;
  displayUnicodeSubGroupName: (name: string) => string;
  drawList: () => void;
  getSubGroupRepresentativeEmoji: (group: string, subGroup: string) => string;
  selectedGroup: string;
  selectedSubGroup: string;
  setSelectedSubGroup: (value: string) => void;
  subGroupFilterDialog: HTMLDialogElement | undefined;
  subGroupPickerTrigger: HTMLElement | undefined;
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  translate: (key: string, fallback: string) => string;
  rerender: () => void;
}) {
  const separatorIndex = options.selectedSubGroup.indexOf("::");
  const selectedName =
    separatorIndex === -1 ? "" : options.selectedSubGroup.slice(separatorIndex + 2);
  const selectedLabel = selectedName
    ? options.displayUnicodeSubGroupName(selectedName)
    : options.translate("all", "All");
  if (options.compactSubGroupLabel) {
    options.compactSubGroupLabel.textContent = selectedLabel;
  }
  renderFilterPickerTrigger(
    options.subGroupPickerTrigger,
    options.translate("subgroup", "Sub-group"),
    selectedName
      ? options.getSubGroupRepresentativeEmoji(options.selectedGroup, selectedName)
      : "🌐",
    selectedLabel,
  );
  const choices = options.availableSubGroupParents.flatMap((group) =>
    options.availableSubGroups[group].map((name) => ({ group, name })),
  );
  replaceChoices(options.compactSubGroupChoices, [
    makeCompactChoice({
      value: "",
      emoji: "🌐",
      label: options.translate("all", "All"),
      selected: options.selectedSubGroup === "",
      onSelect() {
        options.setSelectedSubGroup("");
        options.rerender();
        options.drawList();
        closeFilterPicker(
          options.subGroupFilterDialog,
          options.subGroupPickerTrigger,
        );
      },
    }),
    ...choices.map(({ group, name }) =>
      makeCompactChoice({
        value: options.subGroupSelectionKey(group, name),
        emoji: options.getSubGroupRepresentativeEmoji(group, name),
        label: options.displayUnicodeSubGroupName(name),
        selected:
          options.selectedSubGroup === options.subGroupSelectionKey(group, name),
        onSelect() {
          options.setSelectedSubGroup(
            options.subGroupSelectionKey(group, name),
          );
          options.rerender();
          options.drawList();
          closeFilterPicker(
            options.subGroupFilterDialog,
            options.subGroupPickerTrigger,
          );
        },
      }),
    ),
  ]);
}

export function renderSequencePickerGrid(options: {
  availableSequenceTypes: string[];
  compactSequenceChoices: HTMLElement | undefined;
  compactSequenceLabel?: HTMLElement | null;
  drawList: () => void;
  rerender: () => void;
  selectedSequenceType: string;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeEmoji: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  setSelectedSequenceType: (value: string) => void;
  translate: (key: string, fallback: string) => string;
}) {
  const labelFor = (type: string) =>
    type
      ? options.translate(
          options.sequenceTranslationKeys[type],
          options.sequenceTypeLabels[type],
        )
      : options.translate("all", "All");
  if (options.compactSequenceLabel) {
    options.compactSequenceLabel.textContent = labelFor(
      options.selectedSequenceType,
    );
  }
  const container = options.compactSequenceChoices;
  replaceChoices(container, [
    makeCompactChoice({
      value: "",
      emoji: "🌐",
      label: labelFor(""),
      selected: options.selectedSequenceType === "",
      onSelect() {
        options.setSelectedSequenceType("");
        options.rerender();
        options.drawList();
        if (container) focusCompactChoice(container, "");
      },
    }),
    ...options.availableSequenceTypes.map((type) =>
      makeCompactChoice({
        value: type,
        emoji: options.sequenceTypeEmoji[type],
        label: labelFor(type),
        selected: options.selectedSequenceType === type,
        onSelect() {
          options.setSelectedSequenceType(type);
          options.rerender();
          options.drawList();
          if (container) focusCompactChoice(container, type);
        },
      }),
    ),
  ]);
}
