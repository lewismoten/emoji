import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";

const filterPickerTriggerStylesheetId = "filter-picker-trigger-control-style";
const filterPickerTriggerStyleText = `
.filter-picker-trigger {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font: inherit;
  text-align: start;
}

.filter-picker-trigger:hover {
  border-color: var(--accent);
}

.filter-picker-trigger:focus-visible {
  outline: var(--focus-outline);
  outline-offset: var(--focus-outline-offset);
}

.filter-picker-kind {
  color: var(--muted);
  font-size: var(--ui-font-size-xx-small);
}

.filter-picker-emoji {
  font-family: var(--emoji-font);
  font-size: var(--ui-font-size-xx-large);
}

.filter-picker-value {
  min-width: 0;
  overflow: hidden;
  font-size: var(--ui-font-size-medium-small);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`;

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

  protected styles() {
    return [
      {
        text: filterPickerTriggerStyleText,
        id: filterPickerTriggerStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-controls": this.state.controlsId,
        "aria-label": `${this.state.kind}: ${this.state.value}`,
        "aria-haspopup": "dialog",
        type: "button",
      },
      className: `filter-picker-trigger ${this.state.triggerClassName}`,
      children: [
        DomFactory.element("span", {
          className: "filter-picker-kind sr-only",
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
