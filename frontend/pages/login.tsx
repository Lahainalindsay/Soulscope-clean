import Link from "next/link";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { PublicLayout } from "../components/public/PublicLayout";
import { signInWithPassword } from "../lib/soulscopeApi";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await signInWithPassword(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      await router.push("/scan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

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
            Sign in to begin a private scan. Your browser receives only a
            user session and the public Supabase key.
          </p>
        </div>

        <form className="ss-auth-panel" aria-describedby="signin-note" onSubmit={onSubmit}>
          <label htmlFor="signin-email">Email</label>
          <input id="signin-email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="signin-password">Password</label>
          <input id="signin-password" name="password" type="password" autoComplete="current-password" required />

          <p className="ss-auth-error" role="status">
            {error || " "}
          </p>

          <button type="submit" className="ss-public-button ss-public-button-primary" disabled={loading}>
            {loading ? "Signing in" : "Sign in"}
          </button>

          <p id="signin-note" className="ss-auth-note">
            <a href="#signin-note">Forgot password?</a>
            <span>Private user session</span>
          </p>

          <p className="ss-auth-switch">
            New to SoulScope? <Link href="/signup">Create an account</Link>
          </p>
        </form>
      </section>
    </PublicLayout>
  );
}
