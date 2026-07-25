import { titleCase } from './category-rules.js';

type ChoiceButtonLike = HTMLButtonElement & {
  dataset: DOMStringMap & { value?: string };
};

type ChoiceContainerLike = HTMLElement;

type FilterPickerTriggerLike = HTMLElement | undefined;

type ChoiceDefinition = {
  value: string;
  emoji: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function populateGroupFilter(options: {
  availableGroups: string[];
  displayGroupName: (name: string) => string;
  getGroupRepresentativeEmoji: (group: string) => string;
  groupSelector: HTMLSelectElement;
  selectedGroup: string;
  translate: (key: string, fallback: string) => string;
}) {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${options.translate('all', 'All')}`;
  options.groupSelector.replaceChildren(
    all,
    ...options.availableGroups.map(name => {
      const option = document.createElement('option');
      option.value = name;
      option.text = `${options.getGroupRepresentativeEmoji(name)} ${options.displayGroupName(name)}`;
      return option;
    })
  );
  options.groupSelector.value = options.selectedGroup;
}

export function populateSubGroupFilter(options: {
  availableSubGroupParents: string[];
  availableSubGroups: Record<string, string[]>;
  displayGroupName: (name: string) => string;
  displayUnicodeSubGroupName: (name: string) => string;
  getSubGroupRepresentativeEmoji: (group: string, subGroup: string) => string;
  selectedSubGroup: string;
  subGroupSelectionKey: (group: string, subGroup: string) => string;
  subGroupSelector: HTMLSelectElement;
  translate: (key: string, fallback: string) => string;
}) {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${options.translate('all', 'All')}`;
  const children: (HTMLOptionElement | HTMLOptGroupElement)[] = [all];
  options.availableSubGroupParents.forEach(group => {
    const optionGroup = document.createElement('optgroup');
    optionGroup.label = options.displayGroupName(group);
    options.availableSubGroups[group].forEach(name => {
      const option = document.createElement('option');
      option.value = options.subGroupSelectionKey(group, name);
      option.dataset.group = group;
      option.dataset.subgroup = name;
      option.text = `${options.getSubGroupRepresentativeEmoji(group, name)} ${options.displayUnicodeSubGroupName(name)}`;
      optionGroup.appendChild(option);
    });
    children.push(optionGroup);
  });
  options.subGroupSelector.replaceChildren(...children);
  options.subGroupSelector.value = options.selectedSubGroup;
  options.subGroupSelector.disabled = false;
}

export function populateSequenceTypeFilter(options: {
  availableSequenceTypes: string[];
  selectedSequenceType: string;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeEmoji: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  sequenceTypeSelector: HTMLSelectElement;
  translate: (key: string, fallback: string) => string;
}) {
  const all = document.createElement('option');
  all.value = '';
  all.text = `🌐 ${options.translate('all', 'All')}`;
  options.sequenceTypeSelector.replaceChildren(
    all,
    ...options.availableSequenceTypes.map(type => {
      const option = document.createElement('option');
      option.value = type;
      option.text = `${options.sequenceTypeEmoji[type]} ${options.translate(options.sequenceTranslationKeys[type], options.sequenceTypeLabels[type])}`;
      return option;
    })
  );
  options.sequenceTypeSelector.value = options.selectedSequenceType;
}

export function makeCompactChoice({
  value,
  emoji,
  label,
  selected,
  onSelect
}: ChoiceDefinition) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'compact-choice';
  button.dataset.value = value;
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', String(selected));
  button.tabIndex = selected ? 0 : -1;
  button.setAttribute('aria-label', label);
  button.title = label;
  const icon = document.createElement('span');
  icon.className = 'compact-choice-emoji';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = emoji;
  const text = document.createElement('span');
  text.className = 'compact-choice-label';
  text.textContent = label;
  button.replaceChildren(icon, text);
  button.addEventListener('click', onSelect);
  return button;
}

export function renderFilterPickerTrigger(
  trigger: FilterPickerTriggerLike,
  kind: string,
  emoji: string,
  value: string
) {
  if (!trigger) return;
  trigger.querySelector('.filter-picker-emoji')!.textContent = emoji || '•';
  trigger.querySelector('.filter-picker-value')!.textContent = value;
  const label = `${kind}: ${value}`;
  trigger.setAttribute('aria-label', label);
  trigger.title = label;
}

export function openFilterPicker(
  dialog: HTMLDialogElement | undefined,
  choices: ChoiceContainerLike | undefined
) {
  if (!dialog || !choices) return;
  dialog.showModal();
  window.requestAnimationFrame(() => {
    const selected = choices.querySelector<HTMLElement>('[aria-checked="true"]');
    (
      selected ?? choices.querySelector<HTMLElement>('[role="radio"]')
    )?.focus();
  });
}

export function closeFilterPicker(
  dialog: HTMLDialogElement | undefined,
  trigger: HTMLElement | undefined
) {
  if (dialog?.open) dialog.close();
  trigger?.focus();
}

export function focusCompactChoice(
  container: ChoiceContainerLike,
  value: string
) {
  const choices = Array.from(
    container.querySelectorAll<ChoiceButtonLike>('[role="radio"]')
  );
  const choice =
    choices.find(button => button.dataset.value === value) ??
    choices.find(button => button.getAttribute('aria-checked') === 'true');
  choice?.focus();
}

export function onCompactChoiceKeyDown(event: KeyboardEvent) {
  if (
    ![
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ].includes(event.key)
  )
    return;
  const choices = Array.from(
    (event.currentTarget as ChoiceContainerLike).querySelectorAll<ChoiceButtonLike>('[role="radio"]')
  );
  const currentIndex = choices.indexOf(
    (event.target as HTMLElement).closest('[role="radio"]') as ChoiceButtonLike
  );
  if (currentIndex === -1 || choices.length === 0) return;
  event.preventDefault();
  let nextIndex;
  if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = choices.length - 1;
  } else {
    const rtl = document.documentElement.dir === 'rtl';
    const backwards =
      event.key === 'ArrowUp' ||
      event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    nextIndex =
      (currentIndex + (backwards ? -1 : 1) + choices.length) % choices.length;
  }
  choices[nextIndex].click();
}

export function displayUnicodeSubGroupName(
  name: string,
  options: {
    searchSubgroupLabels: Record<string, string>;
    searchLabels: Record<string, string>;
    unicodeSubgroupLabelKeys: Record<string, string>;
  }
) {
  if (options.searchSubgroupLabels[name]) return options.searchSubgroupLabels[name];
  if (options.searchLabels[options.unicodeSubgroupLabelKeys[name]])
    return options.searchLabels[options.unicodeSubgroupLabelKeys[name]];
  const conciseNames: Record<string, string> = {
    'animal-amphibian': 'Amphibians',
    'animal-bird': 'Birds',
    'animal-bug': 'Bugs',
    'animal-mammal': 'Mammals',
    'animal-marine': 'Marine Animals',
    'animal-reptile': 'Reptiles',
    'plant-flower': 'Flowers',
    'plant-other': 'Other Plants',
    'book-paper': 'Books & Paper'
  };
  if (name.startsWith('food-')) return titleCase(name.slice(5));
  if (conciseNames[name]) return conciseNames[name];
  return titleCase(name);
}
