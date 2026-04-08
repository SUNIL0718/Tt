"use client";

import { useState, useActionState } from "react";
import { updateOrganizationStatus, updateOrganizationPlan } from "@/actions/admin";

interface EditOrganizationModalProps {
  organization: {
    _id: string;
    name: string;
    subscriptionStatus: string;
    subscriptionPlan: string;
  };
  onClose: () => void;
}

export default function EditOrganizationModal({ organization, onClose }: EditOrganizationModalProps) {
  const [status, setStatus] = useState(organization.subscriptionStatus);
  const [plan, setPlan] = useState(organization.subscriptionPlan);

  async function handleUpdate(prevState: any, formData: FormData) {
    const newStatus = formData.get("status") as string;
    const newPlan = formData.get("plan") as string;

    let res1 = { success: true };
    let res2 = { success: true };

    if (newStatus !== organization.subscriptionStatus) {
      const res = await updateOrganizationStatus(organization._id, newStatus) as any;
      if (!res.success) res1 = { success: false };
    }
    if (newPlan !== organization.subscriptionPlan) {
      const res = await updateOrganizationPlan(organization._id, newPlan) as any;
      if (!res.success) res2 = { success: false };
    }

    if (res1.success && res2.success) {
      onClose();
      return { success: true };
    }
    return { message: "Update failed" };
  }

  const [state, formAction, isPending] = useActionState(handleUpdate, null);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit {organization.name}</h2>
          <p className="text-gray-500 text-sm">Update institutional settings and status.</p>
        </div>

        <form action={formAction} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Subscription Status</label>
            <select 
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Subscription Plan</label>
            <select 
              name="plan"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="FREE">FREE</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          {state?.message && <p className="text-red-500 text-sm font-medium">{state.message}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
