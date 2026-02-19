"use server";

import connectToDatabase from "@/lib/db";
import Teacher from "@/lib/models/Teacher";
import Department from "@/lib/models/Department"; // Register Department model
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/types";

const TeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  initials: z.string().max(3, "Max 3 chars").optional(),
  color: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color").optional(),
  maxPeriods: z.coerce.number().min(1).max(50),
  departmentId: z.string().optional().or(z.literal("")),
});

export async function createTeacher(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized", success: false };
  }

  const validatedFields = TeacherSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    initials: formData.get("initials") || undefined,
    color: formData.get("color") || "#3b82f6", // Default blue if missing
    maxPeriods: formData.get("maxPeriods"),
    departmentId: formData.get("departmentId") || undefined,
  });

  console.log("[CreateTeacher] Validated data:", validatedFields.data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      success: false
    };
  }

  try {
    await connectToDatabase();
    
    await Teacher.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/teachers");
    return { message: "Teacher added successfully!", success: true };
  } catch (error) {
    return { message: "Database Error: Failed to Create Teacher.", success: false };
  }
}

export async function deleteTeacher(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    // Ensure we only delete teachers belonging to the user's organization
    await Teacher.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/teachers");
    return { message: "Teacher deleted." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Teacher." };
  }
}
