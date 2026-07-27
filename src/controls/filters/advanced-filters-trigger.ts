import { BaseControl } from "../core/base-control.js";
import { DomFactory, type NodeSpec } from "../core/dom-factory.js";

const advancedFiltersTriggerStylesheetId =
  "advanced-filters-trigger-control-stylesheet";
const advancedFiltersTriggerStylesheetHref =
  "./explorer/controls/filters/advanced-filters-trigger.css";

type AdvancedFiltersTriggerState = {
  controls: string;
  filtersText: string;
  filtersTextKey: string;
  longText: string;
  longTextKey: string;
};

export class AdvancedFiltersTriggerControl extends BaseControl<AdvancedFiltersTriggerState> {
  constructor(state?: Partial<AdvancedFiltersTriggerState>) {
    super({
      controls: "advanced-filters-dialog",
      filtersText: "Filters",
      filtersTextKey: "filters",
      longText: "Advanced filters",
      longTextKey: "advancedFilters",
      ...state,
    });
  }

  protected override stylesheets() {
    return [
      {
        href: advancedFiltersTriggerStylesheetHref,
        id: advancedFiltersTriggerStylesheetId,
      },
    ];
  }

  protected render(): NodeSpec {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controls,
        "aria-haspopup": "dialog",
        "aria-label": this.state.longText,
        type: "button",
      },
      className: "advanced-filters-trigger",
      dataset: {
        i18nAriaLabel: this.state.longTextKey,
      },
      children: [
        DomFactory.element("span", {
          className: "summary-long",
          dataset: { i18n: this.state.longTextKey },
          text: this.state.longText,
        }),
        DomFactory.element("span", {
          className: "summary-short",
          dataset: { i18n: this.state.filtersTextKey },
          text: this.state.filtersText,
        }),
      ],
    });
  }
}
