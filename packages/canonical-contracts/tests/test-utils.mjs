import fs from "node:fs";
import path from "node:path";

export const packageRoot = path.resolve(import.meta.dirname, "..");

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(packageRoot, relativePath), "utf8"));
}

export function readText(relativePath) {
  return fs.readFileSync(path.join(packageRoot, relativePath), "utf8");
}

export function listFiles(dir, predicate = () => true) {
  const root = path.join(packageRoot, dir);
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    const relative = path.relative(packageRoot, full);
    if (entry.isDirectory()) {
      result.push(...listFiles(relative, predicate));
    } else if (predicate(relative)) {
      result.push(relative);
    }
  }
  return result;
}

export function unique(values) {
  return new Set(values).size === values.length;
}

export function validateSchema(schema, value, refs = {}) {
  const errors = [];

  function check(currentSchema, currentValue, location) {
    if (currentSchema.$ref) {
      const ref = refs[currentSchema.$ref];
      if (!ref) {
        errors.push(`${location}: unresolved ref ${currentSchema.$ref}`);
        return;
      }
      check(ref, currentValue, location);
      return;
    }

    if (currentSchema.type) {
      const allowedTypes = Array.isArray(currentSchema.type) ? currentSchema.type : [currentSchema.type];
      const actualType = currentValue === null ? "null" : Array.isArray(currentValue) ? "array" : typeof currentValue;
      if (!allowedTypes.includes(actualType) || (allowedTypes.includes("integer") && !Number.isInteger(currentValue))) {
        if (!(allowedTypes.includes("number") && actualType === "number") && !(allowedTypes.includes("integer") && Number.isInteger(currentValue))) {
          errors.push(`${location}: expected ${allowedTypes.join("|")}, got ${actualType}`);
          return;
        }
      }
    }

    if (currentSchema.enum && !currentSchema.enum.includes(currentValue)) {
      errors.push(`${location}: invalid enum value ${currentValue}`);
    }

    if (currentSchema.anyOf) {
      const matched = currentSchema.anyOf.some((option) => {
        const before = errors.length;
        check(option, currentValue, location);
        const optionErrors = errors.splice(before);
        return optionErrors.length === 0;
      });
      if (!matched) {
        errors.push(`${location}: did not match any allowed schema option`);
      }
    }

    if (typeof currentValue === "string") {
      if (currentSchema.minLength && currentValue.length < currentSchema.minLength) {
        errors.push(`${location}: shorter than ${currentSchema.minLength}`);
      }
      if (currentSchema.pattern && !new RegExp(currentSchema.pattern).test(currentValue)) {
        errors.push(`${location}: does not match ${currentSchema.pattern}`);
      }
    }

    if (
      (currentSchema.type === "object" ||
        currentSchema.required ||
        currentSchema.properties ||
        currentSchema.additionalProperties === false) &&
      currentValue &&
      typeof currentValue === "object" &&
      !Array.isArray(currentValue)
    ) {
      for (const required of currentSchema.required ?? []) {
        if (!(required in currentValue)) {
          errors.push(`${location}: missing ${required}`);
        }
      }
      if (currentSchema.additionalProperties === false) {
        const allowed = new Set(Object.keys(currentSchema.properties ?? {}));
        for (const key of Object.keys(currentValue)) {
          if (!allowed.has(key)) {
            errors.push(`${location}: unexpected ${key}`);
          }
        }
      }
      for (const [key, childSchema] of Object.entries(currentSchema.properties ?? {})) {
        if (key in currentValue) {
          check(childSchema, currentValue[key], `${location}.${key}`);
        }
      }
    }

    if (currentSchema.type === "array" && Array.isArray(currentValue)) {
      for (const [index, item] of currentValue.entries()) {
        check(currentSchema.items ?? {}, item, `${location}[${index}]`);
      }
    }
  }

  check(schema, value, "$");
  return errors;
}

export function validProvenance() {
  return {
    sourceDocument: "docs/CONSTELLATION_BIBLE.md",
    sourceVersion: "0.1",
    sourceSection: "Section 3.1 Minimum ledger record",
    sourceTable: "Table 9",
  };
}

export function validVersion() {
  return {
    packageVersion: "0.1.0",
    registryVersion: "0.1.0",
    schemaVersion: "0.1.0",
    sourceVersion: "0.1",
  };
}
