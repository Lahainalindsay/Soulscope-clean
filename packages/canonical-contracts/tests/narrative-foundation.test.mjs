import assert from "node:assert/strict";
import test from "node:test";
import { readText } from "./test-utils.mjs";

const contracts = readText("src/narrativeContracts.ts");
const sections = readText("src/narrativeSections.ts");
const index = readText("src/index.ts");

test("narrative foundation requires completed-result traceability", () => {
  assert.match(contracts, /completedSemanticResultRequired: true/);
  assert.match(contracts, /everySentenceRequiresInternalCitation: true/);
  assert.match(contracts, /reflectiveHypothesisRequiresUncertaintyLanguage: true/);
  assert.match(contracts, /state_id/);
  assert.match(contracts, /interaction_id/);
  assert.match(contracts, /evidence_ledger_id/);
});

test("narrative foundation blocks unsupported scientific claims", () => {
  assert.match(contracts, /independentScientificInferenceAllowed: false/);
  assert.match(contracts, /diagnosisAllowed: false/);
  assert.match(contracts, /deceptionClaimAllowed: false/);
  assert.match(contracts, /personalityCertaintyAllowed: false/);
  assert.match(contracts, /unresolvedMaySoundResolved: false/);
});

test("reader-facing policy is human-first while canonical section IDs remain stable", () => {
  assert.match(contracts, /leadWithUserNotScan: true/);
  assert.match(contracts, /dailyLifeSectionMayBeLongForm: true/);
  assert.match(contracts, /your scan suggests/);
  assert.match(sections, /id: "how_this_may_show_up_in_daily_life", label: "How this feels daily"/);
});

test("narrative foundation is exported from the package", () => {
  assert.match(index, /export \* from "\.\/narrativeContracts";/);
});
