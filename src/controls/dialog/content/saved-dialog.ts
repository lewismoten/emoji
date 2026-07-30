import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { DialogHeadingControl } from "../dialog-heading.js";
import { TextControl } from "../../core/text-control.js";

const savedDialogStylesheetId = "saved-dialog-control-stylesheet";
const savedDialogStylesheetHref =
  "./explorer/controls/dialog/content/saved-dialog.css";

type SavedDialogState = {
  dialogId: string;
  titleId: string;
  titleKey: string;
  title: string;
  favoritesTitleId: string;
  favoritesTitleKey: string;
  favoritesTitle: string;
  favoritesEmptyKey: string;
  favoritesEmptyText: string;
  copiedTitleId: string;
  copiedTitleKey: string;
  copiedTitle: string;
  copiedEmptyKey: string;
  copiedEmptyText: string;
};

export class SavedDialogControl extends BaseControl<SavedDialogState> {
  constructor(state?: Partial<SavedDialogState>) {
    super({
      copiedEmptyKey: "noRecentlyCopied",
      copiedEmptyText: "Copied emoji will appear here.",
      copiedTitle: "Recently Copied",
      copiedTitleId: "copied-title",
      copiedTitleKey: "recentlyCopied",
      dialogId: "saved-dialog",
      favoritesEmptyKey: "noFavorites",
      favoritesEmptyText: "Favorite emoji will appear here.",
      favoritesTitle: "Favorites",
      favoritesTitleId: "favorites-title",
      favoritesTitleKey: "favorites",
      title: "Saved emoji",
      titleId: "saved-title",
      titleKey: "savedEmoji",
      ...state,
    });
  }

  protected stylesheets() {
    return [
      {
        href: savedDialogStylesheetHref,
        id: savedDialogStylesheetId,
      },
    ];
  }

  protected childControls() {
    return [
      new DialogHeadingControl({
        title: this.state.title,
        titleId: this.state.titleId,
        titleKey: this.state.titleKey,
      }),
    ];
  }

  private createSection(options: {
    emptyClassName: string;
    emptyKey: string;
    emptyText: string;
    listClassName: string;
    title: string;
    titleId: string;
    titleKey: string;
  }) {
    return DomFactory.element("section", {
      attributes: { "aria-labelledby": options.titleId },
      className: "saved-section",
      children: [
        new TextControl({
          i18nKey: options.titleKey,
          id: options.titleId,
          tag: "h3",
          text: options.title,
        }).renderForParent(),
        DomFactory.element("div", {
          className: `saved-emoji-list ${options.listClassName}`,
        }),
        new TextControl({
          className: `saved-empty ${options.emptyClassName}`,
          i18nKey: options.emptyKey,
          tag: "p",
          text: options.emptyText,
        }).renderForParent(),
      ],
    });
  }

  protected render() {
    return DomFactory.element("dialog", {
      attributes: {
        "aria-labelledby": this.state.titleId,
        id: this.state.dialogId,
      },
      className: "saved-dialog",
      children: [
        DialogHeadingControl.toSpec({
          title: this.state.title,
          titleId: this.state.titleId,
          titleKey: this.state.titleKey,
        }),
        this.createSection({
          emptyClassName: "favorites-empty",
          emptyKey: this.state.favoritesEmptyKey,
          emptyText: this.state.favoritesEmptyText,
          listClassName: "favorites-list",
          title: this.state.favoritesTitle,
          titleId: this.state.favoritesTitleId,
          titleKey: this.state.favoritesTitleKey,
        }),
        this.createSection({
          emptyClassName: "copied-empty",
          emptyKey: this.state.copiedEmptyKey,
          emptyText: this.state.copiedEmptyText,
          listClassName: "copied-list",
          title: this.state.copiedTitle,
          titleId: this.state.copiedTitleId,
          titleKey: this.state.copiedTitleKey,
        }),
      ],
    });
  }
}
