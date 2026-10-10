"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { FieldArt } from "@/components/field-art";
import { AccountForm } from "@/components/account-form";
import {
  accountError,
  submitAccount,
  type AccountMode,
} from "@/lib/account-auth";
export default function Account() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [mode, setMode] = useState<AccountMode>("signin"),
    [user, setUser] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const db = getSupabase();
  useEffect(() => {
    if (!db) return;
    // Keep this callback synchronous: auth calls inside it can deadlock the SDK.
    const { data } = db.auth.onAuthStateChange((event, session) => {
      setUser(session?.user.email ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
        setPassword("");
        setMessage("");
      }
      if (event === "SIGNED_OUT") setMode("signin");
    });
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("error_description")) {
      setMessage(
        "This email link is invalid or has expired. Request a new confirmation or password reset link.",
      );
      window.history.replaceState(null, "", window.location.pathname);
    }
    return () => data.subscription.unsubscribe();
  }, [db]);
  async function run(action: AccountMode | "resend") {
    if (!db) return;
    setBusy(true);
    setMessage("");
    try {
      const notice = await submitAccount(
        db.auth,
        action,
        email,
        password,
        window.location.origin + "/account",
      );
      setPassword("");
      setMessage(notice);
      if (action === "update") setMode("signin");
    } catch (error) {
      setMessage(accountError(error));
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
          {mode === "update"
            ? "Choose a new password."
            : mode === "reset"
              ? "Reset your password."
              : user
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
        ) : user && mode !== "update" ? (
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
                try {
                  const { error } = await db.auth.signOut();
                  if (error) throw error;
                  setMessage("");
                } catch (error) {
                  setMessage(accountError(error));
                } finally {
                  setBusy(false);
                }
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <AccountForm
            mode={mode}
            email={email}
            password={password}
            busy={busy}
            onEmail={setEmail}
            onPassword={setPassword}
            onMode={(next) => {
              setMode(next);
              setPassword("");
              setMessage("");
            }}
            onSubmit={(event) => {
              event.preventDefault();
              void run(mode);
            }}
            onResend={() => void run("resend")}
          />
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
