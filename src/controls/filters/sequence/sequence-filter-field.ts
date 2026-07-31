import { BaseControl } from "../../core/base-control.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";

type SequenceFilterFieldState = {
  choicesClassName?: string;
  fieldClassName?: string;
  headingClassName?: string;
  hidden?: boolean;
  label: string;
  labelId: string;
  labelKey: string;
  selectClassName?: string;
  valueClassName?: string;
};

export class SequenceFilterFieldControl extends BaseControl<SequenceFilterFieldState> {
  constructor(state?: Partial<SequenceFilterFieldState>) {
    super({
      choicesClassName: "compact-choices compact-sequence-choices",
      fieldClassName: "filter-field sequence-filter-field has-choice-buttons",
      headingClassName: "filter-heading",
      hidden: true,
      label: "Sequence type",
      labelId: "sequence-filter-label",
      labelKey: "sequenceType",
      selectClassName: "select-sequence-type",
      valueClassName: "compact-sequence-label",
      ...state,
    });
  }

  static toSpec(state?: Partial<SequenceFilterFieldState>): NodeSpec {
    return new SequenceFilterFieldControl(state).render();
  }

  protected render(): NodeSpec {
    return DomFactory.element("div", {
      attributes: {
        hidden: this.state.hidden ? "hidden" : undefined,
      },
      className: this.state.fieldClassName,
      children: [
        DomFactory.element("div", {
          className: this.state.headingClassName,
          children: [
            DomFactory.element("span", {
              attributes: { id: this.state.labelId },
              dataset: { i18n: this.state.labelKey },
              requireI18n: true,
              text: this.state.label,
            }),
            DomFactory.element("span", {
              className: this.state.valueClassName,
            }),
          ],
        }),
        DomFactory.element("select", {
          attributes: {
            "aria-labelledby": this.state.labelId,
          },
          className: this.state.selectClassName,
          children: [
            DomFactory.element("option", {
              text: "Not loaded",
            }),
          ],
        }),
        DomFactory.element("div", {
          attributes: {
            "aria-labelledby": this.state.labelId,
            role: "radiogroup",
          },
          className: this.state.choicesClassName,
        }),
      ],
    });
  }
}
