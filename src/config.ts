import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { CliError } from "./error.js";

export interface Config {
  url: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

interface ConfigFile {
  url?: string;
  client_id?: string;
  client_secret?: string;
  username?: string;
  password?: string;
}

function loadConfigFile(): ConfigFile {
  const configPath = join(homedir(), ".config", "wallabag-cli", "config.json");
  if (!existsSync(configPath)) return {};
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as ConfigFile;
  } catch {
    return {};
  }
}

export function loadConfig(): Config {
  const file = loadConfigFile();

  const url = process.env.WALLABAG_URL || file.url;
  const clientId = process.env.WALLABAG_CLIENT_ID || file.client_id;
  const clientSecret = process.env.WALLABAG_CLIENT_SECRET || file.client_secret;
  const username = process.env.WALLABAG_USERNAME || file.username;
  const password = process.env.WALLABAG_PASSWORD || file.password;

  if (!url) {
    throw new CliError(
      "CONFIG_MISSING",
      "WALLABAG_URL is not set",
      "Set WALLABAG_URL env var or add 'url' to ~/.config/wallabag-cli/config.json"
    );
  }
  if (!clientId) {
    throw new CliError(
      "CONFIG_MISSING",
      "WALLABAG_CLIENT_ID is not set",
      "Set WALLABAG_CLIENT_ID env var or add 'client_id' to ~/.config/wallabag-cli/config.json"
    );
  }
  if (!clientSecret) {
    throw new CliError(
      "CONFIG_MISSING",
      "WALLABAG_CLIENT_SECRET is not set",
      "Set WALLABAG_CLIENT_SECRET env var or add 'client_secret' to ~/.config/wallabag-cli/config.json"
    );
  }
  if (!username) {
    throw new CliError(
      "CONFIG_MISSING",
      "WALLABAG_USERNAME is not set",
      "Set WALLABAG_USERNAME env var or add 'username' to ~/.config/wallabag-cli/config.json"
    );
  }
  if (!password) {
    throw new CliError(
      "CONFIG_MISSING",
      "WALLABAG_PASSWORD is not set",
      "Set WALLABAG_PASSWORD env var or add 'password' to ~/.config/wallabag-cli/config.json"
    );
  }

  return { url, clientId, clientSecret, username, password };
}
