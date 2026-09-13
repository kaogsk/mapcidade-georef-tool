import express, { type Express } from "express";
import { georeferenceToSql } from "./georef.js";

const FORM_PAGE = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>mapcidade-georef-tool</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem auto}label{display:block;font-weight:600;margin-top:1rem}textarea,input{width:100%;padding:0.4rem;font-size:1rem;box-sizing:border-box}pre{background:#f4f4f4;padding:1rem;white-space:pre-wrap}</style>
</head>
<body>
  <h1>Georeference → SQL</h1>
  <p>Paste a world file's 6 lines and the image's pixel dimensions (the CLI reads these straight out of the PNG header; this form takes them typed, to keep the web mode dependency-free).</p>
  <form method="post" action="/generate">
    <label for="worldFile">World file (6 lines)</label>
    <textarea id="worldFile" name="worldFile" rows="6" required>0.5
0
0
-0.5
500000.25
7500000.25</textarea>
    <label for="widthPx">Width (px)</label>
    <input id="widthPx" name="widthPx" type="number" value="100" required />
    <label for="heightPx">Height (px)</label>
    <input id="heightPx" name="heightPx" type="number" value="80" required />
    <label for="tableName">Table name</label>
    <input id="tableName" name="tableName" value="parcel_42" required />
    <label for="layerId">Layer ID</label>
    <input id="layerId" name="layerId" type="number" value="42" required />
    <label for="srid">SRID</label>
    <input id="srid" name="srid" type="number" value="4326" required />
    <button type="submit">Generate SQL</button>
  </form>
</body>
</html>
`;

export function createApp(): Express {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (_req, res) => res.type("html").send(FORM_PAGE));

  app.post("/generate", (req, res) => {
    const body = req.body as Record<string, string>;
    try {
      const sql = georeferenceToSql({
        worldFileContent: body.worldFile ?? "",
        widthPx: Number(body.widthPx),
        heightPx: Number(body.heightPx),
        tableName: body.tableName ?? "",
        layerId: Number(body.layerId),
        srid: Number(body.srid ?? 4326),
      });
      if (req.headers.accept?.includes("application/json")) {
        res.json({ sql });
      } else {
        res.type("html").send(`${FORM_PAGE}<h2>Generated SQL</h2><pre>${sql.replace(/</g, "&lt;")}</pre>`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      res.status(400).json({ error: message });
    }
  });

  return app;
}
