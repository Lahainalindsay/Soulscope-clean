import { provenance, sourceReference } from "./provenance";

export const ACOUSTIC_REGISTRY_VERSION = "0.1" as const;
export const NON_CANONICAL_FEATURE_REGISTRY_VERSION = "PROVISIONAL_NON_CANONICAL" as const;

export const CANONICAL_ACOUSTIC_PARAMETER_IDS = Object.freeze([
  "SS_RESPONSE_ONSET_LATENCY",
  "SS_PAUSE_LOAD",
  "Q_CLIPPING_RATIO",
  "Q_VOICED_RATIO",
] as const);

export type CanonicalAcousticParameterId = (typeof CANONICAL_ACOUSTIC_PARAMETER_IDS)[number];

export const PROVISIONAL_ACOUSTIC_PARAMETER_IDS = Object.freeze([
  "PROVISIONAL_DURATION_MS",
  "PROVISIONAL_RMS_ENERGY",
  "PROVISIONAL_PEAK_AMPLITUDE",
  "PROVISIONAL_ENERGY_SPEECH_RATIO",
  "PROVISIONAL_ENERGY_SILENCE_RATIO",
  "PROVISIONAL_PITCH_ZCR_HZ",
  "PROVISIONAL_SPECTRAL_CENTROID_HZ",
  "PROVISIONAL_FORMANT_TRACKING",
] as const);

export type ProvisionalAcousticParameterId = (typeof PROVISIONAL_ACOUSTIC_PARAMETER_IDS)[number];

export const HISTORICAL_ACOUSTIC_ALIASES = Object.freeze({
  AC_DURATION_MS: "PROVISIONAL_DURATION_MS",
  AC_RMS_ENERGY: "PROVISIONAL_RMS_ENERGY",
  AC_PEAK_AMPLITUDE: "PROVISIONAL_PEAK_AMPLITUDE",
  AC_CLIPPING_RATIO: "Q_CLIPPING_RATIO",
  AC_SPEECH_RATIO: "PROVISIONAL_ENERGY_SPEECH_RATIO",
  AC_SILENCE_RATIO: "PROVISIONAL_ENERGY_SILENCE_RATIO",
  AC_PITCH_ZCR_HZ: "PROVISIONAL_PITCH_ZCR_HZ",
  AC_SPECTRAL_CENTROID_HZ: "PROVISIONAL_SPECTRAL_CENTROID_HZ",
  AC_FORMANT_TRACKING: "PROVISIONAL_FORMANT_TRACKING",
} as const);

export type AcousticParameterRegistryEntry = Readonly<{
  id: CanonicalAcousticParameterId;
  unit: "ms" | "ratio";
  registryVersion: typeof ACOUSTIC_REGISTRY_VERSION;
  implementationStatus: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER";
  provenance: ReturnType<typeof provenance>;
}>;

const acousticSource = sourceReference("acousticParameterRegistry", "Tier C and Q acoustic parameters", "CANON");

export const ACOUSTIC_PARAMETER_REGISTRY: readonly AcousticParameterRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "SS_RESPONSE_ONSET_LATENCY", unit: "ms", registryVersion: ACOUSTIC_REGISTRY_VERSION, implementationStatus: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER", provenance: provenance(acousticSource) }),
  Object.freeze({ id: "SS_PAUSE_LOAD", unit: "ratio", registryVersion: ACOUSTIC_REGISTRY_VERSION, implementationStatus: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER", provenance: provenance(acousticSource) }),
  Object.freeze({ id: "Q_CLIPPING_RATIO", unit: "ratio", registryVersion: ACOUSTIC_REGISTRY_VERSION, implementationStatus: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER", provenance: provenance(acousticSource) }),
  Object.freeze({ id: "Q_VOICED_RATIO", unit: "ratio", registryVersion: ACOUSTIC_REGISTRY_VERSION, implementationStatus: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER", provenance: provenance(acousticSource) }),
]);

export function isCanonicalAcousticParameterId(value: string): value is CanonicalAcousticParameterId {
  return (CANONICAL_ACOUSTIC_PARAMETER_IDS as readonly string[]).includes(value);
}

export function isProvisionalAcousticParameterId(value: string): value is ProvisionalAcousticParameterId {
  return (PROVISIONAL_ACOUSTIC_PARAMETER_IDS as readonly string[]).includes(value);
}
