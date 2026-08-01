import { BaseControl } from "./base-control.js";
import { DomFactory, type NodeSpec } from "./dom-factory.js";

export type ActionButtonState = {
  ariaLabel: string;
  attributes?: Record<string, string | undefined>;
  children?: Array<NodeSpec | string>;
  className: string;
  contentOrder?: "emoji-label" | "label-emoji";
  dataAttributes?: Record<string, string>;
  emoji?: string;
  emojiClassName?: string;
  emojiTag?: string;
  i18nAriaLabel?: string;
  label?: string;
  labelClassName?: string;
  labelKey?: string;
  labelTag?: string;
  title?: string;
  type?: "button" | "submit" | "reset";
};

export class ActionButtonControl<
  TState = ActionButtonState,
> extends BaseControl<TState> {
  protected renderButton(state?: ActionButtonState): NodeSpec {
    const resolvedState = state ?? (this.state as ActionButtonState);
    const emojiNode = resolvedState.emoji
      ? DomFactory.element(resolvedState.emojiTag ?? "span", {
          attributes: { "aria-hidden": "true" },
          className: resolvedState.emojiClassName,
          text: resolvedState.emoji,
        })
      : null;
    const labelNode = resolvedState.label
      ? DomFactory.element(resolvedState.labelTag ?? "span", {
          className: resolvedState.labelClassName,
          dataset: resolvedState.labelKey
            ? { i18n: resolvedState.labelKey }
            : undefined,
          text: resolvedState.label,
        })
      : null;
    const contentOrder = resolvedState.contentOrder ?? "emoji-label";
    const generatedChildren =
      contentOrder === "label-emoji"
        ? [labelNode, emojiNode]
        : [emojiNode, labelNode];
    const children =
      resolvedState.children ??
      generatedChildren.filter(
        (node): node is Exclude<typeof node, null> => node !== null,
      );
    return DomFactory.button({
      attributes: {
        "aria-label": resolvedState.ariaLabel,
        title: resolvedState.title,
        type: resolvedState.type ?? "button",
        ...(resolvedState.attributes ?? {}),
      },
      className: resolvedState.className,
      dataset: {
        ...(resolvedState.i18nAriaLabel
          ? { i18nAriaLabel: resolvedState.i18nAriaLabel }
          : {}),
        ...(resolvedState.dataAttributes ?? {}),
      },
      children,
    });
  }

  protected render(): NodeSpec {
    return this.renderButton();
  }
}
