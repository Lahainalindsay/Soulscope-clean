import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function files(dir) {
  const full = path.join(root, dir);
  const result = [];
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...files(relative));
    else result.push(relative);
  }
  return result;
}

const sourceRoots = ["components", "mocks", "pages", "styles", "tests"];
const sourceFiles = sourceRoots.flatMap((dir) => files(dir)).filter((file) => /\.(tsx?|css|mjs|json)$/.test(file));

test("all visual routes are present", () => {
  for (const routeFile of [
    "pages/index.tsx",
    "pages/scan/index.tsx",
    "pages/scan/question/[step].tsx",
    "pages/scan/analyzing.tsx",
    "pages/results/demo.tsx",
    "pages/history.tsx",
    "pages/profile.tsx",
    "pages/settings.tsx",
  ]) {
    assert.equal(exists(routeFile), true, routeFile);
  }
});

test("navigation landmarks and app shell are present", () => {
  const shell = read("components/app/AppShell.tsx");
  const top = read("components/app/TopNavigation.tsx");
  const mobile = read("components/app/MobileNavigation.tsx");
  assert.match(shell, /<main/);
  assert.match(top, /aria-label="Primary navigation"/);
  assert.match(mobile, /aria-label="Mobile navigation"/);
});

test("canonical labels are imported from the contract package", () => {
  assert.match(read("pages/index.tsx"), /@soulscope\/canonical-contracts/);
  assert.match(read("pages/scan/analyzing.tsx"), /@soulscope\/canonical-contracts/);
});

test("placeholder and fixture carry non-production warnings", () => {
  assert.match(read("components/resonance/SignaturePlaceholder.tsx"), /Visual placeholder — no scientific meaning/);
  assert.match(read("mocks/demoResultPresentation.ts"), /visual review only/);
  assert.match(read("mocks/demoResultPresentation.ts"), /not generated from voice evidence/);
});

test("scan presentation does not auto-record", () => {
  const scanSources = ["components/scan/PromptPanel.tsx", "components/scan/RecordingControls.tsx"].map(read).join("\n");
  assert.equal(/auto(record|Record)|getUserMedia|MediaRecorder/.test(scanSources), false);
  assert.match(scanSources, /Start recording/);
});

test("feedback is labeled non-persistent", () => {
  assert.match(read("components/results/FeedbackDemo.tsx"), /Feedback demonstration — not saved/);
});

test("no forbidden implementation imports exist", () => {
  const combined = sourceFiles.filter((file) => !file.startsWith("tests/")).map((file) => read(file)).join("\n");
  assert.equal(/from ["'].*supabase|createClient|@supabase/.test(combined), false);
  assert.equal(/from ["'].*backend|from ["'].*\/home\/lahainalindsay9111\/soulscope/.test(combined), false);
});

test("prohibited behavior terms are absent from implementation files", () => {
  const implementationFiles = sourceFiles.filter((file) => !file.startsWith("tests/"));
  const combined = implementationFiles.map((file) => read(file)).join("\n");
  for (const term of [
    "scoreDimension",
    "selectState",
    "publishThreshold",
    "blendThreshold",
    "confidenceFormula",
    "analyzeVoice",
    "detectEmotion",
    "diagnose",
    "generateNarrative",
    "renderSignatureFromResult",
  ]) {
    assert.equal(combined.includes(term), false, term);
  }
});

test("no production renderer file is present", () => {
  assert.equal(sourceFiles.some((file) => /Renderer|renderSignature/.test(file)), false);
});
