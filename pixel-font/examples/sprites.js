export function applyPixelEmoji(element, atlasUrl, entry) {
  element.classList.add('pixel-emoji');
  element.setAttribute('role', 'img');
  element.setAttribute('aria-label', entry.name);
  element.style.setProperty('--pixel-emoji-atlas', `url("${atlasUrl}")`);
  element.style.setProperty('--pixel-emoji-x', `${-entry.column}em`);
  element.style.setProperty('--pixel-emoji-y', `${-entry.row}em`);
}

export async function findPixelEmoji(atlasJsonUrl, key) {
  const atlas = await fetch(atlasJsonUrl).then(response => response.json());
  return atlas.entries.find(entry => entry.key === key);
}
