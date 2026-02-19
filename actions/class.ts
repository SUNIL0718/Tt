"use server";

import connectToDatabase from "@/lib/db";
import Class from "@/lib/models/Class";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/types";

const ClassSchema = z.object({
  name: z.string().min(1, "Name required"), // "Class 10"
  section: z.string().min(1, "Semester required"), // "A"
  departmentId: z.string().optional().or(z.literal("")),
});

export async function createClass(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized", success: false };

  const validatedFields = ClassSchema.safeParse({
    name: formData.get("name"),
    section: formData.get("section"),
    departmentId: formData.get("departmentId") || undefined,
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
    
    // Check uniqueness
    const existing = await Class.findOne({
      organizationId: session.user.organizationId,
      name: validatedFields.data.name,
      section: validatedFields.data.section,
    });

    if (existing) {
        return { message: "Class/Section already exists.", success: false };
    }

    await Class.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/classes");
    return { message: "Class added!", success: true };
  } catch (error) {
    return { message: "Database Error.", success: false };
  }
}

export async function deleteClass(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await Class.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/classes");
    return { message: "Class deleted." };
  } catch (error) {
    return { message: "Database Error." };
  }
}
