"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { LayoutDashboard, Target, Zap } from "lucide-react";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
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

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] px-6">
        <div className="w-full max-w-110 space-y-4 animate-pulse">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--bg-card)]" />
          <div className="mx-auto h-8 w-56 rounded-full bg-[var(--bg-card)]" />
          <div className="mx-auto h-4 w-72 max-w-full rounded-full bg-[var(--bg-card)]" />
          <div className="h-12 w-full rounded-2xl bg-[var(--bg-card)]" />
          <div className="h-12 w-full rounded-2xl bg-[var(--bg-card)]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center overflow-hidden p-6 font-sans"
      data-scroll-reveal
    >
      {/* Balanced Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-200 w-200 rounded-full bg-purple-500/5 blur-[160px] pointer-events-none"></div>

      <div className="relative w-full max-w-110 flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center space-y-4">
          <div className="h-14 w-14 rounded-2xl shadow-[0_0_40px_rgba(96,165,250,0.15)] ring-1 ring-white/10 overflow-hidden">
            <img
              src="/logo.svg"
              alt="DSA Tracker Pro logo"
              className="h-full w-full"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              DSA Tracker <span className="text-gray-500">Pro</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Elevate your algorithmic journey
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div
          className="w-full bg-[#0d0d0d] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl"
          data-scroll-reveal
        >
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-gray-500 text-sm">Sign in to continue</p>
            </div>

            {/* Error message from OAuth callback */}
            <Suspense fallback={null}>
              <ErrorMessage />
            </Suspense>

            <div className="space-y-3">
              <button
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 bg-white text-black rounded-2xl font-bold text-sm tracking-tight hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg"
              >
                <img
                  src="https://authjs.dev/img/providers/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              {allowInsecureCredentialsLogin ? (
                <>
                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#0d0d0d] px-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        or use email
                      </span>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-white/30"
                  />
                  <button
                    onClick={handleSignIn}
                    className="group relative w-full py-4 px-6 bg-white text-black rounded-2xl font-bold text-sm tracking-tight hover:bg-gray-200 transition-all active:scale-[0.98] shadow-lg"
                  >
                    Continue
                  </button>
                </>
              ) : null}
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
                {submitError}
              </div>
            ) : null}

            <div className="pt-4 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                  <LayoutDashboard size={16} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  Stats
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                  <Target size={16} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  Goals
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                  <Zap size={16} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  Streaks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex items-center gap-6">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            Verified Secure
          </span>
          <div className="h-1 w-1 rounded-full bg-gray-800"></div>
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-[0.2em]">
            AWS Hosted
          </span>
        </div>
      </div>
    </div>
  );
}
