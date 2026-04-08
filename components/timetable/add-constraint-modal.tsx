"use client";

import { useState, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { createConstraint } from "@/actions/constraint";

interface AddConstraintModalProps {
  teachers: any[];
}

export default function AddConstraintModal({ teachers }: AddConstraintModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createConstraint, { success: false, message: "" });

  useEffect(() => {
    if (state.success) {
      setIsOpen(false);
    }
  }, [state.success]);

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Constraint
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">New Teacher Constraint</h2>
            
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teacher</label>
                <select
                  name="teacherId"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                        <option key={t._id.toString()} value={t._id.toString()}>
                            {t.name}
                        </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Day</label>
                <select
                  name="day"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                >
                    {days.map((day) => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Period Index (Optional)</label>
                <input
                  type="number"
                  name="periodIndex"
                  placeholder="e.g. 1"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1">Leave blank to make the teacher unavailable for the whole day.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                <input
                  type="text"
                  name="reason"
                  placeholder="e.g. Personal errand"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm"
                />
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
      {pending ? "Saving..." : "Save Constraint"}
    </button>
  );
}
