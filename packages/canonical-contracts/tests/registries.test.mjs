import assert from "node:assert/strict";
import test from "node:test";
import { readJson, readText } from "./test-utils.mjs";

const dimensions = readJson("registries/dimensions.v0.1.json");
const stateRegistrySource = readText("src/stateRegistry.ts");

test("registry ordering is deterministic", () => {
  assert.deepEqual(dimensions.map((entry) => entry.order), Array.from({ length: 16 }, (_, index) => index + 1));
  assert.match(stateRegistrySource, /"COG-S01"/);
  assert.match(stateRegistrySource, /"EXP-S02"/);
});

test("registry entries include source provenance", () => {
  for (const entry of dimensions) {
    assert.equal(typeof entry.provenance.sourceDocument, "string");
    assert.equal(typeof entry.provenance.sourceVersion, "string");
    assert.equal(typeof entry.provenance.sourceSection, "string");
    assert.equal(typeof entry.registryVersion, "string");
  }
});

test("registry objects are exported as immutable constants in TypeScript", () => {
  for (const sourceFile of ["src/constellationIds.ts", "src/dimensionIds.ts", "src/stateRegistry.ts"]) {
    const source = readText(sourceFile);
    assert.match(source, /Object\.freeze/);
    assert.match(source, /readonly/);
  }
});

test("active state registry avoids numeric selection fields and narrative templates", () => {
  assert.doesNotMatch(stateRegistrySource, /minimumConfidence|adjacentStates|narrativeTemplates|visualProfile/);
});
