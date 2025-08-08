import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== "user") {
    return NextResponse.json({ quantity: 0 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const cart = await db.collection("carts").findOne({ userId: session.user.id })

    if (!cart || !cart.products) {
      return NextResponse.json({ quantity: 0 })
    }

    // Calculate total quantity of items in cart
    const quantity = cart.products.reduce((total: number, item: any) => total + item.quantity, 0)

    return NextResponse.json({ quantity })
  } catch (error) {
    console.error("Get cart quantity error:", error)
    return NextResponse.json({ quantity: 0 })
  }
}
