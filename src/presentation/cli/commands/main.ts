import { defineCommand } from "citty";
import { watch } from "node:fs";
import { resolve } from "node:path";
import { processTemplates } from "../../../application/use-cases/process-templates.js";
import { renameVariable } from "../../../application/use-cases/rename-variable.js";
import { VariablesFileNotFoundError, SameInputOutputError, InvalidVariablesError } from "../../../shared/errors.js";

interface ProcessOptions {
  input: string;
  output: string;
  vars: string;
  include?: string;
  exclude?: string;
}

async function runProcess(options: ProcessOptions): Promise<boolean> {
  try {
    const result = await processTemplates(options);

    for (const warning of result.warnings) {
      console.warn(warning);
    }

    console.log(`Processed ${result.processedFiles.length} file(s)`);
    for (const file of result.processedFiles) {
      console.log(`  - ${file}`);
    }
    return true;
  } catch (error) {
    if (
      error instanceof VariablesFileNotFoundError ||
      error instanceof SameInputOutputError ||
      error instanceof InvalidVariablesError
    ) {
      console.error(`Error: ${error.message}`);
      return false;
    }
    throw error;
  }
}

function startWatch(options: ProcessOptions): void {
  const inputPath = resolve(options.input);
  const varsPath = resolve(options.vars);

  let debounceTimer: NodeJS.Timeout | null = null;

  const handleChange = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      console.log("\n--- Change detected, rebuilding... ---\n");
      await runProcess(options);
    }, 100);
  };

  console.log(`\nWatching for changes...`);
  console.log(`  - Templates: ${inputPath}`);
  console.log(`  - Variables: ${varsPath}\n`);

  watch(inputPath, { recursive: true }, handleChange);
  watch(varsPath, handleChange);
}

export const mainCommand = defineCommand({
  meta: {
    name: "md-template-vars",
    description: "Replace {{variables}} in markdown templates with YAML values",
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
      description: "Path to variables YAML file",
      default: "variables.yaml",
    },
    include: {
      type: "string",
      description: "Glob pattern to include files",
    },
    exclude: {
      type: "string",
      description: "Glob pattern to exclude files",
    },
    watch: {
      type: "boolean",
      description: "Watch for file changes and rebuild automatically",
      default: false,
    },
    "rename-from": {
      type: "string",
      description: "Variable name to rename from (use with --rename-to)",
    },
    "rename-to": {
      type: "string",
      description: "Variable name to rename to (use with --rename-from)",
    },
  },
  async run({ args }) {
    // Handle rename mode
    if (args["rename-from"] || args["rename-to"]) {
      if (!args["rename-from"] || !args["rename-to"]) {
        console.error("Error: Both --rename-from and --rename-to are required");
        process.exit(1);
      }

      try {
        const result = await renameVariable({
          input: args.input,
          vars: args.vars,
          from: args["rename-from"],
          to: args["rename-to"],
          include: args.include,
          exclude: args.exclude,
        });

        if (result.renamedInFiles.length === 0 && !result.renamedInVars) {
          console.log(`No occurrences of "${args["rename-from"]}" found`);
        } else {
          console.log(`Renamed "${args["rename-from"]}" → "${args["rename-to"]}"`);
          if (result.renamedInVars) {
            console.log(`  - Updated variables file`);
          }
          for (const file of result.renamedInFiles) {
            console.log(`  - ${file}`);
          }
        }
      } catch (error) {
        if (error instanceof VariablesFileNotFoundError) {
          console.error(`Error: ${error.message}`);
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
      include: args.include,
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
