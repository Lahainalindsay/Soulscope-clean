import assert from "node:assert/strict";
import { listFiles, readText } from "./test-utils.mjs";

const tsFiles = listFiles("src", (file) => file.endsWith(".ts"));

assert.ok(tsFiles.length > 0, "expected TypeScript source files");

for (const file of tsFiles) {
  const source = readText(file);
  assert.equal(/\bany\b/.test(source), false, `${file} must not use any`);
  assert.equal(source.includes("let "), false, `${file} must not use mutable let bindings`);
  assert.equal(source.includes("class "), false, `${file} must not define behavior classes`);
  assert.match(source, /export /, `${file} must expose contract surface`);
}

const indexSource = readText("src/index.ts");
for (const expectedExport of [
  "authority",
  "baselineHierarchy",
  "constellationIds",
  "dimensionIds",
  "dimensionInference",
  "evidenceMarkers",
  "evidenceLedger",
  "interactionRegistry",
  "narrativeSections",
  "narrativePolicy",
  "patternRegistry",
  "promptProtocol",
  "processingStages",
  "provenance",
  "resultContracts",
  "scanProcessing",
  "scientificStatus",
  "stateRegistry",
  "validationPhases",
  "versioning",
]) {
  assert.match(indexSource, new RegExp(`"./${expectedExport}"`), `missing export for ${expectedExport}`);
}

console.log(`Static TypeScript contract audit passed for ${tsFiles.length} files.`);
