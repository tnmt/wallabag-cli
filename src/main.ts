#!/usr/bin/env bun

import { loadConfig } from "./config.js";
import { entryCommand } from "./commands/entry.js";
import { tagCommand } from "./commands/tag.js";
import { schemaCommand } from "./commands/schema.js";
import { CliError, handleError } from "./error.js";

const VERSION = "0.1.0";

const HELP = `wallabag-cli v${VERSION}

Usage: wallabag <resource> <action> [args] [options]

Resources:
  entry    Manage entries (list, show, create, archive, unarchive, star, unstar, delete)
  tag      Manage tags (list, add, remove)
  schema   Output CLI specification as JSON

Global options:
  --json      Machine-readable JSON output
  --help      Show this help
  --version   Show version

Examples:
  wallabag entry list
  wallabag entry list --archived --count 10
  wallabag entry show 42
  wallabag entry create https://example.com/article
  wallabag entry archive 42
  wallabag entry delete 42 --yes
  wallabag tag list
  wallabag tag add 42 reading
  wallabag tag remove 42 reading
  wallabag schema
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Global flags
  if (args.includes("--help") || args.includes("-h") || args.length === 0) {
    process.stdout.write(HELP);
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  const resource = args[0];
  const action = args[1];

  // Collect positional args (not flags) after resource+action
  const rest = args.slice(2);
  const positional: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--")) {
      // Skip flag value if next arg exists and isn't a flag
      if (
        (rest[i] === "--count" || rest[i] === "--page") &&
        i + 1 < rest.length
      ) {
        i++;
      }
      continue;
    }
    positional.push(rest[i]);
  }

  switch (resource) {
    case "schema":
      schemaCommand();
      break;

    case "entry": {
      if (!action) {
        throw new CliError(
          "MISSING_ACTION",
          "Action is required for entry resource",
          "Available actions: list, show, create, archive, unarchive, star, unstar, delete"
        );
      }
      const config = loadConfig();
      await entryCommand(config, action, positional, rest);
      break;
    }

    case "tag": {
      if (!action) {
        throw new CliError(
          "MISSING_ACTION",
          "Action is required for tag resource",
          "Available actions: list, add, remove"
        );
      }
      const config = loadConfig();
      await tagCommand(config, action, positional, rest);
      break;
    }

    default:
      throw new CliError(
        "UNKNOWN_RESOURCE",
        `Unknown resource: ${resource}`,
        "Available resources: entry, tag, schema"
      );
  }
}

main().catch(handleError);
