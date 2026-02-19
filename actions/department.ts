"use server";

import connectToDatabase from "@/lib/db";
import Department from "@/lib/models/Department";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/types";

const DepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(1, "Code is required").max(10, "Max 10 chars"),
});

export async function createDepartment(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { message: "Unauthorized", success: false };
  }

  const validatedFields = DepartmentSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please correct the errors below.",
      success: false
    };
  }

  try {
    await connectToDatabase();
    
    await Department.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/departments");
    return { message: "Department added successfully!", success: true };
  } catch (error) {
    return { message: "Database Error: Failed to Create Department.", success: false };
  }
}

export async function deleteDepartment(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await Department.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/departments");
    return { message: "Department deleted." };
  } catch (error) {
    return { message: "Database Error: Failed to Delete Department." };
  }
}
