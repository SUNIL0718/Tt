import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Organization from "@/lib/models/Organization";
import OrganizationsList from "./organizations-list";

export default async function AdminOrganizationsPage() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") return <div>Unauthorized</div>;

  await connectToDatabase();
  const organizations = await Organization.find().sort({ name: 1 }).lean();
  
  // Serialize for client component
  const serializedOrgs = JSON.parse(JSON.stringify(organizations));

  return (
    <div className="p-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organization Management</h1>
            <p className="text-gray-500 text-sm">Manage institutional accounts and billing status.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Add New Institution
        </button>
      </header>

      <OrganizationsList organizations={serializedOrgs} />
    </div>
  );
}

