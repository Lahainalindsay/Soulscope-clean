import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AccountForm } from "../components/account-form";
import { createAuthFetch } from "../lib/auth-fetch";
import {
  accountError,
  submitAccount,
  type AccountMode,
} from "../lib/account-auth";

function form(mode: AccountMode, busy = false) {
  return renderToStaticMarkup(
    createElement(AccountForm, {
      mode,
      busy,
      email: "",
      password: "",
      onEmail() {},
      onPassword() {},
      onMode() {},
      onSubmit() {},
      onResend() {},
    }),
  );
}

function authMock(
  error: { code: string; message: string } | null = null,
  session = true,
) {
  const calls: { method: string; args: unknown[] }[] = [];
  function invoke(method: string) {
    return async (...args: unknown[]) => {
      calls.push({ method, args });
      return {
        data: { session: session ? { access_token: "test-token" } : null },
        error,
      };
    };
  }
  const auth = {
    signInWithPassword: invoke("signin"),
    signUp: invoke("signup"),
    resetPasswordForEmail: invoke("reset"),
    updateUser: invoke("update"),
    resend: invoke("resend"),
  } as unknown as Parameters<typeof submitAccount>[0];
  return { auth, calls };
}
const redirect = "https://soulscope-clean.vercel.app/account";

test("sign-in accepts existing short passwords while new passwords require eight characters", async () => {
  assert.doesNotMatch(form("signin"), /minLength/i);
  assert.match(form("signup"), /minLength="8"/i);
  assert.match(form("update"), /minLength="8"/i);
  const { auth, calls } = authMock();
  assert.equal(
    await submitAccount(
      auth,
      "signin",
      "  person@example.com  ",
      "short ",
      redirect,
    ),
    "",
  );
  assert.deepEqual(calls, [
    {
      method: "signin",
      args: [{ email: "person@example.com", password: "short " }],
    },
  ]);
});

test("password reset needs only email and sends the user back to the account page", async () => {
  assert.doesNotMatch(form("reset"), /type="password"/);
  assert.match(form("reset"), /Send reset link/);
  const { auth, calls } = authMock();
  const message = await submitAccount(
    auth,
    "reset",
    " person@example.com ",
    "",
    redirect,
  );
  assert.match(message, /If an account exists/);
  assert.deepEqual(calls, [
    { method: "reset", args: ["person@example.com", { redirectTo: redirect }] },
  ]);
});

test("confirmation resend uses signup confirmation without changing passwords", async () => {
  assert.match(form("signin"), /Resend confirmation email/);
  assert.match(form("signin"), /Forgot password/);
  const { auth, calls } = authMock();
  await submitAccount(auth, "resend", "person@example.com", "", redirect);
  assert.deepEqual(calls, [
    {
      method: "resend",
      args: [
        {
          type: "signup",
          email: "person@example.com",
          options: { emailRedirectTo: redirect },
        },
      ],
    },
  ]);
});

test("recovery form saves a new password through authenticated updateUser", async () => {
  assert.doesNotMatch(form("update"), /type="email"/);
  assert.match(form("update"), /autoComplete="new-password"/);
  const { auth, calls } = authMock();
  assert.equal(
    await submitAccount(auth, "update", "", "new password", redirect),
    "Your password has been updated.",
  );
  assert.deepEqual(calls, [
    { method: "update", args: [{ password: "new password" }] },
  ]);
});

test("signup requires confirmation when the service supplies no session", async () => {
  const { auth, calls } = authMock(null, false);
  assert.match(
    await submitAccount(
      auth,
      "signup",
      "person@example.com",
      "new password",
      redirect,
    ),
    /confirm your account/,
  );
  assert.deepEqual(calls, [
    {
      method: "signup",
      args: [
        {
          email: "person@example.com",
          password: "new password",
          options: { emailRedirectTo: redirect },
        },
      ],
    },
  ]);
});

test("auth failures retain the service error and offer actionable recovery", async () => {
  for (const code of ["email_not_confirmed", "invalid_credentials"]) {
    const error = { code, message: "service error" };
    const { auth } = authMock(error);
    await assert.rejects(
      () =>
        submitAccount(
          auth,
          "signin",
          "person@example.com",
          "password",
          redirect,
        ),
      (value) => value === error,
    );
    assert.match(
      accountError(error),
      code === "email_not_confirmed"
        ? /Resend confirmation/
        : /Forgot password/,
    );
  }
  assert.equal(
    accountError({ message: "Email rate limit exceeded" }),
    "Email rate limit exceeded",
  );
  assert.match(accountError(null), /try again/);
});

test("empty email never sends recovery requests and busy forms disable their actions", async () => {
  const { auth, calls } = authMock();
  await assert.rejects(
    () => submitAccount(auth, "reset", "  ", "", redirect),
    /Enter your email/,
  );
  assert.equal(calls.length, 0);
  const markup = form("signin", true);
  for (const button of markup.matchAll(/<button\b[^>]*>/g))
    assert.match(button[0], /disabled/);
});

test("stalled auth requests abort and give a retry message", async () => {
  const stalled: typeof fetch = async (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
  });
  await assert.rejects(() => createAuthFetch(stalled, 5)("https://auth.example.test/auth/v1/token"), (error: unknown) => {
    assert.match(accountError(error), /try again/);
    return error instanceof DOMException && error.name === "TimeoutError";
  });
});

test("auth timeout preserves caller cancellation and leaves scan requests untouched", async () => {
  const caller = new AbortController();
  caller.abort(new Error("cancelled by caller"));
  const fetcher: typeof fetch = async (_input, init) => {
    if (init?.signal?.aborted) throw init.signal.reason;
    return Response.json({ ok: true });
  };
  await assert.rejects(() => createAuthFetch(fetcher)("https://auth.example.test/auth/v1/user", { signal: caller.signal }), /cancelled by caller/);
  let actualInit: RequestInit | undefined;
  const capture: typeof fetch = async (_input, init) => { actualInit = init; return Response.json({ ok: true }); };
  const init = { method: "POST", body: "recording" };
  await createAuthFetch(capture, 1)("https://auth.example.test/storage/v1/object/recording", init);
  assert.equal(actualInit, init);
});
