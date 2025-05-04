"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import type { Order } from "../db-models"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { clearCart, getCart } from "./cart-actions"

export async function createOrder(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "user") {
    return { error: "Unauthorized" }
  }

  const shippingAddress = formData.get("shippingAddress") as string
  const paymentMethod = formData.get("paymentMethod") as string
  const paymentId = (formData.get("paymentId") as string) || undefined
  const paymentStatus = (formData.get("paymentStatus") as string) || undefined

  if (!shippingAddress || !paymentMethod) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get user's cart
    const cart = await getCart()

    if (!cart || !cart.products || cart.products.length === 0) {
      return { error: "Cart is empty" }
    }

    // Calculate total amount
    const totalAmount = cart.products.reduce((total: number, item: any) => total + item.price * item.quantity, 0)

    // Create order
    const newOrder: Order & {
      paymentDetails?: {
        paymentId?: string
        paymentStatus?: string
      }
    } = {
      userId: session.user.id,
      userName: session.user.name,
      products: cart.products,
      totalAmount,
      status: paymentMethod === "paypal" && paymentStatus === "COMPLETED" ? "processing" : "pending",
      shippingAddress,
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Add payment details if available
    if (paymentId || paymentStatus) {
      newOrder.paymentDetails = {
        paymentId,
        paymentStatus,
      }
    }

    await db.collection("orders").insertOne(newOrder)

    // Update product stock
    for (const item of cart.products) {
      await db
        .collection("products")
        .updateOne({ _id: new ObjectId(item.productId) }, { $inc: { stock: -item.quantity } })
    }

    // Clear cart
    await clearCart()

    revalidatePath("/orders")
    return { success: "Order placed successfully", orderId: newOrder._id }
  } catch (error) {
    console.error("Create order error:", error)
    return { error: "Failed to place order" }
  }
}

export async function getUserOrders() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const orders = await db.collection("orders").find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error("Get user orders error:", error)
    return []
  }
}

export async function getFarmerOrders() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "farmer") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get farmer's products
    const products = await db.collection("products").find({ farmerId: session.user.id }).toArray()

    const productIds = products.map((p) => p._id.toString())

    // Get orders containing farmer's products
    const orders = await db
      .collection("orders")
      .find({ "products.productId": { $in: productIds } })
      .sort({ createdAt: -1 })
      .toArray()

    // Filter out products that don't belong to this farmer
    const filteredOrders = orders.map((order) => {
      return {
        ...order,
        products: order.products.filter((p: any) => productIds.includes(p.productId)),
      }
    })

    return JSON.parse(JSON.stringify(filteredOrders))
  } catch (error) {
    console.error("Get farmer orders error:", error)
    return []
  }
}

export async function getAllOrders() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "admin") {
    return []
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(orders))
  } catch (error) {
    console.error("Get all orders error:", error)
    return []
  }
}

export async function updateOrderStatus(
  id: string,
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "farmer")) {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })

    if (!order) {
      return { error: "Order not found" }
    }

    // If farmer, check if order contains their products
    if (session.user.role === "farmer") {
      const products = await db.collection("products").find({ farmerId: session.user.id }).toArray()

      const productIds = products.map((p) => p._id.toString())

      const hasProduct = order.products.some((p: any) => productIds.includes(p.productId))

      if (!hasProduct) {
        return { error: "You can only update orders for your products" }
      }
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/orders")
    revalidatePath(`/orders/${id}`)
    return { success: "Order status updated" }
  } catch (error) {
    console.error("Update order status error:", error)
    return { error: "Failed to update order status" }
  }
}
