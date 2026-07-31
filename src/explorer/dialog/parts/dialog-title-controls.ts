type PositionFavoriteButtonOptions = {
  dialogControls: HTMLElement | null;
  dialogTitleRow: HTMLElement | null;
  favoriteButton: HTMLElement | null;
  compact: boolean;
};

export function ensureDialogTitleRow(dialogTitle: HTMLElement | null) {
  if (!dialogTitle) return null;
  let dialogTitleRow =
    dialogTitle.querySelector<HTMLElement>(".dialog-title-row");
  if (dialogTitleRow) {
    ensureDialogTitleMain(dialogTitleRow);
    return dialogTitleRow;
  }
  dialogTitleRow = document.createElement("div");
  dialogTitleRow.className = "dialog-title-row";
  const title = dialogTitle.querySelector("h2");
  title?.before(dialogTitleRow);
  if (title) {
    const dialogTitleMain = ensureDialogTitleMain(dialogTitleRow);
    dialogTitleMain?.append(title);
  }
  return dialogTitleRow;
}

export function ensureDialogTitleMain(dialogTitleRow: HTMLElement | null) {
  if (!dialogTitleRow) return null;
  let dialogTitleMain =
    dialogTitleRow.querySelector<HTMLElement>(".dialog-title-main");
  if (dialogTitleMain) return dialogTitleMain;
  dialogTitleMain = document.createElement("div");
  dialogTitleMain.className = "dialog-title-main";
  const title = dialogTitleRow.querySelector("h2");
  if (title) {
    title.before(dialogTitleMain);
    dialogTitleMain.append(title);
  } else {
    dialogTitleRow.append(dialogTitleMain);
  }
  return dialogTitleMain;
}

export function createFavoriteButtonControl() {
  const favoriteButton = document.createElement("button");
  favoriteButton.className = "toggle-favorite";
  favoriteButton.type = "button";
  favoriteButton.setAttribute("aria-pressed", "false");
  favoriteButton.dataset.favoriteState = "off";
  favoriteButton.dataset.i18nAriaLabel = "addFavorite";
  favoriteButton.setAttribute("aria-label", "Add favorite");
  favoriteButton.title = "Add favorite";

  const icon = document.createElement("span");
  icon.className = "modifier-emoji favorite-glyph";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "☆";
  favoriteButton.append(icon);
  return favoriteButton;
}

export function ensureFavoriteButton(dialogControls: HTMLElement | null) {
  if (!dialogControls) return null;
  let favoriteButton = document.querySelector<HTMLElement>(
    ".example-dialog .toggle-favorite",
  );
  if (!favoriteButton) {
    favoriteButton = createFavoriteButtonControl();
    dialogControls.querySelector("form")?.before(favoriteButton);
  }
  favoriteButton.querySelector(".toggle-favorite-label")?.remove();
  favoriteButton.dataset.i18nAriaLabel = "addFavorite";
  favoriteButton.setAttribute("aria-label", "Add favorite");
  favoriteButton.title = "Add favorite";
  return favoriteButton;
}

export function positionFavoriteButton({
  dialogControls,
  dialogTitleRow,
  favoriteButton,
  compact,
}: PositionFavoriteButtonOptions) {
  if (!favoriteButton || !dialogTitleRow || !dialogControls) return;
  if (compact) {
    dialogControls.querySelector("form")?.before(favoriteButton);
  } else {
    ensureDialogTitleMain(dialogTitleRow)?.prepend(favoriteButton);
  }
}
