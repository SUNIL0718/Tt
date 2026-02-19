"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createClass } from "@/actions/class";

import { ActionState } from "@/lib/types";

export default function AddClassModal({ departments = [] }: { departments?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialState: ActionState = { success: false, message: "", errors: {} };
  const [state, formAction] = useActionState(createClass, initialState);

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Class
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Add New Class</h2>
            
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Class Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Class 10"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Semester</label>
                <input
                  type="text"
                  name="section"
                  placeholder="e.g. 1st or A"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {state.errors?.section && <p className="text-xs text-red-500">{state.errors.section}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select
                  name="departmentId"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept._id.toString()} value={dept._id.toString()}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
                {state.errors?.departmentId && <p className="text-xs text-red-500">{state.errors.departmentId}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <SubmitButton />
              </div>
              
              {state.message && (
                <p className={`text-center text-sm ${state.success ? 'text-green-600' : 'text-red-500'}`}>
                    {state.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save Class"}
    </button>
  );
}
