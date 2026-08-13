import Link from "next/link";
import { PublicLayout } from "../components/public/PublicLayout";

export default function SignupPage() {
  return (
    <PublicLayout
      title="SoulScope — Create Account"
      description="Create a SoulScope account visual screen."
    >
      <section className="ss-auth-page" aria-labelledby="signup-title">
        <div className="ss-auth-copy">
          <p className="ss-public-kicker">Begin with privacy</p>
          <h1 id="signup-title">Create your SoulScope account.</h1>
          <p>
            Your account keeps your scans and reflections private and available
            to you over time once the full product architecture is connected.
          </p>
        </div>

        <form className="ss-auth-panel" aria-describedby="signup-note">
          <label htmlFor="signup-name">Name</label>
          <input id="signup-name" name="name" type="text" autoComplete="name" />

          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" />

          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" />

          <label htmlFor="signup-confirm">Confirm password</label>
          <input id="signup-confirm" name="confirm-password" type="password" autoComplete="new-password" />

          <label className="ss-auth-check" htmlFor="policy-acceptance">
            <input id="policy-acceptance" name="policy-acceptance" type="checkbox" />
            <span>I agree to the Terms of Use and Privacy Policy.</span>
          </label>

          <button type="button" className="ss-public-button ss-public-button-primary">
            Create account
          </button>
          <button type="button" className="ss-public-button ss-public-button-secondary" disabled>
            Disabled state preview
          </button>

          <p id="signup-note" className="ss-auth-note">
            Account creation is visual only in this build.
          </p>

          <p className="ss-auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
