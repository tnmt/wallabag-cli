# wallabag-cli

A CLI tool for [Wallabag](https://wallabag.org/) using REST API v2. Built with Bun.

## Installation

```bash
bun install
bun link
```

After global installation, the `wallabag` command becomes available.

## Configuration

Provide Wallabag connection credentials via environment variables or a config file.

### Environment Variables

```bash
cp .env.example .env
```

```
WALLABAG_URL=https://your-wallabag.example.com
WALLABAG_CLIENT_ID=your-client-id
WALLABAG_CLIENT_SECRET=your-client-secret
WALLABAG_USERNAME=your-username
WALLABAG_PASSWORD=your-password
```

### Config File

Alternatively, place a config file at `~/.config/wallabag-cli/config.json`:

```json
{
  "url": "https://your-wallabag.example.com",
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "username": "your-username",
  "password": "your-password"
}
```

Environment variables take precedence over the config file.

## Usage

### Entries

```bash
# List entries
wallabag entry list
wallabag entry list --archived     # Archived only
wallabag entry list --starred      # Starred only
wallabag entry list --count 20     # Set page size
wallabag entry list --page 2       # Pagination

# Show entry content (rendered as Markdown)
wallabag entry show <id>

# Save a URL
wallabag entry create <url>

# Archive / Star
wallabag entry archive <id>
wallabag entry unarchive <id>
wallabag entry star <id>
wallabag entry unstar <id>

# Delete (requires --yes)
wallabag entry delete <id> --yes
```

### Tags

```bash
# List all tags
wallabag tag list

# Add / remove tags
wallabag tag add <entry-id> <tag>
wallabag tag remove <entry-id> <tag>
```

### Other

```bash
# Output CLI schema as JSON
wallabag schema

# Version
wallabag --version

# Help
wallabag --help
```

### Global Options

| Option | Description |
|---|---|
| `--json` | Machine-readable JSON output |
| `--help`, `-h` | Show help |
| `--version`, `-v` | Show version |

## Development

```bash
bun install
cp .env.example .env  # Edit with your credentials
bun run src/main.ts entry list
```

## License

MIT
