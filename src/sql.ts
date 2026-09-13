import type { Envelope } from "./worldfile.js";

/** Table/layer identifiers are restricted to safe SQL identifiers — this SQL is meant to be reviewed and pasted by a human, never executed automatically by this tool. */
const sqlIdentifier = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface EnvelopeSqlParams {
  tableName: string;
  layerId: number;
  envelope: Envelope;
  srid: number;
}

/**
 * Builds an UPDATE that places an already-registered layer's geometry column using
 * ST_MakeEnvelope — this tool only ever prints SQL text; it never opens a database
 * connection, so review-before-running is the only safety mechanism it needs.
 */
export function buildEnvelopeSql(params: EnvelopeSqlParams): string {
  const { tableName, layerId, envelope, srid } = params;
  if (!sqlIdentifier.test(tableName)) {
    throw new Error(`invalid table name (must match ${sqlIdentifier}): ${tableName}`);
  }
  const { minX, minY, maxX, maxY } = envelope;

  return (
    `UPDATE ${tableName}\n` +
    `SET geom = ST_MakeEnvelope(${minX}, ${minY}, ${maxX}, ${maxY}, ${srid})\n` +
    `WHERE layer_id = ${layerId};`
  );
}
