"use server";

import connectToDatabase from "@/lib/db";
import Room from "@/lib/models/Room";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/types";

const RoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  type: z.enum(["CLASSROOM", "LAB"]),
});

export async function createRoom(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized", success: false };

  const validatedFields = RoomSchema.safeParse({
    name: formData.get("name"),
    capacity: formData.get("capacity"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error",
      success: false
    };
  }

  try {
    await connectToDatabase();
    
    await Room.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/rooms");
    return { message: "Room added!", success: true };
  } catch (error) {
    return { message: "Database Error.", success: false };
  }
}

export async function deleteRoom(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await Room.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/rooms");
    return { message: "Room deleted." };
  } catch (error) {
    return { message: "Database Error." };
  }
}
