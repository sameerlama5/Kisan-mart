"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import { sendEmail, emailTemplates } from "../nodemailer"

export async function getPendingFarmers() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const farmers = await db
      .collection("users")
      .find({
        role: "farmer",
        $or: [
          { approvalStatus: "pending" },
          { approvalStatus: { $exists: false } }, // Include farmers without approval status
        ],
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Remove password field
    const sanitizedFarmers = farmers.map((farmer) => {
      const { password, ...rest } = farmer
      return {
        ...rest,
        approvalStatus: rest.approvalStatus || "pending", // Default to pending if not set
      }
    })

    return JSON.parse(JSON.stringify(sanitizedFarmers))
  } catch (error) {
    console.error("Get pending farmers error:", error)
    return []
  }
}

export async function getAllFarmers() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const farmers = await db.collection("users").find({ role: "farmer" }).sort({ createdAt: -1 }).toArray()

    // Remove password field
    const sanitizedFarmers = farmers.map((farmer) => {
      const { password, ...rest } = farmer
      return {
        ...rest,
        approvalStatus: rest.approvalStatus || "pending", // Default to pending if not set
      }
    })

    return JSON.parse(JSON.stringify(sanitizedFarmers))
  } catch (error) {
    console.error("Get all farmers error:", error)
    return []
  }
}

export async function approveFarmer(farmerId: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get farmer details
    const farmer = await db.collection("users").findOne({ _id: new ObjectId(farmerId) })

    if (!farmer) {
      return { error: "Farmer not found" }
    }

    if (farmer.role !== "farmer") {
      return { error: "User is not a farmer" }
    }

    if (farmer.approvalStatus === "approved") {
      return { error: "Farmer is already approved" }
    }

    // Update farmer status
    await db.collection("users").updateOne(
      { _id: new ObjectId(farmerId) },
      {
        $set: {
          approvalStatus: "approved",
          approvedAt: new Date(),
          approvedBy: session.user.id,
        },
      },
    )

    // Send approval email
    try {
      const template = emailTemplates.farmerApprovalSuccess(farmer.name)
      await sendEmail(farmer.email, template.subject, template.html)
      console.log("Approval email sent to:", farmer.email)
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError)
    }

    revalidatePath("/admin/farmers")
    return { success: "Farmer approved successfully" }
  } catch (error) {
    console.error("Approve farmer error:", error)
    return { error: "Failed to approve farmer" }
  }
}

export async function rejectFarmer(farmerId: string, reason: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  if (!reason || reason.trim().length === 0) {
    return { error: "Rejection reason is required" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get farmer details
    const farmer = await db.collection("users").findOne({ _id: new ObjectId(farmerId) })

    if (!farmer) {
      return { error: "Farmer not found" }
    }

    if (farmer.role !== "farmer") {
      return { error: "User is not a farmer" }
    }

    // Update farmer status
    await db.collection("users").updateOne(
      { _id: new ObjectId(farmerId) },
      {
        $set: {
          approvalStatus: "rejected",
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: session.user.id,
        },
      },
    )

    // Send rejection email
    try {
      const template = emailTemplates.farmerApprovalRejected(farmer.name, reason)
      await sendEmail(farmer.email, template.subject, template.html)
      console.log("Rejection email sent to:", farmer.email)
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError)
      // Don't fail the rejection if email fails
    }

    revalidatePath("/admin/farmers")
    return { success: "Farmer rejected successfully" }
  } catch (error) {
    console.error("Reject farmer error:", error)
    return { error: "Failed to reject farmer" }
  }
}

// Add function to set pending farmers to pending status
export async function updateFarmerToPending(farmerId: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("users").updateOne(
      { _id: new ObjectId(farmerId) },
      {
        $set: {
          approvalStatus: "pending",
        },
      },
    )

    revalidatePath("/admin/farmers")
    return { success: "Farmer status updated to pending" }
  } catch (error) {
    console.error("Update farmer to pending error:", error)
    return { error: "Failed to update farmer status" }
  }
}
