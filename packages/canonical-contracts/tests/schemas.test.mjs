import assert from "node:assert/strict";
import test from "node:test";
import { readJson, validProvenance, validVersion, validateSchema } from "./test-utils.mjs";

const evidenceSchema = readJson("schemas/evidence-ledger-record.schema.json");
const provenanceSchema = readJson("schemas/provenance.schema.json");
const versionSchema = readJson("schemas/version-reference.schema.json");
const registrySchema = readJson("schemas/canonical-registry-entry.schema.json");
const immutableScanResultSchema = readJson("schemas/immutable-scan-result.schema.json");
const refs = {
  "provenance.schema.json": provenanceSchema,
  "version-reference.schema.json": versionSchema,
};

function validEvidenceRecord() {
  return {
    evidence_id: "ev_001",
    marker_id: "PAUSE_LOAD_INCREASE",
    marker_version: "0.1",
    scan_id: "scan_001",
    prompt_scope: ["P2_TROUBLING_CONTEXT"],
    time_scope: {
      start_time: 0,
      end_time: 10,
    },
    reference_scope: {
      reference_type: "within_session_reference",
      reference_id: "P1_OPEN_REFERENCE",
    },
    source_measurement_ids: ["AC_LLD_LOUDNESS:p2:window_01"],
    source_feature_families: ["TIM"],
    direction: "HIGHER",
    quality: {},
    supporting_components: [],
    contradicting_components: [],
    missing_components: [],
    confound_flags: [],
    rule_id: "EV_RULE_001",
    rule_version: "0.1",
    status: "RESOLVED",
    timestamp: "2026-08-03T00:00:00.000Z",
    provenance: validProvenance(),
    version: validVersion(),
  };
}

test("Evidence Ledger records require approved fields", () => {
  assert.deepEqual(validateSchema(evidenceSchema, validEvidenceRecord(), refs), []);
  const invalid = validEvidenceRecord();
  delete invalid.source_measurement_ids;
  assert.match(validateSchema(evidenceSchema, invalid, refs).join("\n"), /missing source_measurement_ids/);
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

test("Evidence family enum rejects unknown values", () => {
  const invalid = validEvidenceRecord();
  invalid.source_feature_families = ["EMO"];
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

test("registry schema accepts current state display names", () => {
  const validState = {
    id: "COG-S01",
    displayName: "Continuous Organization",
    registryVersion: "0.1.0",
    provenance: validProvenance(),
  };
  assert.deepEqual(validateSchema(registrySchema, validState, refs), []);
});

test("schemas use JSON Schema draft 2020-12", () => {
  for (const schema of [evidenceSchema, provenanceSchema, versionSchema, registrySchema, immutableScanResultSchema]) {
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  }
});

test("immutable scan result schema separates semantic and visual paths", () => {
  const valid = {
    acquisitionRecord: {
      scanId: "scan_001",
      promptIds: ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"],
      provenance: validProvenance(),
    },
    measurementRecord: {
      timeResolvedMeasurements: [],
      promptSummaries: [],
      quality: {},
      promptContrasts: [],
      extractorProvenance: validProvenance(),
    },
    semanticResult: {
      evidenceLedger: [],
      dimensions: [],
      constellationGeometry: [],
      statesOrBlends: ["UNRESOLVED"],
      qualifiers: [],
      interactions: [],
      pattern: {
        scanId: "scan_001",
        outcomeType: "NO_PATTERN_PUBLISHED",
        candidatePatterns: [],
        supportingConstellations: [],
        supportingDimensions: [],
        supportingInteractions: [],
        contradictingStructures: [],
        coverage: "INSUFFICIENT_CONSTELLATION_COVERAGE",
        independence: "INSUFFICIENT_EVIDENCE_INDEPENDENCE",
        uncertainty: "PATTERN_MODEL_NOT_VALIDATED",
        temporalScope: "SINGLE_SCAN",
        publicationStatus: "NO_PATTERN_PUBLISHED",
        resolutionReason: "PATTERN_MODEL_NOT_VALIDATED",
        patternDecisionRecord: {},
        registryVersions: {},
      },
      decisionLedger: [],
    },
    resonanceRenderingRecord: {
      inputPath: "QUALIFIED_ACOUSTIC_MEASUREMENTS_T",
      semanticGeometryInputAllowed: false,
      provenance: validProvenance(),
    },
    versionManifest: {
      protocol: "1.3",
      extractor: "CALIBRATION_REQUIRED",
      featureRegistry: "0.1",
      qualityRules: "0.1",
      evidenceRegistry: "0.1",
      dimensionRegistry: "0.1",
      inferenceRules: "0.1",
      stateRegistry: "0.1",
      interactionRegistry: "0.1",
      patternRegistry: "0.1",
      narrativeRegistry: "0.1",
      modelRegistry: "CALIBRATION_REQUIRED",
      rendererRegistry: "CALIBRATION_REQUIRED",
    },
  };
  assert.deepEqual(validateSchema(immutableScanResultSchema, valid, refs), []);
  const invalid = structuredClone(valid);
  invalid.resonanceRenderingRecord.semanticGeometryInputAllowed = true;
  assert.match(validateSchema(immutableScanResultSchema, invalid, refs).join("\n"), /invalid enum value/);
});
