# md-template-vars

A CLI tool to replace `{{variables}}` in Markdown templates with values from a YAML file.

## Installation

```bash
npm install -g md-template-vars
```

Or use with npx:

```bash
npx md-template-vars ./templates ./output
```

## Usage

```bash
md-template-vars <input> <output> [options]
```

### Arguments

| Argument | Description                               |
| -------- | ----------------------------------------- |
| `input`  | Input directory containing template files |
| `output` | Output directory for processed files      |

### Options

| Option          | Default          | Description                                         |
| --------------- | ---------------- | --------------------------------------------------- |
| `--vars`        | `variables.yaml` | Path to the variables YAML file                     |
| `--include`     | -                | Glob pattern to include specific files              |
| `--exclude`     | -                | Glob pattern to exclude specific files              |
| `--watch`       | `false`          | Watch for file changes and rebuild automatically    |
| `--rename-from` | -                | Variable name to rename from (use with --rename-to) |
| `--rename-to`   | -                | Variable name to rename to (use with --rename-from) |
| `--list-vars`   | `false`          | List all variables used in templates                |
| `--dry-run`     | `false`          | Preview changes without writing files               |

## Examples

### Basic usage

```bash
md-template-vars ./templates ./output
```

### Custom variables file

```bash
md-template-vars ./templates ./output --vars production.yaml
```

### Filter files

```bash
# Include only files matching pattern
md-template-vars ./templates ./output --include "api-*.md"

# Exclude files matching pattern
md-template-vars ./templates ./output --exclude "draft-*.md"
```

### Watch mode

```bash
md-template-vars ./templates ./output --watch
```

This will watch for changes in:
- Template files in the input directory
- The variables YAML file

When changes are detected, templates are automatically rebuilt.

### Rename variables

Rename a variable across all template files and the variables YAML file:

```bash
# Simple rename
md-template-vars ./templates ./output --rename-from "name" --rename-to "title"

# Rename nested variable
md-template-vars ./templates ./output --rename-from "database.host" --rename-to "db.host"
```

This updates:
- All `{{oldName}}` occurrences in template files → `{{newName}}`
- The key in the variables YAML file

### List variables

Show all variables used in templates and their status:

```bash
md-template-vars ./templates ./output --list-vars
```

Output:

```
Variables used in templates:

  app.name (✓)
    → README.md
    → config.md
  api.key (✗ undefined)
    → config.md

Unused variables (defined but not used):

  deprecated.setting
```

### Dry run

Preview what files would be created or updated without actually writing them:

```bash
md-template-vars ./templates ./output --dry-run
```

Output:

```
Dry run - no files written

Files to create (1):
  + config.md

Files to update (2):
  ~ README.md
  ~ api.md

Files unchanged (1):
  = changelog.md

Summary: 1 create, 2 update, 1 unchanged
```

## Template Syntax

Use `{{variableName}}` syntax in your Markdown files:

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
