import {
  EvidenceDisclosure,
  InterpretationRail,
  SessionRail,
  UtilityRail,
} from "../../components/instrument/DashboardPanels";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";
import { SignatureField } from "../../components/instrument/SignatureField";
import {
  demoSession,
  reflectionFacets,
  visualFoundationNotice,
} from "../../mocks/visualFoundation";

export default function ResultsDemoPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Demo Reflection"
      description="SoulScope results visual foundation"
      eyebrow="Demo result"
      heading="Holding steady while looking ahead"
      meta={[demoSession.date, "Visual review only"]}
    >
      <section className="ss-instrument-shell ss-results-shell" aria-label="Demo result instrument">
        <UtilityRail />
        <SessionRail />
        <SignatureField />
        <InterpretationRail showAction={false} />
      </section>

      <section className="ss-results-continuation">
        <div className="ss-results-lead">
          <p className="ss-kicker">Human reflection</p>
          <h2>One visual story surface, bounded and traceable.</h2>
          <p>
            This page demonstrates how a completed result will read once a real
            canonical result object exists. The copy below is not generated from
            voice evidence.
          </p>
        </div>

        <div className="ss-reflection-bands">
          {reflectionFacets.map((facet) => (
            <section className="ss-reflection-band" key={facet.label}>
              <h3>{facet.label}</h3>
              <p>{facet.copy}</p>
            </section>
          ))}
        </div>

        <section className="ss-question-strip" aria-label="Reflection question">
          <p className="ss-technical-label">A question to sit with</p>
          <h2>{demoSession.question}</h2>
        </section>

        <EvidenceDisclosure />

        <section className="ss-feedback" aria-label="Feedback demonstration">
          <div>
            <p className="ss-technical-label">Feedback demonstration — not saved</p>
            <p>{visualFoundationNotice}</p>
          </div>
          <div className="ss-feedback-actions">
            <button type="button">This feels true</button>
            <button type="button">Partly</button>
            <button type="button">Not today</button>
            <button type="button">Unsure</button>
          </div>
        </section>
      </section>
    </InstrumentLayout>
  );
}
