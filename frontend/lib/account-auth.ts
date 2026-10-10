import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountMode = "signin" | "signup" | "reset" | "update";
type AccountAuth = Pick<
  SupabaseClient["auth"],
  | "signInWithPassword"
  | "signUp"
  | "resetPasswordForEmail"
  | "updateUser"
  | "resend"
>;

export function accountError(error: unknown): string {
  const detail = error as { code?: string; message?: string } | null;
  if (detail?.code === "email_not_confirmed")
    return "Confirm your email before signing in. Use Resend confirmation email below if you need a new link.";
  if (detail?.code === "invalid_credentials")
    return "The email or password was not accepted. Check your details or use Forgot password.";
  if (/timed? ?out|timeout|failed to fetch|fetch failed|network/i.test(detail?.message ?? ""))
    return "The account connection could not complete. Check your connection and try again.";
  return detail?.message || "Unable to connect. Please try again.";
}

export async function submitAccount(
  auth: AccountAuth,
  mode: AccountMode | "resend",
  email: string,
  password: string,
  redirectTo: string,
): Promise<string> {
  email = email.trim();
  if (mode !== "update" && !email)
    throw new Error("Enter your email address first.");
  if (mode === "reset") {
    const { error } = await auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return "If an account exists for this email, a password reset link will arrive shortly. Check your inbox and spam folder.";
  }
  if (mode === "resend") {
    const { error } = await auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    return "If this account needs confirmation, a new link will arrive shortly. Check your inbox and spam folder.";
  }
  if (mode === "update") {
    const { error } = await auth.updateUser({ password });
    if (error) throw error;
    return "Your password has been updated.";
  }
  const { data, error } =
    mode === "signin"
      ? await auth.signInWithPassword({ email, password })
      : await auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo },
        });
  if (error) throw error;
  return data.session
    ? ""
    : "Check your email to confirm your account, then sign in.";
}
