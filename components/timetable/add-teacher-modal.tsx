"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createTeacher } from "@/actions/teacher";

import { ActionState } from "@/lib/types";

export default function AddTeacherModal({ departments = [] }: { departments?: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const initialState: ActionState = { success: false, message: "", errors: {} };
  const [state, formAction] = useActionState(createTeacher, initialState);

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
        Add Teacher
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Add New Teacher</h2>
            
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {state.errors?.name && <p className="text-xs text-red-500">{state.errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {state.errors?.email && <p className="text-xs text-red-500">{state.errors.email}</p>}
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

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Initials</label>
                  <input
                    type="text"
                    name="initials"
                    maxLength={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700">Max Periods/Week</label>
                   <input
                    type="number"
                    name="maxPeriods"
                    defaultValue={30}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                   />
                </div>
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
              
              {state.message && !state.success && (
                <p className="text-center text-sm text-red-500">{state.message}</p>
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
      {pending ? "Saving..." : "Save Teacher"}
    </button>
  );
}
