export type RecordedPromptAudio = {
  dataUrl: string;
  durationMs: number;
};

export async function recordPromptAudio(maxDurationMs: number): Promise<RecordedPromptAudio> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    throw new Error("This browser does not support microphone recording.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream);

  return new Promise((resolve, reject) => {
    const startedAt = performance.now();
    const stopTracks = () => stream.getTracks().forEach((track) => track.stop());
    const timeout = window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, maxDurationMs);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onerror = () => {
      window.clearTimeout(timeout);
      stopTracks();
      reject(new Error("Recording failed."));
    };
    recorder.onstop = async () => {
      window.clearTimeout(timeout);
      stopTracks();
      try {
        const durationMs = Math.round(performance.now() - startedAt);
        const source = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const wav = await convertBlobToWav(source, 16000);
        resolve({ dataUrl: await blobToDataUrl(wav), durationMs });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Audio conversion failed."));
      }
    };
    recorder.start();
  });
}

async function convertBlobToWav(blob: Blob, targetSampleRate: number) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContextConstructor();
  try {
    const buffer = await context.decodeAudioData(await blob.arrayBuffer());
    const mono = mixToMono(buffer);
    const resampled = resample(mono, buffer.sampleRate, targetSampleRate);
    return new Blob([encodePcm16Wav(resampled, targetSampleRate)], { type: "audio/wav" });
  } finally {
    await context.close();
  }
}

function mixToMono(buffer: AudioBuffer) {
  const output = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index += 1) {
      output[index] += data[index] / buffer.numberOfChannels;
    }
  }
  return output;
}

function resample(input: Float32Array, sourceRate: number, targetRate: number) {
  if (sourceRate === targetRate) return input;
  const ratio = sourceRate / targetRate;
  const length = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    const sourceIndex = index * ratio;
    const before = Math.floor(sourceIndex);
    const after = Math.min(input.length - 1, before + 1);
    const weight = sourceIndex - before;
    output[index] = input[before] * (1 - weight) + input[after] * weight;
  }
  return output;
}

function encodePcm16Wav(samples: Float32Array, sampleRate: number) {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeText(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeText(view, 8, "WAVE");
  writeText(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(view, 36, "data");
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function writeText(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read recorded audio."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
