type EmojiCell = HTMLElement & {
  dataset: DOMStringMap & { emojiKey?: string };
};

export function createEmojiListInteraction(options: {
  asItem: (state: any, key: string) => any;
  asSequenceItem: (state: any, key: string) => any;
  drawList: () => void;
  emojiList: () => HTMLElement;
  flushEmojiCellFragment: (state: any) => void;
  focusedEmojiKey: () => string;
  getDisplayedKeys: () => string[];
  nextRenderGeneration: () => number;
  onClick: (event: Event) => void;
  orderMode: () => string;
  renderGeneration: () => number;
  resetFilters: () => void;
  revealExplorer: () => void;
  searchText: () => HTMLInputElement;
  setFocusedEmojiKey: (key: string) => void;
  translate: (key: string, fallback: string) => string;
  unassigned: string;
}) {
  const yieldForListRender = () => {
    if ((window as any).scheduler?.yield)
      return (window as any).scheduler.yield();
    return new Promise((resolve) => window.setTimeout(resolve, 0));
  };

  const finishEmojiListRender = (
    generation: number,
    shouldRestoreEmojiFocus: boolean,
    renderRoot: DocumentFragment,
  ) => {
    if (generation !== options.renderGeneration()) return;
    const emojiList = options.emojiList();
    emojiList.replaceChildren(renderRoot);
    delete emojiList.dataset.rendering;
    options.revealExplorer();
    if (shouldRestoreEmojiFocus) {
      document.getElementById(options.focusedEmojiKey())?.focus();
    }
  };

  const createEmptyResults = () => {
    const section = document.createElement("section");
    section.className = "empty-results";
    const title = document.createElement("h3");
    title.textContent = options.translate("noResults", "No emoji found");
    const description = document.createElement("p");
    description.textContent = options.translate(
      "noResultsDescription",
      "Try removing a search term or filter.",
    );
    const actions = document.createElement("div");
    actions.className = "empty-actions";
    const searchText = options.searchText();
    if (searchText.value.trim()) {
      const clearSearch = document.createElement("button");
      clearSearch.type = "button";
      clearSearch.textContent = options.translate(
        "clearSearch",
        "Clear search",
      );
      clearSearch.addEventListener("click", () => {
        searchText.value = "";
        options.drawList();
        searchText.focus();
      });
      actions.appendChild(clearSearch);
    }
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = options.translate("resetFilters", "Reset filters");
    reset.addEventListener("click", options.resetFilters);
    actions.appendChild(reset);
    section.append(title, description, actions);
    return section;
  };

  const renderEmojiList = (
    keys: string[],
    shouldRestoreEmojiFocus: boolean,
  ) => {
    const generation = options.nextRenderGeneration();
    const renderRoot = document.createDocumentFragment();
    const emojiList = options.emojiList();
    emojiList.dataset.rendering = "true";
    emojiList.setAttribute("aria-busy", "true");
    if (keys.length === 0) {
      renderRoot.appendChild(createEmptyResults());
      finishEmojiListRender(generation, shouldRestoreEmojiFocus, renderRoot);
      return;
    }
    const sequenceOrder = options.orderMode() === "sequence";
    const renderer = sequenceOrder ? options.asSequenceItem : options.asItem;
    const state = sequenceOrder
      ? {
          items: [],
          type: "",
          emoji: null,
          cellFragment: document.createDocumentFragment(),
        }
      : {
          items: [],
          group: options.unassigned,
          unicodeSubGroup: options.unassigned,
          subGroup: options.unassigned,
          groupElement: null,
          unicodeSubGroupElement: null,
          subGroupElement: null,
          cellFragment: document.createDocumentFragment(),
        };
    let keyIndex = 0;
    let appendedItemCount = 0;
    const renderChunk = () => {
      if (generation !== options.renderGeneration()) return;
      const deadline = performance.now() + 6;
      const chunkEnd = Math.min(keyIndex + 120, keys.length);
      do {
        renderer(state, keys[keyIndex++]);
      } while (
        keyIndex < chunkEnd &&
        keyIndex < keys.length &&
        performance.now() < deadline
      );
      options.flushEmojiCellFragment(state);
      if (appendedItemCount < state.items.length) {
        const fragment = document.createDocumentFragment();
        while (appendedItemCount < state.items.length) {
          fragment.appendChild(state.items[appendedItemCount++]);
        }
        renderRoot.appendChild(fragment);
      }
      if (keyIndex < keys.length) yieldForListRender().then(renderChunk);
      else
        finishEmojiListRender(generation, shouldRestoreEmojiFocus, renderRoot);
    };
    renderChunk();
  };

  const onEmojiFocus = (event: FocusEvent) => {
    const cell = (event.target as HTMLElement)?.closest<EmojiCell>(
      "[data-emoji-key]",
    );
    if (!cell) return;
    options.setFocusedEmojiKey(cell.dataset.emojiKey ?? "");
    options
      .emojiList()
      .querySelectorAll<HTMLElement>("[data-emoji-key]")
      .forEach((item) => {
        item.tabIndex = item === cell ? 0 : -1;
      });
  };

  const closestVerticalEmoji = (
    current: HTMLElement,
    cells: HTMLElement[],
    direction: number,
  ) => {
    const currentRect = current.getBoundingClientRect();
    const currentX = currentRect.left + currentRect.width / 2;
    const currentY = currentRect.top + currentRect.height / 2;
    return cells
      .filter((cell) => {
        if (cell === current) return false;
        const rect = cell.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        return direction > 0 ? centerY > currentY + 1 : centerY < currentY - 1;
      })
      .map((cell) => {
        const rect = cell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return {
          cell,
          score:
            Math.abs(centerY - currentY) * 1000 + Math.abs(centerX - currentX),
        };
      })
      .sort((left, right) => left.score - right.score)[0]?.cell;
  };

  const onEmojiKeyDown = (event: KeyboardEvent) => {
    const cell = (event.target as HTMLElement)?.closest<HTMLElement>(
      "[data-emoji-key]",
    );
    if (!cell) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      options.onClick(event);
      return;
    }
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
    event.preventDefault();
    const cells = options
      .getDisplayedKeys()
      .map((key) => document.getElementById(key))
      .filter(Boolean) as HTMLElement[];
    if (cells.length === 0) return;
    let target: HTMLElement | undefined;
    if (event.key === "Home") target = cells[0];
    else if (event.key === "End") target = cells.at(-1);
    else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      target = closestVerticalEmoji(
        cell,
        cells,
        event.key === "ArrowDown" ? 1 : -1,
      );
    } else {
      const rtl = document.documentElement.dir === "rtl";
      const direction =
        event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : -1;
      target = cells[cells.indexOf(cell) + direction];
    }
    target?.focus();
  };

  return { onEmojiFocus, onEmojiKeyDown, renderEmojiList };
}
