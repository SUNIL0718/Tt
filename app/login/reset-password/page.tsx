import ResetPasswordForm from "@/components/forms/reset-password-form";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password | Timetable Admin",
};

function LoadingForm() {
    return (
        <div className="w-full h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[2rem] shadow-2xl">
          <Suspense fallback={<LoadingForm />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
