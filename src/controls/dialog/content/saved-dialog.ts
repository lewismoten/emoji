import { BaseControl } from "../../core/base-control.js";
import { DomFactory } from "../../core/dom-factory.js";
import { DialogControl } from "../dialog-control.js";
import { TextControl } from "../../core/text-control.js";

const savedDialogStyleId = "saved-dialog-control-style";
const savedDialogStyleText = `
.saved-section {
  padding: 1rem;
}

.saved-section + .saved-section {
  border-top: 1px solid var(--border);
}

.saved-section h3 {
  margin: 0 0 0.65rem;
  color: var(--muted);
  font-size: 0.82rem;
}

.saved-emoji-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.saved-emoji-list button {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-md-lg);
  background: var(--panel-strong);
  color: var(--text);
  cursor: pointer;
  font-family: var(--emoji-font);
  font-size: 1.4rem;
  animation: saved-emoji-enter 320ms var(--motion-ease) both;
  animation-delay: calc(var(--saved-index, 0) * 24ms);
}

.saved-emoji-list button:hover {
  border-color: var(--accent);
  background: var(--accent-surface);
}

.saved-emoji-list button:active {
  transform: scale(0.9);
}

@media (hover: hover) {
  .saved-emoji-list button:hover {
    box-shadow: var(--shadow-saved-emoji-hover, none);
    transform: translateY(-0.2rem) rotate(-2deg) scale(1.08);
  }

  .saved-emoji-list button:nth-child(even):hover {
    transform: translateY(-0.2rem) rotate(2deg) scale(1.08);
  }
}

@keyframes saved-emoji-enter {
  0% {
    opacity: 0;
    transform: translateY(0.55rem) rotate(-4deg) scale(0.72);
  }

  70% {
    transform: translateY(-0.08rem) rotate(1deg) scale(1.08);
  }
}

.saved-empty {
  margin: 0;
  color: var(--muted);
  font-size: 0.82rem;
}

.saved-empty[hidden] {
  display: none;
}
`;

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

  protected styles() {
    return [
      {
        id: savedDialogStyleId,
        text: savedDialogStyleText,
      },
    ];
  }

  protected childControls() {
    return [
      new DialogControl({
        children: [],
        className: "saved-dialog",
        dialogId: this.state.dialogId,
        title: this.state.title,
        titleId: this.state.titleId,
        titleKey: this.state.titleKey,
        isMusical: true,
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
    return DialogControl.toSpec({
      children: [
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
      className: "saved-dialog",
      dialogId: this.state.dialogId,
      isMusical: true,
      title: this.state.title,
      titleId: this.state.titleId,
      titleKey: this.state.titleKey,
    });
  }
}
