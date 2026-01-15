import { defineCommand } from "citty";
import { resolve } from "node:path";
import pc from "picocolors";
import Table from "cli-table3";
import { watch } from "chokidar";

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}
import { processTemplates } from "../../../application/use-cases/process-templates.js";
import { renameVariable } from "../../../application/use-cases/rename-variable.js";
import { listVariables } from "../../../application/use-cases/list-variables.js";
import { dryRun } from "../../../application/use-cases/dry-run.js";
import { VariablesFileNotFoundError, SameInputOutputError, InvalidVariablesError } from "../../../shared/errors.js";

interface ProcessOptions {
  input: string;
  output: string;
  vars: string;
  only?: string;
  exclude?: string;
}

async function runProcess(options: ProcessOptions): Promise<boolean> {
  try {
    const result = await processTemplates(options);

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.warn(pc.yellow(`⚠ ${warning}`));
      }
      console.log();
    }

    if (result.processedFiles.length === 0) {
      console.log(pc.gray("No files to process"));
      return true;
    }

    const table = new Table({
      head: [pc.bold("File"), pc.bold("Status")],
      style: { head: [], border: [] },
    });

    for (const file of result.processedFiles) {
      table.push([file, pc.green("✓ done")]);
    }

    console.log(pc.bold(pc.cyan("\n✨ Build complete\n")));
    console.log(table.toString());
    console.log();
    console.log(pc.bold("Processed: ") + pc.green(`${result.processedFiles.length} file(s)`));

    return true;
  } catch (error) {
    if (
      error instanceof VariablesFileNotFoundError ||
      error instanceof SameInputOutputError ||
      error instanceof InvalidVariablesError
    ) {
      console.error(pc.red(`✗ Error: ${error.message}`));
      return false;
    }
    throw error;
  }
}

function startWatch(options: ProcessOptions): void {
  const inputPath = resolve(options.input);
  const varsPath = resolve(options.vars);

  let debounceTimer: NodeJS.Timeout | null = null;

  const handleChange = (eventType: string, filePath: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      console.log(pc.cyan(`\n👀 Change detected: ${pc.bold(filePath)} (${eventType})\n`));
      await runProcess(options);
    }, 100);
  };

  console.log(pc.bold(pc.magenta("\n👁 Watch mode enabled\n")));

  const watchTable = new Table({
    style: { head: [], border: [] },
  });
  watchTable.push([pc.gray("Templates"), inputPath], [pc.gray("Variables"), varsPath]);
  console.log(watchTable.toString());
  console.log();
  console.log(pc.gray("Waiting for changes... (Ctrl+C to stop)\n"));

  const watcher = watch([inputPath, varsPath], {
    ignoreInitial: true,
    ignored: /(^|[\/\\])\../,
  });

  watcher.on("all", handleChange);
}

