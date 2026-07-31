import { BaseControl } from "../../core/base-control.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";
import { DialogControl } from "../dialog-control.js";
import { TextControl } from "../../core/text-control.js";
import { AudioChoiceGroupControl } from "../../toolbar/audio-choice-group.js";
import { ModeChoiceGroupControl } from "../../toolbar/mode-choice-group.js";
import { ThemeChoiceGroupControl } from "../../toolbar/theme-choice-group.js";

const helpSettingsDialogStylesheetId =
  "help-settings-dialog-control-stylesheet";
const helpSettingsDialogStylesheetHref =
  "./explorer/controls/dialog/content/help-settings-dialog.css";

type HelpSettingsDialogState = {
  headingTitle: string;
  headingTitleId: string;
  headingTitleKey: string;
};

type SettingRowOptions = {
  control: NodeSpec;
  description: string;
  descriptionKey: string;
  rowClassName?: string;
  title: string;
  titleKey: string;
};

type Shortcut = {
  description: string;
  descriptionKey: string;
  keys: string[];
};

const shortcuts: Shortcut[] = [
  {
    description: "Focus search",
    descriptionKey: "shortcutSearch",
    keys: ["/"],
  },
  {
    description: "Navigate emoji",
    descriptionKey: "shortcutNavigate",
    keys: ["←", "→"],
  },
  {
    description: "Open the selected emoji",
    descriptionKey: "shortcutOpen",
    keys: ["Enter"],
  },
  {
    description: "Close a dialog or clear search",
    descriptionKey: "shortcutClose",
    keys: ["Esc"],
  },
  {
    description: "Open Help and settings",
    descriptionKey: "shortcutHelp",
    keys: ["?"],
  },
];

export class HelpSettingsDialogControl extends BaseControl<HelpSettingsDialogState> {
  constructor(state?: Partial<HelpSettingsDialogState>) {
    super({
      headingTitle: "Help and settings",
      headingTitleId: "help-title",
      headingTitleKey: "helpAndSettings",
      ...state,
    });
  }

  protected stylesheets() {
    return [
      {
        href: helpSettingsDialogStylesheetHref,
        id: helpSettingsDialogStylesheetId,
      },
    ];
  }

  protected childControls() {
    return [
      new DialogControl({
        children: [],
        className: "help-dialog",
        dialogId: "help-dialog",
        title: this.state.headingTitle,
        titleId: this.state.headingTitleId,
        titleKey: this.state.headingTitleKey,
      }),
      new ThemeChoiceGroupControl(),
      new AudioChoiceGroupControl(),
      new ModeChoiceGroupControl(),
    ];
  }

  private createSettingRow(options: SettingRowOptions) {
    return DomFactory.element("div", {
      className: ["setting-row", options.rowClassName]
        .filter(Boolean)
        .join(" "),
      children: [
        DomFactory.element("div", {
          children: [
            new TextControl({
              i18nKey: options.titleKey,
              tag: "h4",
              text: options.title,
            }).renderForParent(),
            new TextControl({
              i18nKey: options.descriptionKey,
              tag: "p",
              text: options.description,
            }).renderForParent(),
          ],
        }),
        options.control,
      ],
    });
  }

  private createShortcutEntry(shortcut: Shortcut) {
    const children: Array<NodeSpec | string> = [];
    for (const key of shortcut.keys) {
      children.push(DomFactory.element("kbd", { text: key }), " ");
    }
    return DomFactory.element("div", {
      children: [
        DomFactory.element("dt", { children }),
        new TextControl({
          i18nKey: shortcut.descriptionKey,
          tag: "dd",
          text: shortcut.description,
        }).renderForParent(),
      ],
    });
  }

  protected render() {
    return DialogControl.toSpec({
      children: [
        DomFactory.element("section", {
          attributes: { "aria-labelledby": "help-pixel-title" },
          className: "help-pixel",
          children: [
            new TextControl({
              i18nKey: "pixelHelpTitle",
              id: "help-pixel-title",
              tag: "h3",
              text: "Pixel Emoji in the Explorer",
            }).renderForParent(),
            new TextControl({
              i18nKey: "pixelHelpDescription",
              tag: "p",
              text: "Pixel font: On uses the original 12×12 font when artwork is available. Turn it off to prefer your system font; Pixel Emoji remains a fallback for unsupported emoji.",
            }).renderForParent(),
            DomFactory.element("a", {
              attributes: {
                href: "https://github.com/lewismoten/emoji/tree/main/pixel-font",
              },
              dataset: { i18n: "pixelHelpLink" },
              text: "Learn about and download Pixel Emoji",
            }),
          ],
        }),
        DomFactory.element("section", {
          attributes: { "aria-labelledby": "help-settings-title" },
          className: "help-settings",
          children: [
            new TextControl({
              i18nKey: "settings",
              id: "help-settings-title",
              tag: "h3",
              text: "Settings",
            }).renderForParent(),
            this.createSettingRow({
              control: DomFactory.element("div", {
                className: "help-language-control",
              }),
              description: "Choose a language for emoji search.",
              descriptionKey: "chooseLanguageDescription",
              title: "Language",
              titleKey: "language",
            }),
            this.createSettingRow({
              control: ThemeChoiceGroupControl.toSpec({}),
              description: "Switch between dark, light, and retro themes.",
              descriptionKey: "themeDescription",
              title: "Theme",
              titleKey: "theme",
            }),
            this.createSettingRow({
              control: AudioChoiceGroupControl.toSpec({}),
              description:
                "Sound effects and music are available in light, dark, and retro themes.",
              descriptionKey: "audioDescription",
              rowClassName: "advanced-only",
              title: "Audio",
              titleKey: "audio",
            }),
            this.createSettingRow({
              control: ModeChoiceGroupControl.toSpec({}),
              description:
                "Standard hides advanced tools, Advanced unlocks exploration tools, and Developer adds Base theme and the pixel editor.",
              descriptionKey: "modeDescription",
              title: "Mode",
              titleKey: "mode",
            }),
          ],
        }),
        new TextControl({
          className: "shortcut-heading",
          i18nKey: "keyboardShortcuts",
          tag: "h3",
          text: "Keyboard shortcuts",
        }).renderForParent(),
        DomFactory.element("dl", {
          className: "shortcut-list",
          children: shortcuts.map((shortcut) =>
            this.createShortcutEntry(shortcut),
          ),
        }),
      ],
      className: "help-dialog",
      dialogId: "help-dialog",
      title: this.state.headingTitle,
      titleId: this.state.headingTitleId,
      titleKey: this.state.headingTitleKey,
    });
  }
}
