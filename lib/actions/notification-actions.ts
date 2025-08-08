"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import clientPromise from "../mongodb"

export async function getUnseenWarningsCount() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "farmer") {
    return 0
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Count warnings that are either:
    // 1. New warnings that haven't been seen by the farmer
    // 2. Warnings with admin replies that haven't been seen by the farmer
    const count = await db.collection("warnings").countDocuments({
      farmerId: session.user.id,
      $or: [
        { seenByFarmer: { $exists: false } },
        { adminRepliedAt: { $exists: true, $gt: { $ifNull: ["$seenByFarmer", new Date(0)] } } },
      ],
    })

    return count
  } catch (error) {
    console.error("Error getting unseen warnings count:", error)
    return 0
  }
}

export async function markWarningsAsSeen() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== "farmer") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Mark all warnings for this farmer as seen
    await db.collection("warnings").updateMany({ farmerId: session.user.id }, { $set: { seenByFarmer: new Date() } })

    return { success: true }
  } catch (error) {
    console.error("Error marking warnings as seen:", error)
    return { error: "Failed to mark warnings as seen" }
  }
}
