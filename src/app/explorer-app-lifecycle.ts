type ApplicationWindow = {
  addEventListener(type: "load", listener: () => void): void;
  document: { readyState: string };
};

export function createExplorerApp(options: {
  window: ApplicationWindow;
  start: () => Promise<void> | void;
}) {
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    await options.start();
  };

  return {
    start,
    startWhenReady() {
      if (options.window.document.readyState === "complete") {
        void start();
        return;
      }
      options.window.addEventListener("load", () => void start());
    },
  };
}
