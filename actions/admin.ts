"use server";

import connectToDatabase from "@/lib/db";
import Organization from "@/lib/models/Organization";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import Log from "@/lib/models/Log";

async function checkSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized: Super Admin access required.");
  }
}

async function createLog(message: string, source: string, level: string = "INFO", metadata?: any) {
    try {
        const session = await auth();
        await connectToDatabase();
        await Log.create({
            message,
            source,
            level,
            metadata,
            userId: session?.user?.id
        });
    } catch (e) {
        console.error("Failed to create log:", e);
    }
}

export async function updateOrganizationStatus(id: string, status: string) {
  await checkSuperAdmin();
  try {
    await connectToDatabase();
    const org = await Organization.findByIdAndUpdate(id, { subscriptionStatus: status });
    await createLog(`Updated organization ${org?.name} status to ${status}`, "ADMIN_ACTION", "INFO", { orgId: id, status });
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { message: "Failed to update status." };
  }
}

export async function updateOrganizationPlan(id: string, plan: string) {
    await checkSuperAdmin();
    try {
      await connectToDatabase();
      const org = await Organization.findByIdAndUpdate(id, { subscriptionPlan: plan });
      await createLog(`Updated organization ${org?.name} plan to ${plan}`, "ADMIN_ACTION", "INFO", { orgId: id, plan });
      revalidatePath("/admin/organizations");
      return { success: true };
    } catch (error) {
      console.error(error);
      return { message: "Failed to update plan." };
    }
  }

export async function deleteOrganization(id: string) {
  await checkSuperAdmin();
  try {
    await connectToDatabase();
    const org = await Organization.findByIdAndDelete(id);
    await createLog(`Deleted organization ${org?.name}`, "ADMIN_ACTION", "WARNING", { orgId: id });
    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { message: "Failed to delete organization." };
  }
}

