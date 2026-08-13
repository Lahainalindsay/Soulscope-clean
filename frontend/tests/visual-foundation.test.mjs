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
const sourceFiles = sourceRoots
  .flatMap((dir) => files(dir))
  .filter((file) => /\.(tsx?|css|mjs|json)$/.test(file));

test("current product routes are present", () => {
  for (const routeFile of [
    "pages/index.tsx",
    "pages/login.tsx",
    "pages/signup.tsx",
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

test("public routes use the public shell", () => {
  for (const routeFile of ["pages/index.tsx", "pages/login.tsx", "pages/signup.tsx"]) {
    const source = read(routeFile);
    assert.match(source, /PublicLayout/);
    assert.doesNotMatch(source, /InstrumentLayout/);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|cdn\.jsdelivr|pico/i);
  }
});

test("instrument routes keep the instrument shell", () => {
  assert.match(read("pages/scan/index.tsx"), /InstrumentLayout/);
  assert.match(read("pages/scan/question/[step].tsx"), /InstrumentLayout/);
  assert.match(read("pages/scan/analyzing.tsx"), /InstrumentLayout/);
  assert.match(read("pages/history.tsx"), /InstrumentLayout/);
  assert.match(read("pages/profile.tsx"), /InstrumentLayout/);
  assert.match(read("pages/settings.tsx"), /InstrumentLayout/);
});

test("scan entry is quiet and direct", () => {
  const scanIntro = read("pages/scan/index.tsx");
  assert.match(scanIntro, /Before you begin your scan/);
  assert.match(scanIntro, /Find a quiet place/);
  assert.match(scanIntro, /30 seconds for each response/);
  assert.match(scanIntro, /href="\/scan\/question\/1"/);
  assert.doesNotMatch(scanIntro, /results\/demo|Review visual result|View demo/);
});

test("auth screens are visual only", () => {
  const authSources = [read("pages/login.tsx"), read("pages/signup.tsx")].join("\n");
  assert.match(authSources, /Email/);
  assert.match(authSources, /Password/);
  assert.match(authSources, /Create account/);
  assert.match(authSources, /Terms of Use and Privacy Policy/);
  assert.doesNotMatch(authSources, /onSubmit|fetch\(|axios|createClient|router\.push|signIn|signUp/);
});

test("prompt flow remains presentation-only", () => {
  const promptPage = read("pages/scan/question/[step].tsx");
  assert.match(promptPage, /Guided measurement/);
  assert.match(promptPage, /Begin prompt/);
  assert.match(promptPage, /Automatic completion/);
  assert.match(promptPage, /No audio was recorded or saved/);
  assert.doesNotMatch(promptPage, /Skip Prompt|Stop recording|Start recording|00:30/);
  assert.doesNotMatch(promptPage, /useLocalAudioRecorder|getUserMedia|MediaRecorder|audioUrl|navigator/);
  assert.equal(exists("hooks/useLocalAudioRecorder.ts"), false);
});

test("canonical contract dependency remains available", () => {
  assert.match(read("package.json"), /"@soulscope\/canonical-contracts": "file:\.\.\/packages\/canonical-contracts"/);
  assert.match(read("mocks/visualFoundation.ts"), /CONSTELLATION_REGISTRY/);
  assert.match(read("mocks/visualFoundation.ts"), /@soulscope\/canonical-contracts/);
});

test("single scan result route owns the dashboard experience", () => {
  assert.match(read("pages/results/demo.tsx"), /ScanResultDashboard/);
  assert.match(read("components/results/ScanResultDashboard.tsx"), /SoulScope single scan result/);
  assert.doesNotMatch(read("pages/index.tsx"), /ScanResultDashboard/);
});

test("home is maintained React, not the embedded prototype", () => {
  const home = read("pages/index.tsx");
  assert.doesNotMatch(home, /referenceStyles|referenceBody|dangerouslySetInnerHTML|cdn\.jsdelivr|pico/i);
  assert.match(home, /Clarity comes from within/);
  assert.match(home, /How It Works/);
  assert.match(home, /What You Receive/);
  assert.match(home, /Who SoulScope Is For/);
  assert.match(home, /Your data stays yours/);
  assert.match(home, /Begin a Resonance Scan/);
});

test("result prototype remains isolated to the demo result component", () => {
  const resultPrototype = read("components/results/ScanResultDashboard.tsx");
  assert.match(resultPrototype, /referenceStyles/);
  assert.match(resultPrototype, /referenceBody/);
  assert.match(resultPrototype, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(read("pages/index.tsx"), /dangerouslySetInnerHTML/);
  assert.doesNotMatch(read("pages/scan/index.tsx"), /dangerouslySetInnerHTML/);
  assert.doesNotMatch(read("pages/scan/question/[step].tsx"), /dangerouslySetInnerHTML/);
});

test("visible warnings keep the visual gate bounded", () => {
  const combined = [
    read("pages/scan/question/[step].tsx"),
    read("components/results/ScanResultDashboard.tsx"),
  ].join("\n");
  assert.match(combined, /visual gate|not a diagnosis|No audio was recorded/);
});

test("obsolete prototype component files are absent", () => {
  for (const deletedFile of [
    "components/scan/PromptPanel.tsx",
    "components/scan/RecordingControls.tsx",
    "components/scan/ScanStepper.tsx",
    "components/scan/SignalPresenceDemo.tsx",
    "components/results/ReflectionLayout.tsx",
    "components/results/PromptArc.tsx",
    "components/app/AppShell.tsx",
    "mocks/demoResultPresentation.ts",
  ]) {
    assert.equal(exists(deletedFile), false, deletedFile);
  }
});

test("no forbidden implementation imports exist", () => {
  const combined = sourceFiles
    .filter((file) => !file.startsWith("tests/"))
    .map((file) => read(file))
    .join("\n");
  assert.equal(/from ["'].*supabase|createClient|@supabase/.test(combined), false);
  assert.equal(/from ["'].*backend/.test(combined), false);
});

test("prohibited behavior terms are absent from implementation files", () => {
  const combined = sourceFiles
    .filter((file) => !file.startsWith("tests/"))
    .map((file) => read(file))
    .join("\n");
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
