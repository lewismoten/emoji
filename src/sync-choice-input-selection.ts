const syncChoiceInputSelection = (
  input: HTMLInputElement | null,
  selected: boolean,
) => {
  if (!input) return;
  input.checked = selected;
  input.defaultChecked = selected;
  input.tabIndex = -1;
  if (selected) {
    input.setAttribute("checked", "checked");
  } else {
    input.removeAttribute("checked");
  }
};

export default syncChoiceInputSelection;
