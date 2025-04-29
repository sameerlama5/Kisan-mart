"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function getDashboardStats() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return null
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const totalUsers = await db.collection("users").countDocuments()
    const totalFarmers = await db.collection("users").countDocuments({ role: "farmer" })
    const totalProducts = await db.collection("products").countDocuments()
    const totalOrders = await db.collection("orders").countDocuments()

    // Get total sales
    const orders = await db.collection("orders").find({}).toArray()
    const totalSales = orders.reduce((total, order) => total + order.totalAmount, 0)

    // Get recent orders
    const recentOrders = await db.collection("orders").find({}).sort({ createdAt: -1 }).limit(5).toArray()

    // Get top selling products
    const products = await db.collection("products").find({}).toArray()
    const productSales: Record<string, { count: number; name: string }> = {}

    orders.forEach((order) => {
      order.products.forEach((product: any) => {
        if (!productSales[product.productId]) {
          productSales[product.productId] = { count: 0, name: product.name }
        }
        productSales[product.productId].count += product.quantity
      })
    })

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, name: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalUsers,
      totalFarmers,
      totalProducts,
      totalOrders,
      totalSales,
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      topProducts,
    }
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return null
  }
}

export async function getAllUsers() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()

    // Remove password field
    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user
      return rest
    })

    return JSON.parse(JSON.stringify(sanitizedUsers))
  } catch (error) {
    console.error("Get all users error:", error)
    return []
  }
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("users").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/admin/users")
    return { success: "User deleted successfully" }
  } catch (error) {
    console.error("Delete user error:", error)
    return { error: "Failed to delete user" }
  }
}
