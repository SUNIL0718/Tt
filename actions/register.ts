"use server";

import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import Organization from "@/lib/models/Organization";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ActionState } from "@/lib/types";

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  organizationName: z.string().min(2, { message: "Organization name is required" }),
});

export async function registerUser(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Register.",
      success: false
    };
  }

  const { name, email, password, organizationName } = validatedFields.data;

  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        message: "Email already exists.",
        success: false
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Organization first
    const newOrg = await Organization.create({
      name: organizationName,
      type: "School", // Default
    });

    // Create User (Admin)
    await User.create({
      name,
      email,
      hashedPassword,
      role: "ADMIN",
      organizationId: newOrg._id,
    });

  } catch (error) {
    return {
      message: "Database Error: Failed to Register User.",
      success: false
    };
  }

  // Redirect to login
  redirect("/login");
  return { success: true }; // unreachable but satisfying TS
}
