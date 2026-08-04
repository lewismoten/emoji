export const getWindow = () => globalThis;

export const initialPreferences = (): Record<string, any> => {
  if ("initialPreferences" in globalThis)
    return (
      ((
        globalThis as typeof globalThis & {
          initialPreferences: Record<string, any>;
        }
      ).initialPreferences as Record<string, any>) ?? {}
    );
  return {};
};

export const setTimeout = (
  handler: TimerHandler,
  timeout?: number,
  ...fArgs: any[]
): number => globalThis.setTimeout(handler, timeout, ...fArgs);

export const clearTimeout = (id?: number) => globalThis.clearTimeout(id);

type WebkitAudio = typeof globalThis & {
  webkitAudioContext: {
    new (contextOptions?: AudioContextOptions | undefined): AudioContext;
    prototype: AudioContext;
  };
};

export const getAudioContext = () => {
  if (globalThis.AudioContext) return globalThis.AudioContext;
  if ("webkitAudioContext" in globalThis) {
    return (globalThis as WebkitAudio).webkitAudioContext;
  }
};
