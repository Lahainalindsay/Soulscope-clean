import assert from "node:assert/strict";
import test from "node:test";
import { readJson, readText } from "./test-utils.mjs";

const dimensions = readJson("registries/dimensions.v0.1.json");
const seedStates = readJson("registries/seed-states.v0.1.json");

test("registry ordering is deterministic", () => {
  assert.deepEqual(dimensions.map((entry) => entry.order), Array.from({ length: 16 }, (_, index) => index + 1));
  assert.deepEqual(seedStates.map((entry) => entry.id), [
    "COG-017",
    "COG-014",
    "COG-011",
    "COG-020",
    "REG-022",
    "REG-019",
    "REG-024",
    "REG-026",
    "CAP-012",
    "CAP-016",
    "CAP-018",
    "CAP-021",
    "EXP-009",
    "EXP-006",
    "EXP-004",
    "EXP-012",
  ]);
});

test("registry entries include source provenance", () => {
  for (const entry of [...dimensions, ...seedStates]) {
    assert.equal(typeof entry.provenance.sourceDocument, "string");
    assert.equal(typeof entry.provenance.sourceVersion, "string");
    assert.equal(typeof entry.provenance.sourceSection, "string");
    assert.equal(typeof entry.registryVersion, "string");
  }
});

test("registry objects are exported as immutable constants in TypeScript", () => {
  for (const sourceFile of ["src/constellationIds.ts", "src/dimensionIds.ts", "src/seedStateIds.ts"]) {
    const source = readText(sourceFile);
    assert.match(source, /Object\.freeze/);
    assert.match(source, /readonly/);
  }
});

test("seed-state registry avoids selection, blend, and threshold fields", () => {
  for (const entry of seedStates) {
    assert.equal("region" in entry, false);
    assert.equal("minimumConfidence" in entry, false);
    assert.equal("adjacentStates" in entry, false);
    assert.equal("requiredEvidence" in entry, false);
    assert.equal("narrativeTemplates" in entry, false);
    assert.equal("visualProfile" in entry, false);
  }
});
