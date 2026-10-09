import Link from "next/link";
import { FieldArt, Glyph } from "@/components/field-art";
import { CONSTELLATIONS } from "@/lib/contracts";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">OBSERVE YOUR INNER WORLD</p>
          <h1>
            Your inner world
            <br />
            <em>is always moving.</em>
          </h1>
          <p className="lead">
            Your voice naturally changes as you adapt to life. SoulScope gives
            you a way to observe the patterns in three short spoken responses
            and return to them with curiosity.
          </p>
          <div className="actions">
            <Link className="button primary" href="/scan">
              Begin your scan <span>↗</span>
            </Link>
            <Link className="text-link" href="/results">
              Explore a sample reflection <span>→</span>
            </Link>
          </div>
          <p className="micro">
            3 prompts · about 90 seconds of speaking · private account
          </p>
        </div>
        <div className="hero-field">
          <FieldArt />
          <span className="art-caption">
            DECORATIVE FIELD ART · DESIGN PREVIEW
          </span>
        </div>
      </section>
      <section className="intro-strip">
        <span className="eyebrow">WHAT SOULSCOPE OBSERVES</span>
        <p>
          The patterns are already there.
          <br />
          A scan gives you a moment to notice them.
        </p>
        <Link href="/about" className="text-link">
          How it works →
        </Link>
      </section>
      <section className="section story-section">
        <p className="eyebrow">A DIFFERENT KIND OF SELF-REFLECTION</p>
        <h2>SoulScope begins by listening.</h2>
        <p className="lead">
          You do not need to rate your stress, choose a mood, or explain how
          you feel. Speak naturally in response to three guided prompts. The
          scan checks the recording and describes observable features of your
          voice. You decide what, if anything, those observations mean to you.
        </p>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FOUR CONSTELLATIONS</p>
            <h2>Different lenses. One experience.</h2>
          </div>
          <p>
            Four ways to explore the structure of a spoken response.
            Interpretations will appear only when the evidence supports them.
          </p>
        </div>
        <div className="constellation-grid">
          {CONSTELLATIONS.map((c, i) => (
            <article key={c.id} className={`panel constellation ${c.color}`}>
              <Glyph type={i} />
              <span className="eyebrow">{c.id}</span>
              <h3>{c.name}</h3>
              <p>{c.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">WHAT YOU RECEIVE</p>
            <h2>Every scan becomes a new perspective.</h2>
          </div>
          <p>
            Explore what is available today and see where SoulScope is headed.
            Personal interpretations are awaiting scientific validation.
          </p>
        </div>
        <div className="offering-grid">
          <article className="panel">
            <span className="eyebrow">01 · AVAILABLE NOW</span>
            <h3>Your scan record</h3>
            <p>Return to the recording details, quality checks, and measured features of each response.</p>
          </article>
          <article className="panel">
            <span className="eyebrow">02 · DESIGN PREVIEW</span>
            <h3>Your reflection & map</h3>
            <p>See how a personal reflection and resonance map could look once their interpretations are validated.</p>
          </article>
          <article className="panel">
            <span className="eyebrow">03 · IN DEVELOPMENT</span>
            <h3>Your resonance timeline</h3>
            <p>Individual scans are saved now. A meaningful view of change over time needs a validated longitudinal model.</p>
          </article>
        </div>
      </section>
      <section className="panel return-section">
        <p className="eyebrow">WHY RETURN?</p>
        <h2>Your inner world is always changing.</h2>
        <p>
          Some days bring more clarity. Some bring more recovery. Your saved
          scans give you a place to revisit those moments as life changes.
        </p>
        <p className="return-line">One scan captures a moment. Many scans can tell a story.</p>
      </section>
      <section className="section process-section">
        <div>
          <p className="eyebrow">THE GUIDED SCAN</p>
          <h2>
            Come as you are.
            <br />
            Speak in your own words.
          </h2>
          <p className="muted">
            Find a quiet place and give yourself a moment.
          </p>
        </div>
        <ol className="steps">
          {[
            [
              "01",
              "Begin with you",
              "Speak about yourself, your day, or whatever comes to mind.",
            ],
            [
              "02",
              "Make room for what is on your mind",
              "Speak about something troubling you.",
            ],
            [
              "03",
              "Look ahead",
              "Speak about your hopes or goals for the future.",
            ],
          ].map(([n, t, d]) => (
            <li key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="panel closing-cta">
        <Glyph />
        <h2>Begin your first Resonance Scan.</h2>
        <p>One moment to speak. A place to return to what you noticed.</p>
        <Link className="button primary" href="/scan">
          Begin your scan ↗
        </Link>
      </section>
    </>
  );
}
