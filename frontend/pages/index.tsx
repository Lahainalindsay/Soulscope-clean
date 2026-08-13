import Link from "next/link";
import { PublicLayout } from "../components/public/PublicLayout";

export default function HomePage() {
  return (
    <PublicLayout
      title="SoulScope — A Window Into Your Inner World"
      description="SoulScope is a private self-observation instrument centered on spoken Resonance Scans."
    >
      <section className="ss-public-hero" aria-labelledby="home-title">
        <div className="ss-public-hero-copy">
          <h1 id="home-title">Clarity comes from within</h1>
          <p>
            The way you express yourself naturally changes as you move through life.
          </p>
          <p>
            SoulScope is an instrument designed to notice the subtle patterns in
            your voice and expression, then organize them into a clear reflection
            of what may be present within you in that moment.
          </p>
          <div className="ss-public-actions">
            <Link href="/signup" className="ss-public-button ss-public-button-primary">
              Begin a Resonance Scan
            </Link>
            <Link href="#how-it-works" className="ss-public-button ss-public-button-secondary">
              How it works
            </Link>
          </div>
        </div>

        <div className="ss-public-visual" aria-hidden="true">
          <svg viewBox="0 0 720 620" className="ss-public-field-preview">
            <defs>
              <linearGradient id="publicContour" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#61e7ec" stopOpacity="0.92" />
                <stop offset="52%" stopColor="#168cff" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#b8f5ed" stopOpacity="0.74" />
              </linearGradient>
              <filter id="publicGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path className="ss-public-contour ss-public-contour-faint" d="M104 314 C128 146 285 70 432 105 C590 143 655 284 594 426 C530 574 337 604 199 507 C116 449 87 376 104 314 Z" />
            <path className="ss-public-contour" d="M154 308 C172 190 294 122 411 151 C530 181 584 288 538 402 C490 520 331 548 226 468 C167 423 143 363 154 308 Z" />
            <path className="ss-public-contour ss-public-contour-blue" d="M212 312 C220 230 305 180 390 199 C482 219 525 300 491 382 C455 468 338 488 263 431 C223 400 207 354 212 312 Z" />
            <path className="ss-public-contour ss-public-contour-mint" d="M278 316 C280 268 330 236 383 248 C439 260 467 310 446 360 C423 413 351 424 307 389 C286 372 276 342 278 316 Z" />
            <path className="ss-public-wave" d="M98 402 C190 332 268 327 340 386 C407 441 488 420 612 290" />
            <path className="ss-public-wave ss-public-wave-secondary" d="M148 238 C232 294 312 282 373 226 C434 171 509 202 575 271" />
            <path className="ss-public-spine" d="M430 82 C374 168 426 230 378 306 C332 378 382 432 334 536" filter="url(#publicGlow)" />
          </svg>
          <p>Visual preview only. Not generated from user data.</p>
        </div>
      </section>

      <section id="how-it-works" className="ss-public-section" aria-labelledby="scan-workflow">
        <h2 id="scan-workflow">How It Works</h2>
        <div className="ss-public-steps">
          <section>
            <span>01</span>
            <h3>Speak</h3>
            <p>Respond naturally to a short series of guided prompts.</p>
          </section>
          <section>
            <span>02</span>
            <h3>Observe</h3>
            <p>
              SoulScope organizes patterns in timing, steadiness, rhythm,
              energy, and expression.
            </p>
          </section>
          <section>
            <span>03</span>
            <h3>Reflect</h3>
            <p>
              Receive a Resonance Signature, a current pattern, and a clear
              Reflection.
            </p>
          </section>
        </div>
      </section>

      <section className="ss-public-section" aria-labelledby="receive-title">
        <h2 id="receive-title">What You Receive</h2>
        <p className="ss-public-section-intro">
          Your personal profile page brings together your scan history so you
          can observe how your energy and expression change over time. Emotional
          daily check-ins and journal entries add context to your scans, help
          you remember how you were feeling, and create a clearer record of what
          was happening in your life. Together, these tools help you track your
          emotions and inner energy in an observable, reflective way.
        </p>

        <div className="ss-public-results-preview">
          <section className="ss-public-result-concept">
            <div>
              <h3>Resonance Signature</h3>
              <p className="ss-public-result-lead">
                Many measured patterns. One visual signature.
              </p>
              <p>
                SoulScope organizes relationships across the scan into a single
                visual expression. Changes in spacing, movement, density, and
                balance help each scan take on its own form.
              </p>
              <p className="ss-public-disclosure">
                An illustrative Resonance Signature. Your personal signature is
                created from the patterns present in your own scan.
              </p>
            </div>
            <div className="ss-public-mini-signature" aria-hidden="true">
              <svg viewBox="0 0 320 220">
                <path d="M38 112 C48 42 127 16 196 35 C268 55 300 113 268 170 C234 230 136 232 76 187 C45 164 32 139 38 112 Z" />
                <path d="M82 110 C90 65 143 44 190 58 C238 72 259 111 239 151 C216 195 151 196 111 166 C90 150 77 132 82 110 Z" />
                <path d="M127 112 C130 86 159 72 187 81 C216 89 230 114 217 138 C204 164 166 168 144 148 C132 137 124 126 127 112 Z" />
                <path d="M52 148 C98 111 139 107 175 138 C209 166 248 151 288 101" />
              </svg>
            </div>
          </section>

          <section className="ss-public-result-concept ss-public-result-concept-text">
            <h3>Current Resonance Pattern</h3>
            <p className="ss-public-result-lead">A clear reflection of this moment.</p>
            <p>
              Your current pattern brings the strongest relationships in your
              scan into one readable result. It gives you language for what may
              be present now and a reference point you can compare with future
              scans.
            </p>
          </section>
        </div>
      </section>

      <section className="ss-public-section" aria-labelledby="audience-title">
        <h2 id="audience-title">Who SoulScope Is For</h2>
        <div className="ss-public-audience-list">
          <p>People interested in understanding themselves more clearly</p>
          <p>
            People who want a new perspective on patterns they may not notice
            on their own
          </p>
          <p>
            People who enjoy personality tests, self-assessments, journaling,
            and self-reflection
          </p>
          <p>
            People interested in voice, sound, acoustics, cymatics, and
            resonance
          </p>
          <p>
            People exploring sound healing, somatic practices, biofeedback, or
            alternative approaches to self-awareness
          </p>
          <p>
            People interested in technology, quantified self, emerging
            human-signal technology, and new forms of human-data interaction
          </p>
          <p>
            Researchers, builders, and curious thinkers interested in the
            emerging space where biology, behavior, sound, and technology meet
          </p>
        </div>
      </section>

      <section className="ss-public-privacy" aria-labelledby="privacy-title">
        <h2 id="privacy-title">Your data stays yours.</h2>
        <p>
          SoulScope is being designed around private, user-controlled data. Your
          scans and reflections belong to you. You decide what you keep, and you
          can delete your data at any time.
        </p>
        <p>Your voice is used to create your scan, not to define who you are.</p>
      </section>

      <section className="ss-public-entrance" aria-labelledby="begin-title">
        <h2 id="begin-title">You do not need to know what you are feeling before you begin.</h2>
        <Link href="/signup" className="ss-public-button ss-public-button-primary">
          Begin a Resonance Scan
        </Link>
      </section>
    </PublicLayout>
  );
}
