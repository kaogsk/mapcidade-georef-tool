import { describe, it, expect } from "vitest";
import { parseWorldFile, computeEnvelope } from "../src/worldfile.js";

const wldText = "0.5\n0\n0\n-0.5\n500000.25\n7500000.25\n";

describe("parseWorldFile", () => {
  it("parses all 6 fields in order", () => {
    const wf = parseWorldFile(wldText);
    expect(wf).toEqual({
      pixelSizeX: 0.5,
      rotationY: 0,
      rotationX: 0,
      pixelSizeY: -0.5,
      originX: 500000.25,
      originY: 7500000.25,
    });
  });

  it("throws when fewer than 6 lines are present", () => {
    expect(() => parseWorldFile("0.5\n0\n0\n")).toThrow(/6 lines/);
  });

  it("throws on a non-numeric line", () => {
    expect(() => parseWorldFile("0.5\n0\n0\n-0.5\nabc\n7500000.25")).toThrow(/non-numeric/);
  });

  it("throws when pixel size Y is not negative", () => {
    expect(() => parseWorldFile("0.5\n0\n0\n0.5\n500000.25\n7500000.25")).toThrow(/must be negative/);
  });
});

describe("computeEnvelope", () => {
  it("computes the bounding box from origin, pixel size, and image dimensions", () => {
    const wf = parseWorldFile(wldText);
    const envelope = computeEnvelope(wf, 100, 80);
    expect(envelope).toEqual({
      minX: 500000.25,
      maxY: 7500000.25,
      maxX: 500050.25, // 500000.25 + 100*0.5
      minY: 7499960.25, // 7500000.25 + 80*(-0.5)
    });
  });
});
