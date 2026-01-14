import { resolve, relative, join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { CliOptions } from "../../shared/types.js";
import { SameInputOutputError } from "../../shared/errors.js";
import { loadVariables } from "../../infrastructure/repositories/variables-repository.js";
import { readTemplate } from "../../infrastructure/repositories/template-repository.js";
import { scanTemplates } from "../../infrastructure/services/file-scanner.js";
import { renderTemplate } from "../../domain/services/template-renderer.js";

export interface FileChange {
  relativePath: string;
  outputPath: string;
  status: "create" | "update" | "unchanged";
  undefinedVariables: string[];
}

export interface DryRunResult {
  changes: FileChange[];
  warnings: string[];
}

export async function dryRun(options: CliOptions): Promise<DryRunResult> {
  const inputDir = resolve(options.input);
  const outputDir = resolve(options.output);

  if (inputDir === outputDir) {
    throw new SameInputOutputError();
  }

  const variables = loadVariables(options.vars);

  const files = await scanTemplates(inputDir, {
    include: options.include,
    exclude: options.exclude,
  });

  const changes: FileChange[] = [];
  const warnings: string[] = [];

  for (const filePath of files) {
    const template = readTemplate(filePath);
    const result = renderTemplate(template.content, variables);

    const relativePath = relative(inputDir, filePath);
    const outputPath = join(outputDir, relativePath);

    let status: FileChange["status"];

    if (!existsSync(outputPath)) {
      status = "create";
    } else {
      const existingContent = readFileSync(outputPath, "utf-8");
      status = existingContent === result.content ? "unchanged" : "update";
    }

    changes.push({
      relativePath,
      outputPath,
      status,
      undefinedVariables: result.undefinedVariables,
    });

    for (const varName of result.undefinedVariables) {
      warnings.push(`Warning: undefined variable "{{${varName}}}" in ${relativePath}`);
    }
  }

  return { changes, warnings };
}
