import {
  compositionReductionLabel,
  compositionTitle,
  condenseCompositionPoints,
  describeCompositionPoint,
  findCompositionArtworkKey,
  findCompositionEmojiKey,
  isCondensedSequenceControl
} from './composition-helpers.js';

type MinimalElement = {
  ariaLabel?: string;
  className: string;
  dataset: Record<string, string | undefined>;
  hidden: boolean;
  querySelector(selector: string): MinimalElement | null;
  replaceChildren(...nodes: unknown[]): void;
  setAttribute(name: string, value: string): void;
  textContent: string | null;
  title: string;
  type?: string;
  append(...nodes: unknown[]): void;
};

declare const document: {
  createElement(tagName: string): MinimalElement;
};

type CompositionPoint = { hex: string; point: number };

function createCompositionOperator(operator: string) {
  const element = document.createElement('span');
  element.className = 'emoji-composition-operator';
  element.setAttribute('aria-hidden', 'true');
  element.textContent = operator;
  return element;
}

function createCompositionTerm(operator: string, part: MinimalElement) {
  const term = document.createElement('span');
  term.className = 'emoji-composition-term';
  term.append(createCompositionOperator(operator), part);
  return term;
}

function createCompositionResult(
  value: string,
  name: string | undefined,
  emojiKey: string,
  options: {
    translate: (key: string, fallback: string) => string;
    applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
  }
) {
  const result = document.createElement('span');
  const glyph = document.createElement('span');
  const label = document.createElement('span');
  const resultLabel = options.translate('result', 'Result');
  result.className = 'emoji-composition-part emoji-composition-result';
  result.setAttribute('role', 'img');
  result.setAttribute('aria-label', `${resultLabel}: ${name ?? value}`);
  glyph.className = 'emoji-composition-glyph';
  glyph.textContent = value;
  options.applyPixelArtworkClass(glyph, emojiKey);
  label.className = 'emoji-composition-code';
  label.textContent = resultLabel;
  result.append(glyph, label);
  return result;
}

function createCondensedCompositionPart(
  partData: {
    emojiKey: string;
    components: CompositionPoint[];
  },
  options: {
    emojiByKey: Record<string, string>;
    searchAnnotations: Record<string, string[]>;
    byId: Record<string, { shortName?: string }>;
    translate: (key: string, fallback: string) => string;
    applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
    dir?: string;
    locale?: string;
    numberingSystem?: string;
  }
) {
  const part = document.createElement('button');
  const glyph = document.createElement('span');
  const code = document.createElement('span');
  const linkedName = compositionTitle(
    partData.emojiKey,
    options.searchAnnotations,
    options.byId
  );
  const viewLabel = options.translate('viewEmoji', 'View emoji');
  const codePoints = partData.components
    .map(component => `U+${component.hex}`)
    .join(' ');
  part.className = 'emoji-composition-part';
  part.type = 'button';
  part.dataset.compositionEmoji = partData.emojiKey;
  part.title = `${viewLabel}: ${linkedName} — ${codePoints}`;
  part.setAttribute('aria-label', `${viewLabel}: ${linkedName}. ${codePoints}`);
  glyph.className = 'emoji-composition-glyph';
  glyph.textContent = options.emojiByKey[partData.emojiKey];
  options.applyPixelArtworkClass(glyph, partData.emojiKey);
  code.className = 'emoji-composition-code emoji-composition-code-condensed';
  code.textContent = compositionReductionLabel(partData.components.length, 1, {
    dir: options.dir,
    locale: options.locale,
    numberingSystem: options.numberingSystem
  });
  part.append(glyph, code);
  return part;
}

