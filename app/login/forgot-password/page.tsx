import ForgotPasswordForm from "@/components/forms/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Timetable Admin",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[2rem] shadow-2xl">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
