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

| Option      | Default          | Description                            |
| ----------- | ---------------- | -------------------------------------- |
| `--vars`    | `variables.yaml` | Path to the variables YAML file        |
| `--include` | -                | Glob pattern to include specific files |
| `--exclude` | -                | Glob pattern to exclude specific files |

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

## Error Handling

| Case                        | Behavior                                            |
| --------------------------- | --------------------------------------------------- |
| Undefined variable          | Warning is displayed, variable syntax is kept as-is |
| Same input/output directory | Error and exit                                      |
| Variables file not found    | Error and exit                                      |

## License

MIT
