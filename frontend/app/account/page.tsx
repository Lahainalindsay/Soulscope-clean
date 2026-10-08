"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { FieldArt } from "@/components/field-art";
export default function Account() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [mode, setMode] = useState<"signin" | "signup">("signin"),
    [user, setUser] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const db = getSupabase();
  useEffect(() => {
    if (!db) return;
    db.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
    const { data } = db.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user.email ?? null),
    );
    return () => data.subscription.unsubscribe();
  }, [db]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!db) return;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } =
        mode === "signin"
          ? await db.auth.signInWithPassword({ email, password })
          : await db.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/account" },
            });
      if (error) throw error;
      setPassword("");
      if (!data.session)
        setMessage("Check your email to confirm your account, then sign in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-page">
      <div className="account-art">
        <FieldArt />
        <p className="eyebrow">YOUR VOICE. YOUR SPACE.</p>
      </div>
      <div className="panel account-form">
        <p className="eyebrow">SOULSCOPE ACCOUNT</p>
        <h1>
          {user
            ? "Your space."
            : mode === "signin"
              ? "Welcome back."
              : "Make room for you."}
        </h1>
        <p className="muted">
          {user
            ? user
            : "Keep your scans together and return when you are ready."}
        </p>
        {!db ? (
          <div className="notice">
            Account access is awaiting configuration. Explore the design preview
            while the connection is prepared.
            <Link className="text-link" href="/results">
              Open preview →
            </Link>
          </div>
        ) : user ? (
          <>
            <Link className="button primary" href="/scan">
              Begin a scan ↗
            </Link>
            <Link className="button secondary" href="/history">
              View your history
            </Link>
            <button
              className="text-link"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const { error } = await db.auth.signOut();
                setBusy(false);
                if (error) setMessage(error.message);
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <label>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                required
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="button primary" disabled={busy}>
              {busy
                ? "Connecting…"
                : mode === "signin"
                  ? "Sign in →"
                  : "Create account →"}
            </button>
            <button
              className="text-link"
              type="button"
              disabled={busy}
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setMessage("");
              }}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        )}
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
        <p className="micro">
          Your account protects access to your recordings and results.
        </p>
      </div>
    </section>
  );
}
