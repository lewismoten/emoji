declare const document: {
  createElement(tagName: string): any;
};

type Child = NodeSpec | string;

export type NodeSpec = {
  tag: string;
  attributes?: Record<string, string | undefined>;
  className?: string;
  dataset?: Record<string, string | undefined>;
  text?: string;
  children?: Child[];
  requireI18n?: boolean;
  requireAriaLabel?: boolean;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const validateSpec = (spec: NodeSpec) => {
  const requireI18n = spec.requireI18n === true;
  const requireAriaLabel =
    spec.requireAriaLabel === true || spec.tag.toLowerCase() === "button";
  if (requireI18n && !spec.dataset?.i18n && !spec.dataset?.i18nAriaLabel) {
    throw new Error(`Missing i18n metadata for <${spec.tag}> control.`);
  }
  if (
    requireAriaLabel &&
    !spec.attributes?.["aria-label"] &&
    !spec.dataset?.i18nAriaLabel
  ) {
    throw new Error(`Missing aria-label metadata for <${spec.tag}> control.`);
  }
  spec.children?.forEach((child) => {
    if (typeof child !== "string") validateSpec(child);
  });
};

const setAttributes = (element: any, spec: NodeSpec) => {
  if (spec.className) element.className = spec.className;
  Object.entries(spec.attributes ?? {}).forEach(([name, value]) => {
    if (value === undefined) return;
    element.setAttribute(name, value);
    if (name === "type") element.type = value;
    if (name === "name") element.name = value;
    if (name === "value") element.value = value;
    if (name === "checked") element.checked = true;
    if (name === "tabindex") element.tabIndex = Number(value);
  });
  if (!element.dataset) element.dataset = {};
  Object.entries(spec.dataset ?? {}).forEach(([name, value]) => {
    if (value !== undefined) element.dataset[name] = value;
  });
  if (spec.text !== undefined) element.textContent = spec.text;
  spec.children?.forEach((child) => {
    element.append(
      typeof child === "string" ? child : DomFactory.createElement(child),
    );
  });
  return element;
};

const markupAttributes = (spec: NodeSpec) => {
  const values: string[] = [];
  if (spec.className) values.push(`class="${escapeHtml(spec.className)}"`);
  Object.entries(spec.attributes ?? {}).forEach(([name, value]) => {
    if (value !== undefined) values.push(`${name}="${escapeHtml(value)}"`);
  });
  Object.entries(spec.dataset ?? {}).forEach(([name, value]) => {
    if (value !== undefined) {
      const attribute = name.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      values.push(`data-${attribute}="${escapeHtml(value)}"`);
    }
  });
  return values.length === 0 ? "" : ` ${values.join(" ")}`;
};

export class DomFactory {
  static createElement(spec: NodeSpec) {
    validateSpec(spec);
    return setAttributes(document.createElement(spec.tag), spec);
  }

  static toMarkup(spec: NodeSpec): string {
    validateSpec(spec);
    const children = [
      ...(spec.text !== undefined ? [escapeHtml(spec.text)] : []),
      ...(spec.children ?? []).map((child) =>
        typeof child === "string"
          ? escapeHtml(child)
          : DomFactory.toMarkup(child),
      ),
    ].join("");
    return `<${spec.tag}${markupAttributes(spec)}>${children}</${spec.tag}>`;
  }

  static form(spec: Omit<NodeSpec, "tag"> = {}) {
    return { ...spec, tag: "form" } satisfies NodeSpec;
  }

  static button(spec: Omit<NodeSpec, "tag">) {
    return {
      requireAriaLabel: true,
      ...spec,
      tag: "button",
    } satisfies NodeSpec;
  }

  static element(tag: string, spec: Omit<NodeSpec, "tag"> = {}) {
    return { ...spec, tag } satisfies NodeSpec;
  }
}
