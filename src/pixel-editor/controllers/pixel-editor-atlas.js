import {
  CELL_SIZE,
} from "../pixel-editor-constants.js";
import { canvasToPng, downloadBlob, imageDataCanvas } from "../pixel-editor-canvas-helpers.js";

export function createPixelEditorAtlasController(options) {
  const {
    currentEntry,
    draftController,
    downloadButton,
    downloadEmojiButton,
    getAtlasBlob,
    getAtlasDimensions,
    getDirectoryHandle,
    getNestedFileHandle,
    getPixels,
    imageBitmapFactory = createImageBitmap,
    setAtlasBlob,
    setAtlasExists,
    setDirectoryHandle,
    translate,
    writeStatus,
  } = options;

  async function saveAtlas() {
    if (!currentEntry() || !getAtlasBlob() || downloadButton.disabled) return;
    if (!window.showDirectoryPicker) {
      writeStatus(
        translate(
          "directoryAccessUnavailable",
          "Direct folder access is unavailable; downloading the atlas instead.",
        ),
      );
      await downloadAtlas();
      return;
    }
    try {
      let directoryHandle = getDirectoryHandle();
      directoryHandle ??= await window.showDirectoryPicker({
        id: "pixel-emoji-atlases",
        mode: "readwrite",
        startIn: "documents",
      });
      setDirectoryHandle(directoryHandle);
      const fileHandle = await getNestedFileHandle(
        directoryHandle,
        currentEntry().atlas,
        true,
      );
      const updatedBlob = await renderUpdatedAtlas(getAtlasBlob());
      const writable = await fileHandle.createWritable();
      await writable.write(updatedBlob);
      await writable.close();
      setAtlasBlob(updatedBlob);
      setAtlasExists(true);
      draftController.markAtlasClean(currentEntry().atlas);
      draftController.updateFileButtons();
      writeStatus(translate("atlasSaved", "Atlas PNG saved."));
    } catch (error) {
      if (error.name === "AbortError") return;
      console.warn("Unable to save pixel atlas", error);
      writeStatus(
        translate(
          "atlasSaveFailed",
          `Could not save ${currentEntry().atlas}. Choose the pixel-font/atlases directory.`,
        ),
      );
      setDirectoryHandle(undefined);
    }
  }

  async function downloadAtlas() {
    if (!currentEntry() || !getAtlasBlob() || downloadButton.disabled) return;
    const updatedBlob = await renderUpdatedAtlas(getAtlasBlob());
    setAtlasBlob(updatedBlob);
    setAtlasExists(true);
    draftController.markAtlasClean(currentEntry().atlas);
    draftController.updateFileButtons();
    downloadBlob(updatedBlob, currentEntry().atlas.split("/").at(-1));
    writeStatus(translate("atlasDownloaded", "Updated atlas PNG downloaded."));
  }

  async function renderUpdatedAtlas(source) {
    draftController.rememberCurrentDraft();
    const image = await imageBitmapFactory(source);
    const { width, height } = getAtlasDimensions();
    if (image.width !== width || image.height !== height) {
      image.close();
      throw new Error(
        `The selected atlas must be exactly ${width} by ${height} pixels`,
      );
    }
    const atlasCanvas = document.createElement("canvas");
    atlasCanvas.width = image.width;
    atlasCanvas.height = image.height;
    const atlasContext = atlasCanvas.getContext("2d");
    atlasContext.drawImage(image, 0, 0);
    image.close();
    for (const draft of draftController.artworkDrafts().values()) {
      if (draft.entry.atlas !== currentEntry().atlas) continue;
      atlasContext.putImageData(
        new ImageData(draft.pixels.slice(), CELL_SIZE, CELL_SIZE),
        draft.entry.x,
        draft.entry.y,
      );
    }
    return new Promise((resolve, reject) => {
      atlasCanvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("PNG encoding failed")),
        "image/png",
      );
    });
  }

  async function downloadEmojiPng() {
    if (downloadEmojiButton.disabled || !currentEntry()) return;
    const blob = await canvasToPng(imageDataCanvas(getPixels(), CELL_SIZE, CELL_SIZE));
    downloadBlob(blob, `${currentEntry().key}.png`);
    writeStatus(
      translate("emojiPngDownloaded", "12 by 12 emoji PNG downloaded."),
    );
  }

  return { downloadAtlas, downloadEmojiPng, renderUpdatedAtlas, saveAtlas };
}
