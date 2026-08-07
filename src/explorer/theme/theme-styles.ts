import * as preferences from "../../preferences.js";

export type ThemeName = "base" | "dark" | "light" | "retro";

type ThemeStylesheet = {
  href: string;
  id: string;
};

const themeStylesheets: Record<ThemeName, ThemeStylesheet[]> = {
  base: [
    {
      href: "./explorer/themes/base-theme.css",
      id: "theme-base-stylesheet",
    },
  ],
  dark: [
    {
      href: "./explorer/themes/base-theme.css",
      id: "theme-base-stylesheet",
    },
    {
      href: "./explorer/themes/dark.css",
      id: "theme-dark-stylesheet",
    },
  ],
  light: [
    {
      href: "./explorer/themes/base-theme.css",
      id: "theme-base-stylesheet",
    },
    {
      href: "./explorer/themes/light.css",
      id: "theme-light-stylesheet",
    },
  ],
  retro: [
    {
      href: "./explorer/themes/ega.css",
      id: "theme-ega-stylesheet",
    },
    {
      href: "./explorer/themes/base-theme.css",
      id: "theme-base-stylesheet",
    },
    {
      href: "./explorer/themes/retro.css",
      id: "theme-retro-stylesheet",
    },
  ],
};

function ensureStylesheet({ href, id }: ThemeStylesheet) {
  if (
    typeof document === "undefined" ||
    typeof document.createElement !== "function" ||
    !document.head
  ) {
    return Promise.resolve(undefined);
  }
  const existing =
    typeof document.getElementById === "function"
      ? (document.getElementById(id) as HTMLLinkElement | null)
      : null;
  if (existing) {
    return existing.sheet
      ? Promise.resolve(existing)
      : new Promise((resolve) =>
          existing.addEventListener("load", () => resolve(existing), {
            once: true,
          }),
        );
  }
  const stylesheet = document.createElement("link");
  stylesheet.id = id;
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  document.head.appendChild(stylesheet);
  return new Promise((resolve, reject) => {
    stylesheet.addEventListener("load", () => resolve(stylesheet), {
      once: true,
    });
    stylesheet.addEventListener("error", reject, { once: true });
  });
}

export const resolveTheme = (theme: string | undefined): ThemeName => {
  switch(theme) {
    case "base":
    case "light":
    case "retro":
      return theme;
    default:
      return "dark";
  }
}
export function ensureThemeStyles(theme: string) {
  const resolved = resolveTheme(theme);
  return Promise.all(themeStylesheets[resolved].map(ensureStylesheet));
}

export async function selectTheme(event: Event) {
  const target = event.currentTarget as HTMLElement;
  const requestedTheme = target.dataset.theme;
  const theme = resolveTheme(requestedTheme);
  await ensureThemeStyles(theme);
  preferences.setString("theme", theme);
  const { renderThemeToggle } = await import("../../render-theme-toggle.js");
  renderThemeToggle();
}
