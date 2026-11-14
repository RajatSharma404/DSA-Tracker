"use client";

import { signIn, useSession, getProviders } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { BrandMark } from "@/components/ui/BrandMark";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-500">
      {error === "OAuthAccountNotLinked"
        ? "This email is already linked to another account."
        : error === "AccessDenied"
          ? "Access denied. Please try again."
          : error === "Callback"
            ? "Auth callback failed. Please contact support with the exact time of failure."
            : error === "Configuration"
              ? "Sign-in is temporarily unavailable due to server auth configuration."
              : `Sign in error: ${error}`}
    </div>
  );
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const allowInsecureCredentialsLogin =
    process.env.NEXT_PUBLIC_ALLOW_INSECURE_CREDENTIALS_LOGIN === "true";

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSignIn = async () => {
    setSubmitError("");
    const result = await signIn("credentials", {
      redirect: false,
      email,
      name,
      callbackUrl: "/",
    });

    if (result?.error) {
      setSubmitError("Please enter a valid email to continue.");
      return;
    }

    router.push(result?.url || "/");
  };

  const [hasGoogle, setHasGoogle] = useState<boolean | null>(null);
  useEffect(() => {
    getProviders()
      .then((p) => setHasGoogle(Boolean(p?.google)))
      .catch(() => setHasGoogle(false));
  }, []);

  const field =
    "w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]";

  return (
    <main className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.1fr_1fr]">
        <section className="max-w-md">
          <a href="/home" className="flex items-center gap-2.5" title="What is DSA Tracker?">
            <BrandMark />
            <span className="text-[15px] font-semibold tracking-tight">DSA Tracker</span>
          </a>
          <h1 className="page-title mt-10 text-4xl leading-[1.08] sm:text-5xl">
            Practise with a plan. <span className="text-[var(--accent-primary)]">Remember</span> what you solve.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            A roadmap of 450+ interview problems, spaced repetition that schedules your reviews, and a browser
            extension that records every accepted LeetCode submission for you.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[var(--text-secondary)]">
            {[
              "A single list each day: reviews first, then new practice",
              "Memory forecast shows which patterns are fading",
              "Submit to LeetCode from the editor and get the real verdict",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-primary)]" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="surface w-full max-w-sm justify-self-center p-6 lg:justify-self-end">
          <h2 className="text-lg font-semibold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Your progress syncs across devices.</p>

          <div className="mt-6 space-y-3">
            <Suspense fallback={null}>
              <ErrorMessage />
            </Suspense>

            {hasGoogle && (
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-[var(--border-medium)] bg-[var(--bg-card)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                Continue with Google
              </button>
            )}

            {hasGoogle && allowInsecureCredentialsLogin && (
              <div className="flex items-center gap-3 py-1 text-xs text-[var(--text-muted)]">
                <span className="h-px flex-1 bg-[var(--border-subtle)]" /> or <span className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>
            )}

            {allowInsecureCredentialsLogin && (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignIn();
                }}
              >
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">Name</span>
                  <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">Email</span>
                  <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </label>
                {submitError && <p className="text-xs text-rose-500">{submitError}</p>}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--on-accent)] hover:opacity-90 cursor-pointer"
                >
                  Continue with email
                </button>
                <p className="text-[11px] text-[var(--text-muted)]">Development sign-in: no password is checked.</p>
              </form>
            )}

            {hasGoogle === false && !allowInsecureCredentialsLogin && (
              <p className="text-sm text-[var(--text-muted)]">
                Sign-in isn&apos;t configured on this server. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
