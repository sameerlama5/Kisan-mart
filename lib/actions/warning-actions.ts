"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import type { Warning, FarmerResponse } from "../db-models"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import { sendEmail } from "../nodemailer"

export async function warnFarmer(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const farmerId = formData.get("farmerId") as string
  const reason = formData.get("reason") as string
  const severity = formData.get("severity") as "low" | "medium" | "high"
  const reviewId = formData.get("reviewId") as string

  if (!farmerId || !reason || !severity) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get farmer details
    const farmer = await db.collection("users").findOne({ _id: new ObjectId(farmerId) })
    if (!farmer || farmer.role !== "farmer") {
      return { error: "Farmer not found" }
    }

    const newWarning: Warning = {
      farmerId,
      farmerName: farmer.name,
      adminId: session.user.id,
      adminName: session.user.name,
      reason: reason.trim(),
      reviewId: reviewId || undefined,
      severity,
      status: "active",
      createdAt: new Date(),
    }

    const result = await db.collection("warnings").insertOne(newWarning)

    // Add warning to farmer's record
    await db.collection("users").updateOne(
      { _id: new ObjectId(farmerId) },
      {
        $push: {
          warnings: {
            _id: result.insertedId,
            reason,
            severity,
            adminName: session.user.name,
            createdAt: new Date(),
            status: "active",
          },
        },
      },
    )

    // Send warning email to farmer
    try {
      const emailSubject = `FarmerWeb - ${severity.toUpperCase()} Warning Issued`
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Warning Notice</h2>
          <p>Dear ${farmer.name},</p>
          <p>You have received a <strong>${severity}</strong> warning from our admin team.</p>
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Reason for Warning:</h3>
            <p style="margin-bottom: 0;">${reason}</p>
          </div>
          <p>You can respond to this warning by logging into your farmer dashboard and visiting the warnings section.</p>
          <p>Please review our community guidelines and ensure your products and interactions comply with our standards.</p>
          <p>If you have questions about this warning, please contact our support team or respond through your dashboard.</p>
          <p>Best regards,<br>The FarmerWeb Team</p>
        </div>
      `
      await sendEmail(farmer.email, emailSubject, emailHtml)
    } catch (emailError) {
      console.error("Failed to send warning email:", emailError)
    }

    revalidatePath("/admin/farmers")
    revalidatePath("/admin/warnings")
    revalidatePath("/farmer/warnings")
    return { success: "Warning issued successfully" }
  } catch (error) {
    console.error("Warn farmer error:", error)
    return { error: "Failed to issue warning" }
  }
}

export async function respondToWarning(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "farmer") {
    return { error: "Only farmers can respond to warnings" }
  }

  const warningId = formData.get("warningId") as string
  const message = formData.get("message") as string
  const actionPlan = formData.get("actionPlan") as string
  const responseType = formData.get("responseType") as "explanation" | "action_plan" | "appeal" | "acknowledgment"

  if (!warningId || !message || !responseType) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Verify warning belongs to this farmer
    const warning = await db.collection("warnings").findOne({
      _id: new ObjectId(warningId),
      farmerId: session.user.id,
    })

    if (!warning) {
      return { error: "Warning not found or access denied" }
    }

    if (warning.farmerResponse) {
      return { error: "You have already responded to this warning" }
    }

    const farmerResponse: FarmerResponse = {
      message: message.trim(),
      actionPlan: actionPlan?.trim() || undefined,
      responseType,
      respondedAt: new Date(),
    }

    // Update warning status based on response type
    let newStatus = warning.status
    if (responseType === "appeal") {
      newStatus = "under_review"
    }

    await db.collection("warnings").updateOne(
      { _id: new ObjectId(warningId) },
      {
        $set: {
          farmerResponse,
          status: newStatus,
        },
      },
    )

    // Update warning in farmer's record
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(session.user.id),
        "warnings._id": new ObjectId(warningId),
      },
      {
        $set: {
          "warnings.$.farmerResponse": farmerResponse,
          "warnings.$.status": newStatus,
        },
      },
    )

    // Send notification email to admin
    try {
      const admin = await db.collection("users").findOne({ _id: new ObjectId(warning.adminId) })
      if (admin) {
        const emailSubject = `FarmerWeb - Farmer Response to Warning`
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0A490A;">Farmer Response Received</h2>
            <p>Dear ${admin.name},</p>
            <p>Farmer <strong>${warning.farmerName}</strong> has responded to a ${warning.severity} warning you issued.</p>
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">Response Type: ${responseType.replace("_", " ").toUpperCase()}</h3>
              <p><strong>Message:</strong> ${message}</p>
              ${actionPlan ? `<p><strong>Action Plan:</strong> ${actionPlan}</p>` : ""}
            </div>
            <p>Please review the response in the admin dashboard and take appropriate action.</p>
            <p>Best regards,<br>The FarmerWeb System</p>
          </div>
        `
        await sendEmail(admin.email, emailSubject, emailHtml)
      }
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError)
    }

    revalidatePath("/farmer/warnings")
    revalidatePath("/admin/warnings")
    return { success: "Response submitted successfully" }
  } catch (error) {
    console.error("Respond to warning error:", error)
    return { error: "Failed to submit response" }
  }
}

