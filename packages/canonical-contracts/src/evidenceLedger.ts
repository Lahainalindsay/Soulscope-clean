import type { BaselineReferenceType } from "./baselineHierarchy";
import type { Provenance } from "./provenance";
import type { VersionReference } from "./versioning";

export const EVIDENCE_LEDGER_FIELDS = Object.freeze([
  "evidence_id",
  "session_segment",
  "source_features",
  "observation",
  "direction_magnitude",
  "quality",
  "baseline",
  "support_contradiction",
  "confounds",
  "confidence",
  "policy",
  "timestamp",
  "provenance",
  "version",
] as const);

export type EvidenceLedgerField = (typeof EVIDENCE_LEDGER_FIELDS)[number];

export type EvidenceLedgerRecord = Readonly<{
  evidence_id: string;
  session_segment: Readonly<{
    session_id: string;
    prompt_id: string;
    start_time: number;
    end_time: number;
  }>;
  source_features: readonly Readonly<{
    feature_id: string;
    extractor_version: string;
    feature_definition_version: string;
  }>[];
  observation: string;
  direction_magnitude: Readonly<{
    signed_standardized_deviation?: number | null;
    raw_value?: number | string | boolean | null;
    unit?: string | null;
  }>;
  quality: Readonly<Record<string, string | number | boolean | null>>;
  baseline: Readonly<{
    reference_type: BaselineReferenceType;
    trust_status: string;
    compatibility: string;
    sample_count?: number | null;
  }>;
  support_contradiction: Readonly<{
    support: readonly string[];
    contradiction: readonly string[];
    relationship_type?: string | null;
  }>;
  confounds: readonly string[];
  confidence: Readonly<{
    value?: number | null;
    components?: Readonly<Record<string, number | null>>;
  }>;
  policy: Readonly<{
    allowed_inference_tier: "A" | "B" | "C" | "D";
    prohibited_use_flags: readonly string[];
  }>;
  timestamp: string;
  provenance: Provenance;
  version: VersionReference;
}>;
