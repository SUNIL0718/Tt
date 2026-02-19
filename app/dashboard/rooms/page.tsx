import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Room from "@/lib/models/Room";
import AddRoomModal from "@/components/timetable/add-room-modal";
import { deleteRoom } from "@/actions/room";
import GenericHeader from "@/components/layout/GenericHeader";

async function deleteRoomAction(id: string) {
    "use server";
    await deleteRoom(id);
}

export default async function RoomsPage() {
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
  const rooms = await Room.find(filter).lean();

  return (
    <div className="space-y-6">
      <GenericHeader 
        title="Rooms" 
        subtitle="Manage your physical classrooms and laboratory spaces" 
        entityType="ROOM" 
        AddModal={AddRoomModal} 
      />

      <div className="mt-6 rounded-lg border bg-white shadow">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">Room Name</th>
              <th className="px-6 py-3">Capacity</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  No rooms found. Add one to get started.
                </td>
              </tr>
            ) : (
              rooms.map((room: any) => (
                <tr key={room._id.toString()} className="border-b bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.name}</td>
                  <td className="px-6 py-4">{room.capacity}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        room.type === "LAB" 
                        ? "bg-purple-50 text-purple-700 ring-purple-600/20" 
                        : "bg-blue-50 text-blue-700 ring-blue-600/20"
                    }`}>
                        {room.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <form action={deleteRoomAction.bind(null, room._id.toString())}>
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
