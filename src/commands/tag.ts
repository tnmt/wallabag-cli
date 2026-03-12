import type { Config } from "../config.js";
import { getToken, getTags, addTag, removeTag, getEntry } from "../client.js";
import { formatTable, formatJson } from "../output.js";
import { CliError } from "../error.js";

interface TagFlags {
  json?: boolean;
}

function parseTagFlags(args: string[]): TagFlags {
  const flags: TagFlags = {};
  for (const arg of args) {
    if (arg === "--json") flags.json = true;
  }
  return flags;
}

export async function tagCommand(
  config: Config,
  action: string,
  positional: string[],
  rawArgs: string[]
): Promise<void> {
  const flags = parseTagFlags(rawArgs);
  const token = await getToken(config);

  switch (action) {
    case "list": {
      const tags = await getTags(config, token);

      if (flags.json) {
        process.stdout.write(formatJson(tags) + "\n");
      } else {
        const headers = ["ID", "LABEL", "SLUG"];
        const rows = tags.map((t) => [String(t.id), t.label, t.slug]);
        process.stdout.write(formatTable(headers, rows) + "\n");
      }
      break;
    }

    case "add": {
      const entryId = parseInt(positional[0], 10);
      const tag = positional[1];
      if (!entryId || !tag) {
        throw new CliError(
          "INVALID_ARG",
          "Entry ID and tag are required",
          "Usage: wallabag tag add <entry-id> <tag>"
        );
      }

      const entry = await addTag(config, token, entryId, tag);

      if (flags.json) {
        process.stdout.write(formatJson(entry) + "\n");
      } else {
        process.stdout.write(
          `Added tag "${tag}" to entry ${entryId}: ${entry.title}\n`
        );
      }
      break;
    }

    case "remove": {
      const entryId = parseInt(positional[0], 10);
      const tagName = positional[1];
      if (!entryId || !tagName) {
        throw new CliError(
          "INVALID_ARG",
          "Entry ID and tag name are required",
          "Usage: wallabag tag remove <entry-id> <tag>"
        );
      }

      // Resolve tag name to tag ID by looking at the entry's tags
      const entry = await getEntry(config, token, entryId);
      const tagObj = entry.tags.find(
        (t) => t.label === tagName || t.slug === tagName
      );
      if (!tagObj) {
        throw new CliError(
          "TAG_NOT_FOUND",
          `Tag "${tagName}" not found on entry ${entryId}`,
          `Available tags on this entry: ${entry.tags.map((t) => t.label).join(", ") || "none"}`
        );
      }

      await removeTag(config, token, entryId, tagObj.id);

      if (flags.json) {
        process.stdout.write(
          formatJson({ removed: { entryId, tagId: tagObj.id, label: tagObj.label } }) + "\n"
        );
      } else {
        process.stdout.write(
          `Removed tag "${tagObj.label}" from entry ${entryId}\n`
        );
      }
      break;
    }

    default:
      throw new CliError(
        "UNKNOWN_ACTION",
        `Unknown tag action: ${action}`,
        "Available actions: list, add, remove"
      );
  }
}
