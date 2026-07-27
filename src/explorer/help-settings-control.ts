type HelpDialogControl = {
  element: HTMLDialogElement;
  mountLanguagePicker: (languagePicker: HTMLElement | null) => void;
};

function createHeading(level: "h2" | "h3" | "h4", key: string, text: string) {
  const heading = document.createElement(level);
  heading.dataset.i18n = key;
  heading.textContent = text;
  return heading;
}

function createDialogCloseButton() {
  const form = document.createElement("form");
  form.method = "dialog";
  const button = document.createElement("button");
  button.className = "dialog-close";
  button.dataset.i18nAriaLabel = "close";
  button.setAttribute("aria-label", "Close");
  button.textContent = "×";
  form.append(button);
  return form;
}

function createSettingDescription(key: string, text: string) {
  const description = document.createElement("p");
  description.dataset.i18n = key;
  description.textContent = text;
  return description;
}

function createSettingRow(options: {
  titleKey: string;
  title: string;
  descriptionKey: string;
  description: string;
  control: HTMLElement;
}) {
  const row = document.createElement("div");
  row.className = "setting-row";

  const content = document.createElement("div");
  content.append(
    createHeading("h4", options.titleKey, options.title),
    createSettingDescription(options.descriptionKey, options.description),
  );

  row.append(content, options.control);
  return row;
}

function createThemeChoice(theme: string, emoji: string, key: string, text: string) {
  const button = document.createElement("button");
  button.className = "setting-choice theme-choice";
  button.type = "button";
  button.dataset.theme = theme;
  button.setAttribute("aria-pressed", "false");

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = emoji;

  const label = document.createElement("span");
  label.dataset.i18n = key;
  label.textContent = text;

  button.append(icon, label);
  return button;
}

function createThemeChoices() {
  const group = document.createElement("div");
  group.className = "setting-choice-group theme-choices";
  group.setAttribute("role", "group");
  group.dataset.i18nAriaLabel = "theme";
  group.setAttribute("aria-label", "Theme");
  group.append(
    createThemeChoice("light", "☀️", "light", "Light"),
    createThemeChoice("dark", "🌙", "dark", "Dark"),
    createThemeChoice("retro", "🕹️", "retro", "Retro"),
  );
  return group;
}

function createSwitch(className: string, key: string, text: string) {
  const label = document.createElement("label");
  label.className = "setting-switch";

  const input = document.createElement("input");
  input.className = className;
  input.type = "checkbox";
  input.setAttribute("role", "switch");

  const span = document.createElement("span");
  span.dataset.i18n = key;
  span.textContent = text;

  label.append(input, span);
  return label;
}

function createKeyboardShortcut(keys: string[], descriptionKey: string, description: string) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  keys.forEach((key) => {
    const element = document.createElement("kbd");
    element.textContent = key;
    term.append(element);
    term.append(" ");
  });
  const definition = document.createElement("dd");
  definition.dataset.i18n = descriptionKey;
  definition.textContent = description;
  wrapper.append(term, definition);
  return wrapper;
}

function createHelpDialogElement() {
  const dialog = document.createElement("dialog");
  dialog.className = "help-dialog";
  dialog.id = "help-dialog";
  dialog.setAttribute("aria-labelledby", "help-title");

  const heading = document.createElement("div");
  heading.className = "dialog-heading";
  const title = createHeading("h2", "helpAndSettings", "Help and settings");
  title.id = "help-title";
  heading.append(title, createDialogCloseButton());

  const pixelSection = document.createElement("section");
  pixelSection.className = "help-pixel";
  pixelSection.setAttribute("aria-labelledby", "help-pixel-title");
  const pixelTitle = createHeading(
    "h3",
    "pixelHelpTitle",
    "Pixel Emoji in the Explorer",
  );
  pixelTitle.id = "help-pixel-title";
  const pixelDescription = createSettingDescription(
    "pixelHelpDescription",
    "Pixel font: On uses the original 12×12 font when artwork is available. Turn it off to prefer your system font; Pixel Emoji remains a fallback for unsupported emoji.",
  );
  const pixelLink = document.createElement("a");
  pixelLink.href = "https://github.com/lewismoten/emoji/tree/main/pixel-font";
  pixelLink.dataset.i18n = "pixelHelpLink";
  pixelLink.textContent = "Learn about and download Pixel Emoji";
  pixelSection.append(pixelTitle, pixelDescription, pixelLink);

  const settingsSection = document.createElement("section");
  settingsSection.className = "help-settings";
  settingsSection.setAttribute("aria-labelledby", "help-settings-title");
  const settingsTitle = createHeading("h3", "settings", "Settings");
  settingsTitle.id = "help-settings-title";
  settingsSection.append(settingsTitle);

  const languageControl = document.createElement("div");
  languageControl.className = "help-language-control";
  settingsSection.append(
    createSettingRow({
      titleKey: "language",
      title: "Language",
      descriptionKey: "chooseLanguageDescription",
      description: "Choose a language for emoji search.",
      control: languageControl,
    }),
    createSettingRow({
      titleKey: "theme",
      title: "Theme",
      descriptionKey: "themeDescription",
      description: "Switch between dark, light, and retro themes.",
      control: createThemeChoices(),
    }),
    createSettingRow({
      titleKey: "soundEffects",
      title: "Sound effects",
      descriptionKey: "soundEffectsDescription",
      description:
        "In retro mode, buttons and dialog windows can play 8-bit sound effects.",
      control: createSwitch(
        "sound-effects-toggle",
        "soundEffects",
        "Sound effects",
      ),
    }),
    createSettingRow({
      titleKey: "music",
      title: "Music",
      descriptionKey: "musicDescription",
      description:
        "In retro mode, the Help and settings dialog can play 8-bit music.",
      control: createSwitch("music-toggle", "music", "Music"),
    }),
    createSettingRow({
      titleKey: "developerMode",
      title: "Developer mode",
      descriptionKey: "developerModeDescription",
      description:
        "Show sequence construction, technical metadata, code tools, rendering diagnostics, and the pixel editor.",
      control: createSwitch(
        "developer-mode-toggle",
        "developerMode",
        "Developer mode",
      ),
    }),
  );

  const shortcutHeading = createHeading(
    "h3",
    "keyboardShortcuts",
    "Keyboard shortcuts",
  );
  shortcutHeading.className = "shortcut-heading";

  const shortcutList = document.createElement("dl");
  shortcutList.className = "shortcut-list";
  shortcutList.append(
    createKeyboardShortcut(["/"], "shortcutSearch", "Focus search"),
    createKeyboardShortcut(
      ["←", "→"],
      "shortcutNavigate",
      "Navigate emoji",
    ),
    createKeyboardShortcut(["Enter"], "shortcutOpen", "Open the selected emoji"),
    createKeyboardShortcut(
      ["Esc"],
      "shortcutClose",
      "Close a dialog or clear search",
    ),
    createKeyboardShortcut(
      ["?"],
      "shortcutHelp",
      "Open Help and settings",
    ),
  );

  dialog.append(
    heading,
    pixelSection,
    settingsSection,
    shortcutHeading,
    shortcutList,
  );
  return dialog;
}

export function createHelpDialogControl(): HelpDialogControl {
  const element = createHelpDialogElement();
  return {
    element,
    mountLanguagePicker(languagePicker) {
      const languageControl = element.querySelector(".help-language-control");
      if (languageControl && languagePicker) languageControl.append(languagePicker);
    },
  };
}
