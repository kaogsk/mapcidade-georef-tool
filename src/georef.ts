import { parseWorldFile, computeEnvelope } from "./worldfile.js";
import { buildEnvelopeSql } from "./sql.js";

export interface GeoreferenceParams {
  worldFileContent: string;
  widthPx: number;
  heightPx: number;
  tableName: string;
  layerId: number;
  srid: number;
}

/** The one function both the CLI and the web endpoint call: world file text + image dimensions in, ready-to-review SQL out. */
export function georeferenceToSql(params: GeoreferenceParams): string {
  const wf = parseWorldFile(params.worldFileContent);
  const envelope = computeEnvelope(wf, params.widthPx, params.heightPx);
  return buildEnvelopeSql({ tableName: params.tableName, layerId: params.layerId, envelope, srid: params.srid });
}
