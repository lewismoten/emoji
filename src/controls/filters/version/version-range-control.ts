import { BaseControl } from "../../core/base-control.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";

type VersionRangeControlState = {
  labelId: string;
  outputId?: string;
  rangeId?: string;
  wrapperClassName?: string;
};

export class VersionRangeControl extends BaseControl<VersionRangeControlState> {
  constructor(state?: Partial<VersionRangeControlState>) {
    super({
      labelId: "version-filter-label",
      outputId: "version-range-value",
      rangeId: "version-range",
      wrapperClassName: "compact-version",
      ...state,
    });
  }

  static toSpec(state?: Partial<VersionRangeControlState>): NodeSpec {
    return new VersionRangeControl(state).render();
  }

  protected render(): NodeSpec {
    return DomFactory.element("div", {
      className: this.state.wrapperClassName,
      children: [
        DomFactory.element("input", {
          attributes: {
            "aria-describedby": this.state.outputId,
            "aria-labelledby": this.state.labelId,
            class: undefined,
            disabled: "disabled",
            id: this.state.rangeId,
            max: "0",
            min: "0",
            step: "1",
            type: "range",
            value: "0",
          },
          className: "version-range",
        }),
        DomFactory.element("output", {
          attributes: {
            "aria-live": "polite",
            for: this.state.rangeId,
            id: this.state.outputId,
          },
          className: "version-range-value",
          text: "—",
        }),
      ],
    });
  }
}
