"use client";

import { useState } from "react";
import { upgradePlan } from "@/actions/billing";

interface Plan {
  name: string;
  price: string;
  features: string[];
}

export default function PlanSelector({ currentPlan, plans }: { currentPlan: string; plans: Plan[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleUpgrade = async (planName: string) => {
    setLoading(planName);
    const result = await upgradePlan(planName);
    setLoading(null);
    if (result.success) {
      setMessage(result.message);
    } else {
      setMessage(result.message || "Failed to upgrade.");
    }
  };

  return (
    <div className="space-y-6">
        {message && (
            <p className={`p-3 rounded-lg text-sm text-center ${message.includes("Success") ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
            </p>
        )}
        <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
            <div key={plan.name} className={`p-4 rounded-xl border-2 transition-all ${
                currentPlan === plan.name ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
            }`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{plan.name}</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{plan.price}</p>
                <ul className="mt-4 space-y-2">
                    {plan.features.slice(0, 3).map(f => (
                        <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
                            <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                            {f}
                        </li>
                    ))}
                </ul>
                <button 
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={currentPlan === plan.name || !!loading}
                    className={`w-full mt-6 py-2 rounded-lg text-xs font-bold transition-all ${
                        currentPlan === plan.name 
                            ? "bg-blue-100 text-blue-600 cursor-default" 
                            : "bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                    }`}
                >
                    {loading === plan.name ? "Processing..." : (currentPlan === plan.name ? "Current Plan" : "Select Plan")}
                </button>
            </div>
        ))}
        </div>
    </div>
  );
}
