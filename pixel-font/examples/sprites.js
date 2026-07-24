export function applyPixelEmoji(element, atlasUrl, entry) {
  element.classList.add("pixel-emoji");
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", entry.name);
  element.style.setProperty("--pixel-emoji-atlas", `url("${atlasUrl}")`);
  element.style.setProperty("--pixel-emoji-x", `${-entry.x / entry.width}em`);
  element.style.setProperty("--pixel-emoji-y", `${-entry.y / entry.height}em`);
  element.style.setProperty(
    "--pixel-emoji-width",
    `${entry.atlasWidth / entry.width}em`,
  );
  element.style.setProperty(
    "--pixel-emoji-height",
    `${entry.atlasHeight / entry.height}em`,
  );
}

export async function findPixelEmoji(atlasJsonUrl, key) {
  const atlas = await fetch(atlasJsonUrl).then((response) => response.json());
  const entry = atlas.entries.find((entry) => entry.key === key);
  return entry
    ? { ...entry, atlasWidth: atlas.imageWidth, atlasHeight: atlas.imageHeight }
    : undefined;
}
