"use server";

import connectToDatabase from "@/lib/db";
import PeriodTiming from "@/lib/models/PeriodTiming";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SlotSchema = z.object({
  label: z.string().min(1),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isBreak: z.boolean().default(false),
});

const PeriodTimingSchema = z.object({
  name: z.string().min(1, "Name required"),
  slots: z.array(SlotSchema),
  isDefault: z.boolean().default(false),
});

export async function createPeriodTiming(data: any) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  const validatedFields = PeriodTimingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation Error",
    };
  }

  try {
    await connectToDatabase();
    
    // If isDefault is true, unset other defaults
    if (validatedFields.data.isDefault) {
        await PeriodTiming.updateMany(
            { organizationId: session.user.organizationId },
            { isDefault: false }
        );
    }

    await PeriodTiming.create({
      ...validatedFields.data,
      organizationId: session.user.organizationId,
    });
    
    revalidatePath("/dashboard/settings");
    return { message: "Timing added!", success: true };
  } catch (error) {
    return { message: "Database Error." };
  }
}

export async function deletePeriodTiming(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    await PeriodTiming.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    });
    revalidatePath("/dashboard/settings");
    return { message: "Timing deleted." };
  } catch (error) {
    return { message: "Database Error." };
  }
}

export async function setDefaultPeriodTiming(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId) return { message: "Unauthorized" };

  try {
    await connectToDatabase();
    
    // First, unset any existing default
    await PeriodTiming.updateMany(
      { organizationId: session.user.organizationId },
      { isDefault: false }
    );

    // Then, set the chosen one as default
    await PeriodTiming.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { isDefault: true }
    );

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/timetable");
    return { message: "Schedule set as default." };
  } catch (error) {
    return { message: "Database Error." };
  }
}
