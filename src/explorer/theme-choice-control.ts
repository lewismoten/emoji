export function createThemeChoiceControl(options: {
  theme: string;
  emoji: string;
  key: string;
  text: string;
}) {
  const button = document.createElement("button");
  button.className = "setting-choice theme-choice";
  button.type = "button";
  button.dataset.theme = options.theme;
  button.setAttribute("aria-pressed", "false");

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = options.emoji;

  const label = document.createElement("span");
  label.dataset.i18n = options.key;
  label.textContent = options.text;

  button.append(icon, label);
  return button;
}

export function createThemeChoiceGroupControl() {
  const group = document.createElement("div");
  group.className = "setting-choice-group theme-choices";
  group.setAttribute("role", "group");
  group.dataset.i18nAriaLabel = "theme";
  group.setAttribute("aria-label", "Theme");
  group.append(
    createThemeChoiceControl({
      theme: "light",
      emoji: "☀️",
      key: "light",
      text: "Light",
    }),
    createThemeChoiceControl({
      theme: "dark",
      emoji: "🌙",
      key: "dark",
      text: "Dark",
    }),
    createThemeChoiceControl({
      theme: "retro",
      emoji: "🕹️",
      key: "retro",
      text: "Retro",
    }),
  );
  return group;
}
