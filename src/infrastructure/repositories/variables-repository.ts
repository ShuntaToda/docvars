import { readFileSync, existsSync } from "node:fs";
import { parse } from "yaml";
import { VariablesSchema, flattenVariables, type Variables } from "../../domain/value-objects/variables.js";
import { VariablesFileNotFoundError, InvalidVariablesError } from "../../shared/errors.js";

export function loadVariables(filePath: string): Variables {
  if (!existsSync(filePath)) {
    throw new VariablesFileNotFoundError(filePath);
  }

  const content = readFileSync(filePath, "utf-8");
  const parsed = parse(content);

  const result = VariablesSchema.safeParse(parsed);
  if (!result.success) {
    throw new InvalidVariablesError(result.error.message);
  }

  return flattenVariables(result.data);
}
