import zlib from 'node:zlib';

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function decodeRgbaPng(buffer) {
  assert(buffer.subarray(0, 8).equals(signature), 'Image is not a PNG');

  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const compressed = [];

  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      compressed.push(data);
    } else if (type === 'IEND') {
      break;
    }
  }

  assert(width && height, 'PNG is missing its dimensions');
  assert(bitDepth === 8 && colorType === 6, 'Atlas PNG must be 8-bit RGBA');
  assert(interlace === 0, 'Interlaced atlas PNGs are not supported');

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const inflated = zlib.inflateSync(Buffer.concat(compressed));
  assert(inflated.length === height * (stride + 1), 'PNG pixel data has an unexpected size');
  const pixels = Buffer.alloc(width * height * bytesPerPixel);

  for (let row = 0; row < height; row += 1) {
    const sourceOffset = row * (stride + 1);
    const filter = inflated[sourceOffset];
    for (let column = 0; column < stride; column += 1) {
      const raw = inflated[sourceOffset + 1 + column];
      const destination = row * stride + column;
      const left = column >= bytesPerPixel ? pixels[destination - bytesPerPixel] : 0;
      const above = row > 0 ? pixels[destination - stride] : 0;
      const upperLeft =
        row > 0 && column >= bytesPerPixel ? pixels[destination - stride - bytesPerPixel] : 0;
      pixels[destination] = unfilter(filter, raw, left, above, upperLeft);
    }
  }

  return { width, height, pixels };
}

export function cropRgba(image, x, y, width, height) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const sourceStart = ((y + row) * image.width + x) * 4;
    image.pixels.copy(pixels, row * width * 4, sourceStart, sourceStart + width * 4);
  }
  return { width, height, pixels };
}

export function hasVisiblePixels(image) {
  for (let offset = 3; offset < image.pixels.length; offset += 4) {
    if (image.pixels[offset] !== 0) return true;
  }
  return false;
}

export function encodeRgbaPng(image) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const rows = [];
  for (let row = 0; row < image.height; row += 1) {
    rows.push(Buffer.from([0]));
    const start = row * image.width * 4;
    rows.push(image.pixels.subarray(start, start + image.width * 4));
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function unfilter(filter, raw, left, above, upperLeft) {
  if (filter === 0) return raw;
  if (filter === 1) return (raw + left) & 0xff;
  if (filter === 2) return (raw + above) & 0xff;
  if (filter === 3) return (raw + Math.floor((left + above) / 2)) & 0xff;
  if (filter === 4) return (raw + paeth(left, above, upperLeft)) & 0xff;
  throw new Error(`Unsupported PNG filter ${filter}`);
}

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  if (aboveDistance <= upperLeftDistance) return above;
  return upperLeft;
}

function chunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  name.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return output;
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
