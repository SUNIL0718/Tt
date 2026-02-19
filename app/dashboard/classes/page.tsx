import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Class from "@/lib/models/Class";
import Department from "@/lib/models/Department";
import AddClassModal from "@/components/timetable/add-class-modal";
import { deleteClass } from "@/actions/class";
import GenericHeader from "@/components/layout/GenericHeader";

async function deleteClassAction(id: string) {
    "use server";
    await deleteClass(id);
}

export default async function ClassesPage() {
  const session = await auth();
  const orgId = session?.user?.organizationId?.toString();
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  
  if (!isSuperAdmin && (!orgId || orgId === "[object Object]")) {
    return (
        <div className="p-8 bg-white rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Unauthorized</h2>
            <p className="text-slate-500 mt-1">No organization linked to your account. Please contact support.</p>
        </div>
    );
  }

  await connectToDatabase();
  const filter = (orgId && orgId !== "[object Object]") ? { organizationId: orgId } : {};
  const classes = await Class.find(filter)
    .populate("departmentId")
    .sort({ name: 1, section: 1 })
    .lean();
  const departments = (await Department.find(filter).lean()).map((d: any) => ({
    _id: d._id.toString(),
    name: d.name,
    code: d.code,
  }));


  return (
    <div className="space-y-6">
      <GenericHeader 
        title="Classes & Sections" 
        subtitle="Organize your student groups and academic blocks" 
        entityType="CLASS" 
        AddModal={AddClassModal}
        addModalProps={{ departments }}
      />

      <div className="mt-6 rounded-lg border bg-white shadow">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">Class Name</th>
              <th className="px-6 py-3">Semester</th>
              <th className="px-6 py-3">Department</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  No classes found. Add one to get started.
                </td>
              </tr>
            ) : (
              classes.map((cls: any) => (
                <tr key={cls._id.toString()} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                  <td className="px-6 py-4">{cls.section}</td>
                  <td className="px-6 py-4">
                    {cls.departmentId ? (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase tracking-wider">
                        {(cls.departmentId as any).name}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs italic">No Dept</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <form action={deleteClassAction.bind(null, cls._id.toString())}>
                        <button className="text-red-600 hover:underline">Delete</button>
                     </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
