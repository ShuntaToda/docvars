import { readFileSync, existsSync } from "node:fs";
import { relative } from "node:path";
import { scanTemplates } from "../../infrastructure/services/file-scanner.js";
import { loadVariables } from "../../infrastructure/repositories/variables-repository.js";
import { VariablesFileNotFoundError } from "../../shared/errors.js";

export interface ListVariablesOptions {
  input: string;
  vars: string;
  only?: string;
  exclude?: string;
}

export interface VariableUsage {
  name: string;
  value?: string;
  files: string[];
  isDefined: boolean;
}

export interface UnusedVariable {
  name: string;
  value: string;
}

export interface ListVariablesResult {
  variables: VariableUsage[];
  unusedVariables: UnusedVariable[];
}

const VARIABLE_PATTERN = /\{\{([\w.]+)\}\}/g;

export async function listVariables(options: ListVariablesOptions): Promise<ListVariablesResult> {
  const { input, vars, only, exclude } = options;

  if (!existsSync(vars)) {
    throw new VariablesFileNotFoundError(vars);
  }

  // Load defined variables
  const definedVars = loadVariables(vars);
  const definedVarNames = new Set(Object.keys(definedVars));

  // Scan templates and extract variable usage
  const templateFiles = await scanTemplates(input, { only, exclude });
  const variableUsageMap = new Map<string, Set<string>>();

  for (const file of templateFiles) {
    const content = readFileSync(file, "utf-8");
    const relativePath = relative(input, file);

    let match;
    while ((match = VARIABLE_PATTERN.exec(content)) !== null) {
      const varName = match[1];
      if (!variableUsageMap.has(varName)) {
        variableUsageMap.set(varName, new Set());
      }
      variableUsageMap.get(varName)!.add(relativePath);
    }
  }

  // Build result
  const usedVarNames = new Set(variableUsageMap.keys());
  const variables: VariableUsage[] = [];

  // Variables used in templates
  for (const [name, files] of variableUsageMap) {
    variables.push({
      name,
      value: definedVars[name],
      files: Array.from(files).sort(),
      isDefined: definedVarNames.has(name),
    });
  }

  // Sort by name
  variables.sort((a, b) => a.name.localeCompare(b.name));

  // Find unused variables (defined but not used)
  const unusedVariables = Array.from(definedVarNames)
    .filter((name) => !usedVarNames.has(name))
    .sort()
    .map((name) => ({ name, value: definedVars[name] }));

  return { variables, unusedVariables };
}
