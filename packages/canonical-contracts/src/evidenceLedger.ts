import type { EvidenceFamily, EvidenceMarkerId } from "./evidenceMarkers";
import type { Provenance } from "./provenance";
import type { ResolutionReason, ResolutionStatus } from "./scientificStatus";
import type { VersionReference } from "./versioning";

export const EVIDENCE_LEDGER_FIELDS = Object.freeze([
  "evidence_id",
  "marker_id",
  "marker_version",
  "scan_id",
  "prompt_scope",
  "time_scope",
  "reference_scope",
  "source_measurement_ids",
  "source_feature_families",
  "value",
  "direction",
  "magnitude",
  "uncertainty",
  "quality",
  "coverage",
  "agreement",
  "baseline_trust",
  "supporting_components",
  "contradicting_components",
  "missing_components",
  "confound_flags",
  "rule_id",
  "rule_version",
  "status",
  "resolution_reason",
  "timestamp",
  "provenance",
  "version",
] as const);

export type EvidenceLedgerField = (typeof EVIDENCE_LEDGER_FIELDS)[number];

export type EvidenceLedgerRecord = Readonly<{
  evidence_id: string;
  marker_id: EvidenceMarkerId;
  marker_version: string;
  scan_id: string;
  prompt_scope: readonly string[];
  time_scope: Readonly<{
    start_time?: number | null;
    end_time?: number | null;
  }>;
  reference_scope: Readonly<{
    reference_type: string;
    reference_id?: string | null;
  }>;
  source_measurement_ids: readonly string[];
  source_feature_families: readonly EvidenceFamily[];
  value?: number | string | boolean | null;
  direction: "LOWER" | "HIGHER" | "NONE" | "MIXED" | "UNRESOLVED";
  magnitude?: number | null;
  uncertainty?: number | null;
  quality: Readonly<Record<string, string | number | boolean | null>>;
  coverage?: number | null;
  agreement?: number | null;
  baseline_trust?: number | null;
  supporting_components: readonly string[];
  contradicting_components: readonly string[];
  missing_components: readonly string[];
  confound_flags: readonly string[];
  rule_id: string;
  rule_version: string;
  status: ResolutionStatus;
  resolution_reason?: ResolutionReason;
  timestamp: string;
  provenance: Provenance;
  version: VersionReference;
}>;
