import { displayEmojiKey } from "./emoji-format.js";
import * as state from "../../state.js";
import { displayUnicodeSubGroupName } from "../filters/filter-picker.js";

type RenderState = {
  cellFragment?: DocumentFragment;
  emoji?: HTMLElement;
  group?: string;
  groupElement?: HTMLElement;
  items: HTMLElement[];
  subGroup?: string;
  subGroupElement?: HTMLElement;
  type?: string;
  unicodeSubGroup?: string;
  unicodeSubGroupElement?: HTMLElement;
};

export function createEmojiListRenderers(options: {
  applyPixelArtworkClass: (element: Element | null, key: string) => void;
  byId?: () => Record<string, any>;
  displayExplorerLabel: (name: string) => string;
  displayGroupName: (name: string) => string;
  displayUnicodeSubGroupName?: (name: string) => string;
  emojiByKey?: () => Record<string, string>;
  focusedEmojiKey: () => string;
  getIntroducedVersion: (key: string) => string;
  groups: () => string[];
  orderMode: () => string;
  popularKeys: () => string[];
  searchAnnotations?: () => Record<string, string[]>;
  sequenceTranslationKeys: Record<string, string>;
  sequenceTypeLabels: Record<string, string>;
  sequenceTypeOrder: string[];
  translate: (key: string, fallback: string) => string;
  unassigned: string;
  subGroups?: () => Record<string, string[]>;
}) {
  const popularBucketSize = 10;

  const asGroup = (name: string) => {
    const element = document.createElement("div");
    element.className = "group";
    const heading = document.createElement("h3");
    heading.innerText = options.displayGroupName(name);
    heading.className = "name";
    element.appendChild(heading);
    return element;
  };

  const asUnicodeSubGroup = (name: string) => {
    const element = document.createElement("div");
    element.className = "unicode-subgroup";
    const heading = document.createElement("h4");
    heading.innerText =
      options.displayUnicodeSubGroupName?.(name) ??
      displayUnicodeSubGroupName(name) ??
      "";
    heading.className = "name";
    element.appendChild(heading);
    const sections = document.createElement("div");
    sections.className = "subgroup-list";
    element.appendChild(sections);
    return element;
  };

  const asSubGroup = (name: string, direct: boolean) => {
    const element = document.createElement("div");
    element.className = direct ? "subgroup is-direct" : "subgroup";
    const heading = document.createElement(direct ? "span" : "h5");
    heading.innerText = options.displayExplorerLabel(name) ?? "";
    heading.className = "name";
    element.appendChild(heading);
    const emoji = document.createElement("div");
    emoji.className = "emoji";
    element.appendChild(emoji);
    return element;
  };

  const flushEmojiCellFragment = (state: RenderState) => {
    if (!state.cellFragment?.hasChildNodes()) return;
    const target = state.emoji ?? state.subGroupElement?.lastElementChild;
    target?.appendChild(state.cellFragment);
    state.cellFragment = document.createDocumentFragment();
  };

  const asEmojiCell = (key: string, groupId = 0, subGroupId = 0) => {
    const element = document.createElement("button");
    element.type = "button";
    element.id = key;
    element.dataset.emojiKey = key;
    const accessibleName =
      options.searchAnnotations?.()[key]?.[0] ??
      state.searchAnnotations.get(key)?.[0] ??
      options.byId?.()[key]?.shortName ??
      state.byId.get(key)?.shortName ??
      displayEmojiKey(key);
    element.title = accessibleName;
    element.tabIndex = key === options.focusedEmojiKey() ? 0 : -1;
    element.setAttribute("role", "button");
    const introduced = options.getIntroducedVersion(key);
    const versionDescription =
      introduced === "—"
        ? ""
        : `, ${options.translate("emojiVersion", "Emoji version")} ${introduced}`;
    element.setAttribute(
      "aria-label",
      `${accessibleName}${versionDescription}`,
    );
    element.classList.add(`group-${groupId}`);
    element.classList.add(`sub-group-${subGroupId}`);
    const glyph = document.createElement("span");
    glyph.className = "emoji-glyph";
    glyph.innerText =
      options.emojiByKey?.()[key] ?? state.emojiByKey.get(key) ?? "";
    options.applyPixelArtworkClass(glyph, key);
    element.appendChild(glyph);
    return element;
  };

  type GS = typeof state;
  const resolveGlobalState = (globalState?: GS) =>
    globalState ?? ({
      ...state,
      byId: {
        get: (name?: string) =>
          typeof name === "string"
            ? (options.byId?.() ?? state.byId.get())[name]
            : (options.byId?.() ?? state.byId.get()),
      },
      subGroups: {
        get: (name?: string) =>
          typeof name === "string"
            ? (options.subGroups?.() ?? state.subGroups.get())[name]
            : (options.subGroups?.() ?? state.subGroups.get()),
      },
    } as GS);
  const asItem = (state: RenderState, key: string, globalState?: GS) => {
    const resolvedState = resolveGlobalState(globalState);
    const groups = options.groups();
    const orderMode = options.orderMode();
    if (orderMode === "popular") {
      const popularIndex = options.popularKeys().indexOf(key);
      const bucketEnd = Math.min(
        Math.ceil((popularIndex + 1) / popularBucketSize) * popularBucketSize,
        options.popularKeys().length,
      );
      const bucketLabel = `${options.translate("top", "Top")} ${bucketEnd}`;
      if (state.group !== bucketLabel) {
        flushEmojiCellFragment(state);
        state.groupElement = asGroup(bucketLabel);
        state.items.push(state.groupElement);
        const subgroupList = document.createElement("div");
        subgroupList.className = "subgroup-list";
        state.subGroupElement = asSubGroup("", true);
        subgroupList.appendChild(state.subGroupElement);
        state.groupElement.appendChild(subgroupList);
        state.emoji = state.subGroupElement.lastElementChild as HTMLElement;
        state.group = bucketLabel;
        state.unicodeSubGroup = undefined;
        state.subGroup = undefined;
      }
      state.cellFragment?.appendChild(
        asEmojiCell(key, Math.floor(popularIndex / popularBucketSize), 0),
      );
      return state;
    }
    const meta = resolvedState.byId.get(key) ?? {
      group: options.unassigned,
      subGroup: options.unassigned,
      unicodeSubGroup: options.unassigned,
      hasExplorerSections: false,
    };
    const displaySubGroup =
      orderMode === "unicode" ? meta.unicodeSubGroup : meta.subGroup;
    const directSubGroup = orderMode === "unicode" || !meta.hasExplorerSections;
    let groupId = 0;
    let subGroupId = 0;
    const hasGroups = groups.length !== 0;

    if (hasGroups) {
      if (state.group !== meta.group) {
        flushEmojiCellFragment(state);
        state.groupElement = asGroup(meta.group);
        state.items.push(state.groupElement);
        state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
        state.groupElement.appendChild(state.unicodeSubGroupElement);
        state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
        state.unicodeSubGroupElement.lastChild?.appendChild(
          state.subGroupElement,
        );
        state.group = meta.group;
        state.unicodeSubGroup = meta.unicodeSubGroup;
        state.subGroup = displaySubGroup;
      } else if (state.unicodeSubGroup !== meta.unicodeSubGroup) {
        flushEmojiCellFragment(state);
        state.unicodeSubGroupElement = asUnicodeSubGroup(meta.unicodeSubGroup);
        state.groupElement?.appendChild(state.unicodeSubGroupElement);
        state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
        state.unicodeSubGroupElement.lastChild?.appendChild(state.subGroupElement);
        state.unicodeSubGroup = meta.unicodeSubGroup;
      } else if (state.subGroup !== displaySubGroup) {
        flushEmojiCellFragment(state);
        state.subGroupElement = asSubGroup(displaySubGroup, directSubGroup);
        state.unicodeSubGroupElement?.lastChild?.appendChild(
          state.subGroupElement,
        );
        state.subGroup = displaySubGroup;
      }
      groupId = groups.indexOf(meta.group);
      subGroupId =
        resolvedState.subGroups.get(meta.group)?.indexOf(meta.unicodeSubGroup) ??
        0;
    }

    const cell = asEmojiCell(key, groupId, subGroupId);
    if (hasGroups) state.cellFragment?.appendChild(cell);
    else state.items.push(cell);
    return state;
  };

  const asSequenceItem = (
    state: RenderState,
    key: string,
    globalState?: GS,
  ) => {
    const resolvedState = resolveGlobalState(globalState);
    const type = resolvedState.byId.get(key)?.sequenceType ?? "single";
    if (state.type !== type) {
      flushEmojiCellFragment(state);
      const section = document.createElement("div");
      section.className = "sequence-type";
      const heading = document.createElement("h3");
      heading.className = "name";
      const fallback = options.sequenceTypeLabels[type] ?? type;
      heading.innerText = options.translate(
        options.sequenceTranslationKeys[type],
        fallback,
      );
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      section.append(heading, emoji);
      state.items.push(section);
      state.emoji = emoji;
      state.type = type;
    }
    state.cellFragment?.appendChild(asEmojiCell(key));
    return state;
  };

  const orderedKeys = (keys: string[]) => {
    const orderMode = options.orderMode();
    if (orderMode === "grouped") return keys;
    if (orderMode === "popular") {
      const popularOrder = new Map(
        options.popularKeys().map((key, index) => [key, index]),
      );
      return [...keys].sort(
        (left, right) =>
          (popularOrder.get(left) ?? Number.MAX_SAFE_INTEGER) -
          (popularOrder.get(right) ?? Number.MAX_SAFE_INTEGER),
      );
    }
    return [...keys].sort((left, right) => {
      if (orderMode === "sequence") {
        const typeDifference =
          options.sequenceTypeOrder.indexOf(
            state.byId.get(left)?.sequenceType ?? "single",
          ) -
          options.sequenceTypeOrder.indexOf(
            state.byId.get(right)?.sequenceType ?? "single",
          );
        if (typeDifference !== 0) return typeDifference;
      }
      return (state.byId.get(left)?.order ?? Infinity) - (state.byId.get(right)?.order ?? Infinity);
    });
  };

  return {
    asEmojiCell,
    asGroup,
    asItem,
    asSequenceItem,
    asSubGroup,
    asUnicodeSubGroup,
    flushEmojiCellFragment,
    orderedKeys,
  };
}
