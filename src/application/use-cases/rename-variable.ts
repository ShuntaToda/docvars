import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parse, stringify } from "yaml";
import { scanTemplates } from "../../infrastructure/services/file-scanner.js";
import { VariablesFileNotFoundError } from "../../shared/errors.js";

export interface RenameOptions {
  input: string;
  vars: string;
  from: string;
  to: string;
  include?: string;
  exclude?: string;
}

export interface RenameResult {
  renamedInFiles: string[];
  renamedInVars: boolean;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function renameVariable(options: RenameOptions): Promise<RenameResult> {
  const { input, vars, from, to, include, exclude } = options;

  if (!existsSync(vars)) {
    throw new VariablesFileNotFoundError(vars);
  }

  const result: RenameResult = {
    renamedInFiles: [],
    renamedInVars: false,
  };

  // Rename in template files
  const templateFiles = await scanTemplates(input, { include, exclude });
  const pattern = new RegExp(`\\{\\{${escapeRegex(from)}(\\}\\}|\\|)`, "g");

  for (const file of templateFiles) {
    const content = readFileSync(file, "utf-8");
    const newContent = content.replace(pattern, `{{${to}$1`);

    if (content !== newContent) {
      writeFileSync(file, newContent, "utf-8");
      result.renamedInFiles.push(file);
    }
  }

  // Rename in variables file
  const varsContent = readFileSync(vars, "utf-8");
  const varsData = parse(varsContent);

  if (renameKeyInObject(varsData, from, to)) {
    writeFileSync(vars, stringify(varsData), "utf-8");
    result.renamedInVars = true;
  }

  return result;
}

function renameKeyInObject(obj: Record<string, unknown>, from: string, to: string): boolean {
  const fromParts = from.split(".");
  const toParts = to.split(".");

  // Simple key rename (no dots)
  if (fromParts.length === 1 && toParts.length === 1) {
    if (from in obj) {
      obj[to] = obj[from];
      delete obj[from];
      return true;
    }
    return false;
  }

  // Nested key rename
  const fromParent = getNestedParent(obj, fromParts);
  const fromKey = fromParts[fromParts.length - 1];

  if (!fromParent || !(fromKey in fromParent)) {
    return false;
  }

  const value = fromParent[fromKey];
  delete fromParent[fromKey];

  // Create target path if needed
  const toParentParts = toParts.slice(0, -1);
  const toKey = toParts[toParts.length - 1];

  let toParent: Record<string, unknown> = obj;
  for (const part of toParentParts) {
    if (!(part in toParent)) {
      toParent[part] = {};
    }
    toParent = toParent[part] as Record<string, unknown>;
  }

  toParent[toKey] = value;
  return true;
}

function getNestedParent(obj: Record<string, unknown>, parts: string[]): Record<string, unknown> | null {
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== "object") {
      return null;
    }
    current = current[part] as Record<string, unknown>;
  }

  return current;
}
