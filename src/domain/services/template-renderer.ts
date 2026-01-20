import type { Variables } from "../value-objects/variables.js";
import type { RenderResult } from "../../shared/types.js";

const VARIABLE_PATTERN = /\{\{([\w.]+)\}\}/g;

export function renderTemplate(content: string, variables: Variables): RenderResult {
  const undefinedVariables: string[] = [];

  const renderedContent = content.replace(VARIABLE_PATTERN, (match, varName) => {
    if (varName in variables) {
      return variables[varName];
    }
    undefinedVariables.push(varName);
    return match;
  });

  return {
    content: renderedContent,
    undefinedVariables,
  };
}
