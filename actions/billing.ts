"use server";

import connectToDatabase from "@/lib/db";
import Organization from "@/lib/models/Organization";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function upgradePlan(planName: string) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    
    await Organization.findByIdAndUpdate(session.user.organizationId, {
      subscriptionPlan: planName,
      subscriptionStatus: "ACTIVE",
    });

    revalidatePath("/dashboard/billing");
    return { success: true, message: `Successfully upgraded to ${planName}!` };
  } catch (error) {
    console.error(error);
    return { message: "Failed to upgrade plan." };
  }
}
