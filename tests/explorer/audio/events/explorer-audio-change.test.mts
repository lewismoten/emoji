import assert from "node:assert/strict";

import * as preferences from "../../../../src/preferences.js";
import buildExplorerAudioChange from "../../../../src/explorer/audio/events/explorer-audio-change.js";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  "document",
);
const originalElement = Object.getOwnPropertyDescriptor(globalThis, "Element");
const originalHTMLElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLElement",
);
const originalHTMLInputElement = Object.getOwnPropertyDescriptor(
  globalThis,
  "HTMLInputElement",
);

class FakeElement {
  attributes = new Map<string, string>();
  checked = false;
  dataset: Record<string, string> = {};
  isConnected = true;
  parentElement: FakeElement | null = null;
  tagName = "DIV";
  type = "";
  value = "";
  preferenceContainer: FakeElement | null = null;

  addEventListener() {}

  closest(selector: string) {
    if (selector === "[data-audio-preference]") return this.preferenceContainer;
    return null;
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  matches(selector: string) {
    if (selector === '.audio-choice-input[value="soundEffects"]') {
      return this.value === "soundEffects";
    }
    if (selector === '.audio-choice-input[value="music"]') {
      return this.value === "music";
    }
    if (selector === '[data-audio-preference="soundEffects"]') {
      return this.dataset.audioPreference === "soundEffects";
    }
    if (selector === '[data-audio-preference="music"]') {
      return this.dataset.audioPreference === "music";
    }
    return false;
  }

  querySelector() {
    return null;
  }

  dispatchEvent() {
    return true;
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  removeEventListener() {}
}

class FakeHTMLElement extends FakeElement {}

class FakeInputElement extends FakeHTMLElement {}

const asEvent = (target: EventTarget | null) => ({ target }) as unknown as Event;

Object.defineProperty(globalThis, "Element", {
  configurable: true,
  value: FakeElement,
});
Object.defineProperty(globalThis, "HTMLElement", {
  configurable: true,
  value: FakeHTMLElement,
});
Object.defineProperty(globalThis, "HTMLInputElement", {
  configurable: true,
  value: FakeInputElement,
});

try {
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      documentElement: { dataset: { theme: "retro" } },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });

  preferences.init({ soundEffects: false, music: false });

  const calls: string[] = [];
  const dependencies = {
    audio: {
      playInteraction: async (elementType: string, action: string) => {
        calls.push(`play:${elementType}:${action}`);
      },
      restartMusic: async () => {
        calls.push("restart");
      },
      resumeAudioContext: async () => {
        calls.push("resume");
        return undefined;
      },
      syncHelpMusic: async () => {
        calls.push("sync");
      },
    },
    document: globalThis.document as Document,
    getHoverTarget: () => null,
    getInteractiveTarget: (target: EventTarget | null) =>
      (target as FakeHTMLElement | null) ?? null,
    setHoverTarget() {},
  } as any;
  const handler = buildExplorerAudioChange(dependencies);

  await handler(asEvent(null));
  assert.deepEqual(calls, []);

  const soundEffectsInput = new FakeInputElement();
  soundEffectsInput.tagName = "INPUT";
  soundEffectsInput.type = "checkbox";
  soundEffectsInput.value = "soundEffects";
  soundEffectsInput.checked = true;
  await handler(asEvent(soundEffectsInput));
  assert.deepEqual(calls, ["resume", "play:checkbox:check"]);

  calls.length = 0;
  (globalThis.document as any).documentElement.dataset.theme = "base";
  const delegatedSoundEffectsTarget = new FakeInputElement();
  delegatedSoundEffectsTarget.tagName = "INPUT";
  delegatedSoundEffectsTarget.type = "checkbox";
  delegatedSoundEffectsTarget.checked = false;
  delegatedSoundEffectsTarget.preferenceContainer = new FakeHTMLElement();
  delegatedSoundEffectsTarget.preferenceContainer.dataset.audioPreference =
    "soundEffects";
  await handler(asEvent(delegatedSoundEffectsTarget));
  assert.deepEqual(calls, ["play:checkbox:uncheck"]);

  calls.length = 0;
  (globalThis.document as any).documentElement.dataset.theme = "retro";
  const musicInput = new FakeInputElement();
  musicInput.tagName = "INPUT";
  musicInput.type = "checkbox";
  musicInput.value = "music";
  musicInput.checked = true;
  await handler(asEvent(musicInput));
  assert.deepEqual(calls, ["resume", "restart", "play:checkbox:check"]);

  calls.length = 0;
  (globalThis.document as any).documentElement.dataset.theme = "base";
  const delegatedMusicTarget = new FakeInputElement();
  delegatedMusicTarget.tagName = "INPUT";
  delegatedMusicTarget.type = "checkbox";
  delegatedMusicTarget.checked = false;
  delegatedMusicTarget.preferenceContainer = new FakeHTMLElement();
  delegatedMusicTarget.preferenceContainer.dataset.audioPreference = "music";
  await handler(asEvent(delegatedMusicTarget));
  assert.deepEqual(calls, ["sync", "play:checkbox:uncheck"]);

  calls.length = 0;
  const nonHtmlTarget = new FakeElement();
  await handler(asEvent(nonHtmlTarget));
  assert.deepEqual(calls, []);

  dependencies.getInteractiveTarget = () => null;
  const interactiveMiss = new FakeHTMLElement();
  await handler(asEvent(interactiveMiss));
  assert.deepEqual(calls, []);

  dependencies.getInteractiveTarget = () => {
    const button = new FakeHTMLElement();
    button.tagName = "BUTTON";
    return button as any;
  };
  await handler(asEvent(new FakeHTMLElement()));
  assert.deepEqual(calls, []);

  dependencies.getInteractiveTarget = () => {
    const radio = new FakeInputElement();
    radio.tagName = "INPUT";
    radio.type = "radio";
    radio.checked = true;
    return radio as any;
  };
  await handler(asEvent(new FakeHTMLElement()));
  assert.deepEqual(calls, ["play:radio:check"]);

  calls.length = 0;
  dependencies.getInteractiveTarget = () => {
    const checkbox = new FakeHTMLElement();
    checkbox.setAttribute("role", "checkbox");
    checkbox.setAttribute("aria-checked", "false");
    return checkbox as any;
  };
  await handler(asEvent(new FakeHTMLElement()));
  assert.deepEqual(calls, ["play:checkbox:uncheck"]);
} finally {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
  if (originalDocument) {
    Object.defineProperty(globalThis, "document", originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, "document");
  }
  if (originalElement) {
    Object.defineProperty(globalThis, "Element", originalElement);
  } else {
    Reflect.deleteProperty(globalThis, "Element");
  }
  if (originalHTMLElement) {
    Object.defineProperty(globalThis, "HTMLElement", originalHTMLElement);
  } else {
    Reflect.deleteProperty(globalThis, "HTMLElement");
  }
  if (originalHTMLInputElement) {
    Object.defineProperty(globalThis, "HTMLInputElement", originalHTMLInputElement);
  } else {
    Reflect.deleteProperty(globalThis, "HTMLInputElement");
  }
}
