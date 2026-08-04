import Link from "next/link";
import {
  constellationRows,
  demoSession,
  promptArc,
  visualFoundationNotice,
} from "../../mocks/visualFoundation";

export function UtilityRail() {
  return (
    <aside className="ss-utility-rail" aria-label="Utility rail">
      <span>SS</span>
      <i />
      <i />
      <i />
    </aside>
  );
}

export function SessionRail() {
  return (
    <aside className="ss-panel-rail ss-left-rail" aria-label="Session details">
      <section>
        <p className="ss-technical-label">Session</p>
        <dl className="ss-metadata-list">
          <div>
            <dt>Date</dt>
            <dd>{demoSession.date}</dd>
          </div>
          <div>
            <dt>Duration</dt>
            <dd>{demoSession.duration}</dd>
          </div>
          <div>
            <dt>Prompts</dt>
            <dd>{demoSession.prompts}</dd>
          </div>
        </dl>
      </section>

      <section>
        <p className="ss-technical-label">Reference</p>
        <h2>Within-session</h2>
        <p>
          The opening response can compare changes inside this scan. It is not
          automatically a trusted personal baseline.
        </p>
      </section>

      <section>
        <p className="ss-technical-label">Evidence state</p>
        <div className="ss-readout-row">
          <span>Source</span>
          <strong>Demo fixture</strong>
        </div>
        <div className="ss-readout-row">
          <span>Confidence</span>
          <strong>Not calculated</strong>
        </div>
        <div className="ss-readout-row">
          <span>Interpretation</span>
          <strong>Unavailable</strong>
        </div>
      </section>
    </aside>
  );
}

export function InterpretationRail({ showAction = true }: { showAction?: boolean }) {
  return (
    <aside className="ss-panel-rail ss-right-rail" aria-label="Reflection preview">
      <section className="ss-pattern-readout">
        <p className="ss-technical-label">Current pattern title</p>
        <h2>{demoSession.title}</h2>
        <p>{demoSession.lead}</p>
      </section>

      <PromptArc />

      <ConstellationLegend />

      <section className="ss-question-panel">
        <p className="ss-technical-label">Question to sit with</p>
        <p>{demoSession.question}</p>
        {showAction ? (
          <Link href="/results/demo" className="ss-button ss-button-primary">
            View full reflection
          </Link>
        ) : null}
      </section>
    </aside>
  );
}

export function PromptArc() {
  return (
    <section className="ss-arc-panel" aria-label="Three prompt arc">
      <div className="ss-section-row">
        <p className="ss-technical-label">Session arc</p>
        <span>3 / 3</span>
      </div>

      <div className="ss-prompt-arc">
        {promptArc.map((prompt) => (
          <div className="ss-prompt-step" key={prompt.id}>
            <div className={`ss-prompt-marker ss-prompt-marker-${prompt.tone}`}>
              {prompt.number}
            </div>
            <div>
              <strong>{prompt.label}</strong>
              <span>
                {prompt.detail} · {prompt.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ConstellationLegend() {
  return (
    <section className="ss-constellation-panel" aria-label="Constellation labels">
      <p className="ss-technical-label">Constellations</p>
      {constellationRows.map((row) => (
        <div className="ss-constellation-row" key={row.id}>
          <i className={`ss-dot-${row.id.toLowerCase()}`} />
          <span>{row.label}</span>
          <small>{row.id}</small>
        </div>
      ))}
    </section>
  );
}

export function EvidenceDisclosure() {
  return (
    <details className="ss-disclosure">
      <summary>Evidence and uncertainty disclosure</summary>
      <dl>
        <div>
          <dt>Source type</dt>
          <dd>Demonstration fixture</dd>
        </div>
        <div>
          <dt>Prompts represented</dt>
          <dd>3</dd>
        </div>
        <div>
          <dt>Reference type</dt>
          <dd>Within-session demonstration</dd>
        </div>
        <div>
          <dt>Scientific interpretation</dt>
          <dd>Unavailable in this visual foundation</dd>
        </div>
      </dl>
      <p>{visualFoundationNotice}</p>
    </details>
  );
}
