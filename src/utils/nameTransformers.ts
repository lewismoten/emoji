export const pascalToDashed = (text: string) =>
  text.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
