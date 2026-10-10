import Link from "next/link";
export default function About() {
  return (
    <div className="reading-page">
      <p className="eyebrow">ABOUT SOULSCOPE</p>
      <h1>
        Observe your inner world.
        <br />
        <em>Room to decide for yourself.</em>
      </h1>
      <p className="lead">
        Your voice naturally changes as you adapt to life. SoulScope begins by
        listening to three short spoken responses, then organizing observable
        features into a record you can revisit. The goal is to help you notice
        change without turning a moment into a label.
      </p>
      <section className="panel">
        <h2>What happens in a scan?</h2>
        <p>
          You respond to three prompts, for approximately 30 seconds each. You
          can listen back and record again before sending them. The backend
          checks recording quality, extracts acoustic measurements, and builds
          evidence records.
        </p>
        <p>
          In this beta release, supported recording descriptions and details are available when
          the backend is connected. Constellation interpretations remain
          unavailable while the scientific models are being validated. The
          design preview is illustrative copy, not a reading of your voice.
        </p>
      </section>
      <section className="panel">
        <h2>A reflection belongs to you</h2>
        <p>
          A voice recording cannot establish your identity, diagnose you, or
          reveal a hidden emotional truth. Different contexts, recording
          devices, speech styles, and environments can affect a response.
        </p>
        <p>
          When interpretations become available, they will describe a specific
          set of responses and preserve what remains uncertain. You decide
          whether a reflection fits your experience.
        </p>
      </section>
      <section className="panel" id="privacy">
        <h2>Your voice & privacy</h2>
        <p>
          Recording begins only after you give permission. Audio stays in this
          page until you choose to send it. Leaving the page before submitting
          clears the recordings.
        </p>
        <p>
          Submitted audio is stored privately by the connected backend. The
          backend has a 24-hour cleanup helper; deletion requires the deployment
          to schedule that helper. Do not assume automatic deletion is active
          during testing. Derived measurement and evidence records are separate
          from raw audio and persist in your account.
        </p>
        <p>
          Read our <Link href="/privacy">privacy notice</Link> before submitting a recording.
          SoulScope does not need names or identifying details about other
          people. Your scan history is visible through your signed-in account.
        </p>
      </section>
      <Link className="button primary" href="/scan">
        Begin your scan ↗
      </Link>
    </div>
  );
}
