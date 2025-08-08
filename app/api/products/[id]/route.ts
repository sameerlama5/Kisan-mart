import { type NextRequest, NextResponse } from "next/server"
import { getProductById } from "@/lib/actions/product-actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Get product API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
