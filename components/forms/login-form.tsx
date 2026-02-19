"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { authenticate } from "@/actions/login";

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" x2="3" y1="12" y2="12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
        <p className="text-slate-400 mt-2">Sign in to manage your timetable</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1" htmlFor="email">
            Email Address
          </label>
          <input
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-light"
            id="email"
            type="email"
            name="email"
            placeholder="admin@school.edu"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1" htmlFor="password">
            Password
          </label>
          <input
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-light"
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>
      </div>

      <LoginButton />

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{errorMessage}</span>
            <style jsx>{`
              .animate-shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
              }
              @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
              }
            `}</style>
        </div>
      )}
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 rounded-xl text-white font-bold shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
    >
      {pending ? "Signing in..." : "Sign In"}
    </button>
  );
}
