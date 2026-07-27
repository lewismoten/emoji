export function displayEmojiKey(key: string) {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLocaleLowerCase();
  return words.charAt(0).toLocaleUpperCase() + words.slice(1);
}

export function normalizeDisplayName(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en");
}

export function normalizeCodePoints(codePoints?: string | null) {
  return (codePoints ?? "").trim().replace(/\s+/g, " ").toUpperCase();
}

export function formatUiNumber(
  value: number,
  locale?: string,
  numberingSystem?: string,
) {
  const options = numberingSystem ? { numberingSystem } : {};
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatUiPercent(
  value: number,
  locale?: string,
  numberingSystem?: string,
) {
  const options = numberingSystem ? { numberingSystem } : {};
  return new Intl.NumberFormat(locale, {
    ...options,
    style: "percent",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompositionReduction(
  from: number,
  to: number,
  options: {
    dir?: string;
    locale?: string;
    numberingSystem?: string;
  } = {},
) {
  const fromLabel = formatUiNumber(
    from,
    options.locale,
    options.numberingSystem,
  );
  const toLabel = formatUiNumber(to, options.locale, options.numberingSystem);
  return options.dir === "rtl"
    ? `${toLabel}\u2190${fromLabel}`
    : `${fromLabel}\u2192${toLabel}`;
}
