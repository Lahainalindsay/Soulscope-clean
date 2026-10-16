import type { RecordingReflectionV1 } from "../lib/recording-reflection";

/** Prose-only consumer. The server owns observation selection and comparison. */
export function RecordingReflection({ reflection }: { reflection: RecordingReflectionV1 }) {
  return <>
    <section className="panel reflection-main" aria-label="Your recording reflection">
      <p className="eyebrow">{reflection.status === "AVAILABLE" ? "FROM YOUR RECORDING" : "YOUR RECORDING"}</p>
      <h2>{reflection.title}</h2>
      <p className="reflection-copy">{reflection.strongestObservation.text}</p>
      <p className="reflection-copy">{reflection.overview.map(s => s.text).join(" ")}</p>
    </section>
    {reflection.status === "AVAILABLE" && <>
      <details className="panel recording-chapters">
        <summary>Across your three responses <span>Take a closer look</span></summary>
        <div className="reflection-chapters">
          {reflection.prompts.map((prompt, i) => <section key={prompt.promptId}>
            <p className="eyebrow">0{i + 1} · {prompt.label}</p>
            {prompt.observations.map((s, j) => <p key={j}>{s.text}</p>)}
          </section>)}
        </div>
      </details>
      <section className="section daily-section">
        <p className="eyebrow">AN INVITATION FOR TODAY</p>
        <h2>Notice it <em>for yourself.</em></h2>
        <p className="muted">Choose one small moment to explore today, or simply leave the question open.</p>
        <div className="daily-grid">
          {reflection.invitations.map((invitation, i) => <article className="panel" key={invitation.title}>
            <span className="daily-number">0{i + 1}</span>
            <h3>{invitation.title}</h3><p>{invitation.text}</p>
          </article>)}
        </div>
      </section>
      <section className="question-card">
        <p className="eyebrow">A QUESTION TO SIT WITH</p>
        <h2>{reflection.questionToSitWith}</h2>
        <p>You can recognize something here, disagree, or leave it open.</p>
      </section>
    </>}
    <details className="panel reflection-limits">
      <summary>What this reflection can tell you</summary>
      {reflection.limits.map(limit => <p key={limit}>{limit}</p>)}
      <p>A deeper personal interpretation is still being validated.</p>
    </details>
  </>;
}
