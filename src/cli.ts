import { parseArgs } from "node:util";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import chalk from "chalk";
import { readPngDimensions } from "./png.js";
import { georeferenceToSql } from "./georef.js";

const USAGE = `mapcidade-georef-tool — generates PostGIS SQL from a georeferenced PNG (read-only, prints SQL text only)

Usage: mapcidade-georef-tool --image <PNG> --worldfile <WLD> --table <NAME> --layer-id <N> [--srid <SRID>] [--output <PATH>]

Options:
  --image PATH       (required) source PNG
  --worldfile PATH   (required) matching .wld/.pgw world file
  --table NAME       (required) target table name (safe SQL identifier)
  --layer-id N       (required) layer_id used in the WHERE clause
  --srid N           spatial reference SRID (default 4326)
  --output PATH      write SQL here instead of stdout
  --help             show this help
`;

export function run(argv: string[]): number {
  const { values: args } = parseArgs({
    args: argv,
    options: {
      image: { type: "string" },
      worldfile: { type: "string" },
      table: { type: "string" },
      "layer-id": { type: "string" },
      srid: { type: "string", default: "4326" },
      output: { type: "string" },
      help: { type: "boolean", default: false },
    },
  });

  if (args.help) {
    console.log(USAGE);
    return 0;
  }
  if (!args.image || !args.worldfile || !args.table || !args["layer-id"]) {
    console.error(chalk.red("ERROR: --image, --worldfile, --table, and --layer-id are all required\n"));
    console.log(USAGE);
    return 1;
  }
  if (!existsSync(args.image)) {
    console.error(chalk.red(`ERROR: image not found: ${args.image}`));
    return 1;
  }
  if (!existsSync(args.worldfile)) {
    console.error(chalk.red(`ERROR: world file not found: ${args.worldfile}`));
    return 1;
  }

  try {
    const { width, height } = readPngDimensions(readFileSync(args.image));
    const sql = georeferenceToSql({
      worldFileContent: readFileSync(args.worldfile, "utf-8"),
      widthPx: width,
      heightPx: height,
      tableName: args.table,
      layerId: Number(args["layer-id"]),
      srid: Number(args.srid),
    });

    console.log(chalk.cyan(`Image: ${width}x${height}px`));
    if (args.output) {
      mkdirSync(dirname(args.output), { recursive: true });
      writeFileSync(args.output, sql + "\n", "utf-8");
      console.log(chalk.green(`✓ Wrote ${args.output}`));
    } else {
      console.log(sql);
    }
    return 0;
  } catch (e) {
    console.error(chalk.red(`ERROR: ${e instanceof Error ? e.message : String(e)}`));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(run(process.argv.slice(2)));
}
