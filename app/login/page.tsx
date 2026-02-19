import LoginForm from "../../components/forms/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#02020a] relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
      
      <div className="relative mx-auto flex w-full max-w-[450px] flex-col p-6">
        <div className="flex-1 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 shadow-2xl ring-1 ring-white/5">
          <LoginForm />
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account? <a href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Contact Admin</a>
        </p>
      </div>
    </main>
  );
}
