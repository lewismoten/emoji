// @ts-nocheck -- Transitional TypeScript migration.
function isVisibleControl(button) {
  return (
    button &&
    !button.hidden &&
    !button.disabled &&
    button.getClientRects().length > 0
  );
}

function visibleControls(buttons) {
  return buttons.filter(isVisibleControl);
}

export function syncRovingGrid(buttons, active) {
  const visible = visibleControls(buttons);
  if (visible.length === 0) return;
  const nextActive =
    (active && visible.includes(active) && active) ||
    visible.find((button) => button.getAttribute("aria-pressed") === "true") ||
    visible.find((button) => button.classList.contains("is-active")) ||
    visible.find((button) => button.classList.contains("is-selected")) ||
    visible.find((button) => button.tabIndex === 0) ||
    visible[0];
  buttons.forEach((button) => {
    button.tabIndex =
      isVisibleControl(button) && button === nextActive ? 0 : -1;
  });
}

function findGridTarget(buttons, current, key) {
  const visible = visibleControls(buttons);
  const currentIndex = visible.indexOf(current);
  if (currentIndex === -1 || visible.length === 0) return undefined;
  if (key === "Home") return visible[0];
  if (key === "End") return visible.at(-1);
  const currentRect = current.getBoundingClientRect();
  const rowTolerance = Math.max(8, currentRect.height / 2);
  const positioned = visible.map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      button,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  });
  const rows = [];
  positioned.forEach((item) => {
    const row = rows.find(
      (candidate) =>
        Math.abs(candidate[0].centerY - item.centerY) <= rowTolerance,
    );
    if (row) row.push(item);
    else rows.push([item]);
  });
  rows.forEach((row) =>
    row.sort((left, right) => left.centerX - right.centerX),
  );
  rows.sort((top, bottom) => top[0].centerY - bottom[0].centerY);
  const rowIndex = rows.findIndex((row) =>
    row.some((item) => item.button === current),
  );
  const columnIndex =
    rows[rowIndex]?.findIndex((item) => item.button === current) ?? -1;
  if (rowIndex === -1 || columnIndex === -1) return undefined;
  const rtl = document.documentElement.dir === "rtl";
  const movePrevious = rtl ? key === "ArrowRight" : key === "ArrowLeft";
  const moveNext = rtl ? key === "ArrowLeft" : key === "ArrowRight";
  if (movePrevious || moveNext) {
    const row = rows[rowIndex];
    const offset = movePrevious ? -1 : 1;
    return row[(columnIndex + offset + row.length) % row.length]?.button;
  }
  const targetRow = rows[rowIndex + (key === "ArrowUp" ? -1 : 1)];
  if (!targetRow) return undefined;
  const currentItem = rows[rowIndex][columnIndex];
  return targetRow
    .map((item) => ({
      button: item.button,
      score: Math.abs(item.centerX - currentItem.centerX),
    }))
    .sort((left, right) => left.score - right.score)[0]?.button;
}

export function bindRovingGrid(buttons) {
  syncRovingGrid(buttons);
  buttons.forEach((button) => {
    button.addEventListener("focus", () => syncRovingGrid(buttons, button));
    button.addEventListener("click", () => syncRovingGrid(buttons, button));
    button.addEventListener("keydown", (event) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(event.key)
      )
        return;
      const nextButton = findGridTarget(buttons, button, event.key);
      if (!nextButton) return;
      event.preventDefault();
      event.stopPropagation();
      syncRovingGrid(buttons, nextButton);
      nextButton.focus();
    });
  });
}

function paletteGridPosition(button) {
  const explicitRow = Number.parseInt(button.dataset.gridRow ?? "", 10);
  const explicitColumn = Number.parseInt(button.dataset.gridColumn ?? "", 10);
  if (Number.isFinite(explicitRow) && Number.isFinite(explicitColumn)) {
    return { row: explicitRow, column: explicitColumn };
  }
  const style = getComputedStyle(button);
  const parseStart = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  return {
    row: parseStart(style.gridRowStart, 1),
    column: parseStart(style.gridColumnStart, 1),
  };
}

export function bindPaletteGrid(buttons) {
  syncRovingGrid(buttons);
  buttons.forEach((button) => {
    button.addEventListener("focus", () => syncRovingGrid(buttons, button));
    button.addEventListener("click", () => syncRovingGrid(buttons, button));
    button.addEventListener("keydown", (event) => {
      if (
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(event.key)
      )
        return;
      const visible = visibleControls(buttons);
      if (!visible.includes(button)) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Home" || event.key === "End") {
        const nextButton = event.key === "Home" ? visible[0] : visible.at(-1);
        if (!nextButton) return;
        syncRovingGrid(buttons, nextButton);
        nextButton.focus();
        return;
      }
      const rtl = document.documentElement.dir === "rtl";
      const position = paletteGridPosition(button);
      const matches = visible
        .filter((candidate) => candidate !== button)
        .map((candidate) => ({
          button: candidate,
          ...paletteGridPosition(candidate),
        }));
      let nextButton;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const direction = event.key === "ArrowUp" ? -1 : 1;
        const candidates = matches
          .filter((candidate) => candidate.column === position.column)
          .sort((left, right) => (left.row - right.row) * direction);
        nextButton = candidates.find((candidate) =>
          direction < 0
            ? candidate.row < position.row
            : candidate.row > position.row,
        )?.button;
      } else {
        const movePrevious = rtl
          ? event.key === "ArrowRight"
          : event.key === "ArrowLeft";
        const direction = movePrevious ? -1 : 1;
        const candidates = matches
          .filter((candidate) => candidate.row === position.row)
          .sort((left, right) => (left.column - right.column) * direction);
        nextButton = candidates.find((candidate) =>
          direction < 0
            ? candidate.column < position.column
            : candidate.column > position.column,
        )?.button;
      }
      if (!nextButton) return;
      syncRovingGrid(buttons, nextButton);
      nextButton.focus();
    });
  });
}
