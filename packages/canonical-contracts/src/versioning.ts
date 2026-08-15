export const CONTRACT_PACKAGE_VERSION = "0.1.0" as const;
export const REGISTRY_VERSION = "0.1.0" as const;
export const SCHEMA_VERSION = "0.1.0" as const;
export const JSON_SCHEMA_DRAFT = "https://json-schema.org/draft/2020-12/schema" as const;

export type VersionReference = Readonly<{
  packageVersion: typeof CONTRACT_PACKAGE_VERSION;
  registryVersion: typeof REGISTRY_VERSION;
  schemaVersion: typeof SCHEMA_VERSION;
  sourceVersion: string;
}>;

export const VERSION_REFERENCE: VersionReference = Object.freeze({
  packageVersion: CONTRACT_PACKAGE_VERSION,
  registryVersion: REGISTRY_VERSION,
  schemaVersion: SCHEMA_VERSION,
  sourceVersion: "1.3",
});

export type CanonicalVersionManifest = Readonly<{
  protocol: "1.3";
  extractor: "CALIBRATION_REQUIRED";
  featureRegistry: "0.1";
  qualityRules: "0.1";
  evidenceRegistry: "0.1";
  dimensionRegistry: "0.1";
  inferenceRules: "0.1";
  stateRegistry: "0.1";
  interactionRegistry: "0.1";
  patternRegistry: "0.1";
  narrativeRegistry: "0.1";
  modelRegistry: "CALIBRATION_REQUIRED";
  rendererRegistry: "CALIBRATION_REQUIRED";
}>;

export const ACTIVE_VERSION_MANIFEST: CanonicalVersionManifest = Object.freeze({
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
});
