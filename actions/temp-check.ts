"use server";

import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";

export async function findSuperAdmin() {
  await connectToDatabase();
  const admin = await User.findOne({ role: "SUPER_ADMIN" }).lean();
  
  if (admin && !Array.isArray(admin)) {
    return { email: admin.email, name: admin.name };
  }
  
  return { message: "No Super Admin found." };
}
