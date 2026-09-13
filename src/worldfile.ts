export interface WorldFile {
  pixelSizeX: number; // A: world units per pixel, x axis
  rotationY: number; // D: usually 0
  rotationX: number; // B: usually 0
  pixelSizeY: number; // E: world units per pixel, y axis — negative (image y grows downward, map y grows upward)
  originX: number; // C: x coordinate of the center of the upper-left pixel
  originY: number; // F: y coordinate of the center of the upper-left pixel
}

/** Parses a 6-line ESRI world file (.wld/.pgw/.jgw — same format regardless of extension). */
export function parseWorldFile(content: string): WorldFile {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 6) throw new Error(`world file must have 6 lines, got ${lines.length}`);

  const [pixelSizeX, rotationY, rotationX, pixelSizeY, originX, originY] = lines.slice(0, 6).map(Number);
  if ([pixelSizeX, rotationY, rotationX, pixelSizeY, originX, originY].some((n) => Number.isNaN(n))) {
    throw new Error("world file contains a non-numeric line");
  }
  if (pixelSizeY >= 0) {
    throw new Error(`world file's pixel size Y (line 4) must be negative (got ${pixelSizeY}) — image rows grow downward while map coordinates grow upward`);
  }

  return { pixelSizeX, rotationY, rotationX, pixelSizeY, originX, originY };
}

export interface Envelope {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Computes the geographic bounding box an image covers, given its world file and pixel
 * dimensions. Ignores rotation (rotationX/rotationY) — real aerial/scan world files are
 * overwhelmingly axis-aligned, and a rotated envelope needs a polygon, not a rectangle;
 * out of scope here (a real GIS tool would fall back to ST_MakeEnvelope only when
 * rotation is ~0, and use a rotated polygon otherwise).
 */
export function computeEnvelope(wf: WorldFile, widthPx: number, heightPx: number): Envelope {
  const minX = wf.originX;
  const maxY = wf.originY;
  const maxX = minX + widthPx * wf.pixelSizeX;
  const minY = maxY + heightPx * wf.pixelSizeY; // pixelSizeY is negative, so this subtracts
  return { minX, minY, maxX, maxY };
}
