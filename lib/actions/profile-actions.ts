"use server"

const { hash, compare } = require("bcryptjs");
import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function updateProfile(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Not authenticated" }
    }

    const client = await clientPromise
    const db = client.db()

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const bio = formData.get("bio") as string
    const farmName = formData.get("farmName") as string
    const farmLocation = formData.get("farmLocation") as string
    const profilePicture = formData.get("profilePicture") as string

    if (!name) {
      return { error: "Name is required" }
    }

    const updateData: any = {
      name,
      phone,
      address,
      bio,
      updatedAt: new Date(),
    }

    // Add farmer-specific fields if user is a farmer
    if (session.user.role === "farmer") {
      updateData.farmName = farmName
      updateData.farmLocation = farmLocation
    }

    // Add profile picture if provided
    if (profilePicture) {
      updateData.profilePicture = profilePicture
    }

    const result = await db.collection("users").updateOne({ _id: new ObjectId(session.user.id) }, { $set: updateData })

    if (result.modifiedCount === 0) {
      return { error: "Failed to update profile" }
    }

    return { success: "Profile updated successfully" }
  } catch (error) {
    console.error("Profile update error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { error: "Not authenticated" }
    }

    const client = await clientPromise
    const db = client.db()

    // Get current user
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })
    if (!user) {
      return { error: "User not found" }
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.password)
    if (!isValidPassword) {
      return { error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    if (result.modifiedCount === 0) {
      return { error: "Failed to change password" }
    }

    return { success: "Password changed successfully" }
  } catch (error) {
    console.error("Password change error:", error)
    return { error: "Failed to change password" }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) }, { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } })

    if (!user) {
      return { error: "User not found" }
    }

    return { user }
  } catch (error) {
    console.error("Get user profile error:", error)
    return { error: "Failed to get user profile" }
  }
}
