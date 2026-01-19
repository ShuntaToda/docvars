# docvars

A CLI tool to replace `{{variables}}` in document templates with values from a YAML file.

Supports any text-based files: Markdown, HTML, TXT, and more.

## Installation

```bash
npm install -g docvars
```

Or use with npx:

```bash
npx docvars ./templates ./output
```

## Usage

```bash
docvars <input> <output> [options]
```

### Arguments

| Argument | Description                               |
| -------- | ----------------------------------------- |
| `input`  | Input directory containing template files |
| `output` | Output directory for processed files      |

### Options

| Option          | Alias | Default          | Description                                         |
| --------------- | ----- | ---------------- | --------------------------------------------------- |
| `--vars`        | `-v`  | `variables.yaml` | Path to the variables YAML file                     |
| `--only`        | `-o`  | `**/*`           | Glob pattern to filter files (e.g. **/*.md)         |
| `--exclude`     | `-e`  | -                | Glob pattern to exclude specific files              |
| `--watch`       | `-w`  | `false`          | Watch for file changes and rebuild automatically    |
| `--rename-from` | `-F`  | -                | Variable name to rename from (use with --rename-to) |
| `--rename-to`   | `-T`  | -                | Variable name to rename to (use with --rename-from) |
| `--list-vars`   | `-l`  | `false`          | List all variables used in templates                |
| `--dry-run`     | `-d`  | `false`          | Preview changes without writing files               |

## Examples

### Basic usage

```bash
docvars ./templates ./output
```

### Custom variables file

```bash
docvars ./templates ./output --vars production.yaml
```

### Filter files

```bash
# Process only markdown files
docvars ./templates ./output --only "**/*.md"

# Process multiple file types
docvars ./templates ./output --only "**/*.{md,html,txt}"

# Process only files matching pattern
docvars ./templates ./output --only "api-*.md"

# Exclude files matching pattern
docvars ./templates ./output --exclude "draft-*.md"
```

By default, all text files are processed (binary files like images are automatically excluded).

### Watch mode

```bash
docvars ./templates ./output --watch
```

Output:

```
👁 Watch mode enabled

┌───────────┬─────────────────────────┐
│ Templates │ /path/to/templates      │
│ Variables │ /path/to/variables.yaml │
└───────────┴─────────────────────────┘

Waiting for changes... (Ctrl+C to stop)

👀 Change detected: README.md (change)

✨ Build complete

┌───────────┬────────┐
│ File      │ Status │
├───────────┼────────┤
│ README.md │ ✓ done │
└───────────┴────────┘

Processed: 1 file(s)
```

### Rename variables

Rename a variable across all template files and the variables YAML file:

```bash
# Simple rename
docvars ./templates ./output --rename-from "name" --rename-to "title"

# Rename nested variable
docvars ./templates ./output --rename-from "database.host" --rename-to "db.host"
```

Output:

```
✏️  Rename complete
   database.host → db.host

┌────────────────┬───────────┐
│ File           │ Status    │
├────────────────┼───────────┤
│ variables.yaml │ ✓ updated │
│ README.md      │ ✓ updated │
└────────────────┴───────────┘

Updated: 2 file(s)
```

### List variables

Show all variables used in templates and their status:

```bash
docvars ./templates ./output --list-vars
```

Output:

```
📋 Variables

┌─────────────────┬─────────────┬───────────┐
│ Variable        │ Status      │ Used in   │
├─────────────────┼─────────────┼───────────┤
│ app.name        │ ✓ defined   │ README.md │
│ api.key         │ ✗ undefined │ config.md │
└─────────────────┴─────────────┴───────────┘

⚠ Unused variables (defined but not used):

  deprecated.setting

Summary: 1 defined · 1 undefined · 1 unused
```

### Dry run

Preview what files would be created or updated without actually writing them:

```bash
docvars ./templates ./output --dry-run
```

Output:

```
🔍 Dry run - no files written

┌──────────────┬─────────────┐
│ File         │ Status      │
├──────────────┼─────────────┤
│ config.md    │ + create    │
│ README.md    │ ~ update    │
│ api.md       │ ~ update    │
│ changelog.md │ = unchanged │
└──────────────┴─────────────┘

Summary: 1 create · 2 update · 1 unchanged
```

## Template Syntax

Use `{{variableName}}` syntax in your template files:

**Template (templates/hello.md):**
```markdown
# Hello {{name}}

Welcome to {{project}}!
```

**Variables (variables.yaml):**
```yaml
name: World
project: My Project
```

**Output (output/hello.md):**
```markdown
# Hello World

Welcome to My Project!
```

### Nested Variables

You can use nested objects in your variables file and access them with dot notation:

**Template:**
```markdown
# {{app.name}}

Database: {{database.host}}:{{database.port}}
```

**Variables (variables.yaml):**
```yaml
app:
  name: My App

database:
  host: localhost
  port: 5432
```

**Output:**
```markdown
# My App

Database: localhost:5432
```

## Error Handling

| Case                        | Behavior                                            |
| --------------------------- | --------------------------------------------------- |
| Undefined variable          | Warning is displayed, variable syntax is kept as-is |
| Same input/output directory | Error and exit                                      |
| Variables file not found    | Error and exit                                      |

## License

MIT
