import {
  ActionButtonControl,
  type ActionButtonState,
} from "../../core/action-button.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";

const advancedFiltersTriggerStylesheetId =
  "advanced-filters-trigger-control-style";
const advancedFiltersTriggerStyleText = `
.advanced-filters-trigger {
  width: fit-content;
}
`;

type AdvancedFiltersTriggerState = {
  controls: string;
  filtersText: string;
  filtersTextKey: string;
  longText: string;
  longTextKey: string;
};

export class AdvancedFiltersTriggerControl extends ActionButtonControl<AdvancedFiltersTriggerState> {
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

  protected override styles() {
    return [
      {
        text: advancedFiltersTriggerStyleText,
        id: advancedFiltersTriggerStylesheetId,
      },
    ];
  }

  protected render(): NodeSpec {
    return this.renderButton({
      ariaLabel: this.state.longText,
      attributes: {
        "aria-controls": this.state.controls,
        "aria-haspopup": "dialog",
      },
      className: "setting-choice advanced-filters-trigger",
      i18nAriaLabel: this.state.longTextKey,
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
    } satisfies ActionButtonState);
  }
}
