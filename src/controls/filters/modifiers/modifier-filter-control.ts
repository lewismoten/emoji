import { BaseControl } from "../../core/base-control.js";
import { type NodeSpec } from "../../core/dom-factory.js";
import { ChoiceGroupControl } from "../../groups/choice-group.js";

const modifierFilterControlStyleId = "modifier-filter-control-style";
const modifierFilterControlStyleText = `
.modifier-filter {
  min-inline-size: 0;
}
`;

export type ModifierFilterItem = {
  emoji: string;
  label: string;
  labelKey: string;
  value: string;
};

export type ModifierFilterState = {
  className: string;
  inputClassName: string;
  items: ModifierFilterItem[];
  legend: string;
  legendKey: string;
  maxSelectable?: number;
  minSelectable?: number;
};

export abstract class ModifierFilterControl extends BaseControl<ModifierFilterState> {
  static toSpec(
    this: new (...args: any[]) => ModifierFilterControl,
    state?: Partial<ModifierFilterState>,
  ) {
    return new this(state).render();
  }

  protected render(): NodeSpec {
    return ChoiceGroupControl.toSpec({
      buttonClassName: "modifier-filter-option",
      className: `modifier-filter ${this.state.className}`,
      inputClassName: this.state.inputClassName,
      inputType: "checkbox",
      items: this.state.items.map((item) => ({
        ariaLabel: item.label,
        emoji: item.emoji,
        label: item.label,
        labelKey: item.labelKey,
        selected: false,
        value: item.value,
      })),
      label: this.state.legend,
      labelKey: this.state.legendKey,
      legendClassName: undefined,
      maxSelectable: this.state.maxSelectable ?? 1,
      minSelectable: this.state.minSelectable ?? 0,
      toggleEmojiClassName: "modifier-emoji",
      toggleLabelClassName: "modifier-label",
      wrapperTag: "fieldset",
    });
  }

  protected styles() {
    return [
      {
        id: modifierFilterControlStyleId,
        text: modifierFilterControlStyleText,
      },
    ];
  }
}
