export interface CliOptions {
  input: string;
  output: string;
  vars: string;
  only?: string;
  exclude?: string;
}

export interface ProcessResult {
  processedFiles: string[];
  warnings: string[];
}

export interface RenderResult {
  content: string;
  undefinedVariables: string[];
}
