"use server";

import connectToDatabase from "@/lib/db";
import TeacherConstraint from "@/lib/models/TeacherConstraint";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ConstraintSchema = z.object({
  teacherId: z.string().min(1),
  day: z.string().min(1),
  periodIndex: z.coerce.number().optional().nullable(),
  reason: z.string().optional(),
});

export async function createConstraint(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  const validatedFields = ConstraintSchema.safeParse({
    teacherId: formData.get("teacherId"),
    day: formData.get("day"),
    periodIndex: formData.get("periodIndex") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error",
    };
  }

  try {
    await connectToDatabase();
    
    await TeacherConstraint.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/constraints");
    return { message: "Constraint added!", success: true };
  } catch (error) {
    return { message: "Database Error." };
  }
}

export async function deleteConstraint(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await TeacherConstraint.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/constraints");
    return { message: "Constraint removed." };
  } catch (error) {
    return { message: "Database Error." };
  }
}
