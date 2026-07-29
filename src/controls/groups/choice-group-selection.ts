import type { ChoiceGroupItem } from "./choice-group.js";

export type ChoiceGroupSelectionLimits = {
  maxSelectable?: number;
  minSelectable?: number;
};

const normalizeLimits = (
  itemCount: number,
  limits: ChoiceGroupSelectionLimits,
) => {
  const minSelectable = Math.max(0, limits.minSelectable ?? 0);
  const maxSelectable = Math.max(
    minSelectable,
    limits.maxSelectable ?? itemCount,
  );
  return { maxSelectable, minSelectable };
};

export function isChoiceGroupItemDisabled(
  item: Pick<ChoiceGroupItem, "selected">,
  items: Pick<ChoiceGroupItem, "selected">[],
  limits: ChoiceGroupSelectionLimits,
): boolean {
  const selectedCount = items.filter((entry) => entry.selected).length;
  const { maxSelectable, minSelectable } = normalizeLimits(
    items.length,
    limits,
  );
  const selected = Boolean(item.selected);
  if (!selected && maxSelectable === 1) return false;
  const canDeselect = selectedCount > minSelectable;
  const canSelect = selectedCount < maxSelectable;
  return selected ? !canDeselect : !canSelect;
}

export function toggleChoiceGroupSelection(
  items: ChoiceGroupItem[],
  value: string,
  limits: ChoiceGroupSelectionLimits,
): ChoiceGroupItem[] {
  const current = items.find((item) => item.value === value);
  if (!current) return items;
  if (isChoiceGroupItemDisabled(current, items, limits)) return items;
  const { maxSelectable } = normalizeLimits(items.length, limits);

  if (maxSelectable === 1 && !current.selected) {
    return items.map((item) => ({ ...item, selected: item.value === value }));
  }

  return items.map((item) =>
    item.value === value
      ? { ...item, selected: !Boolean(item.selected) }
      : item,
  );
}
