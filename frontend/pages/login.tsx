import Link from "next/link";
import { PublicLayout } from "../components/public/PublicLayout";

export default function LoginPage() {
  return (
    <PublicLayout
      title="SoulScope — Sign In"
      description="Sign in to the SoulScope visual account screen."
    >
      <section className="ss-auth-page" aria-labelledby="signin-title">
        <div className="ss-auth-copy">
          <p className="ss-public-kicker">Private instrument access</p>
          <h1 id="signin-title">Return to your reflection space.</h1>
          <p>
            Account access is shown here as a visual layer only. Authentication
            is not connected in this build.
          </p>
        </div>

        <form className="ss-auth-panel" aria-describedby="signin-note">
          <label htmlFor="signin-email">Email</label>
          <input id="signin-email" name="email" type="email" autoComplete="email" />

          <label htmlFor="signin-password">Password</label>
          <input id="signin-password" name="password" type="password" autoComplete="current-password" />

          <p className="ss-auth-error" role="status">
            Error state preview. No sign-in request is sent.
          </p>

          <button type="button" className="ss-public-button ss-public-button-primary">
            Sign in
          </button>
          <button type="button" className="ss-public-button ss-public-button-secondary" disabled>
            Loading state preview
          </button>

          <p id="signin-note" className="ss-auth-note">
            <a href="#signin-note">Forgot password?</a>
            <span>Visual placeholder</span>
          </p>

          <p className="ss-auth-switch">
            New to SoulScope? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
