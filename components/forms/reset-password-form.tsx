"use client";

import { useActionState } from "react";
import { resetPassword } from "@/actions/password-reset";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [state, dispatch, isPending] = useActionState(resetPassword, {
    message: null,
    success: false,
  });

  if (!token || !email) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-slate-400 mb-6 px-4">This reset link is missing required information. Please request a new one.</p>
        <Link 
          href="/login/forgot-password" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all inline-block"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight text-center">Reset Password</h1>
        <p className="text-slate-400 mt-2 text-center px-4">
          Almost there! Set a new password for your account.
        </p>
      </div>

      <form action={dispatch} className="space-y-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="email" value={email} />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1" htmlFor="password">
              New Password
            </label>
            <input
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-light"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isPending || state.success}
            />
            {state.errors?.password && (
              <p className="text-xs text-red-400 mt-1 ml-1">{state.errors.password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-light"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={isPending || state.success}
            />
            {state.errors?.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 ml-1">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
        </div>

        <button
          disabled={isPending || state.success}
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>

        {state.message && (
          <div className={`p-4 rounded-xl text-sm border flex items-start gap-3 ${
            state.success 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            <div className="mt-0.5">
              {state.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              )}
            </div>
            <p>{state.message}</p>
          </div>
        )}

        {state.success && (
          <div className="text-center pt-2">
            <Link 
              href="/login" 
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              Log in with new password →
            </Link>
          </div>
        )}
      </form>
    </div>
  );
}
