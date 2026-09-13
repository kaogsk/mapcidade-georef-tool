import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";

function main(): void {
  const app = createApp();
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port, () => console.log(`mapcidade-georef-tool listening on http://localhost:${port}`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
