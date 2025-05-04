"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import type { Cart } from "../db-models"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function addToCart(productId: string, quantity = 1) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "user") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    // Get product details
    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) })

    if (!product) {
      return { error: "Product not found" }
    }

    if (product.stock < quantity) {
      return { error: "Not enough stock available" }
    }

    // Check if user already has a cart
    const existingCart = await db.collection("carts").findOne({ userId: session.user.id })

    if (existingCart) {
      // Check if product already in cart
      const existingProductIndex = existingCart.products.findIndex((p: any) => p.productId === productId)

      if (existingProductIndex > -1) {
        // Update quantity if product already in cart
        existingCart.products[existingProductIndex].quantity += quantity

        await db.collection("carts").updateOne(
          { _id: existingCart._id },
          {
            $set: {
              products: existingCart.products,
              updatedAt: new Date(),
            },
          },
        )
      } else {
        // Add new product to cart
        await db.collection("carts").updateOne(
          { _id: existingCart._id },
          {
            $push: {
              products: {
                productId,
                name: product.name,
                price: product.price,
                images: product.images, // 👈 add this line
                quantity,
              },
            },
            $set: { updatedAt: new Date() },
          },
        )
        
      }
    } else {
      // Create new cart
      const newCart: Cart = {
        userId: session.user.id,
        products: [
          {
            productId,
            name: product.name,
            price: product.price,
            images: product.images,
            quantity,
          },
        ],
        
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await db.collection("carts").insertOne(newCart)
    }

    revalidatePath("/cart")
    return { success: "Product added to cart" }
  } catch (error) {
    console.error("Add to cart error:", error)
    return { error: "Failed to add product to cart" }
  }
}

export async function getCart() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const cart = await db.collection("carts").findOne({ userId: session.user.id })

    if (!cart) {
      return null
    }

    return JSON.parse(JSON.stringify(cart))
  } catch (error) {
    console.error("Get cart error:", error)
    return null
  }
}

export async function updateCartItem(productId: string, quantity: number) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const cart = await db.collection("carts").findOne({ userId: session.user.id })

    if (!cart) {
      return { error: "Cart not found" }
    }

    const productIndex = cart.products.findIndex((p: any) => p.productId === productId)

    if (productIndex === -1) {
      return { error: "Product not in cart" }
    }

    if (quantity <= 0) {
      // Remove product from cart
      cart.products.splice(productIndex, 1)
    } else {
      // Update quantity
      cart.products[productIndex].quantity = quantity
    }

    await db.collection("carts").updateOne(
      { _id: cart._id },
      {
        $set: {
          products: cart.products,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/cart")
    return { success: "Cart updated" }
  } catch (error) {
    console.error("Update cart error:", error)
    return { error: "Failed to update cart" }
  }
}

export async function clearCart() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    await db.collection("carts").deleteOne({ userId: session.user.id })

    revalidatePath("/cart")
    return { success: "Cart cleared" }
  } catch (error) {
    console.error("Clear cart error:", error)
    return { error: "Failed to clear cart" }
  }
}
