import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";

const versionModeToggleStyleId = "version-mode-toggle-control-style";
const versionModeToggleStyleText = `
.version-mode-toggle {
  display: grid;
  place-items: center;
  width: 2.65rem;
  height: 2.65rem;
  padding: 0.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  font-family: var(--emoji-font);
  font-size: calc(var(--ui-font-size-xxx-large) - 0.05rem);
}

.version-mode-toggle:hover {
  background: color-mix(in srgb, var(--panel) 82%, var(--accent));
}

.version-mode-toggle[aria-pressed="true"] {
  border-color: var(--accent);
  background: var(--selected-control-bg);
  color: var(--selected-control-text);
  box-shadow: var(--shadow-selected-inset, none);
}

.version-mode-toggle:focus-visible {
  outline: 2px dashed var(--accent-strong);
  outline-offset: var(--focus-outline-offset);
}
`;

type VersionModeToggleState = {
  emoji: string;
  pressed: boolean;
};

export class VersionModeToggleControl extends BaseControl<VersionModeToggleState> {
  constructor(state: VersionModeToggleState) {
    super(state);
  }

  protected styles() {
    return [
      {
        id: versionModeToggleStyleId,
        text: versionModeToggleStyleText,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-label": "Toggle selected version mode",
        "aria-pressed": String(this.state.pressed),
        type: "button",
        title: "Toggle selected version mode",
      },
      className: "version-mode-toggle",
      children: [
        DomFactory.element("span", {
          attributes: { "aria-hidden": "true" },
          text: this.state.emoji,
        }),
      ],
    });
  }
}
