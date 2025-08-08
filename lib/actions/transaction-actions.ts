"use server"

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"

export async function getFarmerTransactions() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "farmer") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db
      .collection("transactions")
      .find({ farmerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Get farmer transactions error:", error)
    return []
  }
}

export async function getUserTransactions() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "user") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db
      .collection("transactions")
      .find({ customerId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray()

    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Get user transactions error:", error)
    return []
  }
}

export async function getTransactionById(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(id) })

    if (!transaction) {
      return null
    }

    // Check if user has access to this transaction
    const hasAccess =
      session.user.role === "admin" ||
      transaction.farmerId === session.user.id ||
      transaction.customerId === session.user.id

    if (!hasAccess) {
      return null
    }

    return JSON.parse(JSON.stringify(transaction))
  } catch (error) {
    console.error("Get transaction by ID error:", error)
    return null
  }
}

export async function getFarmerTransactionStats() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "farmer") {
    return {
      totalEarnings: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
    }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db.collection("transactions").find({ farmerId: session.user.id }).toArray()

    const stats = {
      totalEarnings: 0,
      totalTransactions: transactions.length,
      completedTransactions: 0,
      pendingTransactions: 0,
    }

    transactions.forEach((transaction: any) => {
      if (transaction.status === "completed") {
        stats.totalEarnings += transaction.farmerEarnings
        stats.completedTransactions++
      } else if (transaction.status === "pending") {
        stats.pendingTransactions++
      }
    })

    return stats
  } catch (error) {
    console.error("Get farmer transaction stats error:", error)
    return {
      totalEarnings: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
    }
  }
}

export async function getAllTransactions() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const transactions = await db.collection("transactions").find({}).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Get all transactions error:", error)
    return []
  }
}
