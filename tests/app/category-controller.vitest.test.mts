import { afterEach, describe, expect, it } from "vitest";

import { createCategoryController } from "../../src/app/category-controller.js";
import * as preferences from "../../src/preferences.js";
import * as state from "../../src/state.js";

describe("category-controller", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  afterEach(() => {
    state.searchLabels.clear();
    state.groupRepresentativeEmoji.replace(new Map());
    state.subGroupRepresentativeEmoji.replace(new Map());
    state.availableGroups.set([]);
    state.availableSequenceTypes.set([]);
    state.availableSubGroups.clear();
    state.groups.set([]);
    state.items.set([]);
    state.versionKeys.replace(new Map());
    state.selectedGroup.set("");
    state.selectedSubGroup.set("");
    state.selectedSequenceType.set("");
    state.orderMode.set("grouped");
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  });

  it("renders localized labels and updates state-backed selections", () => {
    const storage = new Map<string, string>();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem(key: string) {
            return storage.get(key) ?? null;
          },
          setItem(key: string, value: string) {
            storage.set(key, value);
          },
        },
      },
    });
    preferences.init({});

    state.searchLabels.replace({
      smileysLabel: "Localized Smileys",
      faceSmilingLabel: "Localized Smiling Faces",
    });
    state.groups.set(["Smileys & Emotion"]);
    state.items.set([
      {
        key: "grinningFace",
        emoji: "😀",
        group: "Smileys & Emotion",
        unicodeSubGroup: "face-smiling",
        sequenceType: "single",
        order: 1,
      } as any,
      {
        key: "family",
        emoji: "👨‍👩‍👧",
        group: "Smileys & Emotion",
        unicodeSubGroup: "face-smiling",
        sequenceType: "zwj",
        order: 2,
      } as any,
    ]);
    state.versionKeys.replace(
      new Map([["17.0", new Set(["grinningFace", "family"])]]) as any,
    );

    const fieldStub = {
      hidden: false,
      classList: {
        toggle() {},
      },
    };
    const groupSelector = {
      value: "",
      options: [],
      closest() {
        return fieldStub;
      },
    };
    const subGroupSelector = {
      value: "",
      options: [],
      closest() {
        return fieldStub;
      },
    };
    const sequenceTypeSelector = {
      value: "",
      options: [],
      closest() {
        return fieldStub;
      },
    };
    const orderButtons = [
      {
        dataset: { order: "grouped" },
        classList: { toggle() {} },
        setAttribute() {},
      },
      {
        dataset: { order: "sequence" },
        classList: { toggle() {} },
        setAttribute() {},
      },
    ] as any;
    const calls: string[] = [];

    const controller = createCategoryController({
      compactGroupChoices: () => ({ replaceChildren() {} }) as any,
      compactGroupLabel: () => ({ textContent: "" }) as any,
      compactSequenceChoices: () => ({ replaceChildren() {} }) as any,
      compactSequenceLabel: () => ({ textContent: "" }) as any,
      compactSubGroupChoices: () => ({ replaceChildren() {} }) as any,
      compactSubGroupLabel: () => ({ textContent: "" }) as any,
      developerModeEnabled: () => true,
      drawList: () => calls.push("draw"),
      getVersionKeys: () => new Set(["grinningFace", "family"]),
      groupFilterDialog: () => undefined,
      groupPickerTrigger: () => undefined,
      groupSelector: () => groupSelector as any,
      orderButtons: () => orderButtons,
      sequenceTranslationKeys: { single: "single", zwj: "zwj" },
      sequenceTypeEmoji: { single: "1", zwj: "2" },
      sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
      sequenceTypeOrder: ["single", "zwj"],
      sequenceTypeSelector: () => sequenceTypeSelector as any,
      subGroupFilterDialog: () => undefined,
      subGroupPickerTrigger: () => undefined,
      subGroupSelector: () => subGroupSelector as any,
      syncVersionRange: () => calls.push("sync"),
      translate: (_key: string, fallback: string) => fallback,
      unicodeGroupLabelKeys: {
        "Smileys & Emotion": "smileysLabel",
      },
      unicodeSubgroupLabelKeys: {
        "face-smiling": "faceSmilingLabel",
      },
    });

    expect(controller.displayGroupName("Smileys & Emotion")).toBe(
      "Localized Smileys",
    );
    expect(controller.displayUnicodeSubGroupName("face-smiling")).toBe(
      "Face Smiling",
    );

    state.groupRepresentativeEmoji.set("Smileys & Emotion", "😀");
    state.subGroupRepresentativeEmoji.set(
      "Smileys & Emotion::face-smiling",
      "🙂",
    );
    expect(controller.getGroupRepresentativeEmoji("Smileys & Emotion")).toBe(
      "😀",
    );
    expect(
      controller.getSubGroupRepresentativeEmoji(
        "Smileys & Emotion",
        "face-smiling",
      ),
    ).toBe("🙂");

    groupSelector.value = "Smileys & Emotion";
    controller.onGroupSelectorChange();
    expect(state.selectedGroup.get()).toBe("Smileys & Emotion");
    expect(state.selectedSubGroup.get()).toBe("");

    subGroupSelector.value = "Smileys & Emotion::face-smiling";
    controller.onSubGroupSelectorChange();
    expect(calls.filter((value) => value === "draw").length).toBeGreaterThan(1);

    sequenceTypeSelector.value = "zwj";
    controller.onSequenceTypeSelectorChange();
    expect(state.selectedSequenceType.get()).toBe("zwj");

    controller.onOrderModeChange({
      currentTarget: { dataset: { order: "sequence" } },
    });
    expect(state.orderMode.get()).toBe("sequence");
    expect(preferences.getString("order")).toBe("sequence");

    const blockedController = createCategoryController({
      compactGroupChoices: () => ({ replaceChildren() {} }) as any,
      compactGroupLabel: () => ({ textContent: "" }) as any,
      compactSequenceChoices: () => ({ replaceChildren() {} }) as any,
      compactSequenceLabel: () => ({ textContent: "" }) as any,
      compactSubGroupChoices: () => ({ replaceChildren() {} }) as any,
      compactSubGroupLabel: () => ({ textContent: "" }) as any,
      developerModeEnabled: () => false,
      drawList: () => calls.push("blocked-draw"),
      getVersionKeys: () => new Set(["grinningFace", "family"]),
      groupFilterDialog: () => undefined,
      groupPickerTrigger: () => undefined,
      groupSelector: () => groupSelector as any,
      orderButtons: () => orderButtons,
      sequenceTranslationKeys: { single: "single", zwj: "zwj" },
      sequenceTypeEmoji: { single: "1", zwj: "2" },
      sequenceTypeLabels: { single: "Single", zwj: "ZWJ" },
      sequenceTypeOrder: ["single", "zwj"],
      sequenceTypeSelector: () => sequenceTypeSelector as any,
      subGroupFilterDialog: () => undefined,
      subGroupPickerTrigger: () => undefined,
      subGroupSelector: () => subGroupSelector as any,
      syncVersionRange: () => calls.push("blocked-sync"),
      translate: (_key: string, fallback: string) => fallback,
      unicodeGroupLabelKeys: {
        "Smileys & Emotion": "smileysLabel",
      },
      unicodeSubgroupLabelKeys: {
        "face-smiling": "faceSmilingLabel",
      },
    });
    state.orderMode.set("grouped");
    blockedController.onOrderModeChange({
      currentTarget: { dataset: { order: "sequence" } },
    });
    expect(state.orderMode.get()).toBe("grouped");
    expect(calls).not.toContain("blocked-draw");

    controller.refreshLocalizedLabels();
    expect(calls).toContain("sync");
    expect(calls.filter((value) => value === "draw").length).toBeGreaterThan(0);
  });
});
