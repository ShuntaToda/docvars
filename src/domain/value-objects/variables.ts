import { z } from "zod";

const PrimitiveValueSchema = z.union([z.string(), z.number(), z.boolean()]);

type NestedValue = z.infer<typeof PrimitiveValueSchema> | { [key: string]: NestedValue } | NestedValue[];

const NestedValueSchema: z.ZodType<NestedValue> = z.lazy(() =>
  z.union([PrimitiveValueSchema, z.array(NestedValueSchema), z.record(z.string(), NestedValueSchema)])
);

export const VariablesSchema = z.record(z.string(), NestedValueSchema);

export type Variables = Record<string, string>;

export function flattenVariables(obj: Record<string, NestedValue> | NestedValue[], prefix = ""): Variables {
  const result: Variables = {};

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const value = obj[i];
      const fullKey = prefix ? `${prefix}.${i}` : String(i);

      if (typeof value === "object" && value !== null) {
        Object.assign(result, flattenVariables(value as Record<string, NestedValue> | NestedValue[], fullKey));
      } else {
        result[fullKey] = String(value);
      }
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        Object.assign(result, flattenVariables(value as Record<string, NestedValue> | NestedValue[], fullKey));
      } else {
        result[fullKey] = String(value);
      }
    }
  }

  return result;
}
