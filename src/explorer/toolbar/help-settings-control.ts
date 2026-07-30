import { HelpSettingsDialogControl } from "../../controls/dialog/content/help-settings-dialog.js";

type HelpDialogControl = {
  element: HTMLDialogElement;
  mountLanguagePicker: (languagePicker: HTMLElement | null) => void;
};

export function createHelpDialogControl(): HelpDialogControl {
  const element = HelpSettingsDialogControl.create() as HTMLDialogElement;
  return {
    element,
    mountLanguagePicker(languagePicker) {
      const languageControl = element.querySelector(".help-language-control");
      if (languageControl && languagePicker) languageControl.append(languagePicker);
    },
  };
}
