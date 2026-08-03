export const routeLocale = () => {
  const locale = globalThis.location.pathname.match(
    /index\.([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\.html$/,
  )?.[1];
  return locale;
};
export const initialPreferences = (): Record<string, any> => {
  if ("initialPreferences" in globalThis)
    return (
      ((
        globalThis as typeof globalThis & {
          initialPreferences: Record<string, any>;
        }
      ).initialPreferences as Record<string, any>) ?? {}
    );
  return {};
};
