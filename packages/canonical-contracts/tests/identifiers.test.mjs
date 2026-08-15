import assert from "node:assert/strict";
import test from "node:test";
import { readJson, readText, unique } from "./test-utils.mjs";

const constellations = readJson("registries/constellations.v0.1.json");
const dimensions = readJson("registries/dimensions.v0.1.json");
const validConstellationIds = new Set(["COG", "REG", "CAP", "EXP"]);
const validDimensionIds = new Set(dimensions.map((entry) => entry.id));

test("exactly four constellation IDs exist", () => {
  assert.deepEqual(constellations.map((entry) => entry.id), ["COG", "REG", "CAP", "EXP"]);
});

test("exactly sixteen dimension IDs exist in source order", () => {
  assert.deepEqual(dimensions.map((entry) => entry.id), [
    "COG-P1",
    "COG-P2",
    "COG-P3",
    "COG-P4",
    "REG-P1",
    "REG-P2",
    "REG-P3",
    "REG-P4",
    "CAP-P1",
    "CAP-P2",
    "CAP-P3",
    "CAP-P4",
    "EXP-P1",
    "EXP-P2",
    "EXP-P3",
    "EXP-P4",
  ]);
});

test("every dimension belongs to one valid constellation", () => {
  for (const dimension of dimensions) {
    assert.equal(validConstellationIds.has(dimension.constellationId), true, dimension.id);
  }
});

test("dimension IDs are unique", () => {
  assert.equal(unique(dimensions.map((entry) => entry.id)), true);
});

test("invalid constellation IDs are rejected by registry membership", () => {
  assert.equal(validConstellationIds.has("INT"), false);
  assert.equal(validConstellationIds.has("COGNITIVE"), false);
});

test("invalid dimension IDs are rejected by registry membership", () => {
  assert.equal(validDimensionIds.has("COG-P5"), false);
  assert.equal(validDimensionIds.has("EXP-REL"), false);
});

test("TypeScript identifier guards are present", () => {
  assert.match(readText("src/constellationIds.ts"), /function isConstellationId/);
  assert.match(readText("src/dimensionIds.ts"), /function isDimensionId/);
  assert.match(readText("src/stateRegistry.ts"), /STATE_IDS/);
});
