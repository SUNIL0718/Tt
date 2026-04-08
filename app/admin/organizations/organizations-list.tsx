"use client";

import { useState } from "react";
import EditOrganizationModal from "./edit-modal";

interface OrganizationsListProps {
  organizations: any[];
}

export default function OrganizationsList({ organizations }: OrganizationsListProps) {
  const [editingOrg, setEditingOrg] = useState<any>(null);

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Institution Name</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y text-sm">
                {organizations.map((org: any) => (
                    <tr key={org._id.toString()} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{org.name}</div>
                            <div className="text-[10px] text-gray-500">{org.domain || "No domain set"}</div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {org.subscriptionPlan}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                org.subscriptionStatus === "ACTIVE" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {org.subscriptionStatus}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                            {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                             <button 
                                onClick={() => setEditingOrg(org)}
                                className="text-blue-600 font-bold hover:underline"
                             >
                                Edit
                             </button>
                             <button className="text-slate-400 font-bold hover:text-red-500">Impersonate</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {editingOrg && (
        <EditOrganizationModal 
          organization={editingOrg} 
          onClose={() => setEditingOrg(null)} 
        />
      )}
    </>
  );
}
