import assert from "node:assert/strict";
import { onCompactChoiceKeyDown } from "../../../../src/explorer/filters/filter-picker.js";
import {
  FakeElement,
  installDocumentWindow,
} from "./filter-picker-fixture.mjs";

const { documentStub, restore } = installDocumentWindow();

try {
  const navContainer = new FakeElement("div");
  const navButtons = [0, 1, 2, 3].map(() => {
    const button = new FakeElement("button");
    button.setAttribute("role", "radio");
    return button;
  });
  navButtons[0].rect = { left: 0, top: 0, width: 20, height: 20 };
  navButtons[1].rect = { left: 30, top: 0, width: 20, height: 20 };
  navButtons[2].rect = { left: 0, top: 40, width: 20, height: 20 };
  navButtons[3].rect = { left: 30, top: 40, width: 20, height: 20 };
  navButtons[0].tabIndex = 0;
  navButtons[1].tabIndex = -1;
  navButtons[2].tabIndex = -1;
  navButtons[3].tabIndex = -1;
  navContainer.append(...navButtons);

  let prevented = 0;
  onCompactChoiceKeyDown({
    key: "ArrowRight",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {
      prevented += 1;
    },
  } as any);
  assert.equal(prevented, 1);
  assert.equal(navButtons[1].focused, true);
  assert.equal(navButtons[1].tabIndex, 0);
  assert.equal(navButtons[0].tabIndex, -1);

  onCompactChoiceKeyDown({
    key: "ArrowLeft",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[1].tabIndex, 0);

  onCompactChoiceKeyDown({
    key: "ArrowDown",
    currentTarget: navContainer,
    target: navButtons[1],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[3].focused, true);

  onCompactChoiceKeyDown({
    key: "Home",
    currentTarget: navContainer,
    target: navButtons[3],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[0].tabIndex, 0);

  onCompactChoiceKeyDown({
    key: "End",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[3].tabIndex, 0);

  documentStub.documentElement.dir = "rtl";
  onCompactChoiceKeyDown({
    key: "ArrowLeft",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[1].tabIndex, 0);
  documentStub.documentElement.dir = "ltr";

  onCompactChoiceKeyDown({
    key: "ArrowUp",
    currentTarget: navContainer,
    target: navButtons[0],
    preventDefault() {},
  } as any);
  assert.equal(navButtons[0].tabIndex, 0);

  const noMatchContainer = new FakeElement("div");
  onCompactChoiceKeyDown({
    key: "Escape",
    currentTarget: noMatchContainer,
    target: navButtons[0],
    preventDefault() {
      throw new Error("unexpected preventDefault");
    },
  } as any);
  onCompactChoiceKeyDown({
    key: "ArrowRight",
    currentTarget: noMatchContainer,
    target: navButtons[0],
    preventDefault() {
      throw new Error("unexpected preventDefault");
    },
  } as any);

  const orphanContainer = new FakeElement("div");
  const orphanChoice = new FakeElement("button");
  orphanChoice.setAttribute("role", "radio");
  orphanContainer.append(orphanChoice);
  onCompactChoiceKeyDown({
    key: "ArrowDown",
    currentTarget: orphanContainer,
    target: orphanChoice,
    preventDefault() {},
  } as any);
} finally {
  restore();
}
