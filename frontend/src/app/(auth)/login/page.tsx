"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Activity, LayoutDashboard, Target, Zap } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden p-6 font-sans">
      {/* Balanced Radial Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="relative w-full max-w-[440px] flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-10 flex flex-col items-center space-y-4">
          <div className="h-14 w-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            <Activity size={32} strokeWidth={2.5} />
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
        <div className="w-full bg-[#0d0d0d] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">Welcome back</h2>
              <p className="text-gray-500 text-sm">
                Sign in with your account to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                {error === "OAuthAccountNotLinked"
                  ? "This email is already linked to another account."
                  : error === "AccessDenied"
                    ? "Access denied. Please try again."
                    : `Sign in error: ${error}`}
              </div>
            )}

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
