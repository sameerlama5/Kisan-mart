"use server"

import { revalidatePath } from "next/cache"
import clientPromise from "../mongodb"
import type { Product } from "../db-models"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function addProduct(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "farmer") {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = Number.parseFloat(formData.get("price") as string)
  const stock = Number.parseInt(formData.get("stock") as string)
  const category = formData.get("category") as string
  const images = [formData.get("image") as string] // In a real app, handle multiple image uploads

  if (!name || !description || isNaN(price) || isNaN(stock) || !category) {
    return { error: "Missing required fields" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const newProduct: Product = {
      name,
      description,
      price,
      stock,
      category,
      images,
      farmerId: session.user.id,
      farmerName: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("products").insertOne(newProduct)

    revalidatePath("/farmer/products")
    return { success: "Product added successfully" }
  } catch (error) {
    console.error("Add product error:", error)
    return { error: "Failed to add product" }
  }
}

export async function getProducts(category?: string, farmerId?: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    let query = {}

    if (category) {
      query = { ...query, category }
    }

    if (farmerId) {
      query = { ...query, farmerId }
    }

    const products = await db.collection("products").find(query).sort({ createdAt: -1 }).toArray()

    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error("Get products error:", error)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const client = await clientPromise
    const db = client.db()

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return null
    }

    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    console.error("Get product error:", error)
    return null
  }
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "farmer") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return { error: "Product not found" }
    }

    if (product.farmerId !== session.user.id) {
      return { error: "You can only update your own products" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const category = formData.get("category") as string

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          price,
          stock,
          category,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath(`/farmer/products/${id}`)
    revalidatePath("/farmer/products")
    return { success: "Product updated successfully" }
  } catch (error) {
    console.error("Update product error:", error)
    return { error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "farmer") {
    return { error: "Unauthorized" }
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return { error: "Product not found" }
    }

    if (product.farmerId !== session.user.id) {
      return { error: "You can only delete your own products" }
    }

    await db.collection("products").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/farmer/products")
    return { success: "Product deleted successfully" }
  } catch (error) {
    console.error("Delete product error:", error)
    return { error: "Failed to delete product" }
  }
}
