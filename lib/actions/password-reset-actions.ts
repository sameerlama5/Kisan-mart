"use server"

const { hash } = require("bcryptjs");
import crypto from "crypto"
import clientPromise from "../mongodb"
import { sendEmail } from "../nodemailer"

export async function requestPasswordReset(email: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Check if user exists
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      // Don't reveal if email exists or not for security
      return { success: "If an account with that email exists, you will receive a password reset link." }
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    await db.collection("users").updateOne(
      { email },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      },
    )

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`

    const emailTemplate = {
      subject: "FarmerWeb - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A490A;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your FarmerWeb account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #0A490A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The FarmerWeb Team</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
    }

    await sendEmail(email, emailTemplate.subject, emailTemplate.html)

    return { success: "If an account with that email exists, you will receive a password reset link." }
  } catch (error) {
    console.error("Password reset request error:", error)
    return { error: "Failed to process password reset request" }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    // Find user with valid reset token
    const user = await db.collection("users").findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return { error: "Invalid or expired reset token" }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update user password and clear reset token
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
        $unset: {
          resetToken: "",
          resetTokenExpiry: "",
        },
      },
    )

    return { success: "Password reset successfully" }
  } catch (error) {
    console.error("Password reset error:", error)
    return { error: "Failed to reset password" }
  }
}
