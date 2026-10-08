import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeWav, validateCanonicalWav } from "../lib/audio";
import { displayValue } from "../lib/contracts";
test("encoder creates mono 16-bit PCM accepted by the worker format boundary", () => {
  const samples = new Float32Array(16000 * 30);
  samples[0] = -1;
  samples[1] = 1;
  const wav = encodeWav(samples, 16000);
  assert.equal(validateCanonicalWav(wav), 30);
  const v = new DataView(wav);
  assert.equal(v.getInt16(44, true), -32768);
  assert.equal(v.getInt16(46, true), 32767);
});
test("rejects wrong sample rate, incomplete recordings, malformed headers and oversized duration", () => {
  assert.throws(() =>
    validateCanonicalWav(encodeWav(new Float32Array(80000), 44100)),
  );
  assert.throws(() =>
    validateCanonicalWav(encodeWav(new Float32Array(16000), 16000)),
  );
  assert.throws(() =>
    validateCanonicalWav(encodeWav(new Float32Array(16000 * 40), 16000)),
  );
  const wav = encodeWav(new Float32Array(16000 * 30), 16000);
  assert.throws(() => validateCanonicalWav(wav.slice(0, -2)));
  new DataView(wav).setUint16(20, 3, true);
  assert.throws(() => validateCanonicalWav(wav));
});
test("unavailable values remain unavailable and zero remains a measured zero", () => {
  assert.equal(displayValue(null, "ratio"), "Not available");
  assert.equal(displayValue(undefined, "ratio"), "Not available");
  assert.equal(displayValue(NaN, "ratio"), "Not available");
  assert.equal(displayValue(0, "ratio"), "0 ratio");
});
