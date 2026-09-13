import { describe, it, expect } from "vitest";
import { buildEnvelopeSql } from "../src/sql.js";

describe("buildEnvelopeSql", () => {
  const envelope = { minX: 500000.25, minY: 7499960.25, maxX: 500050.25, maxY: 7500000.25 };

  it("builds an UPDATE with ST_MakeEnvelope and the layer_id filter", () => {
    const sql = buildEnvelopeSql({ tableName: "parcel_42", layerId: 42, envelope, srid: 4326 });
    expect(sql).toBe(
      "UPDATE parcel_42\n" +
        "SET geom = ST_MakeEnvelope(500000.25, 7499960.25, 500050.25, 7500000.25, 4326)\n" +
        "WHERE layer_id = 42;",
    );
  });

  it("rejects a table name that isn't a safe SQL identifier", () => {
    expect(() => buildEnvelopeSql({ tableName: "parcel; DROP TABLE x", layerId: 1, envelope, srid: 4326 })).toThrow(
      /invalid table name/,
    );
  });
});
