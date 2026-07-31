import { BaseControl } from "../../core/base-control.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";

const advancedFiltersTriggerStylesheetId =
  "advanced-filters-trigger-control-style";
const advancedFiltersTriggerStyleText = `
.advanced-filters-trigger {
  display: inline-flex;
  min-height: 1.25rem;
  width: fit-content;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  font-size: var(--ui-font-size-medium);
  font-weight: 650;
}

.advanced-filters-trigger:hover {
  color: var(--text);
}

.advanced-filters-trigger:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
`;

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

  protected override styles() {
    return [
      {
        text: advancedFiltersTriggerStyleText,
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
