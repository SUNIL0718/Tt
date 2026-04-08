import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login/reset-password?token=${token}&email=${email}`;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("DEBUG: SMTP configuration missing. Logging reset link instead:");
    console.log(`DEBUG: Password Reset Link for ${email}: ${resetUrl}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Timetable Admin" <${smtpUser}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #4f46e5;">Password Reset</h2>
          <p>You requested a password reset. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">Timetable Application</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("DEBUG: Error sending reset email:", error);
    throw new Error("Failed to send reset email");
  }
};
