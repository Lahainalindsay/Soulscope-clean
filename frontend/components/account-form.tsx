import type { FormEvent } from "react";
import type { AccountMode } from "../lib/account-auth";

export function AccountForm({
  mode,
  email,
  password,
  busy,
  onEmail,
  onPassword,
  onMode,
  onSubmit,
  onResend,
}: {
  mode: AccountMode;
  email: string;
  password: string;
  busy: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onMode: (mode: AccountMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      {mode !== "update" && (
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
          />
        </label>
      )}
      {mode !== "reset" && (
        <label>
          {mode === "update" ? "New password" : "Password"}
          <input
            type="password"
            minLength={mode === "signin" ? undefined : 8}
            required
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => onPassword(e.target.value)}
          />
        </label>
      )}
      <button className="button primary" disabled={busy}>
        {busy
          ? "Connecting…"
          : mode === "signin"
            ? "Sign in →"
            : mode === "signup"
              ? "Create account →"
              : mode === "reset"
                ? "Send reset link →"
                : "Save new password →"}
      </button>
      {mode === "signin" && (
        <button
          className="text-link"
          type="button"
          disabled={busy}
          onClick={() => onMode("reset")}
        >
          Forgot password?
        </button>
      )}
      {mode === "signin" && (
        <button
          className="text-link"
          type="button"
          disabled={busy}
          onClick={(event) => {
            const input =
              event.currentTarget.form?.querySelector<HTMLInputElement>(
                'input[type="email"]',
              );
            if (input?.reportValidity()) onResend();
          }}
        >
          Resend confirmation email
        </button>
      )}
      <button
        className="text-link"
        type="button"
        disabled={busy}
        onClick={() => onMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin"
          ? "New here? Create an account"
          : mode === "signup"
            ? "Already have an account? Sign in"
            : mode === "update"
              ? "Cancel password change"
              : "Back to sign in"}
      </button>
    </form>
  );
}
