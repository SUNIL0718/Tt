"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/password-reset";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [state, dispatch, isPending] = useActionState(requestPasswordReset, {
    message: null,
    success: false,
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight text-center">Forgot Password</h1>
        <p className="text-slate-400 mt-2 text-center px-4">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <form action={dispatch} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1" htmlFor="email">
            Email Address
          </label>
          <input
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-light"
            id="email"
            type="email"
            name="email"
            placeholder="admin@school.edu"
            required
            disabled={isPending || state.success}
          />
          {state.errors?.email && (
            <p className="text-xs text-red-400 mt-1 ml-1">{state.errors.email[0]}</p>
          )}
        </div>

        <button
          disabled={isPending || state.success}
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Sending link..." : "Send Reset Link"}
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

        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
