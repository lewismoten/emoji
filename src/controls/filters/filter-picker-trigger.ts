import { BaseControl } from "../core/base-control.js";
import { DomFactory } from "../core/dom-factory.js";

const filterPickerTriggerStylesheetId =
  "filter-picker-trigger-control-stylesheet";
const filterPickerTriggerStylesheetHref =
  "./explorer/controls/filters/filter-picker-trigger.css";

type FilterPickerTriggerState = {
  controlsId: string;
  kind: string;
  kindKey: string;
  triggerClassName: string;
  value: string;
  valueKey: string;
};

export class FilterPickerTriggerControl extends BaseControl<FilterPickerTriggerState> {
  constructor(state: FilterPickerTriggerState) {
    super(state);
  }

  protected stylesheets() {
    return [
      {
        href: filterPickerTriggerStylesheetHref,
        id: filterPickerTriggerStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controlsId,
        "aria-haspopup": "dialog",
        type: "button",
      },
      className: `filter-picker-trigger ${this.state.triggerClassName}`,
      children: [
        DomFactory.element("span", {
          className: "filter-picker-kind",
          dataset: { i18n: this.state.kindKey },
          requireI18n: true,
          text: this.state.kind,
        }),
        DomFactory.element("span", {
          attributes: { "aria-hidden": "true" },
          className: "filter-picker-emoji",
          text: "🌐",
        }),
        DomFactory.element("span", {
          className: "filter-picker-value",
          dataset: { i18n: this.state.valueKey },
          requireI18n: true,
          text: this.state.value,
        }),
      ],
    });
  }
}
