import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { resolveRenderingDiagnostic } from "../../../src/explorer/emoji/rendering-diagnostic.js";

describe("rendering-diagnostic", () => {
  it("resolves diagnostic state for composed, split, painted, and hidden scenarios", () => {
    const translate = (key: string, fallback: string) => `${key}:${fallback}`;

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: "1F469 200D 1F52C",
        emojiValue: "👩‍🔬",
        painted: true,
        privateUsePoint: 0xe001,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => true,
        translate,
      }),
      {
        sectionAvailable: true,
        invitationAvailable: false,
        sectionHidden: false,
        invitationHidden: true,
        regularEditorHidden: false,
        split: true,
        resultText:
          "systemRenderingSplit:⚠ The system displayed separate components; Pixel Emoji keeps the sequence together.",
      },
    );

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: "1F469 200D 1F52C",
        emojiValue: "👩‍🔬",
        painted: true,
        privateUsePoint: undefined,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => true,
        translate,
      }),
      {
        sectionAvailable: false,
        invitationAvailable: false,
        sectionHidden: true,
        invitationHidden: true,
        regularEditorHidden: false,
        split: false,
        resultText:
          "systemRenderingComposed:✓ The system displayed one composed emoji.",
      },
    );

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: "1F381 FE0F",
        emojiValue: "🎁",
        painted: true,
        privateUsePoint: 0xe001,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => true,
        translate,
      }),
      {
        sectionAvailable: true,
        invitationAvailable: false,
        sectionHidden: false,
        invitationHidden: true,
        regularEditorHidden: false,
        split: false,
        resultText:
          "systemRenderingSingle:The system and Pixel Emoji renderings are shown above.",
      },
    );

    assert.equal(
      resolveRenderingDiagnostic({
        codePoints: "1F381",
        emojiValue: "🎁",
        painted: false,
        privateUsePoint: undefined,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => false,
        translate,
      }).invitationAvailable,
      true,
    );

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: undefined,
        emojiValue: "🎁",
        painted: true,
        privateUsePoint: 0xe001,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => false,
        translate,
      }),
      {
        sectionAvailable: true,
        invitationAvailable: false,
        sectionHidden: false,
        invitationHidden: true,
        regularEditorHidden: false,
        split: false,
        resultText:
          "systemRenderingSingle:The system and Pixel Emoji renderings are shown above.",
      },
    );

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: "1F469 200D 1F52C",
        emojiValue: "👩‍🔬",
        painted: true,
        privateUsePoint: 0xe001,
        developerMode: true,
        detailsVisible: true,
        systemEmojiAppearsSplit: () => false,
        translate,
      }),
      {
        sectionAvailable: true,
        invitationAvailable: false,
        sectionHidden: false,
        invitationHidden: true,
        regularEditorHidden: false,
        split: false,
        resultText:
          "systemRenderingComposed:✓ The system displayed one composed emoji.",
      },
    );

    assert.deepEqual(
      resolveRenderingDiagnostic({
        codePoints: "1F381 FE0F",
        emojiValue: "🎁",
        painted: true,
        privateUsePoint: 0xe001,
        developerMode: false,
        detailsVisible: false,
        systemEmojiAppearsSplit: () => false,
        translate,
      }),
      {
        sectionAvailable: true,
        invitationAvailable: false,
        sectionHidden: true,
        invitationHidden: true,
        regularEditorHidden: true,
        split: false,
        resultText:
          "systemRenderingSingle:The system and Pixel Emoji renderings are shown above.",
      },
    );
  });
});
