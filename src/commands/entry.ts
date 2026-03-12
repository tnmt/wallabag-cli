import type { Config } from "../config.js";
import {
  getToken,
  getEntries,
  getEntry,
  createEntry,
  patchEntry,
  deleteEntry,
} from "../client.js";
import { formatTable, formatJson, htmlToMarkdown } from "../output.js";
import { CliError, handleError } from "../error.js";

interface EntryFlags {
  archived?: boolean;
  starred?: boolean;
  count?: number;
  page?: number;
  json?: boolean;
  yes?: boolean;
}

function parseEntryFlags(args: string[]): EntryFlags {
  const flags: EntryFlags = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--archived":
        flags.archived = true;
        break;
      case "--starred":
        flags.starred = true;
        break;
      case "--count":
        flags.count = parseInt(args[++i], 10);
        break;
      case "--page":
        flags.page = parseInt(args[++i], 10);
        break;
      case "--json":
        flags.json = true;
        break;
      case "--yes":
        flags.yes = true;
        break;
    }
  }
  return flags;
}

export async function entryCommand(
  config: Config,
  action: string,
  positional: string[],
  rawArgs: string[]
): Promise<void> {
  const flags = parseEntryFlags(rawArgs);

  // Validate delete --yes before any API calls
  if (action === "delete" && !flags.yes) {
    const id = parseInt(positional[0], 10);
    if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry delete <id> --yes");
    throw new CliError(
      "CONFIRMATION_REQUIRED",
      "Delete requires --yes flag",
      "Usage: wallabag entry delete <id> --yes"
    );
  }

  const token = await getToken(config);

  switch (action) {
    case "list": {
      const params: {
        archive?: 0 | 1;
        starred?: 0 | 1;
        page?: number;
        perPage?: number;
      } = {};
      if (flags.archived) params.archive = 1;
      if (flags.starred) params.starred = 1;
      if (flags.count) params.perPage = flags.count;
      else params.perPage = 20;
      if (flags.page) params.page = flags.page;

      const result = await getEntries(config, token, params);
      const entries = result._embedded.items;

      if (flags.json) {
        process.stdout.write(formatJson(result) + "\n");
      } else {
        const headers = ["ID", "TITLE", "DOMAIN", "DATE", "STARRED"];
        const rows = entries.map((e) => [
          String(e.id),
          e.title.length > 60 ? e.title.slice(0, 57) + "..." : e.title,
          e.domain_name || "",
          e.created_at.slice(0, 10),
          e.is_starred ? "*" : "",
        ]);
        process.stdout.write(
          formatTable(headers, rows) +
            `\n\nPage ${result.page}/${result.pages} (${result.total} total)\n`
        );
      }
      break;
    }

    case "show": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry show <id>");

      const entry = await getEntry(config, token, id);

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        const md = htmlToMarkdown(entry.content);
        const header = [
          `# ${entry.title}`,
          "",
          `- URL: ${entry.url}`,
          `- Domain: ${entry.domain_name}`,
          `- Created: ${entry.created_at}`,
          `- Reading time: ${entry.reading_time} min`,
          `- Tags: ${entry.tags.map((t) => t.label).join(", ") || "none"}`,
          "",
          "---",
          "",
        ].join("\n");
        process.stdout.write(header + md + "\n");
      }
      break;
    }

    case "create": {
      const url = positional[0];
      if (!url) throw new CliError("INVALID_ARG", "URL is required", "Usage: wallabag entry create <url>");

      const entry = await createEntry(config, token, url);

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(`Created entry ${entry.id}: ${entry.title}\n`);
      }
      break;
    }

    case "archive": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry archive <id>");

      const entry = await patchEntry(config, token, id, { archive: 1 });

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(`Archived entry ${entry.id}: ${entry.title}\n`);
      }
      break;
    }

    case "unarchive": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry unarchive <id>");

      const entry = await patchEntry(config, token, id, { archive: 0 });

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(`Unarchived entry ${entry.id}: ${entry.title}\n`);
      }
      break;
    }

    case "star": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry star <id>");

      const entry = await patchEntry(config, token, id, { starred: 1 });

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(`Starred entry ${entry.id}: ${entry.title}\n`);
      }
      break;
    }

    case "unstar": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry unstar <id>");

      const entry = await patchEntry(config, token, id, { starred: 0 });

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(`Unstarred entry ${entry.id}: ${entry.title}\n`);
      }
      break;
    }

    case "delete": {
      const id = parseInt(positional[0], 10);
      if (!id) throw new CliError("INVALID_ARG", "Entry ID is required", "Usage: wallabag entry delete <id> --yes");

      await deleteEntry(config, token, id);

      if (flags.json) {
        process.stdout.write(formatJson({ deleted: id }) + "\n");
      } else {
        process.stdout.write(`Deleted entry ${id}\n`);
      }
      break;
    }

    default:
      throw new CliError(
        "UNKNOWN_ACTION",
        `Unknown entry action: ${action}`,
        "Available actions: list, show, create, archive, unarchive, star, unstar, delete"
      );
  }
}
