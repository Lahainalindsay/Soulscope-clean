import Link from "next/link";
import { FieldArt, Glyph } from "@/components/field-art";
import { CONSTELLATIONS } from "@/lib/contracts";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A LITTLE SPACE TO HEAR YOURSELF</p>
          <h1>
            Your voice.
            <br />A moment.
            <br />
            <em>A new perspective.</em>
          </h1>
          <p className="lead">
            Step out of the noise. Three short, guided responses create a space
            to notice what is present and return to it with curiosity.
          </p>
          <div className="actions">
            <Link className="button primary" href="/scan">
              Begin your scan <span>↗</span>
            </Link>
            <Link className="text-link" href="/results">
              Explore the design preview <span>→</span>
            </Link>
          </div>
          <p className="micro">
            3 prompts · about 90 seconds of speaking · your own pace
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
        <span className="eyebrow">A MOMENT, NOT A LABEL</span>
        <p>
          You are more than any single response.
          <br />
          SoulScope is a place for reflection, with you at the center.
        </p>
        <Link href="/about" className="text-link">
          How it works →
        </Link>
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
        <h2>Take a moment for yourself.</h2>
        <p>No right answers. No performance to give.</p>
        <Link className="button primary" href="/scan">
          Begin your scan ↗
        </Link>
      </section>
    </>
  );
}
