import { EvidenceDisclosure } from "../../components/results/EvidenceDisclosure";
import { FeedbackDemo } from "../../components/results/FeedbackDemo";
import { PromptArc } from "../../components/results/PromptArc";
import { ReflectionLayout } from "../../components/results/ReflectionLayout";
import { SignaturePlaceholder } from "../../components/resonance/SignaturePlaceholder";
import { InstrumentPanel } from "../../components/ui/InstrumentPanel";
import { MetadataRow } from "../../components/ui/MetadataRow";
import { demoResultPresentation } from "../../mocks/demoResultPresentation";
import styles from "../Page.module.css";

export default function ResultsDemoPage() {
  return (
    <div className={styles.stack}>
      <MetadataRow
        items={[
          { label: "Session", value: "Demo result presentation" },
          { label: "Date", value: demoResultPresentation.date },
          { label: "Completion", value: demoResultPresentation.duration },
          { label: "Source", value: "Mock presentation fixture" },
        ]}
      />
      <SignaturePlaceholder />
      <ReflectionLayout />
      <PromptArc />
      <InstrumentPanel>
        <h2>Question to sit with</h2>
        <p className="humanCopy">{demoResultPresentation.reflectionQuestion}</p>
      </InstrumentPanel>
      <EvidenceDisclosure />
      <FeedbackDemo />
      <InstrumentPanel>
        <p className="instrumentLabel">Product-boundary statement</p>
        <p>
          This page is a visual demo. It contains no voice-derived conclusion, clinical interpretation, or production
          Resonance Signature mapping.
        </p>
      </InstrumentPanel>
    </div>
  );
}