export async function replyToFarmerResponse(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const warningId = formData.get("warningId") as string
  const adminReply = formData.get("adminReply") as string
  const newStatus = formData.get("newStatus") as "active" | "resolved" | "under_review"

  if (!warningId || !adminReply || !newStatus) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const warning = await db.collection("warnings").findOne({ _id: new ObjectId(warningId) })
    if (!warning) {
      return { error: "Warning not found" }
    }

    await db.collection("warnings").updateOne(
      { _id: new ObjectId(warningId) },
      {
        $set: {
          adminReply: adminReply.trim(),
          adminRepliedAt: new Date(),
          status: newStatus,
          seenByFarmer: null, // Reset the seen status when admin replies
          ...(newStatus === "resolved" && { resolvedAt: new Date() }),
        },
      },
    )

    // Update warning in farmer's record
    await db.collection("users").updateOne(
      {
        _id: new ObjectId(warning.farmerId),
        "warnings._id": new ObjectId(warningId),
      },
      {
        $set: {
          "warnings.$.adminReply": adminReply.trim(),
          "warnings.$.adminRepliedAt": new Date(),
          "warnings.$.status": newStatus,
          "warnings.$.seenByFarmer": null, // Reset the seen status when admin replies
          ...(newStatus === "resolved" && { "warnings.$.resolvedAt": new Date() }),
        },
      },
    )

    // Send notification email to farmer
    try {
      const farmer = await db.collection("users").findOne({ _id: new ObjectId(warning.farmerId) })
      if (farmer) {
        const emailSubject = `FarmerWeb - Admin Response to Your Warning Reply`
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0A490A;">Admin Response Received</h2>
            <p>Dear ${farmer.name},</p>
            <p>An admin has responded to your reply regarding the ${warning.severity} warning.</p>
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">Admin Response:</h3>
              <p>${adminReply}</p>
            </div>
            <p><strong>Warning Status:</strong> ${newStatus.replace("_", " ").toUpperCase()}</p>
            <p>You can view the full conversation in your farmer dashboard.</p>
            <p>Best regards,<br>The FarmerWeb Team</p>
          </div>
        `
        await sendEmail(farmer.email, emailSubject, emailHtml)
      }
    } catch (emailError) {
      console.error("Failed to send farmer notification email:", emailError)
    }

    revalidatePath("/admin/warnings")
    revalidatePath("/farmer/warnings")
    return { success: "Reply sent successfully" }
  } catch (error) {
    console.error("Reply to farmer response error:", error)
    return { error: "Failed to send reply" }
  }
}

export async function getAllWarnings() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const warnings = await db.collection("warnings").find({}).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(warnings))
  } catch (error) {
    console.error("Get all warnings error:", error)
    return []
  }
}

export async function getFarmerWarnings(farmerId?: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return []
  }

  // If farmerId is provided, admin is viewing farmer's warnings
  // If not provided, farmer is viewing their own warnings
  const targetFarmerId = farmerId || (session.user.role === "farmer" ? session.user.id : null)

  if (!targetFarmerId) {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const warnings = await db
      .collection("warnings")
      .find({ farmerId: targetFarmerId })
      .sort({ createdAt: -1 })
      .toArray()

    return JSON.parse(JSON.stringify(warnings))
  } catch (error) {
    console.error("Get farmer warnings error:", error)
    return []
  }
}

export async function resolveWarning(warningId: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const warning = await db.collection("warnings").findOne({ _id: new ObjectId(warningId) })
    if (!warning) {
      return { error: "Warning not found" }
    }

    await db.collection("warnings").updateOne(
      { _id: new ObjectId(warningId) },
      {
        $set: {
          status: "resolved",
          resolvedAt: new Date(),
        },
      },
    )

    // Update warning in farmer's record
    await db.collection("users").updateOne(
      { _id: new ObjectId(warning.farmerId), "warnings._id": new ObjectId(warningId) },
      {
        $set: {
          "warnings.$.status": "resolved",
          "warnings.$.resolvedAt": new Date(),
        },
      },
    )

    revalidatePath("/admin/warnings")
    revalidatePath("/farmer/warnings")
    return { success: "Warning resolved successfully" }
  } catch (error) {
    console.error("Resolve warning error:", error)
    return { error: "Failed to resolve warning" }
  }
}
