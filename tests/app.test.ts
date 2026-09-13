import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("mapcidade-georef-tool app", () => {
  it("GET / renders the form", async () => {
    const res = await request(createApp()).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Georeference");
  });

  it("POST /generate returns SQL for a valid world file + dimensions", async () => {
    const res = await request(createApp())
      .post("/generate")
      .set("Accept", "application/json")
      .send({
        worldFile: "0.5\n0\n0\n-0.5\n500000.25\n7500000.25",
        widthPx: "100",
        heightPx: "80",
        tableName: "parcel_42",
        layerId: "42",
        srid: "4326",
      });
    expect(res.status).toBe(200);
    expect(res.body.sql).toContain("ST_MakeEnvelope(500000.25, 7499960.25, 500050.25, 7500000.25, 4326)");
  });

  it("POST /generate returns 400 with a readable error for a bad world file", async () => {
    const res = await request(createApp())
      .post("/generate")
      .set("Accept", "application/json")
      .send({ worldFile: "bad", widthPx: "100", heightPx: "80", tableName: "parcel_42", layerId: "42" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 lines/);
  });
});
