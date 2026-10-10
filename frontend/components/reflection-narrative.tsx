import type { ReflectionNarrativeV1 } from "@soulscope/canonical-contracts/reflection-narrative";
import { narrativeSentences } from "../lib/reflection-narrative";

// This renderer receives only validated prose and citations. It cannot see scores.
export function ReflectionOverview({ narrative }: { narrative: ReflectionNarrativeV1 | null }) {
  return (
    <section className="panel reflection-main" aria-label="What stood out">
      <p className="eyebrow">WHAT STOOD OUT</p>
      <h2>{narrative?.status === "READY"
        ? narrative.strongestObservation.text
        : "There is no supported reflection to show yet."}</h2>
      <p className="reflection-copy">
        {narrative?.status === "READY"
          ? narrative.overview.map((sentence) => sentence.text).join(" ")
          : narrative?.status === "UNRESOLVED"
            ? narrative.unresolved.explanation.text
            : "Any saved recording details remain available below."}
      </p>
    </section>
  );
}

export function ReflectionDetails({ narrative, showReferences = true }: { narrative: ReflectionNarrativeV1 | null; showReferences?: boolean }) {
  if (!narrative || narrative.status === "UNRESOLVED") {
    return (
      <section className="panel unavailable-reflection" aria-label="Reflection availability">
        <p className="eyebrow">YOUR REFLECTION</p>
        <h2>A reflection will appear when supported meaning is available.</h2>
        <p>Unavailable meaning stays unresolved.</p>
        {narrative?.status === "UNRESOLVED" && (
          <details>
            <summary>Evidence and limits</summary>
            <p>{narrative.unresolved.explanation.text}</p>
            <ul>{narrative.unresolved.reasonCodes.map((reason) => <li key={reason}>{reason}</li>)}</ul>
          </details>
        )}
      </section>
    );
  }
  return (
    <>
      <section className="section daily-section">
        <p className="eyebrow">HOW THIS MAY SHOW UP IN DAILY LIFE</p>
        <h2>The small moments <em>in between.</em></h2>
        <div className="daily-grid">
          {narrative.dailyLife.map((sentence, i) => (
            <article className="panel" key={i}>
              <span className="daily-number">0{i + 1}</span>
              <p>{sentence.text}</p>
            </article>
          ))}
        </div>
      </section>
      {narrative.alternatives.length > 0 && (
        <div className="two-columns">
          {narrative.alternatives.map((sentence, i) => (
            <section className="panel" key={i}>
              <p className="eyebrow">{i === 0 ? "OTHER POSSIBILITIES" : "ANOTHER POSSIBILITY"}</p>
              <p>{sentence.text}</p>
            </section>
          ))}
        </div>
      )}
      <section className="question-card">
        <p className="eyebrow">A QUESTION TO SIT WITH</p>
        <h2>{narrative.questionToSitWith.text}</h2>
        <p>No need to solve it all. Start with one small moment.</p>
      </section>
      {showReferences && <details className="panel measurement-detail">
        <summary>Evidence and language versions <span>View references</span></summary>
        <p>Language {narrative.languageVersion} · Canon {narrative.canonVersion}</p>
        <ul>
          {narrativeSentences(narrative).map((sentence, i) => (
            <li key={i}>
              <p>{sentence.text}</p>
              <small>Evidence: {sentence.evidenceRefs.join(", ")} · Decisions: {sentence.decisionRefs.join(", ")} · Meaning: {sentence.meaningUnitRefs.join(", ")}</small>
            </li>
          ))}
        </ul>
      </details>}
    </>
  );
}
