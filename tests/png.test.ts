import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { readPngDimensions } from "../src/png.js";

describe("readPngDimensions", () => {
  it("reads width/height from the fixture PNG's IHDR chunk", () => {
    const buffer = readFileSync("fixtures/parcel-42.png");
    expect(readPngDimensions(buffer)).toEqual({ width: 100, height: 80 });
  });

  it("throws on a buffer that isn't a PNG", () => {
    expect(() => readPngDimensions(Buffer.from("not a png"))).toThrow(/not a valid PNG/);
  });
});
