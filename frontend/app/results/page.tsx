import { ResultsView } from "@/components/results-view";
import { DEMO_RECORDING_REFLECTION } from "@/lib/server-recording-reflection-demo";
export default function ResultsPreview() {
  return <ResultsView recordingDemo={DEMO_RECORDING_REFLECTION} />;
}
