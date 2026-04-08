"use client";

import { useActionState, useEffect, useState } from "react";
import { X, Building2 } from "lucide-react";
import { createDepartment } from "@/actions/department";

import { ActionState } from "@/lib/types";

export default function AddDepartmentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const initialState: ActionState = { success: false, message: "", errors: {} };
  const [state, action, isPending] = useActionState(createDepartment, initialState);

  const onClose = () => setIsOpen(false);

  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
      >
        Add Department
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Add Department</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form action={action} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Department Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. Computer Science"
            />
            {state?.errors?.name && <p className="mt-1 text-xs text-red-500 font-bold">{state.errors.name}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Department Code</label>
            <input
              name="code"
              type="text"
              required
              className="w-full bg-slate-50 border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="e.g. CS"
            />
            {state?.errors?.code && <p className="mt-1 text-xs text-red-500 font-bold">{state.errors.code}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-xs font-black text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-3 text-xs font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              {isPending ? "Adding..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</>
);
}
