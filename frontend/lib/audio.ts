// Canonical upload format: mono, 16-bit PCM WAV, 16 kHz.
export function encodeWav(
  samples: Float32Array,
  sampleRate: number,
): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const str = (at: number, value: string) => {
    for (let i = 0; i < value.length; i++)
      view.setUint8(at + i, value.charCodeAt(i));
  };
  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => {
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, s < 0 ? s * 32768 : s * 32767, true);
  });
  return buffer;
}
export function validateCanonicalWav(buffer: ArrayBuffer): number {
  if (buffer.byteLength < 44 || buffer.byteLength > 3_000_000)
    throw new Error("Recording size is invalid.");
  const v = new DataView(buffer);
  const str = (a: number, n: number) =>
    String.fromCharCode(...new Uint8Array(buffer, a, n));
  if (
    str(0, 4) !== "RIFF" ||
    str(8, 4) !== "WAVE" ||
    str(12, 4) !== "fmt " ||
    str(36, 4) !== "data" ||
    v.getUint32(16, true) !== 16 ||
    v.getUint16(20, true) !== 1 ||
    v.getUint16(22, true) !== 1 ||
    v.getUint32(24, true) !== 16000 ||
    v.getUint16(34, true) !== 16 ||
    v.getUint16(32, true) !== 2 ||
    v.getUint32(28, true) !== 32000
  )
    throw new Error("Use a mono, 16-bit PCM WAV recording at 16 kHz.");
  if (
    v.getUint32(40, true) !== buffer.byteLength - 44 ||
    v.getUint32(4, true) !== buffer.byteLength - 8 ||
    (buffer.byteLength - 44) % 2
  )
    throw new Error("Recording is truncated.");
  const seconds = (buffer.byteLength - 44) / 32000;
  if (seconds < 5 || seconds > 35)
    throw new Error("Please record between 5 and 35 seconds for each prompt.");
  return seconds;
}
export async function canonicalizeAudio(blob: Blob): Promise<Blob> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(decoded.duration * 16000),
      16000,
    );
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return new Blob([encodeWav(rendered.getChannelData(0), 16000)], {
      type: "audio/wav",
    });
  } finally {
    await context.close();
  }
}
