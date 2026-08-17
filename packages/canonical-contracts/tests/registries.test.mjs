import assert from "node:assert/strict";
import test from "node:test";
import { readJson, readText } from "./test-utils.mjs";

const dimensions = readJson("registries/dimensions.v0.1.json");
const stateRegistrySource = readText("src/stateRegistry.ts");
const acousticRegistrySource = readText("src/acousticParameters.ts");
const evidenceRegistrySource = readText("src/evidenceMarkers.ts");
const dimensionInferenceSource = readText("src/dimensionInference.ts");

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

test("acoustic contract separates canonical registry IDs from provisional aliases", () => {
  assert.match(acousticRegistrySource, /SS_RESPONSE_ONSET_LATENCY/);
  assert.match(acousticRegistrySource, /SS_PAUSE_LOAD/);
  assert.match(acousticRegistrySource, /Q_CLIPPING_RATIO/);
  assert.match(acousticRegistrySource, /PROVISIONAL_NON_CANONICAL/);
  assert.match(acousticRegistrySource, /AC_RMS_ENERGY: "PROVISIONAL_RMS_ENERGY"/);
});

test("evidence marker contract uses canonical EV marker IDs", () => {
  assert.match(evidenceRegistrySource, /"EV_PRO_001"/);
  assert.match(evidenceRegistrySource, /"EV_TIM_008"/);
  assert.match(evidenceRegistrySource, /"EV_DYN_005"/);
  assert.doesNotMatch(evidenceRegistrySource, /"OUTPUT_CONTINUITY"/);
  assert.doesNotMatch(evidenceRegistrySource, /"MODULATION_BREADTH"/);
});

test("dimension structural requirements are contract encoded for all sixteen dimensions", () => {
  assert.match(dimensionInferenceSource, /DIMENSION_STRUCTURAL_REQUIREMENTS/);
  for (const dimension of dimensions) {
    assert.match(dimensionInferenceSource, new RegExp(`dimensionId: "${dimension.id}"`));
  }
  assert.match(dimensionInferenceSource, /minimumIndependentFamilies: 3/);
  assert.match(dimensionInferenceSource, /NO_RECOVERY_COMPATIBLE_CONDITION/);
  assert.match(dimensionInferenceSource, /CALIBRATION_REQUIRED/);
});
