"use server";

import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import { sendResetEmail } from "@/lib/mail";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ForgotPasswordState = {
  errors?: {
    email?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function requestPasswordReset(
  prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please enter a valid email.",
    };
  }

  const { email } = validatedFields.data;

  try {
    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      // For security reasons, don't confirm if the user exists
      return {
        success: true,
        message: "If an account exists for that email, we've sent a reset link.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    await sendResetEmail(email, token);

    return {
      success: true,
      message: "If an account exists for that email, we've sent a reset link.",
    };
  } catch (error) {
    console.error("DEBUG: Forgot Password Error:", error);
    return {
      message: "Something went wrong. Please try again later.",
    };
  }
}

export type ResetPasswordState = {
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    token?: string[];
    email?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function resetPassword(
  prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid input. Please check your passwords.",
    };
  }

  const { token, email, password } = validatedFields.data;

  try {
    await connectToDatabase();
    const user = await User.findOne({ 
      email,
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return {
        message: "Invalid or expired reset link. Please request a new one.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.hashedPassword = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return {
      success: true,
      message: "Password has been successfully reset. You can now login.",
    };
  } catch (error) {
    console.error("DEBUG: Reset Password Error:", error);
    return {
      message: "Something went wrong. Please try again later.",
    };
  }
}
