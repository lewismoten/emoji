import { BaseControl } from "../../core/base-control.js";
import { DialogControl } from "../dialog-control.js";
import { GenderFilterControl } from "../../filters/modifiers/gender-filter.js";
import { HairFilterControl } from "../../filters/modifiers/hair-filter.js";
import { SkinToneFilterControl } from "../../filters/modifiers/skin-tone-filter.js";
import { SequenceFilterFieldControl } from "../../filters/sequence/sequence-filter-field.js";

type AdvancedFiltersDialogState = {
  bodyClassName?: string;
  className: string;
  dialogId: string;
  gridClassName?: string;
  modifiersClassName?: string;
  title: string;
  titleId: string;
  titleKey: string;
};

export class AdvancedFiltersDialogControl extends BaseControl<AdvancedFiltersDialogState> {
  constructor(state?: Partial<AdvancedFiltersDialogState>) {
    super({
      bodyClassName: "advanced-filters-dialog-body",
      className: "advanced-filters-dialog",
      dialogId: "advanced-filters-dialog",
      gridClassName: "filter-grid",
      modifiersClassName: "modifier-filters",
      title: "Advanced filters",
      titleId: "advanced-filters-dialog-title",
      titleKey: "advancedFilters",
      ...state,
    });
  }

  protected childControls() {
    return [
      new DialogControl({
        bodyClassName: this.state.bodyClassName,
        children: [],
        className: this.state.className,
        dialogId: this.state.dialogId,
        title: this.state.title,
        titleId: this.state.titleId,
        titleKey: this.state.titleKey,
      }),
      new SequenceFilterFieldControl(),
      new GenderFilterControl(),
      new SkinToneFilterControl(),
      new HairFilterControl(),
    ];
  }

  protected render() {
    return DialogControl.toSpec({
      bodyClassName: this.state.bodyClassName,
      children: [
        {
          tag: "div",
          className: this.state.gridClassName,
          children: [SequenceFilterFieldControl.toSpec()],
        },
        {
          tag: "div",
          className: this.state.modifiersClassName,
          children: [
            GenderFilterControl.toSpec(),
            SkinToneFilterControl.toSpec(),
            HairFilterControl.toSpec(),
          ],
        },
      ],
      className: this.state.className,
      dialogId: this.state.dialogId,
      title: this.state.title,
      titleId: this.state.titleId,
      titleKey: this.state.titleKey,
    });
  }
}
