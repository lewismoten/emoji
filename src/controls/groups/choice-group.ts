import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";
import {
  ToggleButtonControl,
  type ToggleButtonState,
} from "../core/toggle-button.js";
import { isChoiceGroupItemDisabled } from "./choice-group-selection.js";

export type ChoiceGroupItem = {
  ariaLabel: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  emoji?: string;
  label?: string;
  labelKey?: string;
  selected?: boolean;
  title?: string;
  value: string;
};

export type ChoiceGroupState = {
  buttonClassName: string;
  className: string;
  inputClassName?: string;
  inputType?: "checkbox" | "radio";
  items: ChoiceGroupItem[];
  label: string;
  labelKey?: string;
  labelTag?: string;
  legendClassName?: string;
  maxSelectable?: number;
  minSelectable?: number;
  role?: "group" | "radiogroup";
  toggleEmojiClassName?: string;
  toggleLabelClassName?: string;
  wrapperTag?: "div" | "fieldset";
};

export class ChoiceGroupControl extends BaseControl<ChoiceGroupState> {
  constructor(state: ChoiceGroupState) {
    super(state);
  }

  static toSpec(state: ChoiceGroupState): NodeSpec {
    return new ChoiceGroupControl(state).render();
  }

  protected render(): NodeSpec {
    const wrapperTag = this.state.wrapperTag ?? "div";
    const minSelectable = this.state.minSelectable ?? 0;
    const maxSelectable = this.state.maxSelectable ?? this.state.items.length;
    const labelTag = this.state.labelTag ?? (wrapperTag === "fieldset" ? "legend" : "span");
    const groupId = this.state.labelKey ? `${this.state.labelKey}-group-label` : undefined;

    return DomFactory.element(wrapperTag, {
      attributes: {
        "aria-label": wrapperTag === "fieldset" ? undefined : this.state.label,
        "aria-labelledby": wrapperTag === "fieldset" ? undefined : groupId,
        role: wrapperTag === "fieldset" ? undefined : this.state.role,
      },
      className: this.state.className,
      dataset: {
        i18nAriaLabel:
          wrapperTag === "fieldset" || !this.state.labelKey ? undefined : this.state.labelKey,
        maxSelectable: String(maxSelectable),
        minSelectable: String(minSelectable),
      },
      children: [
        DomFactory.element(labelTag, {
          attributes: groupId ? { id: groupId } : undefined,
          className: this.state.legendClassName,
          dataset: this.state.labelKey ? { i18n: this.state.labelKey } : undefined,
          text: this.state.label,
        }),
        ...this.state.items.map((item) => {
          const selected = Boolean(item.selected);
          const disabled = isChoiceGroupItemDisabled(item, this.state.items, {
            maxSelectable,
            minSelectable,
          });
          const toggleState: ToggleButtonState = {
            ariaLabel: item.ariaLabel,
            className: [this.state.buttonClassName, item.className]
              .filter(Boolean)
              .join(" "),
            dataAttributes: {
              ...(item.dataAttributes ?? {}),
              disabled: disabled ? "true" : "false",
            },
            emoji: item.emoji,
            emojiClassName: this.state.toggleEmojiClassName,
            inputClassName: this.state.inputClassName,
            inputType: this.state.inputType,
            label: item.label,
            labelClassName: this.state.toggleLabelClassName,
            labelKey: item.labelKey,
            pressed: selected,
            role: this.state.role === "radiogroup" ? "radio" : undefined,
            tabIndex: selected ? 0 : -1,
            title: item.title ?? item.label,
            value: item.value,
          };
          return ToggleButtonControl.toSpec(toggleState);
        }),
      ],
    });
  }
}
