export class FakeContext2D {
  fillStyle = "";
  font = "";
  textAlign = "";
  textBaseline = "";
  fillRects: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
  }> = [];
  fillTexts: Array<{
    value: string;
    x: number;
    y: number;
    font: string;
    color: string;
  }> = [];
  clearRects: Array<[number, number, number, number]> = [];
  drawImages: Array<any[]> = [];
  putImageDataCalls: Array<{ image: any; x: number; y: number }> = [];
  imageData = { data: new Uint8ClampedArray() };
  measureResult = { actualBoundingBoxAscent: 6, actualBoundingBoxDescent: 2 };

  fillRect(x: number, y: number, w: number, h: number) {
    this.fillRects.push({ x, y, w, h, color: this.fillStyle });
  }

  fillText(value: string, x: number, y: number) {
    this.fillTexts.push({
      value,
      x,
      y,
      font: this.font,
      color: this.fillStyle,
    });
  }

  clearRect(x: number, y: number, w: number, h: number) {
    this.clearRects.push([x, y, w, h]);
  }

  drawImage(...args: any[]) {
    this.drawImages.push(args);
  }

  getImageData() {
    return this.imageData;
  }

  putImageData(image: any, x: number, y: number) {
    this.putImageDataCalls.push({ image, x, y });
  }

  measureText() {
    return this.measureResult;
  }
}

export class FakeCanvas {
  width = 0;
  height = 0;
  context = new FakeContext2D();
  blob: any = { type: "image/png" };

  getContext(_kind: string) {
    return this.context;
  }

  toBlob(callback: (blob: any) => void) {
    callback(this.blob);
  }
}

export function installCanvasHelpersRuntime() {
  const browserGlobal = globalThis as any;
  const originalDocument = browserGlobal.document;
  const originalUrl = browserGlobal.URL;
  const originalSetTimeout = browserGlobal.setTimeout;
  const originalImageData = browserGlobal.ImageData;
  const originalGetComputedStyle = browserGlobal.getComputedStyle;
  const createdAnchors: Array<any> = [];
  const createdCanvases: FakeCanvas[] = [];
  let revokedUrl = "";
  let timeoutDelay = -1;

  browserGlobal.document = {
    createElement(tag: string) {
      if (tag === "a") {
        const anchor = {
          href: "",
          download: "",
          clicks: 0,
          click() {
            this.clicks += 1;
          },
        };
        createdAnchors.push(anchor);
        return anchor;
      }
      if (tag === "canvas") {
        const canvas = new FakeCanvas();
        createdCanvases.push(canvas);
        return canvas;
      }
      throw new Error(`Unexpected element ${tag}`);
    },
    documentElement: {},
    fonts: { load: () => Promise.resolve() },
  };
  browserGlobal.URL = {
    createObjectURL() {
      return "blob:test";
    },
    revokeObjectURL(url: string) {
      revokedUrl = url;
    },
  };
  browserGlobal.setTimeout = (callback: () => void, delay: number) => {
    timeoutDelay = delay;
    callback();
    return 1;
  };
  browserGlobal.ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;

    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
  browserGlobal.getComputedStyle = () => ({
    getPropertyValue(name: string) {
      if (name === "--pixel-emoji-proposed-family") return "";
      if (name === "--pixel-emoji-released-family")
        return '"Pixel Emoji Loaded"';
      return "";
    },
  });

  return {
    createdAnchors,
    createdCanvases,
    get revokedUrl() {
      return revokedUrl;
    },
    get timeoutDelay() {
      return timeoutDelay;
    },
    restore() {
      browserGlobal.document = originalDocument;
      browserGlobal.URL = originalUrl;
      browserGlobal.setTimeout = originalSetTimeout;
      browserGlobal.ImageData = originalImageData;
      browserGlobal.getComputedStyle = originalGetComputedStyle;
    },
  };
}
