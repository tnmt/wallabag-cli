import { formatJson } from "../output.js";

const SCHEMA = {
  name: "wallabag",
  version: "0.1.0",
  description: "CLI tool for Wallabag REST API v2",
  commands: {
    entry: {
      list: {
        description: "List entries",
        options: {
          "--archived": { type: "boolean", description: "List archived entries" },
          "--starred": { type: "boolean", description: "List starred entries" },
          "--count": { type: "number", description: "Limit results (default 20)" },
          "--page": { type: "number", description: "Page number" },
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      show: {
        description: "Show entry content as markdown",
        args: ["<id>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      create: {
        description: "Save URL to Wallabag",
        args: ["<url>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      archive: {
        description: "Archive entry",
        args: ["<id>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      unarchive: {
        description: "Unarchive entry",
        args: ["<id>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      star: {
        description: "Star entry",
        args: ["<id>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      unstar: {
        description: "Unstar entry",
        args: ["<id>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      delete: {
        description: "Delete entry (requires --yes)",
        args: ["<id>"],
        options: {
          "--yes": { type: "boolean", description: "Confirm deletion", required: true },
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
    },
    tag: {
      list: {
        description: "List all tags",
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      add: {
        description: "Add tag to entry",
        args: ["<entry-id>", "<tag>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
      remove: {
        description: "Remove tag from entry",
        args: ["<entry-id>", "<tag>"],
        options: {
          "--json": { type: "boolean", description: "Output as JSON" },
        },
      },
    },
    schema: {
      description: "Output CLI specification as JSON",
    },
  },
  globalOptions: {
    "--json": { type: "boolean", description: "Machine-readable JSON output" },
    "--help": { type: "boolean", description: "Show help" },
    "--version": { type: "boolean", description: "Show version" },
  },
  config: {
    env: [
      "WALLABAG_URL",
      "WALLABAG_CLIENT_ID",
      "WALLABAG_CLIENT_SECRET",
      "WALLABAG_USERNAME",
      "WALLABAG_PASSWORD",
    ],
    file: "~/.config/wallabag-cli/config.json",
  },
};

export function schemaCommand(): void {
  process.stdout.write(formatJson(SCHEMA) + "\n");
}
