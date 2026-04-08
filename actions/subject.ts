"use server";

import connectToDatabase from "@/lib/db";
import Subject from "@/lib/models/Subject";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ActionState } from "@/lib/types";

const SubjectSchema = z.object({
  name: z.string().min(2, "Name required"),
  code: z.string().optional(),
  type: z.enum(["THEORY", "LAB"]),
  departmentId: z.string().optional().or(z.literal("")),
});

export async function createSubject(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized", success: false };

  const validatedFields = SubjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    type: formData.get("type"),
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
    
    await Subject.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/subjects");
    return { message: "Subject added!", success: true };
  } catch (error) {
    return { message: "Database Error.", success: false };
  }
}

export async function deleteSubject(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await Subject.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/subjects");
    return { message: "Subject deleted." };
  } catch (error) {
    return { message: "Database Error." };
  }
}
