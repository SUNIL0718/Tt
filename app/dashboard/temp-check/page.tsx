import { findSuperAdmin } from "@/actions/temp-check";

export default async function TempCheckPage() {
  const result = await findSuperAdmin();
  return (
    <div className="p-10">
      <h1 className="text-xl font-bold">Super Admin Check</h1>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
