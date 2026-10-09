import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="landing-kicker">A NEW WAY TO SEE WHAT IS ALREADY THERE</p>
          <h1 id="landing-title">Observe your inner world.</h1>
          <p className="landing-opening">
            The way you express yourself changes as you move through life.
          </p>
          <p className="landing-description">
            SoulScope is an instrument designed to notice the subtle patterns
            in your voice and expression, then organize them into a clear
            reflection of what may be present within you in that moment.
          </p>
          <div className="landing-actions">
            <Link className="landing-button landing-button-primary" href="/account">
              Begin Your Resonance Scan <span aria-hidden="true">↗</span>
            </Link>
            <Link className="landing-button landing-button-secondary" href="#how-it-works">
              How SoulScope Works
            </Link>
          </div>
        </div>
        <div className="landing-hero-foot">
          <span>PRIVATE BY DESIGN</span>
          <span>THREE GUIDED RESPONSES · ONE MOMENT IN TIME</span>
        </div>
      </section>

      <section className="landing-story" id="how-it-works">
        <div className="landing-story-heading">
          <p className="landing-kicker">THE EXPERIENCE</p>
          <h2>A little more space to understand yourself.</h2>
        </div>
        <p>
          No mood questionnaire. No perfect words to find. You speak naturally
          in response to three short prompts. SoulScope examines the acoustic
          features of those responses and gives you a private record to return
          to. What you make of it remains yours.
        </p>
      </section>

      <section className="landing-steps" aria-label="How a scan works">
        <article>
          <span className="landing-step-number">01 / SPEAK</span>
          <h3>Start with your voice.</h3>
          <p>
            Three guided prompts invite you to speak about where you are,
            what is on your mind, and what you hope for.
          </p>
        </article>
        <article>
          <span className="landing-step-number">02 / OBSERVE</span>
          <h3>Notice the details.</h3>
          <p>
            Your scan checks recording quality and captures measurable features
            of your voice, with uncertainty shown where evidence is limited.
          </p>
        </article>
        <article>
          <span className="landing-step-number">03 / RETURN</span>
          <h3>Make room for perspective.</h3>
          <p>
            Keep your scans together and revisit them over time. Your experience
            is bigger than any single moment.
          </p>
        </article>
      </section>

      <section className="landing-reflection">
        <div>
          <p className="landing-kicker">THE REFLECTION</p>
          <h2>One moment can be worth noticing.</h2>
        </div>
        <div>
          <p>
            SoulScope is being built toward a personal reflection, a resonance
            map, and a view of how your patterns change over time. Today you can
            save a scan and explore its measured features. The personal
            interpretation shown in the sample is a design preview while the
            scientific models are validated.
          </p>
          <Link className="landing-inline-link" href="/results">
            Explore the sample reflection <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className="landing-close">
        <p className="landing-kicker">BEGIN WITH A MOMENT</p>
        <h2>There is more to you than any single scan.</h2>
        <Link className="landing-button landing-button-primary" href="/account">
          Begin Your Resonance Scan <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
}
