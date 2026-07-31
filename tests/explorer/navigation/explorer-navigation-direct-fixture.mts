export function createExplorerNavigationDirectFixture() {
  const historyCalls: Array<[string, unknown, string]> = [];
  const searchInput = {
    focused: false,
    value: "smile",
    focus() {
      this.focused = true;
    },
  };
  const versionRange = {
    dispatched: [] as any[],
    value: "1",
    dispatchEvent(event: any) {
      this.dispatched.push(event);
    },
  };
  const versionSelector = { options: { length: 5 }, value: "16.0" };
  const versionModeSelector = { value: "selected" };
  const dialog = {
    open: false,
    classList: { contains(name: string) { return name === "is-code-view"; } },
  };
  const dialogs = {
    favorites: { open: false, id: "favorites" },
    filters: { open: false, id: "filters" },
    help: { open: false, id: "help" },
    language: { open: true, id: "language" },
  };
  const selectedValues: Array<[string, string]> = [];
  let compositionMode = "details";
  const drawCalls: string[] = [];
  const navigationCalls: number[] = [];
  const openEmojiCalls: any[] = [];
  const urlStateCalls: any[] = [];
  const filterCalls: any[] = [];
  const panelCalls: any[] = [];
  let currentState: any = {
    compositionMode: "full",
    developerMode: true,
    emoji: undefined,
    emojiMode: "details",
    orderMode: "sequence",
    panel: "help",
    selectedSequenceType: "zwj",
  };
  return {
    currentState: () => currentState,
    dialog,
    dialogs,
    drawCalls,
    filterCalls,
    historyCalls,
    navigationCalls,
    openEmojiCalls,
    panelCalls,
    searchInput,
    selectedValues,
    setCompositionMode(value: "details" | "condensed" | "full") {
      compositionMode = value;
    },
    setCurrentState(value: any) {
      currentState = value;
    },
    versionModeSelector,
    versionRange,
    versionSelector,
    urlStateCalls,
    compositionMode: () => compositionMode,
  };
}

export function installExplorerNavigationGlobals(fixture: ReturnType<typeof createExplorerNavigationDirectFixture>) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: {
        state: { page: 1 },
        pushState(state: unknown, _title: string, url: string) {
          fixture.historyCalls.push(["push", state, url]);
        },
        replaceState(state: unknown, _title: string, url: string) {
          fixture.historyCalls.push(["replace", state, url]);
        },
      },
      location: { hash: "#top", pathname: "/index.en.html", search: "?existing=1" },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      activeElement: { tagName: "DIV" },
      documentElement: { dir: "rtl" },
      querySelector(selector: string) {
        return selector === "dialog[open]" ? null : null;
      },
    },
  });
  Object.defineProperty(globalThis, "Event", {
    configurable: true,
    value: class FakeEvent {
      constructor(
        readonly type: string,
        readonly options: Record<string, unknown>,
      ) {}
    },
  });
}
