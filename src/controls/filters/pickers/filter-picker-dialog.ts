import { BaseControl } from "../../core/base-control.js";
import { DomFactory, type NodeSpec } from "../../core/dom-factory.js";
import { DialogControl } from "../../dialog/dialog-control.js";

type FilterPickerDialogState = {
  choicesClassName: string;
  className: string;
  dialogId: string;
  title: string;
  titleId: string;
  titleKey: string;
};

export class FilterPickerDialogControl extends BaseControl<FilterPickerDialogState> {
  constructor(state: FilterPickerDialogState) {
    super(state);
  }

  static toSpec(state: FilterPickerDialogState): NodeSpec {
    return new FilterPickerDialogControl(state).render();
  }

  protected childControls() {
    return [
      new DialogControl({
        children: [],
        className: this.state.className,
        dialogId: this.state.dialogId,
        title: this.state.title,
        titleId: this.state.titleId,
        titleKey: this.state.titleKey,
      }),
    ];
  }

  protected render(): NodeSpec {
    return DialogControl.toSpec({
      children: [
        DomFactory.element("div", {
          attributes: {
            "aria-labelledby": this.state.titleId,
            role: "radiogroup",
          },
          className: `compact-choices ${this.state.choicesClassName}`,
        }),
      ],
      className: this.state.className,
      dialogId: this.state.dialogId,
      title: this.state.title,
      titleId: this.state.titleId,
      titleKey: this.state.titleKey,
    });
  }
}
