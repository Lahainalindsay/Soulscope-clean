import test from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import { readJson, readText } from "./test-utils.mjs";

const schema = readJson("schemas/reflection-narrative-v1.schema.json");
const validate = new Ajv2020({ strictTypes: false }).compile(schema);
const sentence = { text: "One possible reflection remains optional.", evidenceRefs: ["e"], decisionRefs: ["d"], meaningUnitRefs: ["m"] };
const ready = {
  schemaVersion: "reflection-narrative.v1", languageVersion: "1.0.0", canonVersion: "2.0", sourceResultId: "r",
  status: "READY", strongestObservation: sentence, overview: [sentence, sentence, sentence], dailyLife: [sentence, sentence, sentence],
  questionToSitWith: { ...sentence, text: "What feels useful?" }, alternatives: [],
  evidenceRefs: ["e"], decisionRefs: ["d"], meaningUnitRefs: ["m"], unresolved: null,
};
test("ReflectionNarrativeV1 schema enforces version, full ready shape, and citations", () => {
  assert.equal(validate(ready), true);
  assert.equal(validate({ ...ready, schemaVersion: "v0" }), false);
  assert.equal(validate({ ...ready, evidenceRefs: [] }), false);
  assert.equal(validate({ ...ready, strongestObservation: { ...sentence, decisionRefs: [] } }), false);
  assert.equal(validate({ ...ready, extraField: "not allowed" }), false);
});
test("overview and daily-life counts allow three through five sentences only", () => {
  for (const count of [0, 1, 2, 3, 4, 5, 6]) {
    for (const field of ["overview", "dailyLife"]) {
      assert.equal(validate({ ...ready, [field]: Array(count).fill(sentence) }), count >= 3 && count <= 5);
    }
  }
});
test("unresolved has explicit reasons and cannot contain resolved reflection or a question", () => {
  const unresolved = {
    ...ready, status: "UNRESOLVED", strongestObservation: null, overview: [], dailyLife: [], questionToSitWith: null, alternatives: [], meaningUnitRefs: [],
    unresolved: { reasonCodes: ["INSUFFICIENT_SUPPORT"], explanation: { ...sentence, evidenceRefs: [], meaningUnitRefs: [] } },
  };
  assert.equal(validate(unresolved), true);
  assert.equal(validate({ ...unresolved, strongestObservation: sentence }), false);
  assert.equal(validate({ ...unresolved, dailyLife: [sentence] }), false);
  assert.equal(validate({ ...unresolved, questionToSitWith: sentence }), false);
  assert.equal(validate({ ...unresolved, unresolved: null }), false);
});
test("narrative contract adds no scientific inference or Signature behavior", () => {
  assert.match(readText("src/index.ts"), /reflectionNarrative/);
  assert.doesNotMatch(readText("src/reflectionNarrative.ts"), /posteriorMean|selectState|scoreDimension|renderSignature|publishThreshold/);
});
