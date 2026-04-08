import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Organization, { IOrganization } from "@/lib/models/Organization";
import PlanSelector from "@/components/billing/plan-selector";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized</div>;

  await connectToDatabase();
  const organization = await Organization.findById(session.user.organizationId).lean() as unknown as IOrganization;

  if (!organization) return <div>Organization not found</div>;

  const currentPlan = organization.subscriptionPlan || "FREE";
  const status = organization.subscriptionStatus || "ACTIVE";

  const plans = [
    {
      name: "FREE",
      price: "$0",
      features: ["10 Teachers", "5 Classes", "Community Support"],
    },
    {
      name: "PRO",
      price: "$49",
      features: ["Unlimited Teachers", "50 Classes", "Priority Support", "PDF Exports"],
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      features: ["Unlimited Classes", "SSO", "Dedicated Support", "API Access"],
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Billing & Subscriptions</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Subscription Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Current Subscription</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Active Plan</p>
                <p className="text-xl font-bold text-blue-600">{currentPlan}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase ${
                    status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {status}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Your next billing date is <span className="font-semibold">March 15, 2026</span>
                </p>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    View Invoices
                </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Change Your Plan</h2>
            <PlanSelector currentPlan={currentPlan} plans={plans} />
          </div>
        </div>

        {/* Usage Summary */}
        <div className="space-y-6">
            <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Why Upgrade?</h2>
                <ul className="space-y-4">
                    <li className="flex gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight">Advanced Constraints</p>
                            <p className="text-xs text-gray-400 mt-1">Setup complex staff unavailability rules.</p>
                        </div>
                    </li>
                    <li className="flex gap-3">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight">Batch PDF Export</p>
                            <p className="text-xs text-gray-400 mt-1">Export individual class & teacher grids.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