export const mainCommand = defineCommand({
  meta: {
    name: "docvars",
    description: "Replace {{variables}} in document templates with YAML values",
  },
  args: {
    input: {
      type: "positional",
      description: "Input directory containing templates",
      required: true,
    },
    output: {
      type: "positional",
      description: "Output directory for processed files",
      required: true,
    },
    vars: {
      type: "string",
      alias: "v",
      description: "Path to variables YAML file",
      default: "variables.yaml",
    },
    only: {
      type: "string",
      alias: "o",
      description: "Glob pattern to filter files (e.g. **/*.md)",
    },
    exclude: {
      type: "string",
      alias: "e",
      description: "Glob pattern to exclude files",
    },
    watch: {
      type: "boolean",
      alias: "w",
      description: "Watch for file changes and rebuild automatically",
      default: false,
    },
    "rename-from": {
      type: "string",
      alias: "r",
      description: "Variable name to rename from (use with --rename-to)",
    },
    "rename-to": {
      type: "string",
      alias: "t",
      description: "Variable name to rename to (use with --rename-from)",
    },
    "list-vars": {
      type: "boolean",
      alias: "l",
      description: "List all variables used in templates",
      default: false,
    },
    "dry-run": {
      type: "boolean",
      alias: "d",
      description: "Preview changes without writing files",
      default: false,
    },
  },
  async run({ args }) {
    // Handle dry-run mode
    if (args["dry-run"]) {
      try {
        const result = await dryRun({
          input: args.input,
          output: args.output,
          vars: args.vars,
          only: args.only,
          exclude: args.exclude,
        });

        console.log(pc.bold(pc.cyan("\n🔍 Dry run - no files written\n")));

        if (result.warnings.length > 0) {
          for (const warning of result.warnings) {
            console.warn(pc.yellow(`⚠ ${warning}`));
          }
          console.log();
        }

        if (result.changes.length === 0) {
          console.log(pc.gray("No files to process"));
          return;
        }

        const table = new Table({
          head: [pc.bold("File"), pc.bold("Status")],
          style: { head: [], border: [] },
        });

        for (const change of result.changes) {
          let status: string;
          switch (change.status) {
            case "create":
              status = pc.green("+ create");
              break;
            case "update":
              status = pc.yellow("~ update");
              break;
            case "unchanged":
              status = pc.gray("= unchanged");
              break;
          }
          table.push([change.relativePath, status]);
        }

        console.log(table.toString());
        console.log();

        const creates = result.changes.filter((c) => c.status === "create").length;
        const updates = result.changes.filter((c) => c.status === "update").length;
        const unchanged = result.changes.filter((c) => c.status === "unchanged").length;

        console.log(
          pc.bold("Summary: ") +
            pc.green(`${creates} create`) +
            pc.gray(" · ") +
            pc.yellow(`${updates} update`) +
            pc.gray(" · ") +
            pc.gray(`${unchanged} unchanged`)
        );
      } catch (error) {
        if (
          error instanceof VariablesFileNotFoundError ||
          error instanceof SameInputOutputError ||
          error instanceof InvalidVariablesError
        ) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
        throw error;
      }
      return;
    }

    // Handle list-vars mode
    if (args["list-vars"]) {
      try {
        const result = await listVariables({
          input: args.input,
          vars: args.vars,
          only: args.only,
          exclude: args.exclude,
        });

        console.log(pc.bold(pc.cyan("\n📋 Variables\n")));

        if (result.variables.length === 0 && result.unusedVariables.length === 0) {
          console.log(pc.gray("No variables found"));
          return;
        }

        if (result.variables.length > 0) {
          const table = new Table({
            head: [pc.bold("Variable"), pc.bold("Value"), pc.bold("Used in")],
            style: { head: [], border: [] },
            wordWrap: true,
            colWidths: [null, 30, null],
          });

          for (const v of result.variables) {
            const value = v.isDefined ? pc.green(truncate(v.value || "", 25)) : pc.red("✗ undefined");
            const files = v.files.map((f) => pc.gray(f)).join("\n");
            table.push([v.name, value, files]);
          }

          console.log(table.toString());
        }

        if (result.unusedVariables.length > 0) {
          console.log(pc.bold(pc.yellow("\n⚠ Unused variables (defined but not used):\n")));

          const unusedTable = new Table({
            head: [pc.bold("Variable"), pc.bold("Value")],
            style: { head: [], border: [] },
            colWidths: [null, 40],
          });

          for (const v of result.unusedVariables) {
            unusedTable.push([pc.gray(v.name), pc.gray(truncate(v.value, 35))]);
          }

          console.log(unusedTable.toString());
        }

        console.log();
        const defined = result.variables.filter((v) => v.isDefined).length;
        const undefined_ = result.variables.filter((v) => !v.isDefined).length;
        console.log(
          pc.bold("Summary: ") +
            pc.green(`${defined} defined`) +
            pc.gray(" · ") +
            (undefined_ > 0 ? pc.red(`${undefined_} undefined`) : pc.gray("0 undefined")) +
            pc.gray(" · ") +
            pc.yellow(`${result.unusedVariables.length} unused`)
        );
      } catch (error) {
        if (error instanceof VariablesFileNotFoundError) {
          console.error(pc.red(`✗ Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
      return;
    }

    // Handle rename mode
    if (args["rename-from"] || args["rename-to"]) {
      if (!args["rename-from"] || !args["rename-to"]) {
        console.error(pc.red("✗ Error: Both --rename-from and --rename-to are required"));
        process.exit(1);
      }

      try {
        const result = await renameVariable({
          input: args.input,
          vars: args.vars,
          from: args["rename-from"],
          to: args["rename-to"],
          only: args.only,
          exclude: args.exclude,
        });

        if (result.renamedInFiles.length === 0 && !result.renamedInVars) {
          console.log(pc.yellow(`⚠ No occurrences of "${args["rename-from"]}" found`));
        } else {
          console.log(
            pc.bold(pc.cyan("\n✏️  Rename complete\n")) +
              pc.gray(`   ${args["rename-from"]}`) +
              pc.cyan(" → ") +
              pc.green(args["rename-to"]) +
              "\n"
          );

          const table = new Table({
            head: [pc.bold("File"), pc.bold("Status")],
            style: { head: [], border: [] },
          });

          if (result.renamedInVars) {
            table.push([pc.italic("variables.yaml"), pc.green("✓ updated")]);
          }
          for (const file of result.renamedInFiles) {
            table.push([file, pc.green("✓ updated")]);
          }

          console.log(table.toString());
          console.log();

          const total = result.renamedInFiles.length + (result.renamedInVars ? 1 : 0);
          console.log(pc.bold("Updated: ") + pc.green(`${total} file(s)`));
        }
      } catch (error) {
        if (error instanceof VariablesFileNotFoundError) {
          console.error(pc.red(`✗ Error: ${error.message}`));
          process.exit(1);
        }
        throw error;
      }
      return;
    }

    // Normal processing mode
    const options: ProcessOptions = {
      input: args.input,
      output: args.output,
      vars: args.vars,
      only: args.only,
      exclude: args.exclude,
    };

    const success = await runProcess(options);

    if (args.watch) {
      if (!success) {
        console.log("\nFix errors and save to retry...\n");
      }
      startWatch(options);
    } else if (!success) {
      process.exit(1);
    }
  },
});
