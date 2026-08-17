import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { PublicLayout } from "../components/public/PublicLayout";
import { signUpWithPassword } from "../lib/soulscopeApi";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm-password") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.get("policy-acceptance") !== "on") {
      setError("Please accept the Terms of Use and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const session = await signUpWithPassword(String(form.get("email") ?? ""), password);
      if (session) {
        await router.push("/scan");
      } else {
        setMessage("Account created. Check your email if confirmation is required before sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
    } finally {
      setLoading(false);
    }
  }

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

        <form className="ss-auth-panel" aria-describedby="signup-note" onSubmit={onSubmit}>
          <label htmlFor="signup-name">Name</label>
          <input id="signup-name" name="name" type="text" autoComplete="name" />

          <label htmlFor="signup-email">Email</label>
          <input id="signup-email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="signup-password">Password</label>
          <input id="signup-password" name="password" type="password" autoComplete="new-password" required />

          <label htmlFor="signup-confirm">Confirm password</label>
          <input id="signup-confirm" name="confirm-password" type="password" autoComplete="new-password" required />

          <label className="ss-auth-check" htmlFor="policy-acceptance">
            <input id="policy-acceptance" name="policy-acceptance" type="checkbox" />
            <span>I agree to the Terms of Use and Privacy Policy.</span>
          </label>

          <p className="ss-auth-error" role="status">
            {error || message || " "}
          </p>

          <button type="submit" className="ss-public-button ss-public-button-primary" disabled={loading}>
            {loading ? "Creating account" : "Create account"}
          </button>

          <p id="signup-note" className="ss-auth-note">
            Account creation uses Supabase Auth and keeps processing privileges on the backend.
          </p>

          <p className="ss-auth-switch">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
