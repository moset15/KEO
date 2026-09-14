// Read raster dimensions before asking a browser decoder to allocate the image.
export function checkRasterSize(bytes: Uint8Array, type: string) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset: number, count: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + count));
  let width = 0,
    height = 0;
  if (
    type === "image/png" &&
    bytes.length >= 24 &&
    bytes
      .subarray(0, 8)
      .every((b, i) => b === [137, 80, 78, 71, 13, 10, 26, 10][i]) &&
    ascii(12, 4) === "IHDR"
  ) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (type === "image/jpeg" && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 0xda || marker === 0xd9 || offset + 2 > bytes.length)
        break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
      const length = view.getUint16(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if (
        [
          0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd,
          0xce, 0xcf,
        ].includes(marker) &&
        length >= 8
      ) {
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  } else if (
    type === "image/webp" &&
    ascii(0, 4) === "RIFF" &&
    ascii(8, 4) === "WEBP"
  ) {
    for (let offset = 12; offset + 8 <= bytes.length;) {
      const kind = ascii(offset, 4),
        length = view.getUint32(offset + 4, true),
        start = offset + 8;
      if (start + length > bytes.length) break;
      const uint24 = (i: number) =>
        bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16);
      if (kind === "VP8X" && length >= 10) {
        width = 1 + uint24(start + 4);
        height = 1 + uint24(start + 7);
        break;
      }
      if (
        kind === "VP8 " &&
        length >= 10 &&
        ascii(start + 3, 3) === "\x9d\x01\x2a"
      ) {
        width = view.getUint16(start + 6, true) & 0x3fff;
        height = view.getUint16(start + 8, true) & 0x3fff;
        break;
      }
      if (kind === "VP8L" && length >= 5 && bytes[start] === 0x2f) {
        const packed = view.getUint32(start + 1, true);
        width = (packed & 0x3fff) + 1;
        height = ((packed >>> 14) & 0x3fff) + 1;
        break;
      }
      offset = start + length + (length % 2);
    }
  }
  if (!width || !height)
    throw new Error(
      "The image has an unreadable or unsupported header. Choose another JPEG, PNG or WebP.",
    );
  if (width * height > 36000000 || width > 16000 || height > 16000)
    throw new Error(
      "Resize this image to under 36 megapixels and 16,000 pixels per side.",
    );
  return { width, height };
}
