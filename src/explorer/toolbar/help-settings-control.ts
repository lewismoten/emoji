import {
  appendToDialogPart,
  createDialogControlParts,
} from "../dialog/parts/dialog-control-parts.js";

type HelpDialogControl = {
  element: HTMLDialogElement;
  dialog: HTMLDialogElement;
  languageControl: HTMLElement;
  mountLanguagePicker: (languagePicker: HTMLElement | null) => void;
};

export async function createHelpDialogControl(): Promise<HelpDialogControl> {
  const { HelpSettingsDialogControl } = await import(
    "../../controls/dialog/content/help-settings-dialog.js"
  );
  const element = HelpSettingsDialogControl.create() as HTMLDialogElement;
  const parts = createDialogControlParts(element, {
    languageControl: ".help-language-control",
  });
  return {
    ...parts,
    mountLanguagePicker(languagePicker) {
      appendToDialogPart(parts.languageControl, languagePicker);
    },
  };
}
