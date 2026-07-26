import { CELL_SIZE } from "./pixel-editor-constants.js";
import { canvasToPng, drawBitmapText } from "./pixel-editor-canvas-helpers.js";

export async function getNestedFileHandle(root, relativePath, create = false) {
  const parts = relativePath.split("/");
  const fileName = parts.pop();
  let directory = root;
  for (const part of parts) {
    directory = await directory.getDirectoryHandle(part, { create });
  }
  return directory.getFileHandle(fileName, { create });
}

export async function createBlankAtlas(manifest, entry) {
  const canvas = document.createElement("canvas");
  canvas.width = entry.atlasWidth;
  canvas.height = entry.atlasHeight;
  const context = canvas.getContext("2d");
  const footerY = canvas.height - manifest.footerHeight;
  context.fillStyle = "#160622";
  context.fillRect(0, 0, canvas.width, manifest.headerHeight);
  context.fillRect(0, footerY, canvas.width, manifest.footerHeight);
  context.fillStyle = "#6de0ff";
  context.fillRect(0, manifest.headerHeight - 1, canvas.width, 1);
  context.fillRect(0, footerY, canvas.width, 1);
  const subGroupTitle =
    entry.partCount > 1
      ? `${entry.subGroup} ${entry.part}/${entry.partCount}`
      : entry.subGroup;
  drawBitmapText(context, 8, 4, manifest.setName, "#ffe28e");
  drawBitmapText(context, 8, 12, `GROUP: ${entry.group}`, "#f5f3f8");
  drawBitmapText(context, 8, 20, `SUBGROUP: ${subGroupTitle}`, "#f5f3f8");
  drawBitmapText(context, 8, 28, `CREATED: ${manifest.createdDate}`, "#99afba");
  drawBitmapText(
    context,
    8,
    footerY + 4,
    `AUTHOR: ${manifest.author}`,
    "#f5f3f8",
  );
  drawBitmapText(context, 8, footerY + 12, manifest.url, "#6de0ff");
  return canvasToPng(canvas);
}

export async function extractCell(blob, entry) {
  const image = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  image.close();
  return context.getImageData(entry.x, entry.y, CELL_SIZE, CELL_SIZE).data;
}
