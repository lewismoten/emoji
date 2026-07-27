import { BaseControl } from "./base-control.js";
import { DomFactory } from "./dom-factory.js";

const versionModeToggleStylesheetId =
  "version-mode-toggle-control-stylesheet";
const versionModeToggleStylesheetHref =
  "./explorer/controls/version-mode-toggle.css";

type VersionModeToggleState = {
  emoji: string;
  pressed: boolean;
};

export class VersionModeToggleControl extends BaseControl<VersionModeToggleState> {
  constructor(state: VersionModeToggleState) {
    super(state);
  }

  protected stylesheets() {
    return [
      {
        href: versionModeToggleStylesheetHref,
        id: versionModeToggleStylesheetId,
      },
    ];
  }

  protected render() {
    return DomFactory.button({
      attributes: {
        "aria-pressed": String(this.state.pressed),
        type: "button",
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
