const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export interface PngDimensions {
  width: number;
  height: number;
}

/**
 * Reads width/height straight out of the PNG's IHDR chunk header — no image-decoding
 * dependency needed, since georeferencing only ever needs pixel dimensions, never
 * pixel data.
 */
export function readPngDimensions(buffer: Buffer): PngDimensions {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("not a valid PNG file (bad signature)");
  }
  const chunkType = buffer.subarray(12, 16).toString("ascii");
  if (chunkType !== "IHDR") {
    throw new Error(`expected IHDR as the first chunk, got "${chunkType}"`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}