function createCompositionPart(
  component: CompositionPoint,
  currentEmojiKey: string,
  options: {
    emojiKeyByCodePoints: Map<string, string>;
    searchAnnotations: Record<string, string[]>;
    byId: Record<string, { shortName?: string }>;
    translate: (key: string, fallback: string) => string;
    applyStandalonePixelArtwork: (
      element: MinimalElement,
      emojiKey?: string
    ) => void;
  }
) {
  const linkedEmojiKey = findCompositionEmojiKey(
    component.hex,
    currentEmojiKey,
    options.emojiKeyByCodePoints
  );
  const artworkEmojiKey = findCompositionArtworkKey(
    component.hex,
    options.emojiKeyByCodePoints
  );
  const part = document.createElement(linkedEmojiKey ? 'button' : 'span');
  const glyph = document.createElement('span');
  const code = document.createElement('span');
  const details = describeCompositionPoint(component.point, options.translate);
  part.className = 'emoji-composition-part';
  if (linkedEmojiKey) {
    const linkedName = compositionTitle(
      linkedEmojiKey,
      options.searchAnnotations,
      options.byId
    );
    const viewLabel = options.translate('viewEmoji', 'View emoji');
    part.type = 'button';
    part.dataset.compositionEmoji = linkedEmojiKey;
    part.title = `${details.label} — ${viewLabel}: ${linkedName}`;
    part.setAttribute(
      'aria-label',
      `${details.label}, U+${component.hex}. ${viewLabel}: ${linkedName}`
    );
  } else {
    part.setAttribute('role', 'img');
    part.title = details.label;
    part.setAttribute('aria-label', `${details.label}, U+${component.hex}`);
  }
  glyph.className = `emoji-composition-glyph${details.symbolic ? ' is-symbolic' : ''}`;
  glyph.textContent = details.glyph;
  options.applyStandalonePixelArtwork(glyph, artworkEmojiKey);
  code.className = 'emoji-composition-code emoji-composition-code-point';
  code.textContent = `U+${component.hex}`;
  part.append(glyph, code);
  return part;
}

export function renderEmojiComposition(options: {
  section: MinimalElement | null;
  equation: MinimalElement | null;
  modeButton: MinimalElement | null;
  item: { key: string; shortName?: string; codePoints?: string };
  value: string;
  developerMode: boolean;
  detailsVisible: boolean;
  compositionMode: 'condensed' | 'full';
  emojiKeyByCodePoints: Map<string, string>;
  emojiByKey: Record<string, string>;
  searchAnnotations: Record<string, string[]>;
  byId: Record<string, { shortName?: string }>;
  translate: (key: string, fallback: string) => string;
  applyPixelArtworkClass: (element: MinimalElement, emojiKey: string) => void;
  applyStandalonePixelArtwork: (
    element: MinimalElement,
    emojiKey?: string
  ) => void;
  dir?: string;
  locale?: string;
  numberingSystem?: string;
}) {
  if (!options.section || !options.equation || !options.modeButton) return;
  const points = (options.item.codePoints ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map(hex => ({ hex: hex.toUpperCase(), point: Number.parseInt(hex, 16) }))
    .filter(component => Number.isFinite(component.point));

  options.equation.replaceChildren();
  options.section.dataset.available = String(points.length > 1);
  options.section.hidden =
    !options.developerMode || points.length <= 1 || !options.detailsVisible;
  if (points.length <= 1) {
    options.modeButton.hidden = true;
    return;
  }

  const condensedParts = condenseCompositionPoints(
    points,
    options.item.key,
    options.emojiKeyByCodePoints
  );
  const hasHiddenSequenceControl = points.some(component =>
    isCondensedSequenceControl(component.point)
  );
  const canCondense =
    hasHiddenSequenceControl || condensedParts.some(part => 'emojiKey' in part);
  const displayedParts =
    options.compositionMode === 'full' || !canCondense
      ? points.map(component => ({ component }))
      : condensedParts.filter(
          part =>
            !('component' in part) ||
            !isCondensedSequenceControl(part.component.point)
        );
  const modeLabel =
    options.compositionMode === 'full'
      ? options.translate('showCondensedSequence', 'Show condensed sequence')
      : options.translate('showFullSequence', 'Show full sequence');
  options.modeButton.hidden = !canCondense;
  options.modeButton.textContent = modeLabel;
  options.modeButton.title = modeLabel;
  options.modeButton.setAttribute('aria-label', modeLabel);
  options.modeButton.setAttribute(
    'aria-pressed',
    String(options.compositionMode === 'full')
  );

  displayedParts.forEach((displayedPart, index) => {
    const part =
      'emojiKey' in displayedPart
        ? createCondensedCompositionPart(displayedPart, options)
        : createCompositionPart(
            displayedPart.component,
            options.item.key,
            options
          );
    options.equation!.append(
      index === 0 ? part : createCompositionTerm('+', part)
    );
  });
  options.equation.append(
    createCompositionTerm(
      '=',
      createCompositionResult(
        options.value,
        options.item.shortName,
        options.item.key,
        options
      )
    )
  );
}
