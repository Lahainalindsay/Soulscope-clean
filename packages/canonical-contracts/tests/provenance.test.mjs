import assert from "node:assert/strict";
import test from "node:test";
import { listFiles, readText } from "./test-utils.mjs";

test("source and version contracts are exported", () => {
  assert.match(readText("src/provenance.ts"), /SOURCE_DOCUMENTS/);
  assert.match(readText("src/versioning.ts"), /CONTRACT_PACKAGE_VERSION = "0\.1\.0"/);
  assert.match(readText("src/versioning.ts"), /JSON_SCHEMA_DRAFT/);
});

test("no frontend, backend, Supabase, renderer, or old-repo imports exist", () => {
  const files = listFiles("src", (file) => file.endsWith(".ts"));
  const forbidden = [/from\s+["'].*frontend/, /from\s+["'].*backend/, /from\s+["'].*supabase/, /from\s+["'].*renderer/, /\/home\/lahainalindsay9111\/soulscope/];
  for (const file of files) {
    const source = readText(file);
    for (const pattern of forbidden) {
      assert.equal(pattern.test(source), false, `${file} matched ${pattern}`);
    }
  }
});

test("prohibited implementation concepts are absent from executable contract files", () => {
  const files = [
    ...listFiles("src", (file) => file.endsWith(".ts")),
    ...listFiles("registries", (file) => file.endsWith(".json")),
    ...listFiles("schemas", (file) => file.endsWith(".json")),
  ];
  const prohibited = [
    "scoreDimension",
    "selectState",
    "blendThreshold",
    "publishThreshold",
    "confidenceFormula",
    "generateNarrative",
    "renderSignature",
    "diagnose",
    "detectEmotion",
  ];
  for (const file of files) {
    const source = readText(file);
    for (const term of prohibited) {
      assert.equal(source.includes(term), false, `${file} contains ${term}`);
    }
  }
});

test("no scoring thresholds, feature weights, narrative templates, or renderer behavior are encoded", () => {
  const files = [
    ...listFiles("src", (file) => file.endsWith(".ts")),
    ...listFiles("registries", (file) => file.endsWith(".json")),
  ];
  const prohibited = ["minimum_confidence", "region", "weights", "narrative_templates", "visual_profile"];
  for (const file of files) {
    const source = readText(file);
    for (const term of prohibited) {
      assert.equal(source.includes(term), false, `${file} contains ${term}`);
    }
  }
});
