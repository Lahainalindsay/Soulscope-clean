import assert from "node:assert/strict";
import test from "node:test";
import { readJson, validProvenance, validVersion, validateSchema } from "./test-utils.mjs";

const evidenceSchema = readJson("schemas/evidence-ledger-record.schema.json");
const provenanceSchema = readJson("schemas/provenance.schema.json");
const versionSchema = readJson("schemas/version-reference.schema.json");
const registrySchema = readJson("schemas/canonical-registry-entry.schema.json");
const refs = {
  "provenance.schema.json": provenanceSchema,
  "version-reference.schema.json": versionSchema,
};

function validEvidenceRecord() {
  return {
    evidence_id: "ev_001",
    session_segment: {
      session_id: "session_001",
      prompt_id: "prompt_1",
      start_time: 0,
      end_time: 10,
    },
    source_features: [
      {
        feature_id: "voice.f0.median",
        extractor_version: "extractor-0.1.0",
        feature_definition_version: "feature-0.1.0",
      },
    ],
    observation: "Neutral evidence statement.",
    direction_magnitude: {},
    quality: {},
    baseline: {
      reference_type: "within_session_reference",
      trust_status: "within-session",
      compatibility: "compatible",
      sample_count: 1,
    },
    support_contradiction: {
      support: [],
      contradiction: [],
    },
    confounds: [],
    confidence: {},
    policy: {
      allowed_inference_tier: "B",
      prohibited_use_flags: [],
    },
    timestamp: "2026-08-03T00:00:00.000Z",
    provenance: validProvenance(),
    version: validVersion(),
  };
}

test("Evidence Ledger records require approved fields", () => {
  assert.deepEqual(validateSchema(evidenceSchema, validEvidenceRecord(), refs), []);
  const invalid = validEvidenceRecord();
  delete invalid.source_features;
  assert.match(validateSchema(evidenceSchema, invalid, refs).join("\n"), /missing source_features/);
});

test("provenance is required", () => {
  const invalid = validEvidenceRecord();
  delete invalid.provenance;
  assert.match(validateSchema(evidenceSchema, invalid, refs).join("\n"), /missing provenance/);
});

test("version references are required", () => {
  const invalid = validEvidenceRecord();
  delete invalid.version;
  assert.match(validateSchema(evidenceSchema, invalid, refs).join("\n"), /missing version/);
});

test("baseline enum rejects unknown values", () => {
  const invalid = validEvidenceRecord();
  invalid.baseline.reference_type = "opening_prompt_as_trait_baseline";
  assert.match(validateSchema(evidenceSchema, invalid, refs).join("\n"), /invalid enum value/);
});

test("registry schema rejects malformed permanent IDs", () => {
  const valid = {
    id: "COG-P1",
    label: "Organization",
    registryVersion: "0.1.0",
    provenance: validProvenance(),
  };
  assert.deepEqual(validateSchema(registrySchema, valid, refs), []);

  const invalid = { ...valid, id: "COG-P5" };
  assert.match(validateSchema(registrySchema, invalid, refs).join("\n"), /invalid enum value/);
});

test("registry schema accepts seed-state display names", () => {
  const validSeed = {
    id: "COG-017",
    displayName: "Deliberate Builder",
    registryVersion: "0.1.0",
    provenance: validProvenance(),
  };
  assert.deepEqual(validateSchema(registrySchema, validSeed, refs), []);
});

test("schemas use JSON Schema draft 2020-12", () => {
  for (const schema of [evidenceSchema, provenanceSchema, versionSchema, registrySchema]) {
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  }
});
