import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { processTemplates } from "./process-templates.js";
import { SameInputOutputError } from "../../shared/errors.js";
import { VariablesFileNotFoundError } from "../../shared/errors.js";

const INPUT_DIR = ".test-input";
const OUTPUT_DIR = ".test-output";
const VARS_FILE = ".test-vars.yaml";

describe("processTemplates", () => {
  beforeEach(() => {
    mkdirSync(INPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(INPUT_DIR, { recursive: true, force: true });
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
    rmSync(VARS_FILE, { force: true });
  });

  it("should process templates and replace variables", async () => {
    writeFileSync(join(INPUT_DIR, "test.md"), "Hello {{name}}!");
    writeFileSync(VARS_FILE, "name: World");

    const result = await processTemplates({
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      vars: VARS_FILE,
    });

    expect(result.processedFiles).toEqual(["test.md"]);
    expect(result.warnings).toEqual([]);
    expect(readFileSync(join(OUTPUT_DIR, "test.md"), "utf-8")).toBe("Hello World!");
  });

  it("should warn about undefined variables", async () => {
    writeFileSync(join(INPUT_DIR, "test.md"), "Hello {{name}}! ID: {{id}}");
    writeFileSync(VARS_FILE, "name: World");

    const result = await processTemplates({
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      vars: VARS_FILE,
    });

    expect(result.warnings).toContain('Warning: undefined variable "{{id}}" in test.md');
    expect(readFileSync(join(OUTPUT_DIR, "test.md"), "utf-8")).toBe("Hello World! ID: {{id}}");
  });

  it("should throw SameInputOutputError when input equals output", async () => {
    writeFileSync(VARS_FILE, "name: Test");

    await expect(
      processTemplates({
        input: INPUT_DIR,
        output: INPUT_DIR,
        vars: VARS_FILE,
      })
    ).rejects.toThrow(SameInputOutputError);
  });

  it("should throw VariablesFileNotFoundError when vars file missing", async () => {
    await expect(
      processTemplates({
        input: INPUT_DIR,
        output: OUTPUT_DIR,
        vars: "nonexistent.yaml",
      })
    ).rejects.toThrow(VariablesFileNotFoundError);
  });

  it("should filter files with only option", async () => {
    writeFileSync(join(INPUT_DIR, "api-users.md"), "Users: {{users}}");
    writeFileSync(join(INPUT_DIR, "api-posts.md"), "Posts: {{posts}}");
    writeFileSync(join(INPUT_DIR, "readme.md"), "Readme");
    writeFileSync(VARS_FILE, "users: 100\nposts: 50");

    const result = await processTemplates({
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      vars: VARS_FILE,
      only: "api-*.md",
    });

    expect(result.processedFiles).toHaveLength(2);
    expect(existsSync(join(OUTPUT_DIR, "readme.md"))).toBe(false);
  });

  it("should exclude files with exclude option", async () => {
    writeFileSync(join(INPUT_DIR, "doc.md"), "Doc");
    writeFileSync(join(INPUT_DIR, "draft-doc.md"), "Draft");
    writeFileSync(VARS_FILE, "key: value");

    const result = await processTemplates({
      input: INPUT_DIR,
      output: OUTPUT_DIR,
      vars: VARS_FILE,
      exclude: "draft-*.md",
    });

    expect(result.processedFiles).toEqual(["doc.md"]);
    expect(existsSync(join(OUTPUT_DIR, "draft-doc.md"))).toBe(false);
  });
});
